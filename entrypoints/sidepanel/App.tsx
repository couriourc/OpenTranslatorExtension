import {
    Accordion,
    Box,
    AccordionControlProps,
    Center,
    Text,
    Flex,
    Title,
    AppShell
} from '@mantine/core';
import {HiDotsHorizontal} from "react-icons/hi";
import useSWR from "swr";
import React, {PropsWithChildren, ReactElement, Ref, useEffect, useState} from "react";
import {useDrag, useDrop} from "react-dnd";
import {IconTrash} from "@tabler/icons-react";
import {Button} from "@nextui-org/react";
import {CopyIcon} from "@nextui-org/shared-icons";
import {useCopyToClipboard, useWindowSize} from "react-use";
import '@mantine/notifications/styles.css';
import {notifications} from "@mantine/notifications";
import {HistoryItemDragType} from "@/shared/constants";
import {cx} from "@emotion/css";
import {settingStore} from "@/shared/store";

interface ExtendedAccordionControlProps extends AccordionControlProps {
    Actions?: ReactElement | ReactElement[];
}

function AccordionControl({Actions, ...props}: ExtendedAccordionControlProps) {
    return (
        <Center>
            <Accordion.Control {...props} />
            <Flex align={"center"}>
                {Actions}
            </Flex>
        </Center>
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


function HistoryItem({children, width, value, ...props}: PropsWithChildren<{
    value: string;
    width: number;
    height?: number;
    [k: string]: any;
}>) {

    const [connected, source, dragPreview] = useDrag({
        type: HistoryItemDragType,
        collect(monitor) {
            return {
                isDragging: monitor.isDragging(),
            };
        }
    },);
    const [binding, copy] = useCopy();
    return <>
        <div ref={dragPreview}></div>
        <Accordion.Item ref={source}  role="Handle" style={{ opacity: connected.isDragging ? 0.5 : 1}} value={value} {...props}>
            <AccordionControl
                Actions={<>
                    <Button onClick={() => {
                        copy(value);
                    }} isIconOnly color="default" variant={"light"} aria-label="More">
                        <CopyIcon></CopyIcon>
                    </Button>
                    <Button isIconOnly color="default" variant={"light"} aria-label="More">
                        <HiDotsHorizontal/>
                    </Button>
                </>}
            >
                <Box w={width * 0.8}>
                    <Text truncate="end" size={"md"}>
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
settingStore

export function HistoryList() {
    const {data} = useSWR(() => "a", () => {
        return Promise.resolve(["asdjasdjaskldnaskldajskdljasd按时间第哦啊是对焦速度加啊四哦大家按时",
            "asdjasdjaskldnaskldajskdljasd按时间第哦啊是对焦速度加啊四哦大家按时asdjasdjaskldnaskldajskdljasd按时间第哦啊是对焦速度加啊四哦大家按时asdjasdjaskldnaskldajskdljasd按时间第哦啊是对焦速度加啊四哦大家按时asdjasdjaskldnaskldajskdljasd按时间第哦啊是对焦速度加啊四哦大家按时asdjasdjaskldnaskldajskdljasd按时间第哦啊是对焦速度加啊四哦大家按时asdjasdjaskldnaskldajskdljasd按时间第哦啊是对焦速度加啊四哦大家按时",
        ]);
    });
    const {width, height} = useWindowSize();

    return <>
        <Accordion chevronPosition="left" w={"100vw"}
                   className={'box-border'}
                   mx="auto"
        >
            {data?.map((item) => {
                return <HistoryItem
                    draggable={true}
                    {...{width, height,}}
                    value={item + ""}
                    key={item}
                >{item}</HistoryItem>;
            })}
        </Accordion>
    </>;
}

export default function App() {
    const [collectedProps, drop] = useDrop(() => ({
        accept: HistoryItemDragType
    }));

    return <AppShell className={"p-8px box-border"}
                     header={{height: 60}}
    >
        <AppShell.Header h={45}>
            <Flex justify={"space-between"} m={"sm"} align={"center"}>
                <Title order={4}>
                    <Text c="blue.4">翻译历史</Text>
                </Title>
                <div ref={drop}>
                    <Text c="red.4">
                        <IconTrash></IconTrash>
                    </Text>
                </div>
            </Flex>
        </AppShell.Header>
        <AppShell.Main>
            <HistoryList></HistoryList>
        </AppShell.Main>
    </AppShell>;
}
