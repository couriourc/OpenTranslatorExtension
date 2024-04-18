import React, {useCallback, useEffect, useRef, useState} from 'react';
import ReactDOM from 'react-dom/client';
import {cx} from "@emotion/css";
import 'uno.css';
import "@/assets/styles/style.less";
import {motion, useDragControls} from "framer-motion";
import {
    Avatar,
    Button,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    Divider,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    NextUIProvider,
    Textarea
} from "@nextui-org/react";
import {IoIosHeartEmpty, IoMdCopy} from "react-icons/io";
import {Logo, LogoWithName} from "@/shared/components/Logo.tsx";
import {popupCardOffset, zIndex} from "@/shared/constants";
import {DndProvider} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";
import {IoClose} from "react-icons/io5";
import {usePanelStore} from "@/shared/store";
import {GPTEngine, WrapperHelper} from "@/shared/designPattern/Singleton.ts";
import {OpenAIEngine} from "@/shared/engines/openai.ts";
import {getClientX, getClientY, UserEventType} from "@/shared/utils.ts";
import $ from "jquery";
import {role_map, sys_map} from "@/shared/apis/openai.ts";

function getSelectedText(): string {
    const selection = window.getSelection();
    return selection?.toString() ?? "";
}

let $ui: JQuery;

function EnginePanel({selection}: { selection: string }) {

    const CardMotion = motion(Card);
    const ref = useRef<HTMLDivElement>();
    const controls = useDragControls();

    function startDrag(event: React.PointerEvent<HTMLDivElement>) {
        controls.start(event);
    }

    return <CardMotion
        exit={{opacity: 0}}
        ref={(r) => ref.current = (r as unknown as HTMLDivElement)!}
        style={{
            minWidth: '280px',
            cursor: 'pointer',
            width: 'auto',
            backdropFilter: 'blur(6px)',
            borderRadius: '6px',
            boxShadow: "0 0 4px 0 rgba(0,0,0,.3)",
            boxSizing: 'border-box',
            overflow: "visible"
        }}
        isFooterBlurred
        id={"card-main"}
    >
        <CardHeader
            className={"justify-between py-0! mt-6px! box-border shrink-0"}
        >
            <div
                onPointerDown={startDrag}
            >
                <LogoWithName></LogoWithName>
            </div>

            <Dropdown
                portalContainer={ref.current}
                className={"z-max"}
            >
                <DropdownTrigger>
                    <Button
                        variant={"light"}
                        className="capitalize"
                    >
                        切换语言
                    </Button>
                </DropdownTrigger>
                <DropdownMenu
                    aria-label="Dropdown Variants"
                    variant={"light"}
                >
                    <DropdownItem key="English">English</DropdownItem>
                    <DropdownItem key="中文" className="text-danger" color="danger">
                        中文
                    </DropdownItem>
                </DropdownMenu>
            </Dropdown>

        </CardHeader>
        <CardBody
            className={'flex flex-col w-full h-full box-border'}
        >
            <form className={cx('flex flex-col gap-12px')} onSubmit={(e) => e.preventDefault()}>

                <Divider></Divider>
                <Textarea
                    label="翻译结果"
                    placeholder="Enter your description"
                    className="w-full select-none"
                />
            </form>
        </CardBody>
        <CardFooter className={"flex justify-end"}>
            <div className="flex gap-1">
                <IoMdCopy title={"Copy Me"}></IoMdCopy>
                <IoIosHeartEmpty title={"Collect Me"}></IoIosHeartEmpty>
            </div>
        </CardFooter>
    </CardMotion>;
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

let panel_position: DOMRect = new DOMRect();

function ContentApp({wrapper}: { wrapper: HTMLElement }) {
    const [panel, setPanel] = usePanelStore();
    /*@REMEMBER_ME 这里配置使用的引擎*/
    useEffect(() => {
        console.log("this");
        if (GPTEngine._is_loaded()) return;
        const openai = new OpenAIEngine();
        openai.openApiKey = panel.openAiKey as string;
        GPTEngine.set(openai);
    }, []);
    const [panel_position, setPanel_position] = useState<DOMRect>();
    const [selection, set_selection] = useState<string>("");
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const listen = (e: any) => {
            const postion = (e?.detail)?.getBoundingClientRect();
            $(ref.current as HTMLElement).css({
                position: "fixed",
                zIndex: zIndex,
                minWidth: '280px',
                minHeight: '500px',
                top: postion?.top + "px",
                left: postion?.left + "px",
            });
        };
        wrapper.addEventListener("show-popup", listen);
        return () => {
            wrapper.removeEventListener("show-popup", listen);
        };
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
                        } else {
                            const x = getClientX(event);
                            const y = getClientY(event);
                            let panel_position = new DOMRect(x, y, popupCardOffset, popupCardOffset);
                            $ui.show();
                            wrapper.dispatchEvent(new CustomEvent("show-popup", {
                                detail: {
                                    getBoundingClientRect: () => new DOMRect(x, y, popupCardOffset, popupCardOffset),
                                    selection: text,
                                }
                            }));
                        }
                    });

                };

                document.addEventListener('mouseup', mouseUpHandler);
                document.addEventListener('touchend', mouseUpHandler);
                wrapper.addEventListener("hide-popup", () => {
                    WrapperHelper
                        .then(({$ui}) => {
                            $ui.hide();
                        });
                });

                // @REMEMBER_ME: 在此处设置了$ui
                WrapperHelper
                    .set({$ui})
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

        app_container.mount();
    },

});

