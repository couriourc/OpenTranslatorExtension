//@ts-ignore
import {createParser} from 'eventsource-parser';
import {browser} from "wxt/browser";
import EN from "@/public/_locales/en/messages.json";

interface FetchSSEOptions extends RequestInit {
    onMessage(data: string): Promise<void>;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError(error: any): void;

    onStatusCode?: (statusCode: number) => void;
    fetcher?: (input: string, options: RequestInit) => Promise<Response>;
    useJSONParser?: boolean;
}

function tryParse(currentText: string): {
    remainingText: string
    parsedResponse: any
} {
    let jsonText: string;
    if (currentText.startsWith('[')) {
        if (currentText.endsWith(']')) {
            jsonText = currentText;
        } else {
            jsonText = currentText + ']';
        }
    } else if (currentText.startsWith(',')) {
        if (currentText.endsWith(']')) {
            jsonText = '[' + currentText.slice(1);
        } else {
            jsonText = '[' + currentText.slice(1) + ']';
        }
    } else {
        return {
            remainingText: currentText,
            parsedResponse: null,
        };
    }

    try {
        const parsedResponse = JSON.parse(jsonText);
        return {
            remainingText: '',
            parsedResponse,
        };
    } catch (e) {
        throw new Error(`Invalid JSON: "${jsonText}"`);
    }
}

export async function fetchSSE(input: string, options: FetchSSEOptions) {
    const {
        onMessage,
        onError,
        onStatusCode,
        useJSONParser = false,
        fetcher = fetch,
        ...fetchOptions
    } = options;

    let currentText = '';
    const jsonParser = async ({value, done}: { value: string; done: boolean }) => {
        if (done && !value) {
            return;
        }

        currentText += value;
        const {parsedResponse, remainingText} = tryParse(currentText);
        if (parsedResponse) {
            currentText = remainingText;
            for (const item of parsedResponse) {
                await onMessage(JSON.stringify(item));
            }
        }
    };

    const sseParser = createParser(async (event) => {
        if (event.type === 'event') {
            await onMessage(event.data);
        }
    });


    const resp = await fetcher(input, fetchOptions);
    onStatusCode?.(resp.status);
    if (resp.status !== 200) {
        onError(await resp.json());
        return;
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const reader = resp.body!.getReader();
    try {
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const {done, value} = await reader.read();
            if (done) {
                break;
            }
            const str = new TextDecoder().decode(value);
            if (useJSONParser) {
                await jsonParser({value: str, done});
            } else {
                sseParser.feed(str);
            }
        }
    } finally {
        reader.releaseLock();
    }
}

export type UserEventType = MouseEvent | TouchEvent | PointerEvent
export const getClientX = (event: UserEventType) => {
    return event instanceof MouseEvent ? event.clientX : event.changedTouches[0].clientX;
};

export const getClientY = (event: UserEventType) => {
    return event instanceof MouseEvent ? event.clientY : event.changedTouches[0].clientY;
};


export function getCaretNodeType(event: UserEventType) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (document.caretPositionFromPoint) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const range = document?.caretPositionFromPoint(getClientX(event), getClientY(event));
        if (!range) return null;
        return range.offsetNode.nodeType;
    } else if (document.caretRangeFromPoint) {
        const range = document.caretRangeFromPoint(getClientX(event), getClientY(event));
        if (!range) return null;
        return range.startContainer.nodeType;
    } else {
        return null;
    }
}

export const $t = (message: keyof typeof EN) => browser.i18n.getMessage(message as any);

export const universalFetch = fetch;
export const pick = (flag: boolean, a: any, b: any) => flag ? a : b;
