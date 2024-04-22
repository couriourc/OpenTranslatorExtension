import React, {ReactNode, Suspense, useState} from "react";
import {Avatar, Card, CardBody, CardHeader, Skeleton} from "@nextui-org/react";
import {LangCode, supportedLanguages} from "@/shared/lang";
import {Logo, LogoWithName} from "@/shared/components/Logo.tsx";
import {cx} from "@emotion/css";
import {AppShell, Burger, List} from '@mantine/core';
import {useDisclosure} from '@mantine/hooks';
import {RouterView, Sidebars, TRoutes} from "@/entrypoints/options/router";
import {noop} from "underscore";

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

function LanguageSelector({}: ILanguageSelectorProps) {
    const [opened, {toggle}] = useDisclosure();
    const [curActive, setCurActive] = useState<TRoutes>(Sidebars[1].path);
    return (
        <Card className={"w-full h-100vh"}>
            <CardHeader className={cx("flex  z-0 top-1 !items-center justify-center")}>

            </CardHeader>
            <CardBody className={"z-10  "}>

                <AppShell
                    header={{height: 48}}
                    navbar={{
                        width: 300,
                        breakpoint: 'sm',
                        collapsed: {mobile: !opened},
                    }}
                    padding="md"
                >
                    <AppShell.Header className={"flex items-center justify-between"}>
                        <div className={"flex items-center"}>
                            <Burger
                                opened={opened}
                                onClick={toggle}
                                hiddenFrom="sm"
                                size="sm"
                            />
                            <div>
                                <LogoWithName></LogoWithName>
                            </div>
                        </div>
                        <div className={"px-12px"}>
                            <Avatar size={"sm"}
                                    isBordered
                                    className={"cursor-pointer"}
                                    icon={<Logo/>}
                            />
                        </div>
                    </AppShell.Header>

                    <AppShell.Navbar p="md" bg={"white"}>
                        <List
                            spacing="xs"
                            size="sm"
                            center
                        >
                            {
                                Sidebars.map(({title, tap, path}) => {
                                    const _tap = tap ?? noop;
                                    return <List.Item key={path}>
                                        <div
                                            onClick={() => {
                                                setCurActive(path);
                                                _tap();
                                            }}
                                            className={
                                                cx("flex cursor-pointer border-solid w-full h-24px items-center hover:text-blue duration-200",
                                                    path.toLowerCase(),
                                                    {
                                                        "text-blue active": curActive === path
                                                    },
                                                )
                                            }
                                        >
                                            {title as ReactNode}
                                        </div>
                                    </List.Item>;
                                })
                            }
                            <List.Item></List.Item>
                        </List>
                    </AppShell.Navbar>
                    <AppShell.Main>
                        <RouterView path={curActive!}/>
                    </AppShell.Main>
                </AppShell>
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
