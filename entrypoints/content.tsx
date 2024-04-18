import React, {useEffect, useRef, useState} from 'react';
import ReactDOM from 'react-dom/client';
import {cx} from "@emotion/css";
import 'uno.css';
import "@/assets/styles/style.less";
import {motion, useDragControls} from "framer-motion";
import {
    Avatar,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    Divider,
    NextUIProvider,
    ScrollShadow,
    Select,
    SelectItem
} from "@nextui-org/react";
import {IoIosHeartEmpty, IoMdCopy} from "react-icons/io";
import {Logo, LogoWithName} from "@/shared/components/Logo.tsx";
import {popupCardOffset, zIndex} from "@/shared/constants";
import {DndProvider} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";
import {IoClose} from "react-icons/io5";
import {usePanelStore} from "@/shared/store";
import {GPTEngine, WrapperHelper} from "@/shared/designPattern/Singleton.ts";
import {getClientX, getClientY, UserEventType} from "@/shared/utils.ts";
import $ from "jquery";
import {ALL_DOM_EVENTS, trigger_wrapper_jquery_event, wrap_jquery_event} from "@/shared/events";
import {OpenAIEngine} from "@/shared/engines/openai.ts";
import {Markdown} from "@/shared/components/Markdown.tsx";
import {supportedLanguages} from "@/shared/lang";

function getSelectedText(): string {
    const selection = window.getSelection();
    return selection?.toString() ?? "";
}

let $ui: JQuery;

