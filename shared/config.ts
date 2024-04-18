export interface ISettingsOption {
    languageDetectionEngine: "baidu" |
        "google" |
        "bing" |
        "local";
}

export const getSettings:()=>ISettingsOption = () => {
    return {
        languageDetectionEngine: "local"
    };
};

