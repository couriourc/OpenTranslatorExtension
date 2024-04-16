import React from 'react';
import ReactDOM from 'react-dom/client';
import {cx} from "@emotion/css";
import 'uno.css';
import "@/assets/styles/style.less";
import {motion} from "framer-motion";
import {useMouse} from "@uidotdev/usehooks";
import {Button, Divider, NextUIProvider, Select, SelectItem, Textarea} from "@nextui-org/react";
import {CiRepeat} from "react-icons/ci";

function getSelectedText(): string {
    const selection = window.getSelection();
    return selection?.toString() ?? "";
}

function ContentApp() {
    const [{x, y}] = useMouse();
    return <motion.div
        animate={{}}
        style={{
            top: "2em",
            left: "2em",
            padding: '6px',
            position: 'fixed',
            background: 'transparent',
            cursor: 'pointer',
            width: '500px',
            minHeight: '200px',
            backdropFilter: 'blur(6px)',
            borderRadius: '6px',
            boxShadow: "0 0 4px 0 rgba(0,0,0,.3)",
            zIndex: 2 ^ 64,
            boxSizing: 'border-box',
        }}
    >
        <div
            className={'flex flex-col w-full h-full box-border'}
        >
            <form className={cx('flex flex-col gap-12px')} onSubmit={(e) => e.preventDefault()}>
                <div className={cx("w-full flex justify-around items-center py-12px")}>
                    <Select
                        radius={"sm"}
                        size={"sm"}
                        label="当前语言"
                        placeholder="Select a Language"
                        className={cx("max-w-[45%]", "h-full")}
                    >
                        <SelectItem value={"asdk"} key={"asdjai"}>
                            English
                        </SelectItem>
                    </Select>
                    <Button isIconOnly size={"sm"} aria-label="Switch" title={"切换语言"}>
                        <CiRepeat></CiRepeat>
                    </Button>
                    <Select
                        radius={"sm"}
                        size={"sm"}
                        label="目标语言"
                        placeholder="Select a Language"
                        className="max-w-[45%]"
                    >
                        <SelectItem value={"asdk"} key={"asdjai"}>
                            English
                        </SelectItem>
                    </Select>
                </div>

                <Divider></Divider>

                <Textarea
                    label="翻译结果"
                    placeholder="Enter your description"
                    className="w-full"
                />
            </form>
        </div>
    </motion.div>;
}

export default defineContentScript({
    matches: ['<all_urls>'],
    runAt: "document_end",
    cssInjectionMode: "ui",
    async main(e) {
        let $ui;
        const app_container = await createShadowRootUi(e, {
            async onMount(wrapper: HTMLElement) {
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

