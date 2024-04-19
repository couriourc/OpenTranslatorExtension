import {LanguageDetectionEngine} from "@/shared/lang";

export interface ISettingsOption {
    languageDetectionEngine: LanguageDetectionEngine;
    pinned: boolean;
    openAiKey: string;
    openAiUrl: string;
}

export const defaultSettings: ISettingsOption = {
    languageDetectionEngine: "local",
    openAiKey: "noopenaikey",
    openAiUrl: "http://localhost:1337",
    pinned: false,
} as const;
export const settingKeys = Object.keys(defaultSettings);
export const getSettings: () => Promise<ISettingsOption> = async () => {
    return {
        ...defaultSettings,
        ...((await browser.storage.local.get(settingKeys)) as ISettingsOption),
    };
};


export const saveSettings: (settings: Partial<ISettingsOption>) => Promise<ISettingsOption> =
    async (settings) => {
        await browser.storage.local.set(settings);
        return {
            ...defaultSettings,
            ...((await browser.storage.local.get(Object.keys(defaultSettings))) as ISettingsOption),
        };
    };
