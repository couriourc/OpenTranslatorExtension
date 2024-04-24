import {detectLang} from "@/shared/lang/index.ts";
/*@ts-ignore*/
import {Segment, useDefault, cnPOSTag, enPOSTag, POSTAG} from 'segmentit';

interface ISegmentInfo {
    isWordLike: boolean;
    segment: string;
}

export const segment = async (text: string) => {
    const locals = await detectLang(text);
    console.log(locals);
    switch (locals) {
        case "zh-Hans":
        case "zh-Hant":
            const segmentit = useDefault(new Segment());
            const result = segmentit.doSegment(text, {
                stripPunctuation: false
            });
            console.log(result.map((i: any) => {
                return {
                    segment: i.w,
                    isWordLike: i.p !== POSTAG.D_W
                };
            }));
            return result.map((i: any) => {
                return {
                    segment: i.w,
                    isWordLike: i.p !== POSTAG.D_W
                };
            }) as ISegmentInfo[];
        default:
            const segment = new Intl.Segmenter(locals, {granularity: 'word'});
            return [...segment.segment(text)[Symbol.iterator]()] as ISegmentInfo[];
    }

};
