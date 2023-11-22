export const getCookie = (domain: string, name: string): Promise<string> =>
    new Promise((resolve, reject) => {
      chrome.cookies.get({url: domain, name: name}, (cookie) => {
        if (cookie) {
          resolve(cookie.value);
        } else {
          reject("Cookie not found");
        }
      });
    });
