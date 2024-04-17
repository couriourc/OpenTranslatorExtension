import React, {useRef} from 'react';
import ReactDOM from 'react-dom/client';
import {cx} from "@emotion/css";
import 'uno.css';
import "@/assets/styles/style.less";
import {motion} from "framer-motion";
import {useMouse} from "@uidotdev/usehooks";
import {
    Button,
    Divider,
    NextUIProvider,
    Select,
    SelectItem,
    Textarea,
    Card,
    CardHeader,
    CardBody,
    CardFooter, DropdownItem, DropdownMenu, Dropdown, DropdownTrigger
} from "@nextui-org/react";
import {CiRepeat} from "react-icons/ci";
import {IoIosHeartEmpty, IoMdCopy} from "react-icons/io";
import {Logo, LogoWithName} from "@/shared/Logo.tsx";
import {CopyDocumentBulk} from "@nextui-org/shared-icons";

function getSelectedText(): string {
    const selection = window.getSelection();
    return selection?.toString() ?? "";
}

let $ui: HTMLElement;

function ContentApp() {
    const [{x, y}] = useMouse();
    const CardMotion = motion(Card);
    const ref = useRef<HTMLDivElement>();
    //@ts-ignore
    return <div
    >
        <Card
            ref={(r) => ref.current = r!}
            style={{
                top: "2em",
                left: "2em",
                position: 'fixed',
                cursor: 'pointer',
                width: 'auto',
                minWidth: '600px',
                minHeight: '200px',
                zIndex: 2147483,
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
                <LogoWithName></LogoWithName>

                <Dropdown
                    portalContainer={ref.current}
                    className={"z-max"}
                >
                    <DropdownTrigger>
                        <Button
                            variant={"light"}
                            className="capitalize"
                        >
                            当前语言
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
                    <IoIosHeartEmpty title={"Favirote Me"}></IoIosHeartEmpty>
                </div>
            </CardFooter>
        </Card>
    </div>;
}

export default defineContentScript({
    matches: ['<all_urls>'],
    runAt: "document_end",
    cssInjectionMode: "ui",
    async main(e) {
        const app_container = await createShadowRootUi(e, {
            async onMount(wrapper: HTMLElement) {
                $ui = wrapper;

//                const shadowRoot = wrapper.attachShadow({mode: "open"});
                ReactDOM.createRoot(wrapper).render(
                    <React.StrictMode>
                        <NextUIProvider>
                            <ContentApp/>
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