function EnginePanel({selection}: { selection: string }) {

    const CardMotion = motion(Card);
    const controls = useDragControls();

    function startDrag(event: React.PointerEvent<HTMLDivElement>) {
        controls.start(event);
    }

    const [message, syncMessage] = useState<string>("# GPT 翻译助手");
    GPTEngine.then((gpt) => {
        gpt.on_message((msg: any) => {
            syncMessage((m) => m + msg.content);
        });
    });
    const ref = useRef<HTMLDivElement>(null);
    const [is_loaded, setIsLoaded] = useState(false);
    useEffect(() => {
        setIsLoaded(true);
    }, []);
    return <Card
        className={cx('w-full h-full min-h-300px')}
        ref={element => {
            //@ts-ignore
            ref.current = element!;
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

            <div className={"flex w-full justify-end gap-12px  items-center"}>

                {
                    Assert(is_loaded, <Select
                        popoverProps={{
                            portalContainer: ref.current!,
                            className: cx("max-h-120px overflow-auto overflow-x-hidden"),
                        }}
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

                <IoClose></IoClose>
            </div>
        </CardHeader>
        <CardBody
            className={'flex flex-col w-full h-full box-border'}
        >
            <form className={cx('flex flex-col gap-12px')} onSubmit={(e) => e.preventDefault()}>

                <Divider></Divider>
                <CardBody>
                    <ScrollShadow hideScrollBar className="max-h-40vh">
                        <Markdown>{message}</Markdown>
                    </ScrollShadow>
                </CardBody>
            </form>
        </CardBody>
        <CardFooter className={"flex justify-end"}>
            <div className="flex gap-1">
                <IoMdCopy title={"Copy Me"}></IoMdCopy>
                <IoIosHeartEmpty title={"Collect Me"}></IoIosHeartEmpty>
            </div>
        </CardFooter>
    </Card>;
}

function Assert(bool: boolean, Component: React.ReactNode) {

    if (bool) return Component;
    return null;
}

function PanelHeader() {
    const [panel, setPanel] = usePanelStore();

    function showPanel() {
        setPanel((state) => {
            state.isOpen = true;
        });
    }

    function closePanel() {
        setPanel((state) => {
            state.isOpen = false;
        });
    }

    const MotionAvatar = motion(Avatar);

    const [is_hovering, set_is_hovering] = useState<boolean>(false);
    return <div className={cx(
        "flex bg-white! shadow-sm gap-4px my-4px px-8px rounded-2em h-2em  w-fit items-center ",
    )}
                onMouseEnter={(e) => {
                    set_is_hovering(true);
                }}
                onMouseLeave={(e) => {
                    set_is_hovering(false);
                }}
    >
        {
            <MotionAvatar icon={<Logo/>}
                          radius="md"
                          className={
                              cx("w-6 h-6  bg-transparent cursor-pointer hover:bg-#ecf0f1 dark:hover:bg-#57606f")
                          }
                          onClick={showPanel}
                          showFallback
            />
        }
        {
            Assert(
                is_hovering,
                <MotionAvatar
                    onClick={closePanel}
                    icon={<IoClose size={18}/>}
                    radius="md"
                    className="close w-6 h-6 text-tiny bg-transparent cursor-pointer hover:text-red animate-fade-in"
                    showFallback
                />
            )
        }
    </div>;
}


function ContentApp({wrapper}: { wrapper: HTMLElement }) {
    const [panel, setPanel] = usePanelStore();
    /*@REMEMBER_ME 这里配置使用的引擎*/
    useEffect(() => {
        console.log("this");
    }, []);
    const [panel_position, setPanel_position] = useState<DOMRect>();
    const [selection, set_selection] = useState<string>("");
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const listen = (e: any) => {
            const postion = (e)?.getBoundingClientRect();
            $(ref.current as HTMLElement).css({
                position: "fixed",
                zIndex: zIndex,
                width: '380px',
                top: postion?.top + "px",
                left: postion?.left + "px",
            });
        };

        return wrap_jquery_event("show-popup", listen).unlisten;
    });

    return <div
        ref={r => {
            //@ts-ignore
            ref.current = r!;
        }}
    >
        <PanelHeader/>
        {
            Assert(panel.isOpen as boolean, <EnginePanel selection={selection}></EnginePanel>)
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

function makeShowPopupEvent<T extends any>(params: CustomEventInit<T>) {
    return new CustomEvent("show-popup", params);
}

function receiveHidePopupEvent<T extends any>(obj: {
    listen: Function,
    unlisten: Function
}) {
    obj.unlisten = () => {
    };
    WrapperHelper.then(({$ui}) => {
        console.log(ALL_DOM_EVENTS["hide-popup"]);
        $ui.on("hide-popup", () => {
            obj.listen();
        });
        obj.unlisten = () => $ui.off("hide-popup");
    });
}

let is_showed_popup = false;
export default defineContentScript({
    matches: ['<all_urls>'],
    runAt: "document_end",
    cssInjectionMode: "ui",
    async main(e) {
        const app_container = await createShadowRootUi(e, {
            async onMount(wrapper: HTMLElement) {
                $ui = $(wrapper);

                let lastMouseEvent;
                let mousedownTarget: EventTarget;
                const mouseUpHandler = async (event: UserEventType) => {
                    lastMouseEvent = event;

                    if (
                        (mousedownTarget instanceof HTMLInputElement || mousedownTarget instanceof HTMLTextAreaElement)) {
                        return;
                    }
                    window.setTimeout(async () => {
                        const sel = window.getSelection();
                        let text = (sel?.toString() ?? '').trim();
                        if (!text) {
                            if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
                                const elem = event.target;
                                text = elem.value.substring(elem.selectionStart ?? 0, elem.selectionEnd ?? 0).trim();
                            }
                            console.log(getElementByXpath(getPathTo(event.target as HTMLElement)));
                            if (is_showed_popup && !!getElementByXpath(getPathTo(event.target as HTMLElement))) {
                                trigger_wrapper_jquery_event("hide-popup");
                                $ui.hide();
                                is_showed_popup = false;
                            }
                        } else {
                            is_showed_popup = true;
                            const x = getClientX(event);
                            const y = getClientY(event);
                            $ui.show();
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

                ReactDOM.createRoot(wrapper).render(
                    <React.StrictMode>
                        <NextUIProvider>
                            <DndProvider backend={HTML5Backend}>
                                <ContentApp wrapper={wrapper}/>
                            </DndProvider>
                        </NextUIProvider>
                    </React.StrictMode>,
                );
            },
            name: "open-ai-translator",
            position: "overlay",
            append: "first",
        });

        /*@REMEMBER ME*/
        GPTEngine.set(new OpenAIEngine().use_bypass());
        app_container.mount();
    },

});

