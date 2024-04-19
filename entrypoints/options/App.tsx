import React, {Suspense} from "react";
import {Select, SelectItem, Skeleton} from "@nextui-org/react";
import {LangCode, supportedLanguages} from "@/shared/lang";
import {appStore, getPanelStore} from "@/shared/store";

setTimeout(() => {
    console.log(getPanelStore());
});

interface ILanguageSelectorProps {
    value?: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
}

type LangOption = ({
    id: LangCode,
    label: string,
})[];
const langOptions: LangOption = supportedLanguages.reduce((acc, [id, label]) => {
    return [
        ...acc,
        {
            id,
            label,
        },
    ];
}, [] as ({
    id: LangCode,
    label: string,
})[]);

function LanguageSelector({value, onChange, onBlur}: ILanguageSelectorProps) {
    return (
        <Select
            onChange={(event) => onChange(event.target.value)}
            onBlur={onBlur}
            value={value}
            size={"sm"}
        >
            {
                (langOptions as LangOption).map(({id, label}) => {
                    return <SelectItem value={id} key={id} variant={"flat"}>{label}</SelectItem>;
                })
            }
        </Select>
    );
}

function LoadingPage() {
    return <div className="max-w-[300px] w-full flex items-center gap-3">
        <div>
            <Skeleton className="flex rounded-full w-12 h-12"/>
        </div>
        <div className="w-full flex flex-col gap-2">
            <Skeleton className="h-3 w-3/5 rounded-lg"/>
            <Skeleton className="h-3 w-4/5 rounded-lg"/>
        </div>
    </div>;
}

export default function App() {

    function changeLanguage() {

    }

    return <>
        <Suspense fallback={<LoadingPage/>}>
            <LanguageSelector onChange={changeLanguage}></LanguageSelector>
        </Suspense>
    </>;

}
