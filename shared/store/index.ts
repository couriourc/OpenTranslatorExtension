import {atomWithImmer, useImmerAtom} from "jotai-immer";
import {atom, createStore, useAtom} from 'jotai';
import {atomWithStorage, selectAtom} from 'jotai/utils';
import * as _ from 'underscore';

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
    const value = atom(initialValue);
    const [v, s] = useAtom(value);
    const storage = atom(
        async (get) => {
            s(await browser.storage.local.get(Object.keys(initialValue)) as Value);
            return get(value);
        }, async (get, set, new_val) => {
            const nextValue =
                _.isFunction(new_val) ? new_val(get(value)) : new_val;
            await browser.storage.local.set({
                initialValue: nextValue,
                ...v,
            });
        });
}

