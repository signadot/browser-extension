import React, { useEffect, useState } from 'react';
import styles from './Settings.module.css';
import { Button } from '@blueprintjs/core';
import { auth } from "../../contexts/auth";

// Import the headers constant
const ROUTING_HEADERS = {
  "baggage": `sd-routing-key={routingKey},sd-sandbox={routingKey}`,
  "ot-baggage-sd-routing-key": `{routingKey}`,
  "ot-baggage-sd-sandbox": `{routingKey}`,
  "tracestate": `sd-routing-key={routingKey},sd-sandbox={routingKey}`,
  "uberctx-sd-routing-key": `{routingKey}`,
  "uberctx-sd-sandbox": `{routingKey}`,
};

export const DEFAULT_API_URL = 'https://api.signadot.com/';
export const DEFAULT_PREVIEW_URL = 'https://preview.signadot.com/';
const UNLOCK_KEYS = ['Control', 'Shift', 'u']; // Ctrl+Shift+U to unlock

const AUTH_SESSION_COOKIE_NAME = 'signadot-auth';


interface SettingsProps {
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onClose }) => {
  const [apiUrl, setApiUrl] = useState<string>(DEFAULT_API_URL);
  const [previewUrl, setPreviewUrl] = useState<string>(DEFAULT_PREVIEW_URL);
  const [showValues, setShowValues] = useState(false);
  const [isApiEditable, setIsApiEditable] = useState(false);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load saved API URL when component mounts
    chrome.storage.sync.get(['apiUrl', 'previewUrl'], (result) => {
      setApiUrl(result.apiUrl || DEFAULT_API_URL);
      setPreviewUrl(result.previewUrl || DEFAULT_PREVIEW_URL);
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      setPressedKeys(prev => {
        const newKeys = new Set(prev);
        newKeys.add(e.key);
        
        // Check if all unlock keys are pressed
        if (UNLOCK_KEYS.every(key => newKeys.has(key))) {
          setIsApiEditable(true);
        }
        
        return newKeys;
      });
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setPressedKeys(prev => {
        const newKeys = new Set(prev);
        newKeys.delete(e.key);
        return newKeys;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleSave = () => {
    const cleanApiUrl = apiUrl.replace(/\/+$/, '');
    const cleanPreviewUrl = previewUrl.replace(/\/+$/, '');
    
    chrome.storage.sync.set({ 
      apiUrl: cleanApiUrl,
      previewUrl: cleanPreviewUrl 
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
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Settings</h3>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h4 className={styles.sectionTitle}>Headers Being Added</h4>
          <Button
            small
            minimal
            onClick={() => setShowValues(!showValues)}
          >
            {showValues ? 'Hide Values' : 'Show Values'}
          </Button>
        </div>
        <div className={styles.headersList}>
          {Object.entries(ROUTING_HEADERS).map(([header, value]) => (
            <div key={header} className={styles.headerItem}>
              <span className={styles.headerName}>{header}</span>
              {showValues && (
                <div className={styles.headerValue}>{value}</div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h4 className={styles.sectionTitle}>API Configuration</h4>
          {!isApiEditable && (
            <small className={styles.unlockHint}>Press Ctrl+Shift+U to edit</small>
          )}
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
            disabled={!isApiEditable}
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
            disabled={!isApiEditable}
          />
        </div>
      </div>

      <button 
        onClick={handleSave} 
        className={styles.button}
        disabled={!isApiEditable}
      >
        Save Settings
      </button>
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
