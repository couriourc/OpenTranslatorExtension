import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom/client';
import {cx, css} from "@emotion/css";
import 'uno.css';

function getSelectedText(): string {
    const selection = window.getSelection();
    return selection?.toString() ?? "";
}

function ContentApp() {

    return <div>
        <form className={cx('flex')}
              style={{
                  display: 'flex',
                  gap: '12px'
              }}
              onSubmit={(e) => e.preventDefault()}>
            <input className={'w-full'} style={{width: '100%'}}/>
            <input className={'w-full'} style={{width: '100%'}}/>
        </form>
        <textarea></textarea>
        <hr/>
        <textarea></textarea>
    </div>;
}

export default defineContentScript({
    matches: ['<all_urls>'],
    runAt: "document_end",
    cssInjectionMode: 'manifest', // 注入模式
    async main(e) {
        let $ui;
        const ui = await createShadowRootUi(e, {
            name: 'open-ai',
            position: 'overlay',
            onMount(container) {

                ReactDOM.createRoot(container).render(
                    <React.StrictMode>
                        <ContentApp/>
                    </React.StrictMode>,
                );
            }
        });

        setTimeout(() => {
            ui.mount();
            // 绑定 ui
            $ui = $('open-ai')
                .css(
                    {
                        position: 'fixed',
                        top: "2em",
                        left: "2em",
                        width: '500px',
                        height: '200px',
                        background: 'transparent',
                        "backdrop-filter": 'blur(6px)',
                        "border-radius": '6px',
                        "box-shadow": "0 0 4px 0 rgba(0,0,0,.3)",
                        "z-index": 2 ^ 64,
                        "cursor": 'pointer',
                    }
                );

        });

        browser.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
            switch (request.type) {
                case "open-translator":
                    const selectedText = getSelectedText();
                    break;
            }
        });


    },

});

