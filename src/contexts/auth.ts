type PostAuthCallbackFn = (authenticated: boolean) => void;
const AUTH_SESSION_COOKIE_NAME = "signadot-auth";
export const DASHBOARD_ENDPOINT =
    "https://app.signadot.com";
export const DASHBOARD_PREVIEW_ENDPOINT =
    "https://dashboard.preview.signadot.com";
export const SIGNADOT_API_ENDPOINT = "https://api.signadot.com";

const refreshPreviewDomainCookies = () => {
  // Synchronous fetch request to https://dashboard.preview.signadot.com
  try {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", DASHBOARD_PREVIEW_ENDPOINT, false); // false for synchronous request
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
      {url: DASHBOARD_PREVIEW_ENDPOINT, name: AUTH_SESSION_COOKIE_NAME},
      function (cookie) {
        if (cookie) {
          chrome.cookies.set(
              {
                url: SIGNADOT_API_ENDPOINT,
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
