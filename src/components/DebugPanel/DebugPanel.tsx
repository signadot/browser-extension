import React from "react";
import { Card, H5, Pre, Tag, Collapse, Button } from "@blueprintjs/core";
import { useStorage } from "../../contexts/StorageContext/StorageContext";
import styles from "./DebugPanel.module.css";

type ValueType = "string" | "number" | "boolean" | "undefined" | "object" | "function" | "array" | "null";

interface StateEntry {
  key: string;
  value: string;
  type: ValueType;
}

export const DebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const storage = useStorage();

  const storageEntries = Object.entries(storage).map(([key, value]): StateEntry | null => {
    let displayValue: string;
    let valueType: ValueType;

    // Format the value for display
    if (value === undefined) {
      displayValue = "undefined";
      valueType = "undefined";
    } else if (value === null) {
      displayValue = "null";
      valueType = "null";
    } else if (typeof value === "function") {
      displayValue = value.toString().split("{")[0].trim();
      valueType = "function";
    } else if (Array.isArray(value)) {
      displayValue = JSON.stringify(value, null, 2);
      valueType = "array";
    } else if (typeof value === "object") {
      displayValue = JSON.stringify(value, null, 2);
      valueType = "object";
    } else {
      displayValue = String(value);
      valueType = typeof value as ValueType;
    }

    if (["function"].includes(valueType)) {
      return null;
    }

    return {
      key,
      value: displayValue,
      type: valueType,
    };
  });

  if (!storage.settings.debugMode) {
    return null;
  }

  return (
    <div className={styles.debugContainer}>
      <Button
        minimal
        small
        icon={isOpen ? "chevron-down" : "chevron-right"}
        onClick={() => setIsOpen(!isOpen)}
        className={styles.toggleButton}
      >
        Debug Panel
      </Button>
      <Collapse isOpen={isOpen}>
        <Card className={styles.debugPanel}>
          <H5>Storage State Debug</H5>
          <div className={styles.stateList}>
            {(storageEntries.filter((s) => s !== null) as StateEntry[]).map(({ key, value, type }) => (
              <div key={key} className={styles.stateItem}>
                <div className={styles.stateHeader}>
                  <span className={styles.stateKey}>{key}</span>
                  <Tag minimal>{type}</Tag>
                </div>
                <Pre className={styles.stateValue}>{value}</Pre>
              </div>
            ))}
          </div>
        </Card>
      </Collapse>
    </div>
  );
};
