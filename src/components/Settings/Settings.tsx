import React, { useEffect, useState } from "react";
import styles from "./Settings.module.css";
import { useHotkeys } from "react-hotkeys-hook";
import { Switch } from "@blueprintjs/core";
import { useStorage } from "../../contexts/StorageContext/StorageContext";
import {
  DEFAULT_SIGNADOT_API_URL,
  DEFAULT_SIGNADOT_PREVIEW_URL,
  DEFAULT_SIGNADOT_DASHBOARD_URL,
  DEFAULT_TRACEPARENT_VALUE,
} from "../../contexts/StorageContext/defaults";

const AUTH_SESSION_COOKIE_NAME = "signadot-auth";

interface SettingsProps {
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onClose }) => {
  const [unsavedValues, setUnsavedValues] = useState<{
    apiUrl: string;
    previewUrl: string;
    dashboardUrl: string;
    traceparentHeader: string;
    traceparentHeaderEnabled: boolean;
    debugMode: boolean;
  }>({
    apiUrl: DEFAULT_SIGNADOT_API_URL,
    previewUrl: DEFAULT_SIGNADOT_PREVIEW_URL,
    dashboardUrl: DEFAULT_SIGNADOT_DASHBOARD_URL,
    traceparentHeader: DEFAULT_TRACEPARENT_VALUE,
    traceparentHeaderEnabled: false,
    debugMode: false,
  });

  const { settings, traceparent, setSettings, setTraceparent } = useStorage();

  const [isExtraSettingsOpen, setIsExtraSettingsOpen] = React.useState(false);

  // Use the hook to handle Ctrl+Shift+U
  useHotkeys("ctrl+shift+u", () => setIsExtraSettingsOpen(!isExtraSettingsOpen), {
    enableOnFormTags: true,
    preventDefault: true,
  });

  useEffect(() => {
    setUnsavedValues({
      apiUrl: settings.signadotUrls.apiUrl || DEFAULT_SIGNADOT_API_URL,
      previewUrl: settings.signadotUrls.previewUrl || DEFAULT_SIGNADOT_PREVIEW_URL,
      dashboardUrl: settings.signadotUrls.dashboardUrl || DEFAULT_SIGNADOT_DASHBOARD_URL,
      traceparentHeader: traceparent.value || DEFAULT_TRACEPARENT_VALUE,
      traceparentHeaderEnabled: traceparent.inject,
      debugMode: settings.debugMode,
    });
  }, [settings, traceparent]);

  const handleSave = () => {
    const cleanApiUrl = unsavedValues.apiUrl.replace(/\/+$/, "");
    const cleanPreviewUrl = unsavedValues.previewUrl.replace(/\/+$/, "");
    const cleanDashboardUrl = unsavedValues.dashboardUrl.replace(/\/+$/, "");

    setSettings({
      enabled: settings.enabled,
      signadotUrls: {
        apiUrl: cleanApiUrl,
        previewUrl: cleanPreviewUrl,
        dashboardUrl: cleanDashboardUrl,
      },
      debugMode: unsavedValues.debugMode,
    });

    setTraceparent(unsavedValues.traceparentHeaderEnabled, unsavedValues.traceparentHeader);

    // TODO: This has been disabled because we are using the storage context to save the settings, however
    // part of this logic have to be checked after issue#51 is merged
    // chrome.storage.local.set({
    //     apiUrl: cleanApiUrl,
    //     previewUrl: cleanPreviewUrl,
    //     dashboardUrl: cleanDashboardUrl,
    //     traceparentHeader: temporaryValues.traceparentHeader,
    //     traceparentHeaderEnabled: temporaryValues.traceparentHeaderEnabled,
    //     debugMode: temporaryValues.debugMode,
    // }, () => {
    //     // After saving, update the cookie for the new domain
    //     chrome.cookies.get(
    //         {url: cleanPreviewUrl, name: AUTH_SESSION_COOKIE_NAME},
    //         function (cookie) {
    //             if (cookie) {
    //                 // Set the cookie for the new API domain
    //                 chrome.cookies.set(
    //                     {
    //                         url: cleanApiUrl,
    //                         name: AUTH_SESSION_COOKIE_NAME,
    //                         value: cookie.value,
    //                     },
    //                     () => {
    //                         // Re-authenticate with the new API URL
    //                         auth((authenticated) => {
    //                             if (authenticated) {
    //                                 alert('Settings saved and authenticated successfully!');
    //                             } else {
    //                                 alert('Settings saved but authentication failed. Please check your API URL and ensure you are logged in.');
    //                             }
    //                         });
    //                     }
    //                 );
    //             } else {
    //                 alert('Settings saved but no authentication cookie found. Please log in to Signadot first.');
    //             }
    //         }
    //     );
    // });

    onClose();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Settings</h3>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h4 className={styles.sectionTitle}>Header Settings</h4>
        </div>
        <div className={styles.traceparent}>
          <Switch
            onChange={(e) =>
              setUnsavedValues({
                ...unsavedValues,
                traceparentHeaderEnabled: e.target.checked,
              })
            }
            checked={unsavedValues.traceparentHeaderEnabled}
            large={false}
          />
          <label htmlFor="traceparentEnabled">Enable Traceparent</label>
        </div>
        <div className={styles.traceparent}>
          <Switch
            onChange={(e) =>
              setUnsavedValues({
                ...unsavedValues,
                debugMode: e.target.checked,
              })
            }
            checked={unsavedValues.debugMode}
            large={false}
          />
          <label htmlFor="debugEnabled">Debug Mode</label>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="traceparentHeader">Traceparent Header Value:</label>
          <input
            id="traceparentHeader"
            type="string"
            value={unsavedValues.traceparentHeader}
            disabled={!unsavedValues.traceparentHeaderEnabled}
            onChange={(e) =>
              setUnsavedValues({
                ...unsavedValues,
                traceparentHeader: e.target.value,
              })
            }
            className={styles.input}
            placeholder="Enter Value (eg 00-abcdef0123456789-abcdef01-00)"
          />
        </div>
      </div>
      <div className={styles.section} data-hide-section={!isExtraSettingsOpen}>
        <div className={styles.sectionHeader}>
          <h4 className={styles.sectionTitle}>API Configuration</h4>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="apiUrl">API URL:</label>
          <input
            id="apiUrl"
            type="url"
            value={unsavedValues.apiUrl}
            onChange={(e) => setUnsavedValues({ ...unsavedValues, apiUrl: e.target.value })}
            className={styles.input}
            placeholder="Enter API URL"
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="previewUrl">Preview URL:</label>
          <input
            id="previewUrl"
            type="url"
            value={unsavedValues.previewUrl}
            onChange={(e) =>
              setUnsavedValues({
                ...unsavedValues,
                previewUrl: e.target.value,
              })
            }
            className={styles.input}
            placeholder="Enter Preview URL"
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="dashboardUrl">Dashboard URL:</label>
          <input
            id="dashboardUrl"
            type="url"
            value={unsavedValues.dashboardUrl}
            onChange={(e) =>
              setUnsavedValues({
                ...unsavedValues,
                dashboardUrl: e.target.value,
              })
            }
            className={styles.input}
            placeholder="Enter Dashboard URL"
          />
        </div>
      </div>
      <div className={styles.actions}>
        <button onClick={handleSave} className={styles.button}>
          Save Settings
        </button>
        <button onClick={onClose} className={styles.cancel_action}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export const getApiUrl = async (): Promise<string> => {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["apiUrl"], (result) => {
      resolve(result.apiUrl || DEFAULT_SIGNADOT_API_URL);
    });
  });
};

export default Settings;
