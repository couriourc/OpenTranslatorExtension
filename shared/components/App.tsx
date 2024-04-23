import React, {ReactNode} from "react";
import {NextUIProvider,} from "@nextui-org/react";

import {ThemeProvider as NextThemesProvider} from "next-themes";
import {Toaster} from "react-hot-toast";
import {Provider as JotaiProvider} from 'jotai';
import {appStore, getSettingStore} from "@/shared/store";
import {MantineProvider, Portal} from "@mantine/core";
import {WrapperHelper} from "@/shared/design-pattern/Singleton.ts";
import 'uno.css';
import '@/assets/styles/style.less';
import {cx} from "@emotion/css";


export function TranslatorAppWrapper({children, wrapper = document.body}: {
    children: ReactNode;
    wrapper: HTMLElement
}): ReactNode {
    const store = getSettingStore();
    return <React.StrictMode>
        <JotaiProvider store={appStore}>
            <NextUIProvider>
                <MantineProvider getRootElement={() => WrapperHelper.get()?.dom! as HTMLElement ?? document.body}
                                 defaultColorScheme={store.theme}
                >
                    <NextThemesProvider
                        attribute="class"
                        defaultTheme={store.theme}
                    >
                        {children}

                        <Portal target={wrapper}>
                            <div className={cx("pointer-events-auto ")}>
                                <Toaster   position="top-center"
                                           reverseOrder={false}
                                           gutter={8}
                                           containerClassName=""
                                           containerStyle={{}}
                                           toastOptions={{
                                               // Define default options
                                               className: '',
                                               duration: 5000,
                                               style: {
                                                   background: '#363636',
                                                   color: '#fff',
                                               },

                                           }}/>
                            </div>
                        </Portal>
                    </NextThemesProvider>
                </MantineProvider>
            </NextUIProvider>
        </JotaiProvider>
    </React.StrictMode>;
}
