import {LanguageDetectionEngine} from "@/shared/lang";

export interface ISettingsOption {
    languageDetectionEngine: LanguageDetectionEngine;
    pinned: boolean;
}

export const getSettings: () => Promise<ISettingsOption> = async () => {
    return {
        languageDetectionEngine: "local",
        autoTranslate: true,
        pinned: false,
    };
};

