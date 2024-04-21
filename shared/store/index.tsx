import {atomWithImmer, useImmerAtom} from "jotai-immer";
import {createStore} from 'jotai';
import {defaultSettings, getSettings, ISettingsOption, settingsStorage} from "@/shared/config.ts";

export interface IPanelStore {
    isOpen: boolean;
    isClose: boolean;
}

export const PanelStore = atomWithImmer<IPanelStore>({
    isOpen: false,
    isClose: false,
});
export const usePanelStore = () => useImmerAtom(PanelStore);
export const appStore = createStore();
export const getPanelStore = () => appStore.get(PanelStore);

/*FIXED: Sync LocalStorage*/
export const settingStore = atomWithImmer<ISettingsOption>(defaultSettings);
export const useSettingStore = () => useImmerAtom(settingStore);
export const getSettingStore = () => appStore.get(settingStore);
/*同步配置信息*/
setTimeout(async () => {
    appStore.set(settingStore, await getSettings());
}, 50);
settingsStorage.watch(async () => {
    appStore.set(settingStore, (await getSettings()) as ISettingsOption);
});

