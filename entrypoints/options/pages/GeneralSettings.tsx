import React from "react";
import {Box, CheckIcon, ColorSwatch, Flex, Group, Radio} from "@mantine/core";
import {IconLighter} from "@tabler/icons-react";
import {PiBirdLight} from "react-icons/pi";

const settings = [
    {
        label: "主题设置",
        Component: () =>
            <Radio.Group
                name="favoriteFramework"
                label="Select your favorite framework/library"
                description="This is anonymous"
                withAsterisk
            >
                <Group mt="xs">
                    <Radio checked={true} icon={PiBirdLight} value="dark" label="dark"/>
                    <Radio checked={true} icon={CheckIcon} value="light" label="light"/>
                    <Radio checked={true} icon={CheckIcon} value="system" label="system"/>
                </Group>
            </Radio.Group>

    }
];

export function GeneralSettings() {
    return <div>

        {
            settings.map(({label, Component}) => {
                return <Flex key={label}>
                    <Component/>
                </Flex>;
            })
        }
    </div>;
}
