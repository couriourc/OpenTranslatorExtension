import React, {ReactNode} from "react";
import {NextUIProvider} from "@nextui-org/react";

import {ThemeProvider as NextThemesProvider} from "next-themes";
import {Toaster} from "react-hot-toast";

export function TranslatorAppWrapper({children}: { children: ReactNode }): ReactNode {
    return <React.StrictMode>
        <NextUIProvider>
            <NextThemesProvider attribute="class" defaultTheme="dark">
                {children}
                <Toaster/>
            </NextThemesProvider>
        </NextUIProvider>
    </React.StrictMode>;
}
