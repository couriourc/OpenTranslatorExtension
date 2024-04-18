import "uno.css";


import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import '@/assets/styles/style.less';
import {NextUIProvider} from "@nextui-org/react";
import {Toaster} from "react-hot-toast";

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <NextUIProvider>
            <App/>
            <Toaster/>
        </NextUIProvider>
    </React.StrictMode>,
);
