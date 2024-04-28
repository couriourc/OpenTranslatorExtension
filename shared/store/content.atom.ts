import {z} from "zod";
import {atomWithImmer, useImmerAtom} from "jotai-immer";
import {useMemo} from "react";

const TranslatorStateEnum = ["pre", "editing", "ing", 'over'] as const;
export const ZodTranslatorStore = z.enum(TranslatorStateEnum);
export type ZodTranslatorStoreEnum = z.infer<typeof ZodTranslatorStore>;

interface transformer_atom {
    translator_state: ZodTranslatorStoreEnum;
}

export const transformer_atom = atomWithImmer<transformer_atom>({
    translator_state: ZodTranslatorStore.Enum.pre,
})
const DisplayNames = {
    "pre": "翻译中",
    "editing": "编辑中",
    "ing": "火力翻译中",
    "over": "翻译结果"
} as Record<ZodTranslatorStoreEnum, string>;

export function useTransformStore() {
    const [state, setState] = useImmerAtom(transformer_atom)
    console.log(`state.translator_state-->${state.translator_state}`)

    const displayName: string = useMemo(() => DisplayNames[state.translator_state], [state.translator_state])
    return {
        state,
        displayName,
        update(state: ZodTranslatorStoreEnum) {
            setState((_state) => {
                _state.translator_state = state;
            })
        },
    } as ({
        state: transformer_atom;
        displayName: string;
        update(state: ZodTranslatorStoreEnum): void;
    })
}
