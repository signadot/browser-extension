import React, { useEffect } from "react";
import styles from "./Frame.module.css";
import { Button, Intent, Switch } from "@blueprintjs/core";

const ROUTING_KEY = "routingKey";
const ENABLED = "enabled";

interface StorageChange {
  [key: string]: {
    oldValue?: any;
    newValue?: any;
  };
}

const Frame = () => {
  const [userInput, setUserInput] = React.useState<string>("");
  const [enabled, setEnabled] = React.useState<boolean>(false);
  const [status, setStatus] = React.useState<string | undefined>(undefined);
  const [storageValue, setStorageValue] = React.useState<string>("");

  // const logoImageUrl = chrome.runtime.getURL("images/signadot-full-logo.png");
  const saveRoutingKey = () => {
    chrome.storage.local.set(
      {
        [ROUTING_KEY]: userInput,
      },
      () => {
        setUserInput("");
        setStatus("Routing Key saved!");
        // No need to return a function here, since we're not inside useEffect
        setTimeout(() => {
          setStatus("");
        }, 1000);
      }
    );

    // Synchronous fetch request to https://xyz.preview.signadot.com
    try {
      let xhr = new XMLHttpRequest();
      xhr.open('GET', 'https://xyz.preview.signadot.com', false); // false for synchronous request
      xhr.send();
    } catch (error) {
      console.error("ignored empty response");
    }

    let url = "https://preview.signadot.com"; // replace with your URL
    let cookieName = "signadot-auth"; // replace with your cookie's name

    chrome.cookies.get({ url: url, name: cookieName}, function(cookie) {
      if (cookie) {
        console.log("applied cookie value. Cookie value: ", JSON.stringify(cookie));
      } else {
        console.log('Can\'t get cookie that we just set ! Check the name and URL.');
      }
    });

    chrome.cookies.get({ url: url, name: cookieName }, function(cookie) {
      if (cookie) {
        console.log(cookie.value);

        chrome.cookies.set({ url: "https://api.signadot.com", name: cookieName, value: cookie.value}, function(cookie) {
          if (cookie) {
            console.log("applied cookie value. Cookie value: ", JSON.stringify(cookie));
          } else {
            console.log('Can\'t get cookie that we just set ! Check the name and URL.');
          }
        });

        fetch("https://api.signadot.com/api/v2/orgs/signadot/sandboxes")
          .then((response) => response.json())
          .then((data) => {
            console.log("Fetched sandboxes: ", data);
          })
          .catch((error) => console.log("Error fetching sandboxes:", error));
      } else {
        console.log('Can\'t get cookie! Check the name and URL.');
      }
    });
  };

  const handleEnabledChange = (enable: boolean) => {
    setEnabled(enable);
    chrome.storage.local.set(
      {
        [ENABLED]: enable,
      },
      () => {
        setStatus(enable ? "Feature enabled" : "Feature disabled");
        // No need to return a function here, since we're not inside useEffect
        setTimeout(() => {
          setStatus("");
        }, 1000);
      }
    );
  };

  useEffect(() => {
    // Fetching from chrome.storage.local instead of chrome.storage.sync
    chrome.storage.local.get([ROUTING_KEY, ENABLED], (result) => {
      if (result[ROUTING_KEY]) {
        setStorageValue(result[ROUTING_KEY] || "");
      }
      setEnabled(!!result[ENABLED]);
    });

    const handleStorageChange = (changes: StorageChange, area: string) => {
      if (area === "local" && changes[ROUTING_KEY]) {
        setStorageValue(changes[ROUTING_KEY].newValue || "");
      }
    };

    // Add event listener for changes in storage
    chrome.storage.onChanged.addListener(handleStorageChange);

    // Cleanup function to remove event listener
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        {/*{imageUrl ? <img src={logoImageUrl} className={styles.logo} /> : "no image url"}*/}
        <div className={styles.title}>Signadot</div>
      </div>
      <div className={styles.body}>
        <div className={styles.switchPanel}>
          <Switch
            alignIndicator={"right"}
            label={`Setting Routing Key header is ${
              enabled ? "ENABLED" : "DISABLED"
            }`}
            onChange={(e) => handleEnabledChange(e.target.checked)}
            className={styles.switch}
            checked={enabled}
          />
        </div>
        {enabled ? (
          <div className={styles.mainPanel}>
            <h3>Routing Key</h3>
            <div className={styles.routingKeyInput}>
              <div className={styles.label}>Current value</div>
              <div>{storageValue}</div>
            </div>
            <div className={styles.routingKeyInput}>
              <div className={styles.label}>New value</div>
              <div>
                <input
                  type="text"
                  onChange={(e) => setUserInput(e.target.value)}
                  size={32}
                  value={userInput}
                />
              </div>
            </div>
            <div>
              <Button onClick={() => saveRoutingKey()} intent={Intent.PRIMARY}>
                Update
              </Button>
            </div>
          </div>
        ) : null}
      </div>
      {status && <div className={styles.status}>{status}</div>}
    </div>
  );
};

export default Frame;
