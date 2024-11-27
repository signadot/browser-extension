type PostAuthCallbackFn = (authenticated: boolean) => void;
const AUTH_SESSION_COOKIE_NAME = "signadot-auth";

const refreshPreviewDomainCookies = async (previewUrl: string) => {
  try {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", previewUrl, false);
    xhr.send();
  } catch (error) {
    // empty response expected. ignore
  }
};

export const auth = (callback: PostAuthCallbackFn) => {
  // Get stored URLs
  chrome.storage.sync.get(['apiUrl', 'previewUrl'], async (result) => {
    const apiUrl = result.apiUrl;
    const previewUrl = result.previewUrl;
    
    if (!apiUrl || !previewUrl) {
      callback(false);
      return;
    }

    await refreshPreviewDomainCookies(previewUrl);

    // Get auth session cookie from preview subdomain
    chrome.cookies.get(
      { url: previewUrl, name: AUTH_SESSION_COOKIE_NAME },
      function (cookie) {
        if (cookie) {
          chrome.cookies.set({
            url: apiUrl,
            name: AUTH_SESSION_COOKIE_NAME,
            value: cookie.value,
          });
          callback(true);
        } else {
          callback(false);
        }
      }
    );
  });
};
