import {Accordion, AccordionControlProps, AppShell, Box, Flex, Text} from '@mantine/core';
import {HiDotsHorizontal} from "react-icons/hi";
import useSWR from "swr";
import React, {PropsWithChildren, ReactElement, useEffect} from "react";
import {useDrag, useDrop} from "react-dnd";
import {Button, Card, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Tab, Tabs} from "@nextui-org/react";
import {CopyIcon} from "@nextui-org/shared-icons";
import {useCopyToClipboard} from "react-use";
import '@mantine/notifications/styles.css';
import {notifications} from "@mantine/notifications";
import {HistoryItemDragType} from "@/shared/constants";
import {z} from "zod";
import {useBrowserConnector} from "@/shared/hooks/useConnector.ts";


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
            notifications.show({
                title: '复制失败🤥',
                message: <>{binding.error}</>,
            });
        } else {
            notifications.show({
                title: '复制成功💕',
                message: "Cool😘",
            });
        }
    }, [binding]);

    return [binding, copy];
}

function TranslateResult({children}: PropsWithChildren) {
    const [binding, copy] = useCopy();

    return <Box
        className={" px-12px text-justify text-sm text-#333 dark:text-#FFF cursor-pointer break-words max-w-97vw"}
        onClick={() => {
            copy(children as string);
        }}
    >{children}</Box>;
}


function HistoryItem({children, value, ...props}: PropsWithChildren<{
    value: string;
    height?: number;
    [k: string]: any;
}>) {
    useBrowserConnector("db")
        .then((instance) => {
            instance.send_message("asd").then((...receive) => {
                console.log(`receive-->${receive}`, receive);

            });
            instance.on_message((info: any) => {
                console.log(info);

            });
        });
    const [connected, source, dragPreview] = useDrag({
        type: HistoryItemDragType,
        collect(monitor) {
            return {
                isDragging: monitor.isDragging(),
            };
        }
    },);
    const [binding, copy] = useCopy();
    const zodWordActions = z.enum(["delete", "copy"]);
    const wordActions: (
        {
            action: typeof zodWordActions,
            description: string,
            props: Record<string, any>
        }
        )[] = [
        {
            action: "delete",
            description: "移除",
            props: {
                className: "text-danger",
                color: "danger",
            }
        }
    ];

    function handleDeleteWord() {
        notifications.show({
            title: "删除成功👍",
        });
    }

    function handleWordAction(action: typeof zodWordActions) {
        console.log(zodWordActions.parse(action));
        if (!zodWordActions.parse(action)) {
            return false;
        }
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
                    <Button onClick={() => {
                        copy(value);
                    }} isIconOnly color="default" variant={"light"} aria-label="More">
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
                            onAction={(key) => {
                                handleWordAction(key);
                            }}
                        >
                            {
                                wordActions.map(({action, description, props}) => {
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
    const {data} = useSWR(() => "a", () => {
        return Promise.resolve(["asdjasdjaskldnaskldajskdljasd按时间第哦啊是对焦速度加啊四哦大家按时",
            "asdjasdjaskldnaskldajskdljasd按时间第哦啊是对焦速度加啊四哦大家按时asdjasdjaskldnaskldajskdljasd按时间第哦啊是对焦速度加啊四哦大家按时asdjasdjaskldnaskldajskdljasd按时间第哦啊是对焦速度加啊四哦大家按时asdjasdjaskldnaskldajskdljasd按时间第哦啊是对焦速度加啊四哦大家按时asdjasdjaskldnaskldajskdljasd按时间第哦啊是对焦速度加啊四哦大家按时asdjasdjaskldnaskldajskdljasd按时间第哦啊是对焦速度加啊四哦大家按时",
        ]);
    });

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
    const [collectedProps, drop] = useDrop(() => ({
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

function PageView({key, title, children}: PropsWithChildren) {
    return <>
        {children}
    </>;
}
