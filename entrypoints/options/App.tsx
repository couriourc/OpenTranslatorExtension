import React, {Suspense, useState} from "react";
import {Avatar, Card, CardBody, CardHeader, Skeleton} from "@nextui-org/react";
import {LangCode, supportedLanguages} from "@/shared/lang";
import {Logo, LogoWithName} from "@/shared/components/Logo.tsx";
import {css, cx} from "@emotion/css";
import {AppShell, Burger} from '@mantine/core';
import {useDisclosure} from '@mantine/hooks';
import {List, rem} from '@mantine/core';
import {IoMusicalNote, IoSettings} from "react-icons/io5";
import {router} from "@/entrypoints/options/router";
import {RouterProvider,} from "react-router-dom";
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
    const [curActive, setCurActive] = useState<string>();
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
                                    icon={<Logo/>}
                            />
                        </div>
                    </AppShell.Header>

                    <AppShell.Navbar p="md">
                        <List
                            spacing="xs"
                            size="sm"
                            center
                        >
                            {
                                [
                                    {
                                        path: "/",
                                        title: <><IoMusicalNote style={{width: rem(16), height: rem(16)}}/>单词本</>,
                                        onClick: () => {
                                        }
                                    },
                                    {
                                        path: "/settings",
                                        title: <><IoSettings style={{width: rem(16), height: rem(16)}}/>通用设置</>,
                                        onClick: () => {
                                        }
                                    }
                                ].map(({title, onClick, path}) => {
                                    const tap = onClick ?? noop;
                                    return <List.Item key={path}>
                                        <div
                                            onClick={() => {
                                                setCurActive(path);
                                                tap();
                                            }}
                                            className={
                                                cx("flex cursor-pointer border-solid w-full h-24px items-center hover:text-blue duration-200",
                                                    css`
                                                        &.active {

                                                        }
                                                    `,
                                                    {
                                                        "text-blue": curActive === path
                                                    },
                                                )
                                            }
                                        >
                                            {title}
                                        </div>
                                    </List.Item>;
                                })
                            }
                            <List.Item></List.Item>
                        </List>
                    </AppShell.Navbar>
                    <AppShell.Main>
                        <RouterProvider router={router}/>
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
