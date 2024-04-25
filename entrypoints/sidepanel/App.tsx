import {
    Accordion,
    AccordionControlProps,
    AppShell,
    Box,
    Flex,
    Paper,
    SegmentedControl,
    type SegmentedControlItem,
    Text
} from '@mantine/core';
import {HiDotsHorizontal} from "react-icons/hi";
import useSWR from "swr";
import React, {PropsWithChildren, ReactElement, useEffect, useMemo, useState} from "react";
import {useDrag, useDrop} from "react-dnd";
import {Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger} from "@nextui-org/react";
import {CopyIcon} from "@nextui-org/shared-icons";
import {useCopyToClipboard} from "react-use";
import {HistoryItemDragType} from "@/shared/constants";
import {useBrowserConnector} from "@/shared/hooks/useConnector.ts";
import {TWordActions, Z_WordActions} from "@/entrypoints/sidepanel/types.ts";
import {LoadingCoffee} from "@/shared/components/Animation.tsx";
import {notify_copy_fail, notify_delete_word_success} from "@/shared/notifications";
import _ from "underscore";
import {IoLockClosed, IoTrash} from "react-icons/io5";
import {Carousel, Embla} from '@mantine/carousel';
import '@mantine/notifications/styles.css';
import '@mantine/carousel/styles.css';
import {Unlocked} from "@/shared/components/Functional.tsx";
import {BiDotsVertical, BiLogoGithub} from "react-icons/bi";
/*只属于App.tsx的整个全局变量信息*/
const db = useBrowserConnector("db");


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
        console.log(binding.value);
        if (binding.error) {
            notify_copy_fail();
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
                id: value,
            };
        },
        item() {
            return {
                id: value,
                action: handleDeleteWord
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

    const [_collectedProps, drop] = useDrop(() => ({
        accept: HistoryItemDragType,
        drop(item, monitor) {
        },
        collect() {

        }
    }));
    const {data} = useSWR(() => "a", async () => [
        "测试"
    ]);

    if (isLoading) return <LoadingCoffee></LoadingCoffee>;
    return <>
        <Accordion chevronPosition="left"
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

        <div className={"absolute bottom-2em right-3em gap-12px flex flex-col"}>
            <Button ref={drop} isIconOnly={true} color={"danger"}>
                <IoTrash title={"清空"}></IoTrash>
            </Button>
            <Dropdown
                backdrop="blur"
                classNames={{
                    base: "before:bg-default-200", // change arrow background
                    content: "min-w-fit",
                }}
            >
                <DropdownTrigger>
                    <Button isIconOnly={true} color={"default"}>
                        <BiDotsVertical title={"清空"}></BiDotsVertical>
                    </Button>
                </DropdownTrigger>
                <DropdownMenu className={"w-fit"}
                              aria-label="icons"
                              onAction={(key) => {
                                  console.log(`key-->${key}`);
                                  switch (key) {
                                      case "github":
                                          window.open("https://github.com/couriourc");
                                          break;
                                  }

                              }}
                >
                    <DropdownItem key="github"
                                  className={"w-fit"}
                                  textValue={"github"}
                    >
                        <BiLogoGithub></BiLogoGithub>
                    </DropdownItem>
                </DropdownMenu>
            </Dropdown>
        </div>
    </>;
}

function MemoView() {
    return <Flex justify={"center"} align={"center"} h={"100%"}>
        <Unlocked>
            <Button variant={"faded"}>
                开启背词模式
                <Text c={"yellow.4"}><IoLockClosed title={"开发中"}></IoLockClosed></Text>
            </Button>
        </Unlocked>
    </Flex>;
}

export default function App() {
    const [curPageIndex, syncCurPageIndex] = useState<string>("0");
    const Pages = useMemo(() => [
        {
            label: <Text c={"blue.5"}
                         fw={900}
            >单词本</Text>,
            Component: <HistoryList></HistoryList>
        },
        {
            label: <Text c={"blue.5"}
                         fw={900}
            >背词模式</Text>,
            Component: <MemoView></MemoView>
        }
    ].map((props, index) => {
        return {
            ...props,
            value: index + ''
        };
    }), []);
    const [embla, setEmbla] = useState<Embla | null>(null);
    useEffect(() => {
        embla?.scrollTo(~~curPageIndex);
    }, [curPageIndex]);
    return <AppShell className={"p-6px box-border relative overflow-hidden"}
    >
        <div className="flex w-99vw overflow-x-hidden flex-col box-border">
            <SegmentedControl
                data={Pages as SegmentedControlItem[]}
                transitionDuration={500}
                value={curPageIndex}
                transitionTimingFunction="linear"
                onChange={syncCurPageIndex}
            />
            <Carousel
                slideSize={{base: '100%', sm: '50%'}}
                slideGap={{base: 'xl', sm: 2}}
                align="start"
                slidesToScroll={1}
                getEmblaApi={setEmbla}
                withControls={false}
                onSlideChange={(index) => {
                    syncCurPageIndex(Pages[index].value);
                }}
            >
                {
                    Pages.map(page => {
                        return <Carousel.Slide key={page.value}>
                            <Paper className={"w-96vw h-95vh overflow-x-hidden"}>{page.Component}</Paper>
                        </Carousel.Slide>;
                    })
                }
            </Carousel>

        </div>
    </AppShell>;
}

function PageView({children}: PropsWithChildren) {
    return <>
        {children}
    </>;
}
