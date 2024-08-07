// Select.stories.tsx

import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import {
  Select,
  SelectGroup,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectValue,
} from "@/components/ui/select";

const meta: Meta<typeof Select> = {
  title: "Example/Select",
  component: Select,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    children: { control: "text" },
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof meta>;

// Template for the Select component stories
const Template = (args: typeof Select) => (
  <Select {...args}>
    <SelectTrigger className="w-[180px]">
      <SelectValue placeholder="Select an option..." />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectLabel>Options</SelectLabel>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
        <SelectItem value="option3">Option 3</SelectItem>
        <SelectSeparator />
        <SelectItem value="option4">Option 4</SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
);

// Default Select story
export const Default: Story = Template.bind({}) as unknown as Story;
Default.args = {};
