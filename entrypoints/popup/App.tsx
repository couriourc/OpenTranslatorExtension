import React, {useEffect, useState} from 'react';
import './App.css';
import {TitleBarHeader} from "@/shared/components/Logo.tsx";
import {Input} from "@nextui-org/input";
import {Button, Divider} from "@nextui-org/react";
import {EyeFilledIcon, EyeSlashFilledIcon} from "@nextui-org/shared-icons";
import {settingStore} from "@/shared/store";
import {useImmerAtom} from "jotai-immer";
import {ISettingsOption, saveSettings} from "@/shared/config.ts";

function App() {
    const [isVisible, setIsVisible] = useState(false);
    const toggleVisibility = () => setIsVisible(isVisible => !isVisible);
    const [setting] = useImmerAtom(settingStore);
    const [form, syncForm] = useState<Partial<ISettingsOption>>(setting);
    useEffect(() => {
        console.log(setting);
    }, []);
    const syncField: <T extends keyof ISettingsOption>(key: T, value: ISettingsOption[T]) => void =
        (key, value) => syncForm((form) => ({
            ...form,
            [key]: value
        }));
    return (
        <>
            <TitleBarHeader></TitleBarHeader>
            {/* 配置 OpenaiKey */}
            <Divider></Divider>
            <div className="flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-6px pt-12px  px-6px box-border">

                <Input size={"sm"}
                       type="text"
                       placeholder="Openai Url"
                       value={form.openAiUrl}
                       onChange={(event) => {
                           syncField("openAiUrl", event.target.value ?? "");
                       }}
                />
                <Input size={"sm"}
                       type={isVisible ? "text" : "password"}
                       placeholder="Openai Key"
                       value={form.openAiKey}
                       onChange={(event) => {
                           syncField("openAiKey", event.target.value ?? "");
                       }}
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
                    <Button size="sm" variant={"ghost"}
                            onClick={async () => {
                                console.log(await saveSettings(form));
                            }}>
                        Save
                    </Button>
                </div>
            </div>
        </>
    );
}

export default App;
