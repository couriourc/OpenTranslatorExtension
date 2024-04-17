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
import {GPTEngine} from "@/shared/designPattern/Singleton.ts";
import {OpenAIEngine} from "@/shared/engines/openai.ts";
import {getClientX, getClientY, UserEventType} from "@/shared/utils.ts";
import $ from "jquery";

function getSelectedText(): string {
    const selection = window.getSelection();
    return selection?.toString() ?? "";
}

let $ui: JQuery;

function EnginePanel() {

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
                    className="w-full"
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
        setPanel((panel) => {
            return {
                ...panel,
                isOpen: true,
            };
        });
    }

    function closePanel() {
        setPanel((panel) => {
            return {
                ...panel,
                isClose: true,

            };
        });
    }

    return <div className={cx(
        "flex bg-white! shadow-sm gap-4px my-4px px-8px rounded-2em h-2em w-fit items-center ",
    )}
                onMouseEnter={(e) => {
                }}
                onMouseLeave={(e) => {

                }}
    >
        <Avatar icon={<Logo/>}
                radius="md"
                className={
                    cx("w-6 h-6 text-tiny bg-transparent cursor-pointer")
                }
                onClick={showPanel}
                showFallback
        >
        </Avatar>
        {
            (() => {
                const MotionAvatar = motion(Avatar);
                return <MotionAvatar
                    onClick={closePanel}
                    icon={<IoClose size={18}/>}
                    radius="md"
                    className="close w-6 h-6 text-tiny bg-transparent cursor-pointer hover:text-red "
                    showFallback>
                </MotionAvatar>;
            })()
        }
    </div>;
}


function ContentApp({wrapper}: { wrapper: HTMLElement }) {

    const [panel, setPanel] = usePanelStore();

    const callback = useCallback(() => {
        const openApiEngine = new OpenAIEngine();
        console.log(panel.openAiKey);
        openApiEngine.openApiKey = panel.openAiKey;
        GPTEngine.set(openApiEngine);
    }, [panel]);
    callback();
    useEffect(() => {
        if (panel.isClose) {
            wrapper.dispatchEvent(new CustomEvent("hide-popup", {
                detail: null,
            }));
        }
    }, [panel]);
    const [panel_position, setPanel_position] = useState<DOMRect>();
    useEffect(() => {
        const listen = (e) => {
            setPanel_position(e.detail.getBoundingClientRect());
        };
        wrapper.addEventListener("show-popup", listen);
        return () => {
            wrapper.removeEventListener("show-popup", listen);
        };
    });
    //@ts-ignore
    return <div
        style={{
            position: "fixed",
            top: panel_position?.top + "px",
            left: panel_position?.left + "px",
            zIndex: zIndex,
            minWidth: '280px',
            minHeight: '500px',

        }}

    >
        <PanelHeader></PanelHeader>
        {
            Assert(panel.isOpen as boolean, <EnginePanel></EnginePanel>)
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
                $ui.hide();

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
                            $ui.show();
                            const x = getClientX(event);
                            const y = getClientY(event);
                            wrapper.dispatchEvent(new CustomEvent("show-popup", {
                                detail: {
                                    getBoundingClientRect: () => new DOMRect(x, y, popupCardOffset, popupCardOffset)
                                }
                            }));
                        }
                    });

                };

                document.addEventListener('mouseup', mouseUpHandler);
                document.addEventListener('touchend', mouseUpHandler);
                wrapper.addEventListener("hide-popup", () => {
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


        browser.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
            switch (request.type) {
                case "open-translator":
                    const selectedText = getSelectedText();
                    break;
            }
        });


    },

});

