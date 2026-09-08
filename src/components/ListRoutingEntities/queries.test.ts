import { fetchSandboxes } from "./queries";
import { type RoutingEntity, RoutingEntityType } from "./types";

const sandbox = (name: string): RoutingEntity => ({
	name,
	routingKey: `rk-${name}`,
	type: RoutingEntityType.Sandbox,
	cluster: "cluster-1",
});

const response = (body: unknown, ok = true) =>
	Promise.resolve({
		ok,
		json: () => Promise.resolve(body),
	} as Response);

const fetchMock = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>();

beforeEach(() => {
	fetchMock.mockReset();
	global.fetch = fetchMock as unknown as typeof fetch;
});

describe("fetchSandboxes", () => {
	it("opts into pagination and walks every cursor page", async () => {
		fetchMock
			.mockReturnValueOnce(
				response({
					items: [sandbox("a"), sandbox("b")],
					hasMore: true,
					nextCursor: "cursor-1",
				}),
			)
			.mockReturnValueOnce(response({ items: [sandbox("c")], hasMore: false }));

		await expect(
			fetchSandboxes("https://api.example.test", "acme"),
		).resolves.toEqual([sandbox("a"), sandbox("b"), sandbox("c")]);

		expect(fetchMock).toHaveBeenCalledTimes(2);
		expect(fetchMock.mock.calls[0]).toEqual([
			"https://api.example.test/api/v2/orgs/acme/sandboxes?pageSize=500",
			{ headers: { "signadot-api-opt-in": "pagination" } },
		]);
		expect(fetchMock.mock.calls[1]).toEqual([
			"https://api.example.test/api/v2/orgs/acme/sandboxes?pageSize=500&cursor=cursor-1",
			{ headers: { "signadot-api-opt-in": "pagination" } },
		]);
	});

	it("fails instead of fetching page one forever when a cursor is missing", async () => {
		fetchMock.mockReturnValueOnce(
			response({ items: [sandbox("a")], hasMore: true }),
		);

		await expect(
			fetchSandboxes("https://api.example.test", "acme"),
		).rejects.toThrow("Failed to fetch sandboxes");
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it("accepts the legacy bare-array response during rollout", async () => {
		fetchMock.mockReturnValueOnce(
			response([sandbox("legacy-a"), sandbox("legacy-b")]),
		);

		await expect(
			fetchSandboxes("https://api.example.test", "acme"),
		).resolves.toEqual([sandbox("legacy-a"), sandbox("legacy-b")]);
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it("rejects a non-success response", async () => {
		fetchMock.mockReturnValueOnce(response({}, false));

		await expect(
			fetchSandboxes("https://api.example.test", "acme"),
		).rejects.toThrow("Failed to fetch sandboxes");
	});
});
