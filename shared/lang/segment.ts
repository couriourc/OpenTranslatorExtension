import {detectLang} from "@/shared/lang/index.ts";

export const segment = async (text: string) => {
    const locals = await detectLang(text);
    const segment = new Intl.Segmenter(locals, {granularity: 'word'});
    return segment.segment(text)[Symbol.iterator]();
};
