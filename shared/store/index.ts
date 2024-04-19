import {atomWithImmer, useImmerAtom} from "jotai-immer";
import {atom, createStore} from 'jotai';
import {atomWithStorage, selectAtom} from 'jotai/utils';

export interface IPanelStore {
    isOpen: boolean;
    isClose: boolean;
    openAiKey: string;
}

export const PanelStore = atomWithImmer<IPanelStore>({
    isOpen: false,
    isClose: false,
    openAiKey: "sk-aLHe5YUN91bM9QYqgdlWD0r6WKkR4tqhG5kHwejAbX6BhDfb",
});
export const usePanelStore = () => useImmerAtom(PanelStore);
export const appStore = createStore();
export const getPanelStore = () => appStore.get(PanelStore);

/*TODO:Sync LocalStorage*/
export function useBrowserAtom<Value extends {}>(
    initialValue: Value
) {
    const storage = atom(async (get) => {
        const value = atom(await browser.storage.local.get(Object.keys(initialValue)));
        get(value);
    }, async (get, set, args) => {
    });
}
