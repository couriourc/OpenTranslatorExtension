import {TranslatorProvider} from "@/shared/engines";
import {LanguageDetectionEngine, TranslateMode} from './lang';

export type ProxyProtocol = 'HTTP' | 'HTTPS'

type ThemeType = "light" | "dark";


export interface ISettings {
    automaticCheckForUpdates: boolean;
    apiKeys: string;
    apiURL: string;
    apiURLPath: string;
    apiModel: string;
    provider: TranslatorProvider;
    chatgptModel: string;
    defaultTranslateMode: Exclude<TranslateMode, 'big-bang'> | 'nop';
    defaultTargetLanguage: string;
    alwaysShowIcons: boolean;
    hotkey?: string;
    displayWindowHotkey?: string;
    ocrHotkey?: string;
    writingTargetLanguage: string;
    writingHotkey?: string;
    writingNewlineHotkey?: string;
    themeType?: ThemeType;
    i18n?: string;
    restorePreviousPosition?: boolean;
    selectInputElementsText?: boolean;
    readSelectedWordsFromInputElementsText?: boolean;
    runAtStartup?: boolean;
    disableCollectingStatistics?: boolean;
    allowUsingClipboardWhenSelectedTextNotAvailable?: boolean;
    pinned?: boolean;
    autoCollect?: boolean;
    hideTheIconInTheDock?: boolean;
    languageDetectionEngine?: LanguageDetectionEngine;
    autoHideWindowWhenOutOfFocus?: boolean;
    proxy?: {
        enabled?: boolean
        protocol?: ProxyProtocol
        server?: string
        port?: string
        basicAuth?: {
            username?: string
            password?: string
        }
        noProxy?: string
    };
}
