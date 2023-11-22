type PostAuthCallbackFn = (authenticated: boolean) => void;
const AUTH_SESSION_COOKIE_NAME = "signadot-auth";
const DUMMY_PREVIEW_ENDPOINT =
    "https://dummy-preview-endpoint.preview.signadot.com";
const SIGNADOT_API_DOMAIN = "https://api.signadot.com";

const refreshPreviewDomainCookies = () => {
  // Synchronous fetch request to https://xyz.preview.signadot.com
  try {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", DUMMY_PREVIEW_ENDPOINT, false); // false for synchronous request
    xhr.send();
  } catch (error) {
    // empty response expected. ignore
  }
};

// TODO: Explain the auth approach.
export const auth = (callback: PostAuthCallbackFn) => {
  refreshPreviewDomainCookies();

  // Get auth session cookie from preview subdomain.
  chrome.cookies.get(
      {url: DUMMY_PREVIEW_ENDPOINT, name: AUTH_SESSION_COOKIE_NAME},
      function (cookie) {
        if (cookie) {
          chrome.cookies.set(
              {
                url: SIGNADOT_API_DOMAIN,
                name: AUTH_SESSION_COOKIE_NAME,
                value: cookie.value,
              }
          );
          callback(true);
        } else {
          callback(false);
        }
      }
  );
};
