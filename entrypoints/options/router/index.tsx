import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
    RouterProvider, Routes, RoutesProps,
} from "react-router-dom";
import {motion} from "framer-motion";
import {lazy} from "react";
import {Home} from "@/entrypoints/options/pages/Home.tsx";
import {GeneralSettings} from "@/entrypoints/options/pages/GeneralSettings.tsx";

const routes = [
    {
        path: "/",
        component: Home,
    },
    {
        path: "/settings",
        component: GeneralSettings
    }
];
export const router = createBrowserRouter(
    createRoutesFromElements(
        <>{
            routes.map(({
                            path,
                            component: Component
                        }) => {
                return <Route key={path} path={"/"} element={
                    <motion.div animate={{
                        opacity: 1,
                    }}>
                        <Component></Component>
                    </motion.div>
                }></Route>;

            })
        }</>
    )
    , {
        basename: "/options.html"
    });
