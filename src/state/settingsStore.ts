import { createContext, createElement, useContext, useMemo, useState, type ReactNode } from "react";
import { SIMPLE_INTERVALS } from "../music/intervals";
import { getStringNumbersForTuning } from "../music/instruments";
import { getTuningById, STANDARD_6_STRING_TUNING } from "../music/tunings";
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
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

const tuningIdForInstrument = (instrumentType: InstrumentType): string =>
  instrumentType === "sevenStringGuitar" ? "standard-7" : "standard-6";

const validateSettings = (settings: AppSettings): AppSettings => {
  const activeTuning = getTuningById(settings.tuningId);

  if (activeTuning.instrumentType !== settings.instrumentType) {
    throw new Error("Active tuning must match active instrument type.");
  }

  const startFret = Math.max(0, Math.trunc(settings.startFret));
  const endFret = Math.max(startFret, Math.trunc(settings.endFret));
  const tuningStringNumbers = getStringNumbersForTuning(activeTuning);
  const tuningStringSet = new Set(tuningStringNumbers);
  const selectedStrings = settings.selectedStrings.filter((stringNumber) =>
    tuningStringSet.has(stringNumber)
  );

  if (selectedStrings.length === 0) {
    throw new Error("Selected strings must not be empty.");
  }

  if (settings.allowedIntervals.length === 0) {
    throw new Error("Allowed intervals must not be empty.");
  }

  return {
    ...settings,
    startFret,
    endFret,
    selectedStrings
  };
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [selectedStringsByInstrument, setSelectedStringsByInstrument] =
    useState<SelectedStringsByInstrument>({
      [DEFAULT_SETTINGS.instrumentType]: DEFAULT_SETTINGS.selectedStrings
    });

  const activeTuning = useMemo(() => getTuningById(settings.tuningId), [settings.tuningId]);

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

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      activeTuning,
      setInstrumentType,
      setFretRange,
      setSelectedStrings,
      toggleString,
      setSetting,
      toggleAllowedInterval
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
