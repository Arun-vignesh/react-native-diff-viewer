import { DIFF_TYPES } from '../constants';

type DiffItem = {
  key: string;
  type: typeof DIFF_TYPES[keyof typeof DIFF_TYPES];
  oldValue?: string;
  newValue?: string;
};

const isObject = (item: unknown): item is Record<string, unknown> => {
  return item !== null && typeof item === 'object' && !Array.isArray(item);
};

const stringifyValue = (value: unknown): string => {
  if (value === undefined || value === null) {
    return '';
  }
  if (Array.isArray(value)) {
    return JSON.stringify(value);
  }
  return String(value);
};

const flattenObject = (obj: Record<string, unknown>, prefix = ''): Record<string, unknown> => {
  return Object.keys(obj).reduce((acc: Record<string, unknown>, key: string) => {
    const prefixedKey = prefix ? `${prefix}.${key}` : key;
    
    if (isObject(obj[key])) {
      Object.assign(acc, flattenObject(obj[key] as Record<string, unknown>, prefixedKey));
    } else {
      acc[prefixedKey] = obj[key];
    }
    
    return acc;
  }, {});
};

/**
 * Compares two JSON objects and returns an array of differences
 * @param newConfig - The new configuration object
 * @param oldConfig - The old configuration object
 * @returns Array of differences with their types and values
 */
export const diffJSON = (newConfig: unknown, oldConfig: unknown): DiffItem[] => {
  const differences: DiffItem[] = [];

  // Handle non-object inputs
  if (!isObject(newConfig) || !isObject(oldConfig)) {
    const oldStr = stringifyValue(oldConfig);
    const newStr = stringifyValue(newConfig);
    if (oldStr !== newStr) {
      differences.push({
        key: 'root',
        type: DIFF_TYPES.CHANGED,
        oldValue: oldStr,
        newValue: newStr
      });
    }
    return differences;
  }

  // Flatten both objects
  const flattenedNew = flattenObject(newConfig);
  const flattenedOld = flattenObject(oldConfig);

  // Get all keys from both flattened objects
  const allKeys = new Set([...Object.keys(flattenedNew), ...Object.keys(flattenedOld)]);

  // Compare each key
  allKeys.forEach(key => {
    const oldValue = flattenedOld[key];
    const newValue = flattenedNew[key];
    const oldValueStr = stringifyValue(oldValue);
    const newValueStr = stringifyValue(newValue);

    if (!(key in flattenedOld)) {
      // Key only exists in new config
      differences.push({
        key,
        type: DIFF_TYPES.ADDED,
        newValue: newValueStr
      });
    } else if (!(key in flattenedNew)) {
      // Key only exists in old config
      differences.push({
        key,
        type: DIFF_TYPES.REMOVED,
        oldValue: oldValueStr
      });
    } else if (oldValueStr !== newValueStr) {
      // Value changed
      differences.push({
        key,
        type: DIFF_TYPES.CHANGED,
        oldValue: oldValueStr,
        newValue: newValueStr
      });
    } else {
      // No change
      differences.push({
        key,
        type: DIFF_TYPES.UNCHANGED,
        oldValue: oldValueStr,
        newValue: newValueStr
      });
    }
  });

  // Sort differences by key for consistent display
  return differences.sort((a, b) => a.key.localeCompare(b.key));
}; 