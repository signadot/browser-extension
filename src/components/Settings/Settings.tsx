import React, { useEffect, useState } from 'react';
import styles from './Settings.module.css';
import { auth } from "../../contexts/auth";
import { useHotkeys } from 'react-hotkeys-hook';
import { useChromeStorage } from '../../hooks/storage';

export const DEFAULT_API_URL = 'https://api.signadot.com';
export const DEFAULT_PREVIEW_URL = 'https://browser-extension-auth-redirect.preview.signadot.com';
export const DEFAULT_DASHBOARD_URL = 'https://app.signadot.com';

const AUTH_SESSION_COOKIE_NAME = 'signadot-auth';

interface SettingsProps {
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onClose }) => {
  const [apiUrl, setApiUrl] = useState<string>(DEFAULT_API_URL);
  const [previewUrl, setPreviewUrl] = useState<string>(DEFAULT_PREVIEW_URL);
  const [dashboardUrl, setDashboardUrl] = useState<string>(DEFAULT_DASHBOARD_URL);
  const { apiUrl: storedApiUrl, previewUrl: storedPreviewUrl, dashboardUrl: storedDashboardUrl } = useChromeStorage();

  // Use the hook to handle Ctrl+Shift+U
  useHotkeys('ctrl+shift+u', onClose, {
    enableOnFormTags: true,
    preventDefault: true
  });

  useEffect(() => {
    setApiUrl(storedApiUrl || DEFAULT_API_URL);
    setPreviewUrl(storedPreviewUrl || DEFAULT_PREVIEW_URL);
    setDashboardUrl(storedDashboardUrl || DEFAULT_DASHBOARD_URL);
  }, [storedApiUrl, storedPreviewUrl, storedDashboardUrl]);

  const handleSave = () => {
    const cleanApiUrl = apiUrl.replace(/\/+$/, '');
    const cleanPreviewUrl = previewUrl.replace(/\/+$/, '');
    const cleanDashboardUrl = dashboardUrl.replace(/\/+$/, '');

    chrome.storage.local.set({
      apiUrl: cleanApiUrl,
      previewUrl: cleanPreviewUrl,
      dashboardUrl: cleanDashboardUrl
    }, () => {
      // After saving, update the cookie for the new domain
      chrome.cookies.get(
        { url: cleanPreviewUrl, name: AUTH_SESSION_COOKIE_NAME },
        function (cookie) {
          if (cookie) {
            // Set the cookie for the new API domain
            chrome.cookies.set(
              {
                url: cleanApiUrl,
                name: AUTH_SESSION_COOKIE_NAME,
                value: cookie.value,
              },
              () => {
                // Re-authenticate with the new API URL
                auth((authenticated) => {
                  if (authenticated) {
                    alert('Settings saved and authenticated successfully!');
                  } else {
                    alert('Settings saved but authentication failed. Please check your API URL and ensure you are logged in.');
                  }
                });
              }
            );
          } else {
            alert('Settings saved but no authentication cookie found. Please log in to Signadot first.');
          }
        }
      );
    });

    onClose();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Settings</h3>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h4 className={styles.sectionTitle}>API Configuration</h4>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="apiUrl">API URL:</label>
          <input
            id="apiUrl"
            type="url"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            className={styles.input}
            placeholder="Enter API URL"
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="previewUrl">Preview URL:</label>
          <input
            id="previewUrl"
            type="url"
            value={previewUrl}
            onChange={(e) => setPreviewUrl(e.target.value)}
            className={styles.input}
            placeholder="Enter Preview URL"
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="dashboardUrl">Dashboard URL:</label>
          <input
            id="dashboardUrl"
            type="url"
            value={dashboardUrl}
            onChange={(e) => setDashboardUrl(e.target.value)}
            className={styles.input}
            placeholder="Enter Dashboard URL"
          />
        </div>
      </div>

      <div className={styles.actions}>
        <button
            onClick={handleSave}
            className={styles.button}
        >
          Save Settings
        </button>
        <button
            onClick={onClose}
            className={styles.cancel_action}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export const getApiUrl = async (): Promise<string> => {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['apiUrl'], (result) => {
      resolve(result.apiUrl || DEFAULT_API_URL);
    });
  });
};

export default Settings;
