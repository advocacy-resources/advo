// MainSearch.stories.tsx

import React from "react";
import { Meta, StoryObj } from "@storybook/react";
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

type Story = StoryObj<typeof meta>;

const Template = (args: React.JSX.IntrinsicAttributes) => (
  <MainSearch {...args} />
);

// Default story for MainSearch component
export const Default: Story = Template.bind({}) as unknown as Story;
Default.args = {};
