// MainSearch.stories.tsx

import React from "react";
import { Meta } from "@storybook/react";
import MainSearch from "@/components/MainSearch";

const meta: Meta<typeof MainSearch> = {
  title: "Example/MainSearch",
  component: MainSearch,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;

type MainSearchStory = Story<typeof meta>;

const Template: Story = (args: React.JSX.IntrinsicAttributes) => <MainSearch {...args} />;

// Default story for MainSearch component
export const Default: Story = Template.bind({});
Default.args = {};
