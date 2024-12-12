import { StorageKey } from "../hooks/storage";

type PostAuthCallbackFn = (authenticated: boolean) => void;
const AUTH_SESSION_COOKIE_NAME = "signadot-auth";

const refreshPreviewDomainCookies = async (previewUrl: string) => {
    await fetch(previewUrl, {
      method: 'GET',
      redirect: 'manual' // Prevents automatic redirection
  });
};

// Define two prototypes for the auth function, one that a callback and other that take apiUrl and previewUrl as arguments plus a callback
type AuthCallbackFn = (authenticated: boolean) => void;
type AuthOptions = { apiUrl: string, previewUrl: string };

const doAuth = async (callback: AuthCallbackFn, options: AuthOptions) => {
  const { apiUrl, previewUrl } = options;

  await refreshPreviewDomainCookies(previewUrl);

  // Get auth session cookie from preview subdomain
  chrome.cookies.get(
      { url: previewUrl, name: AUTH_SESSION_COOKIE_NAME },
      function (cookie) {
        if (cookie) {
          chrome.cookies.set({
            url: apiUrl!,
            name: AUTH_SESSION_COOKIE_NAME,
            value: cookie.value,
          });
          callback(true);
        } else {
          callback(false);
        }
      }
  );
}

export const auth = async (callback: AuthCallbackFn, options?: AuthOptions) => {
  let apiUrl = options?.apiUrl;
  let previewUrl = options?.previewUrl;

  if (!apiUrl || !previewUrl) {
    chrome.storage.local.get([StorageKey.ApiUrl, StorageKey.PreviewUrl], (result) => {
      apiUrl = result[StorageKey.ApiUrl];
      previewUrl = result[StorageKey.PreviewUrl];

      if (apiUrl === undefined || previewUrl === undefined) {
        callback(false);
        return;
      }

      doAuth(callback, { apiUrl, previewUrl });
    });
  } else {
    doAuth(callback, { apiUrl, previewUrl });
  }
};
