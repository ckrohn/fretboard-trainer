import { createContext, createElement, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { SIMPLE_INTERVALS } from "../music/intervals";
import { getStringNumbersForTuning } from "../music/instruments";
import { getTuningById, STANDARD_6_STRING_TUNING } from "../music/tunings";
import { LOCAL_STORAGE_KEYS, readLocalStorageJson, removeLocalStorageValue, writeLocalStorageJson } from "../utils/localStorage";
import type { AppSettings } from "../types/settings";
import type { InstrumentType, StringNumber, Tuning } from "../types/music";

export const DEFAULT_SETTINGS: AppSettings = {
  instrumentType: "sixStringGuitar",
  tuningId: STANDARD_6_STRING_TUNING.id,
  startFret: 0,
  endFret: 12,
  selectedStrings: getStringNumbersForTuning(STANDARD_6_STRING_TUNING),
  accidentalPreference: "sharps",
  showNoteNames: false,
  showStringNames: true,
  showFretNumbers: false,
  highStringOnTop: true,
  allowedIntervals: SIMPLE_INTERVALS.map((interval) => interval.id),
  listeningPlaybackMode: "melodicAscending"
};

type SelectedStringsByInstrument = Partial<Record<InstrumentType, StringNumber[]>>;

type SettingsContextValue = {
  settings: AppSettings;
  activeTuning: Tuning;
  setInstrumentType: (instrumentType: InstrumentType) => void;
  setFretRange: (startFret: number, endFret: number) => void;
  setSelectedStrings: (selectedStrings: StringNumber[]) => void;
  toggleString: (stringNumber: StringNumber) => void;
  setSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  toggleAllowedInterval: (intervalId: string) => void;
  resetSettings: () => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

const tuningIdForInstrument = (instrumentType: InstrumentType): string =>
  instrumentType === "sevenStringGuitar" ? "standard-7" : "standard-6";

const isInstrumentType = (value: unknown): value is InstrumentType =>
  value === "sixStringGuitar" || value === "sevenStringGuitar";

const validateSettings = (settings: AppSettings): AppSettings => {
  let activeTuning: Tuning;
  let didFallbackToDefaultTuning = false;

  try {
    activeTuning = getTuningById(settings.tuningId);
  } catch {
    activeTuning = STANDARD_6_STRING_TUNING;
    didFallbackToDefaultTuning = true;
  }

  const instrumentType = didFallbackToDefaultTuning
    ? STANDARD_6_STRING_TUNING.instrumentType
    : isInstrumentType(settings.instrumentType)
      ? settings.instrumentType
      : activeTuning.instrumentType;

  if (activeTuning.instrumentType !== instrumentType) {
    activeTuning = getTuningById(tuningIdForInstrument(instrumentType));
  }

  const startFret = Math.max(0, Math.trunc(Number(settings.startFret)) || 0);
  const rawEndFret = Math.trunc(Number(settings.endFret));
  const endFret = Number.isFinite(rawEndFret) ? Math.max(startFret, rawEndFret) : startFret;
  const tuningStringNumbers = getStringNumbersForTuning(activeTuning);
  const tuningStringSet = new Set(tuningStringNumbers);
  const selectedStrings = Array.isArray(settings.selectedStrings)
    ? settings.selectedStrings.filter((stringNumber) => tuningStringSet.has(stringNumber))
    : [];
  const allowedIntervalIds = new Set<string>(SIMPLE_INTERVALS.map((interval) => interval.id));
  const allowedIntervals = Array.isArray(settings.allowedIntervals)
    ? settings.allowedIntervals.filter((intervalId) => allowedIntervalIds.has(intervalId))
    : [];

  return {
    ...DEFAULT_SETTINGS,
    ...settings,
    instrumentType,
    tuningId: activeTuning.id,
    startFret,
    endFret,
    selectedStrings: selectedStrings.length > 0 ? selectedStrings : tuningStringNumbers,
    accidentalPreference: settings.accidentalPreference === "flats" ? "flats" : "sharps",
    showNoteNames: Boolean(settings.showNoteNames),
    showStringNames: typeof settings.showStringNames === "boolean" ? settings.showStringNames : DEFAULT_SETTINGS.showStringNames,
    showFretNumbers: Boolean(settings.showFretNumbers),
    highStringOnTop: typeof settings.highStringOnTop === "boolean" ? settings.highStringOnTop : DEFAULT_SETTINGS.highStringOnTop,
    allowedIntervals: allowedIntervals.length > 0 ? allowedIntervals : DEFAULT_SETTINGS.allowedIntervals,
    listeningPlaybackMode: settings.listeningPlaybackMode === "harmonic" ? "harmonic" : "melodicAscending"
  };
};

const loadSettings = (): AppSettings =>
  validateSettings(readLocalStorageJson(LOCAL_STORAGE_KEYS.settings, DEFAULT_SETTINGS));

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [selectedStringsByInstrument, setSelectedStringsByInstrument] =
    useState<SelectedStringsByInstrument>({
      [settings.instrumentType]: settings.selectedStrings
    });

  const activeTuning = useMemo(() => getTuningById(settings.tuningId), [settings.tuningId]);

  useEffect(() => {
    writeLocalStorageJson(LOCAL_STORAGE_KEYS.settings, settings);
  }, [settings]);

  const updateSettings = (updater: (current: AppSettings) => AppSettings) => {
    setSettings((current) => validateSettings(updater(current)));
  };

  const setInstrumentType = (instrumentType: InstrumentType) => {
    updateSettings((current) => {
      const nextTuning = getTuningById(tuningIdForInstrument(instrumentType));
      const currentTuning = getTuningById(current.tuningId);
      const storedSelection = selectedStringsByInstrument[instrumentType];
      const defaultSelection = getStringNumbersForTuning(nextTuning);
      const nextSelectedStrings = storedSelection ?? defaultSelection;

      setSelectedStringsByInstrument((currentSelections) => ({
        ...currentSelections,
        [currentTuning.instrumentType]: current.selectedStrings
      }));

      return {
        ...current,
        instrumentType,
        tuningId: nextTuning.id,
        selectedStrings: nextSelectedStrings
      };
    });
  };

  const setFretRange = (startFret: number, endFret: number) => {
    updateSettings((current) => ({ ...current, startFret, endFret }));
  };

  const setSelectedStrings = (selectedStrings: StringNumber[]) => {
    updateSettings((current) => ({ ...current, selectedStrings }));
    setSelectedStringsByInstrument((currentSelections) => ({
      ...currentSelections,
      [settings.instrumentType]: selectedStrings
    }));
  };

  const toggleString = (stringNumber: StringNumber) => {
    const selectedStringSet = new Set(settings.selectedStrings);
    selectedStringSet.has(stringNumber)
      ? selectedStringSet.delete(stringNumber)
      : selectedStringSet.add(stringNumber);

    const nextSelectedStrings = getStringNumbersForTuning(activeTuning).filter((candidate) =>
      selectedStringSet.has(candidate)
    );

    if (nextSelectedStrings.length > 0) {
      setSelectedStrings(nextSelectedStrings);
    }
  };

  const setSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    updateSettings((current) => ({ ...current, [key]: value }));
  };

  const toggleAllowedInterval = (intervalId: string) => {
    const currentAllowed = new Set(settings.allowedIntervals);
    currentAllowed.has(intervalId)
      ? currentAllowed.delete(intervalId)
      : currentAllowed.add(intervalId);

    if (currentAllowed.size > 0) {
      setSetting("allowedIntervals", Array.from(currentAllowed));
    }
  };

  const resetSettings = () => {
    removeLocalStorageValue(LOCAL_STORAGE_KEYS.settings);
    setSettings(DEFAULT_SETTINGS);
    setSelectedStringsByInstrument({
      [DEFAULT_SETTINGS.instrumentType]: DEFAULT_SETTINGS.selectedStrings
    });
  };

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      activeTuning,
      setInstrumentType,
      setFretRange,
      setSelectedStrings,
      toggleString,
      setSetting,
      toggleAllowedInterval,
      resetSettings
    }),
    [settings, activeTuning]
  );

  return createElement(SettingsContext.Provider, { value }, children);
}

export const useSettings = (): SettingsContextValue => {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider.");
  }

  return context;
};
