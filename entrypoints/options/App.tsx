import React, {Suspense} from "react";
import {Card, CardBody, CardHeader, Radio, RadioGroup, Skeleton} from "@nextui-org/react";
import {LangCode, supportedLanguages} from "@/shared/lang";
import {useTheme} from "@/shared/hooks/useTheme.ts";
import {useSettingStore} from "@/shared/store";
import {LogoWithName} from "@/shared/components/Logo.tsx";
import {saveSettings} from "@/shared/config.ts";
import {UseThemeProps} from "next-themes/dist/types";
import {$t} from "@/shared/utils.ts";

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
    const {themes,theme, setTheme} = useTheme();
    console.log(useSettingStore());
    return (
        <Card className={"w-full h-100vh"}>
            <CardHeader className="flex  z-0 top-1 flex-col !items-start">
                <LogoWithName></LogoWithName>
            </CardHeader>
            <CardBody className={"z-10  "}>
                <RadioGroup
                    label={$t("SelectYourFavoriteTheme")}
                    orientation="horizontal"
                    value={theme}
                    onChange={async (event) => {
                        const value = event.target.value! as UseThemeProps['systemTheme'];
                        await saveSettings({
                            theme: value,
                        });
                        //@ts-ignore
                        setTheme(value);
                    }}
                >
                    {
                        themes.map(theme => {
                            return <Radio
                                value={theme}
                                key={theme}
                                className={"cursor-pointer"}>{theme}</Radio>;
                        })
                    }
                </RadioGroup>
                <div className={"flex gap-1"}>
                </div>
            </CardBody>
        </Card>
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
