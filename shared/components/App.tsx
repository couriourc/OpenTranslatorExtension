import React, {ReactNode} from "react";
import {NextUIProvider,} from "@nextui-org/react";

import {ThemeProvider as NextThemesProvider} from "next-themes";
import {Toaster} from "react-hot-toast";
import {Provider as JotaiProvider} from 'jotai';
import {appStore, getSettingStore} from "@/shared/store";
import {MantineProvider} from "@mantine/core";
import {WrapperHelper} from "@/shared/design-pattern/Singleton.ts";
import 'uno.css';
import '@/assets/styles/style.less';


export function TranslatorAppWrapper({children}: { children: ReactNode }): ReactNode {
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
                            <Toaster/>
                        </NextThemesProvider>
                    </MantineProvider>
                </NextUIProvider>
            </JotaiProvider>
    </React.StrictMode>;
}
