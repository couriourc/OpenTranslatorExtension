import React, {ReactNode, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import ReactDOM from 'react-dom/client';
import {cx} from "@emotion/css";
import 'uno.css';
import "@/assets/styles/style.less";
import {useDragControls} from "framer-motion";
import {
    Avatar,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    Divider,
    ScrollShadow,
    Select,
    SelectItem,
} from "@nextui-org/react";
import {Mark, Menu, Text} from "@mantine/core";
import {IoIosHeartEmpty, IoMdCopy} from "react-icons/io";
import {Logo, LogoWithName} from "@/shared/components/Logo.tsx";
import {
    injectedShadowName,
    popupCardMaxWidth,
    popupCardMinWidth,
    popupCardOffset,
    portName,
    zIndex
} from "@/shared/constants";
import {DndProvider, useDrag} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";
import {IoClose} from "react-icons/io5";
import {usePanelStore} from "@/shared/store";
import {GPTEngine, MessagePool, WrapperHelper} from "@/shared/design-pattern/Singleton.ts";
import {$t, getCaretNodeType, getClientX, getClientY, selectCursorWord, UserEventType} from "@/shared/utils.ts";
import $ from "jquery";
import {
    listen_all_content_scripts_command,
    trigger_channel_event,
    trigger_wrapper_jquery_event,
    wrap_jquery_event
} from "@/shared/events";
import {OpenAIEngine} from "@/shared/engines/openai.ts";
import {supportedLanguages} from "@/shared/lang";
import {TranslatorAppWrapper} from "@/shared/components/App.tsx";
import {browser} from "wxt/browser";
import {getSettings} from "@/shared/config.ts";
import {CiSettings} from "react-icons/ci";
import {Markdown} from "@/shared/components/Markdown.tsx";
import {LoadingCoffee} from "@/shared/components/Animation.tsx";
import Highlighter from "react-highlight-words";
import {segment} from "@/shared/lang/segment.ts";
import useSWR from "swr";
import {SiTrueup} from "react-icons/si";

let $ui: JQuery;
let $mount: Element | null;
let selection: string;

function Preview() {
    const [message, syncMessage] = useState<string>(``);
    const gpt = GPTEngine.get();
    useEffect(() => {
        return gpt.on_message((msg: any) => {
            syncMessage((m) => m + msg.content);
        });
    }, []);

    return <>
        {
            /**@todo: 处理预览部分的信息*/
            Assert(!!!message,
                <Markdown>{message}</Markdown>,
                <LoadingCoffee/>
            )
        }
    </>;
}

interface IOriginProps {
    className: undefined | string;

}

import {db} from "@/shared/store/db";

function HighlighterMarker({
                               children,
                               highlightIndex,
                               className,
                               ...props
                           }: {
    children: ReactNode,
    highlightIndex: number,
    className: string,
}) {
    const words: Map<string, IWordInfo> = new Map();
    const [curSelected, setCurSelected] = useState<IWordInfo>({
        isKeyword: false,
        isMemo: false,
    });

    const handleInput: React.KeyboardEventHandler<HTMLElement> = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const selectedValues = useMemo(
        () => Object.keys(curSelected ?? {}).filter(key => curSelected[key as keyof IWordInfo]),
        [
            curSelected
        ]);

    function handleOneWordPick(key: keyof IWordInfo) {
        console.log(key);
        setCurSelected((state) => {
            return {
                ...state,
                [key]: !state[key]
            };
        });
    }

    return <Menu withinPortal={false}
                 closeOnClickOutside={true}
                 closeOnItemClick={false}
                 shadow="md"
                 width={200}
    >
        <Menu.Target>
            <Mark className={cx("cursor-pointer", className)} onKeyDownCapture={handleInput}>
                {children}
            </Mark>
        </Menu.Target>

        <Menu.Dropdown>
            {/**@todo 优化点击后自动关闭的 BUG*/}
            <Menu.Item rightSection={
                <SiTrueup className={cx({
                    'hidden': curSelected.isKeyword
                })}/>
            } onClick={(e) => {
                handleOneWordPick("isKeyword");
            }}>
                专有名词
            </Menu.Item>
            <Menu.Item rightSection={
                <SiTrueup
                    className={cx({
                        'hidden': curSelected.isMemo
                    })}
                />
            } onClick={(e) => {
                handleOneWordPick("isMemo");
            }}>
                备忘录
            </Menu.Item>
        </Menu.Dropdown>
    </Menu>;
}

interface IWordInfo {
    isKeyword: boolean;
    isMemo: boolean;
}

function Origin({className, ...props}: IOriginProps) {
    const {data} = useSWR(() => '/segment?selection=' + selection, async () => {
//        console.log(await db.system.get("version"));
//        await db.system.add({
//            "version": 1,
//        });
//        console.log(await db.system.count());

        const data = await segment(selection)!;
        return [...data]?.filter((seg) => !/\s/.test(seg.segment)).filter((word) => word.isWordLike);
    });

    return <div
        {...props}
    >
        <Highlighter
            highlightClassName={cx("cursor-pointer hover:bg-yellow rounded-lg bg-transparent px-2px")}
            searchWords={data?.map(word => word.segment) ?? []}
            autoEscape={true}
            textToHighlight={selection}
            highlightTag={({children, highlightIndex, className, ...props}) =>
                <HighlighterMarker {...{highlightIndex, className, ...props}}>{children}</HighlighterMarker>
            }
        />
    </div>;
}

function EnginePanel({selection}: { selection: string }) {

    const controls = useDragControls();

    function startDrag(event: React.PointerEvent<HTMLDivElement>) {
        controls.start(event);
    }

    const ref = useRef<HTMLDivElement>(null);
    const [is_loaded, setIsLoaded] = useState(false);

    useLayoutEffect(() => {
        setIsLoaded(true);
        return () => {
            $mount = null;
        };
    }, []);
    return <Card
        className={cx('w-full h-full min-h-300px w-99% m-auto pointer-events-auto overflow-visible!')}
        ref={element => {
            //@ts-ignore
            ref.current = element!;
            $mount = element!;
        }}
        isFooterBlurred
    >
        <CardHeader
            className={"justify-between py-0! mt-6px! box-border "}
        >
            <div
                onPointerDown={startDrag}
            >
                <LogoWithName></LogoWithName>
            </div>

            <div className={"flex w-full justify-end gap-4px  items-center"}>
                <IoMdCopy className={cx("animate-fade-in")} title={"Copy Me"}></IoMdCopy>
                <IoIosHeartEmpty className={cx("animate-fade-in")} title={"Collect Me"}></IoIosHeartEmpty>
                <ClosePanelButton/>
            </div>
        </CardHeader>
        <CardBody
            className={'flex flex-col w-full h-full box-border overflow-visible'}
        >
            <form className={cx('flex flex-col gap-12px')} onSubmit={(e) => e.preventDefault()}>


                <Divider></Divider>
                <CardBody>
                    <ScrollShadow hideScrollBar className="min-h-200px overflow-visible max-h-40vh">
                        <Origin className={cx("h-full")}></Origin>
                        <Preview></Preview>
                    </ScrollShadow>
                    <div className={"flex items-center"}>

                        {
                            Assert(is_loaded, <Select
                                aria-label={"翻译为"}
                                popoverProps={{
                                    portalContainer: ref.current!,
                                }}
                                listboxProps={{
                                    className: cx("max-h-100px overflow-y-auto overflow-x-hidden"),
                                }}
                                onSelect={(event) => {
                                    console.log(event);
                                }}
                                placeholder={"翻译为X"}
                                size={"sm"}
                                className="w-70px"
                            >
                                {
                                    supportedLanguages.map(([lang, name]) => {
                                        return <SelectItem key={lang} value={lang}>{name}</SelectItem>;
                                    })
                                }
                            </Select>)
                        }
                    </div>
                </CardBody>
            </form>
        </CardBody>
        <CardFooter className={"flex justify-end"}>
            <div className="flex gap-1">
                <CiSettings onClick={() => trigger_channel_event("open-setting")}
                            className={"hover:text-primary cursor-pointer"}/>

            </div>
        </CardFooter>
    </Card>;
}

function Assert(bool: boolean, Component: React.ReactNode, ComponentB?: React.ReactNode) {
    if (bool) return Component;
    if (ComponentB) return ComponentB;
    return null;
}

function ClosePanelButton() {
    const [panel, setPanel] = usePanelStore();

    function closePanel() {
        setPanel((state) => {
            state.isOpen = false;
            trigger_wrapper_jquery_event("hide-popup");
            trigger_channel_event("abort");
        });
    }

    return <Avatar
        onClick={closePanel}
        icon={<IoClose size={18}/>}
        radius="md"
        className="close w-6 h-6 text-tiny bg-transparent cursor-pointer hover:text-red animate-fade-in"
        showFallback
    />;
}

function PanelHeader() {
    const [panel, setPanel] = usePanelStore();
    const [{isDragging}, drag, preview] = useDrag(() => ({
        type: "drag",
        collect(monitor) {
            return {
                isDragging: monitor.isDragging(),
            };
        }
    }));

    function showPanel() {
        setPanel((state) => {
            state.isOpen = true;
            const openai = GPTEngine.get();
            if (!selection) return;
            openai.send_pass({
                selection: selection,
                to: '中文'
            });
        });
    }


    const [is_hovering, set_is_hovering] = useState<boolean>(false);
    return <div className={cx(
        "flex bg-white! shadow-sm gap-4px my-4px px-8px rounded-2em h-2em  w-fit items-center select-none pointer-events-auto",
    )}
                onMouseEnter={(e) => {
                    set_is_hovering(true);
                }}
                onMouseLeave={(e) => {
                    set_is_hovering(false);
                }}
    >
        {
            <Avatar icon={<Logo/>}
                    radius="md"
                    className={
                        cx("w-6 h-6  bg-transparent cursor-pointer hover:bg-#ecf0f1 dark:hover:bg-#57606f")
                    }
                    onClick={showPanel}
                    showFallback
                    ref={drag}
            />
        }
        {
            Assert(
                is_hovering,
                <ClosePanelButton/>
            )
        }
    </div>;
}

function ContentApp({wrapper}: { wrapper: HTMLElement }) {
    const [panel, setPanel] = usePanelStore();
    const [selection, set_selection] = useState<string>("");
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const listen = (e: any) => {
            $(ref.current as HTMLElement).css({
                position: "absolute",
                padding: "1em",
                boxSizing: "border-box",
                overflow: 'visible',
                top: 0 + "px",
                left: 0 + "px",
                pointerEvents: 'none',
                minHeight: (panel.isOpen ? popupCardMinWidth : 0) + "px",
                minWidth: popupCardMinWidth + "px",
                maxWidth: popupCardMaxWidth + "px",
                zIndex: zIndex,
            });
        };
        const listen_hide_popup = () => {
            setPanel((panel) => {
                panel.isOpen = false;
            });
        };
        const events = [
            wrap_jquery_event("show-popup", listen),
            wrap_jquery_event("hide-popup", listen_hide_popup),
        ];
        return () => events.forEach(fn => fn.unlisten());
    });

    return <div
        ref={r => {
            //@ts-ignore
            ref.current = r!;
        }}
    >
        {
            Assert(!panel.isOpen as boolean, <PanelHeader/>, <EnginePanel selection={selection}></EnginePanel>)
        }
    </div>;
}

