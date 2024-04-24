import {Accordion, Box, ActionIcon, AccordionControlProps, Center, ThemeIcon, Text, Flex, Title} from '@mantine/core';
import {HiDotsHorizontal} from "react-icons/hi";
import useSWR from "swr";
import React, {forwardRef, PropsWithChildren, ReactElement, Ref, useEffect, useState} from "react";
import {useDrag} from "react-dnd";
import {IconDots} from "@tabler/icons-react";
import {Button} from "@nextui-org/react";
import {CopyIcon} from "@nextui-org/shared-icons";
import {useCopyToClipboard, useWindowSize} from "react-use";
import '@mantine/notifications/styles.css';
import {notifications} from "@mantine/notifications";
import {CopyToClipboardState} from "react-use/lib/useCopyToClipboard";

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

    return <Box className={" px-12px text-justify text-sm text-#333 dark:text-#FFF cursor-pointer break-words max-w-97vw"}
                onClick={() => {
                    copy(children as string);
                }}
    >{children}</Box>;
}

function HistoryItem({children, ref, width, value}: PropsWithChildren<{
    value: string;
    width: number;
    height?: number;
    ref?: Ref<HTMLDivElement>
}>) {
    const [binding, copy] = useCopy();
    return <Accordion.Item ref={ref} value={value}>
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
    </Accordion.Item>;

}


function HistoryList() {
    const {data} = useSWR(() => "a", () => {
        return Promise.resolve(["asdjasdjaskldnaskldajskdljasd按时间第哦啊是对焦速度加啊四哦大家按时",
            "asdjasdjaskldnaskldajskdljasd按时间第哦啊是对焦速度加啊四哦大家按时asdjasdjaskldnaskldajskdljasd按时间第哦啊是对焦速度加啊四哦大家按时asdjasdjaskldnaskldajskdljasd按时间第哦啊是对焦速度加啊四哦大家按时asdjasdjaskldnaskldajskdljasd按时间第哦啊是对焦速度加啊四哦大家按时asdjasdjaskldnaskldajskdljasd按时间第哦啊是对焦速度加啊四哦大家按时asdjasdjaskldnaskldajskdljasd按时间第哦啊是对焦速度加啊四哦大家按时",
        ]);
    });
    const [drag, source] = useDrag({
        type: "asdas",
    },);
    const {width, height} = useWindowSize();
    console.log(source);
    return <>
        <Accordion chevronPosition="left" w={"100vw"}
                   className={'box-border'}
                   mx="auto"
        >
            {data?.map((item) => {
                return <HistoryItem
                    ref={source}
                    {...{width, height}}
                    value={item + ""}
                >{item}</HistoryItem>;
            })}
        </Accordion>
    </>;
}

export default function App() {
    return <Box className={"p-8px box-border"}>
        <Title className={"m-6px!"}  order={4}><Text c="blue.4">翻译历史</Text></Title>
        <HistoryList></HistoryList>
    </Box>;
}
