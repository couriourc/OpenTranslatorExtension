import {LanguageDetectionEngine} from "@/shared/lang";

export interface ISettingsOption {
    languageDetectionEngine: LanguageDetectionEngine;
}

export const getSettings: () => ISettingsOption = () => {
    return {
        languageDetectionEngine: "local"
    };
};