function getPathTo(element: HTMLElement): string {
    if (element.id !== '')
        return 'id("' + element.id + '")';
    if (element === document.body)
        return element.tagName as string;
    if (!element) return '';

    let ix = 0;
    let siblings = (element.parentNode as HTMLElement).children ?? [];
    for (let i = 0; i < siblings.length; i++) {
        let sibling = siblings[i];
        if (sibling === element)
            return getPathTo(element.parentNode as HTMLElement) + '/' + element.tagName + '[' + (ix + 1) + ']';
        if (sibling.nodeType === 1 && sibling.tagName === element.tagName)
            ix++;
    }
    return '';
}

function getElementByXpath(path: string, parent = document) {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

let is_showed_popup = false;
const position = {
    x: 0,
    y: 0,
    offset: 0,
};
export default defineContentScript({
    matches: ['<all_urls>'],
    runAt: "document_end",
    cssInjectionMode: "ui",
    async main(e) {
        const settings = await getSettings();
        const app_container = await createShadowRootUi(e, {
            name: injectedShadowName,
            position: "overlay",
            append: "after",
            async onMount(wrapper: HTMLElement) {
                $ui = $(wrapper);

                const $container = $(app_container.shadowHost);
                let lastMouseEvent: UserEventType;
                let mousedownTarget: EventTarget;
                window.addEventListener("scroll", (event) => {
                    console.log(-window.scrollY + position.offset);
                    $container.css({
                        transform: `translateY(${-window.scrollY + position.offset}px)`,
                        top: position.y + "px",
                        marginLeft: position.x + "px",
                    });
                });

                const mouseUpHandler = async (event: UserEventType) => {
                    lastMouseEvent = event;
                    const settings = await getSettings();

                    if (
                        (mousedownTarget instanceof HTMLInputElement || mousedownTarget instanceof HTMLTextAreaElement)
                        && settings.selectInputElementsText === false
                    ) {
                        return;
                    }
                    if (event.ctrlKey) {
                        selectCursorWord(event);
                    }

                    window.setTimeout(async () => {
                        const sel = window.getSelection();
                        let text = (sel?.toString() ?? '').trim();
                        const click_target = getElementByXpath(getPathTo(event.target as HTMLElement));


                        if (!text) {
                            if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
                                const elem = event.target;
                                text = elem.value.substring(elem.selectionStart ?? 0, elem.selectionEnd ?? 0).trim();
                            }
                            if (is_showed_popup && !!click_target) {
                                trigger_wrapper_jquery_event("hide-popup");
                                $ui.hide();
                                is_showed_popup = false;
                            }
                        } else {
                            if (is_showed_popup && !click_target) return;
                            if (getCaretNodeType(event) !== Node.TEXT_NODE) {
                                console.error($t("JustSupportTextTranslate"));
                                return false;
                            }
                            is_showed_popup = true;
                            const x = getClientX(event);
                            const y = getClientY(event);
                            $ui.show();
                            selection = text;
                            position.x = x;
                            position.y = y;
                            position.offset = window.scrollY;
                            $container.css({
                                top: y + "px",
                                left: 0,
                                marginLeft: x + "px",
                                position: "fixed",
                                transform: `translateY(0)`,
                                zIndex: zIndex,
                            });
                            trigger_wrapper_jquery_event("show-popup", {
                                getBoundingClientRect: () => new DOMRect(x, y, popupCardOffset, popupCardOffset),
                                selection: text,
                            });
                        }
                    });

                };

                document.addEventListener('mouseup', mouseUpHandler);
                document.addEventListener('touchend', mouseUpHandler);

                wrapper.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                });


                wrap_jquery_event("hide-popup", () => {
                    $ui.hide();
                });


                // @REMEMBER_ME: 在此处设置了$ui
                WrapperHelper
                    .set({$ui, dom: wrapper})
                    .then(({$ui}) => {
                        $ui.hide();
                    });
                const div = document.createElement("div");
                wrapper.append(div);
                div.style.pointerEvents = "auto";
                ReactDOM.createRoot(div).render(
                    <TranslatorAppWrapper>
                        <DndProvider backend={HTML5Backend}>
                            <ContentApp wrapper={wrapper}/>
                        </DndProvider>
                    </TranslatorAppWrapper>,
                );
            }
        });

        /*@REMEMBER ME*/
        const port = browser.runtime.connect({
            name: portName,
        });
        MessagePool.set(port);
        GPTEngine.set(new OpenAIEngine().use_bypass());

        listen_all_content_scripts_command();
        app_container.mount();
    },

});

