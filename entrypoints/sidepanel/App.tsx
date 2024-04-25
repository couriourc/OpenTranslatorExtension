import {Accordion, AccordionControlProps, AppShell, Box, Flex, Text} from '@mantine/core';
import {HiDotsHorizontal} from "react-icons/hi";
import useSWR from "swr";
import React, {PropsWithChildren, ReactElement, useEffect} from "react";
import {useDrag, useDrop} from "react-dnd";
import {Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Tab, Tabs} from "@nextui-org/react";
import {CopyIcon} from "@nextui-org/shared-icons";
import {useCopyToClipboard} from "react-use";
import '@mantine/notifications/styles.css';
import {notifications} from "@mantine/notifications";
import {HistoryItemDragType} from "@/shared/constants";
import {useBrowserConnector} from "@/shared/hooks/useConnector.ts";
import {TWordActions, Z_WordActions} from "@/entrypoints/sidepanel/types.ts";
import {LoadingCoffee} from "@/shared/components/Animation.tsx";
import {notify_copy_fail, notify_copy_success, notify_delete_word_success} from "@/shared/notifications";
import _ from "underscore";

interface ExtendedAccordionControlProps extends AccordionControlProps {
    Actions?: ReactElement | ReactElement[];
}

function AccordionControl({Actions, ...props}: ExtendedAccordionControlProps) {
    return (
        <Flex justify={"start"} align={"center"}>
            <Accordion.Control {...props} />
            <Flex align={"center"}>
                {Actions}
            </Flex>
        </Flex>
    );
}

function useCopy(): ReturnType<typeof useCopyToClipboard> {
    const [binding, copy] = useCopyToClipboard();
    useEffect(() => {
        if (!binding.value) return;
        if (binding.error) {
            notify_copy_fail();
        } else {
            notify_copy_success();
        }
    }, [binding]);
    return [binding, copy];
}

function TranslateResult({children}: PropsWithChildren) {
    const [_, copy] = useCopy();

    return <Box
        className={" px-12px text-justify text-sm text-#333 dark:text-#FFF cursor-pointer break-words max-w-97vw"}
        onClick={() => {
            copy(children as string);
        }}
    >{children}</Box>;
}

const db = useBrowserConnector("db");

function HistoryItem({children, value, ...props}: PropsWithChildren<{
    value: string;
    height?: number;
    [_: string]: any;
}>) {
    const [connected, source, dragPreview] = useDrag({
        type: HistoryItemDragType,
        collect(monitor) {
            return {
                isDragging: monitor.isDragging(),
            };
        }
    },);
    const [_binding, copy] = useCopy();
    const wordActions: (
        {
            action: TWordActions,
            description: string,
            props: Record<string, any>
        }
        )[] = [
        {
            action: Z_WordActions.Enum.delete,
            description: "移除",
            props: {
                className: "text-danger",
                color: "danger",
            }
        }
    ];

    function handleDeleteWord() {
        notify_delete_word_success();
    }

    function handleWordAction(action: TWordActions) {
        action = Z_WordActions.parse(action);
        switch (action) {
            case "delete":
                handleDeleteWord();
                break;
            default:
                break;
        }

    }

    return <>
        <div ref={dragPreview}></div>
        <Accordion.Item ref={source} role="Handle" style={{opacity: connected.isDragging ? 0.5 : 1}}
                        value={value}
                        {...props}
        >
            <AccordionControl
                Actions={<>
                    <Button onClick={copy.bind(null, value)} isIconOnly color="default" variant={"light"}
                            aria-label="More">
                        <CopyIcon></CopyIcon>
                    </Button>
                    <Dropdown>
                        <DropdownTrigger>
                            <Button isIconOnly color="default" variant={"light"} aria-label="More">
                                <HiDotsHorizontal/>
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                            aria-label="Action event example"
                            onAction={(key: any) => {
                                handleWordAction(key as TWordActions);
                            }}
                        >
                            {
                                _.map(wordActions,
                                    ({action, description, props}) => {
                                        return <DropdownItem
                                            key={action}
                                            title={description}
                                            {...props}
                                        >
                                            {description}
                                        </DropdownItem>;
                                    })
                            }
                        </DropdownMenu>
                    </Dropdown>
                </>}
            >
                <Box maw={"80vw"}>
                    <Text truncate="end" size={"md"} title={value}>
                        {value}
                    </Text>
                </Box>
            </AccordionControl>
            <Accordion.Panel>
                <TranslateResult>{children}</TranslateResult>
            </Accordion.Panel>
        </Accordion.Item>
    </>;

}


export function HistoryList() {
    const {data: port, isLoading} = useSWR("db", async () => db);

    const {data} = useSWR(() => "a", async () => [
        "测试"
    ]);

    if (isLoading) return <LoadingCoffee></LoadingCoffee>;
    return <>
        <Accordion chevronPosition="left" w={"full"}
                   className={'box-border'}
                   mx="auto"
        >
            {data?.map((item) => {
                return <HistoryItem
                    draggable={true}
                    value={item + ""}
                    key={item}
                    {...{}}
                >{item}</HistoryItem>;
            })}
        </Accordion>
    </>;
}

export default function App() {
    const [_collectedProps, drop] = useDrop(() => ({
        accept: HistoryItemDragType
    }));

    const Pages = [
        {
            key: "HistoryList",
            title: "翻译历史",
            Component: <HistoryList></HistoryList>
        },
    ] as const;
    return <AppShell className={"p-6px box-border"}
    >
        <div className="flex w-full flex-col box-border">
            <Tabs aria-label="Options">
                {
                    Pages.map(({key, title, Component}) => {
                        return <Tab title={title} key={key}>
                            <PageView>{Component}</PageView>
                        </Tab>;
                    })
                }
            </Tabs>
        </div>
    </AppShell>;
}

function PageView({children}: PropsWithChildren) {
    return <>
        {children}
    </>;
}
