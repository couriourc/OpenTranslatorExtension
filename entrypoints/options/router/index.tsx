//
//export const routes = [
//    {
//        path: "/",
//
//        component: Home,
//    },
//    {
//        path: "/settings",
//        component: GeneralSettings
//    }
//];
//export const router = createBrowserRouter(
//    createRoutesFromElements(
//    )
//    , {
//        basename: "/options.html"
//    });

import React, {FC, NamedExoticComponent, ReactNode, Suspense} from "react";
import {Home} from "@/entrypoints/options/pages/Home.tsx";
import {GeneralSettings} from "@/entrypoints/options/pages/GeneralSettings.tsx";
import {IoMusicalNote, IoSettings} from "react-icons/io5";

export const RoutesMap = Object.seal({
    'Home': Home,
    'GeneralSettings': GeneralSettings,
} as const);

export const Sidebars: (IRouterView & {
    title: NamedExoticComponent<any> | ReactNode;
    tap?: () => {}
})[] = [
    {
        title: <><IoMusicalNote/>单词主页</>,
        path: "Home"
    },
    {
        title: <><IoSettings/>通用设置</>,
        path: "GeneralSettings"
    }
];
export type TRoutes = keyof typeof RoutesMap;

interface IRouterView {
    path: TRoutes;

    [k: string]: any;
}

export function RouterView({path, ...props}: IRouterView) {
    const Component = RoutesMap[path] as FC<any>;
    if (!Component) return null;
    return <Suspense fallback={<></>}>
        <Component {...props}/>
    </Suspense>;
}
