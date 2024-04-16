import { callOpenAI } from "./apis/openai"
import $ from 'jquery';
import { cx, css } from "@emotion/css";
import 'uno.css';

function getSelectedText(): string {
  const selection = window.getSelection();
  return selection?.toString() ?? "";
}

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: "document_end",
  async main(e) {
    let $ui;
    const ui = await createShadowRootUi(e, {
      name: 'open-ai',
      position: 'overlay',
      onMount(container) {
        const $container = $(container);
        $container.addClass(cx('absolute w-120px'));
        $container.html(`<div>asd</div>`)
      }
    })
    setTimeout(() => {
      ui.mount();
      // 绑定 ui
      $ui = $('open-ai')
        .css(
          {
            position: 'fixed',
            top: "2em",
            left: "2em",
            width: '300px',
            height: '200px',
            background: 'transparent',
            "backdrop-filter": 'blur(6px)',
            "border-radius": '6px',
            "box-shadow": "0 0 4px 0 rgba(0,0,0,.3)",
            "z-index": 2 ^ 64,
            "cursor": 'pointer',
          }
        )

    })

    browser.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
      switch (request.type) {
        case "open-translator":
          const selectedText = getSelectedText();
          break;
      }
    });


  },

});

