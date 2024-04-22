import {LanguageDetectionEngine} from "@/shared/lang";
import {UseThemeProps} from "next-themes/dist/types";

export interface ISettingsOption {
    languageDetectionEngine: LanguageDetectionEngine;
    pinned: boolean;
    openAiKey: string;
    openAiUrl: string;
    openAiModel: string;
    theme: UseThemeProps['systemTheme'];
    selectInputElementsText: boolean;
    cacheLastOpenedOptions: boolean;
}

export const defaultSettings: ISettingsOption = {
    languageDetectionEngine: "local",
    openAiKey: "noopenaikey",
    openAiUrl: "http://localhost:1337",
    pinned: false,
    openAiModel: "gpt-3.5-turbo",
    theme: undefined,
    selectInputElementsText: false,
    cacheLastOpenedOptions: false,
} as const;
export const settingsStorage = (() => {
    try {
        return storage?.defineItem<ISettingsOption>("local:settings", {
            defaultValue: defaultSettings,
        });
    } catch (e) {
        return null;
    }
})()!;
export const getSettings: () => Promise<ISettingsOption> = async () => {
    return {
        ...defaultSettings,
        ...((await settingsStorage.getValue()) as ISettingsOption),
    };
};


export const saveSettings: (settings: Partial<ISettingsOption>) => Promise<ISettingsOption> =
    async (settings) => {
        const savedSettings = {
            ...defaultSettings,
            ...settings,
        };
        await settingsStorage.setValue(savedSettings);
        return savedSettings;
    };
