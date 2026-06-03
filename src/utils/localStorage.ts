export const LOCAL_STORAGE_KEYS = {
  settings: "guitarTrainer.settings",
  progress: "guitarTrainer.progress"
} as const;

export const readLocalStorageJson = <T>(key: string, fallback: T): T => {
  try {
    const rawValue = window.localStorage.getItem(key);

    if (rawValue === null) {
      return fallback;
    }

    return JSON.parse(rawValue) as T;
  } catch {
    return fallback;
  }
};

export const writeLocalStorageJson = <T>(key: string, value: T): void => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Persistence should never break the trainer UI.
  }
};

export const removeLocalStorageValue = (key: string): void => {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Persistence should never break the trainer UI.
  }
};
