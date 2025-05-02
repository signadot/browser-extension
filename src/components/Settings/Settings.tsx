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
  PROD_SIGNADOT_API_URL,
  PROD_SIGNADOT_PREVIEW_URL,
  PROD_SIGNADOT_DASHBOARD_URL,
  STAGING_SIGNADOT_API_URL,
  STAGING_SIGNADOT_PREVIEW_URL,
  STAGING_SIGNADOT_DASHBOARD_URL,
} from "../../contexts/StorageContext/defaults";
import { useAuth } from "../../contexts/AuthContext";
import { sanitizeUrl } from "@braintree/sanitize-url";
const AUTH_SESSION_COOKIE_NAME = "signadot-auth";

type Environment = "production" | "staging" | "custom";

interface SettingsProps {
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onClose }) => {
  const [selectedEnv, setSelectedEnv] = useState<Environment>("production");
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
  const { resetAuth } = useAuth();

  useHotkeys("ctrl+shift+u", () => setIsExtraSettingsOpen(!isExtraSettingsOpen), {
    enableOnFormTags: true,
    preventDefault: true,
  });

  useEffect(() => {
    // Determine initial environment based on current URLs
    let initialEnv: Environment = "custom";
    if (
      settings.signadotUrls.apiUrl === PROD_SIGNADOT_API_URL &&
      settings.signadotUrls.previewUrl === PROD_SIGNADOT_PREVIEW_URL &&
      settings.signadotUrls.dashboardUrl === PROD_SIGNADOT_DASHBOARD_URL
    ) {
      initialEnv = "production";
    } else if (
      settings.signadotUrls.apiUrl === STAGING_SIGNADOT_API_URL &&
      settings.signadotUrls.previewUrl === STAGING_SIGNADOT_PREVIEW_URL &&
      settings.signadotUrls.dashboardUrl === STAGING_SIGNADOT_DASHBOARD_URL
    ) {
      initialEnv = "staging";
    }
    setSelectedEnv(initialEnv);

    setUnsavedValues({
      apiUrl: settings.signadotUrls.apiUrl || DEFAULT_SIGNADOT_API_URL,
      previewUrl: settings.signadotUrls.previewUrl || DEFAULT_SIGNADOT_PREVIEW_URL,
      dashboardUrl: settings.signadotUrls.dashboardUrl || DEFAULT_SIGNADOT_DASHBOARD_URL,
      traceparentHeader: traceparent.value || DEFAULT_TRACEPARENT_VALUE,
      traceparentHeaderEnabled: traceparent.inject,
      debugMode: settings.debugMode,
    });
  }, [settings, traceparent]);

  const handleEnvironmentChange = (env: Environment) => {
    setSelectedEnv(env);
    if (env === "production") {
      setUnsavedValues((prev) => ({
        ...prev,
        apiUrl: PROD_SIGNADOT_API_URL,
        previewUrl: PROD_SIGNADOT_PREVIEW_URL,
        dashboardUrl: PROD_SIGNADOT_DASHBOARD_URL,
      }));
    } else if (env === "staging") {
      setUnsavedValues((prev) => ({
        ...prev,
        apiUrl: STAGING_SIGNADOT_API_URL,
        previewUrl: STAGING_SIGNADOT_PREVIEW_URL,
        dashboardUrl: STAGING_SIGNADOT_DASHBOARD_URL,
      }));
    }
  };

  const handleUrlChange = (field: keyof typeof unsavedValues, value: string) => {
    setUnsavedValues((prev) => ({ ...prev, [field]: value }));
    setSelectedEnv("custom");
  };

  const isReadOnly = selectedEnv === "production" || selectedEnv === "staging";

  const handleSave = () => {
    const cleanApiUrl = sanitizeUrl(unsavedValues.apiUrl);
    const cleanPreviewUrl = sanitizeUrl(unsavedValues.previewUrl);
    const cleanDashboardUrl = sanitizeUrl(unsavedValues.dashboardUrl);

    // If there is a new apiUrl, we need to reset the auth state
    if (
      cleanApiUrl !== settings.signadotUrls.apiUrl ||
      cleanPreviewUrl !== settings.signadotUrls.previewUrl ||
      cleanDashboardUrl !== settings.signadotUrls.dashboardUrl
    ) {
      resetAuth();
    }

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
          <h4 className={styles.sectionTitle}>General Settings</h4>
        </div>
        <div className={styles.traceparent}>
          <Switch
            onChange={(e) => setUnsavedValues({ ...unsavedValues, debugMode: e.target.checked })}
            checked={unsavedValues.debugMode}
            large={false}
          />
          <label htmlFor="debugEnabled">Debug Mode</label>
        </div>
      </div>
      <div className={styles.section} data-hide-section={!isExtraSettingsOpen}>
        <div className={styles.sectionHeader}>
          <h4 className={styles.sectionTitle}>API Configuration</h4>
        </div>
        <div className={styles.envToggleGroup}>
          <button
            className={styles.envToggleButton}
            data-active={selectedEnv === "production"}
            onClick={() => handleEnvironmentChange("production")}
          >
            Production
          </button>
          <button
            className={styles.envToggleButton}
            data-active={selectedEnv === "staging"}
            onClick={() => handleEnvironmentChange("staging")}
          >
            Staging
          </button>
          <button
            className={styles.envToggleButton}
            data-active={selectedEnv === "custom"}
            onClick={() => handleEnvironmentChange("custom")}
          >
            Custom
          </button>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="apiUrl">
            API URL:
            {isReadOnly && <span className={styles.envLockIcon}>🔒</span>}
          </label>
          <input
            id="apiUrl"
            type="url"
            value={unsavedValues.apiUrl}
            onChange={(e) => handleUrlChange("apiUrl", e.target.value)}
            className={`${styles.input} ${isReadOnly ? styles.readOnly : ""}`}
            placeholder="Enter API URL"
            readOnly={isReadOnly}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="previewUrl">
            Preview URL:
            {isReadOnly && <span className={styles.envLockIcon}>🔒</span>}
          </label>
          <input
            id="previewUrl"
            type="url"
            value={unsavedValues.previewUrl}
            onChange={(e) => handleUrlChange("previewUrl", e.target.value)}
            className={`${styles.input} ${isReadOnly ? styles.readOnly : ""}`}
            placeholder="Enter Preview URL"
            readOnly={isReadOnly}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="dashboardUrl">
            Dashboard URL:
            {isReadOnly && <span className={styles.envLockIcon}>🔒</span>}
          </label>
          <input
            id="dashboardUrl"
            type="url"
            value={unsavedValues.dashboardUrl}
            onChange={(e) => handleUrlChange("dashboardUrl", e.target.value)}
            className={`${styles.input} ${isReadOnly ? styles.readOnly : ""}`}
            placeholder="Enter Dashboard URL"
            readOnly={isReadOnly}
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

export default Settings;
