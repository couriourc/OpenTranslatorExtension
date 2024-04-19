import React, {useState} from 'react';
import './App.css';
import {TitleBarHeader} from "@/shared/components/Logo.tsx";
import {Input} from "@nextui-org/input";
import {Button, Divider} from "@nextui-org/react";
import {EyeFilledIcon, EyeSlashFilledIcon} from "@nextui-org/shared-icons";

function App() {
    const [isVisible, setIsVisible] = useState(false);
    const toggleVisibility = () => setIsVisible(isVisible => !isVisible);
    return (
        <>
            <TitleBarHeader></TitleBarHeader>
            {/* 配置 OpenaiKey */}
            <Divider></Divider>
            <div className="flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-6px pt-12px  px-6px box-border">
                <Input size={"sm"} type="text" placeholder="Openai Url"/>
                <Input size={"sm"}
                       type={isVisible ? "text" : "password"}
                       placeholder="Openai Key"
                       endContent={
                           <button className="focus:outline-none" type="button" onClick={toggleVisibility}>
                               {isVisible ? (
                                   <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none"/>
                               ) : (
                                   <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none"/>
                               )}
                           </button>
                       }
                />
                <div className={"relative flex justify-end w-full"}>
                    <Button size="sm" variant={"ghost"}>
                        Save
                    </Button>
                </div>
            </div>
        </>
    );
}

export default App;
