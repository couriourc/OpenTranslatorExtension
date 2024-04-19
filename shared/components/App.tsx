import React, {ReactNode} from "react";
import {NextUIProvider,} from "@nextui-org/react";

import {ThemeProvider as NextThemesProvider} from "next-themes";
import {Toaster} from "react-hot-toast";
import {Provider as JotaiProvider} from 'jotai';
import {appStore} from "@/shared/store";
import {MantineProvider} from "@mantine/core";

export function TranslatorAppWrapper({children}: { children: ReactNode }): ReactNode {
    return <React.StrictMode>
        <JotaiProvider store={appStore}>
            <NextUIProvider>
                <MantineProvider>
                    <NextThemesProvider attribute="class">
                        {children}
                        <Toaster/>
                    </NextThemesProvider>
                </MantineProvider>
            </NextUIProvider>
        </JotaiProvider>
    </React.StrictMode>;
}
