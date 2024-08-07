import { Meta, StoryObj } from "@storybook/react";
import { Button, ButtonProps } from "@/components/ui/button";
import { action } from "@storybook/addon-actions";

const meta: Meta<typeof Button> = {
  title: "Example/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    onClick: { action: "clicked" },
    variant: {
      control: {
        type: "select",
        options: [
          "default",
          "destructive",
          "outline",
          "secondary",
          "ghost",
          "link",
        ],
      },
    },
    size: {
      control: { type: "select", options: ["default", "sm", "lg", "icon"] },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

// Default button story
export const Default: Story = {
  args: {
    variant: "default",
    size: "default",
    children: "Button",
  },
};

// Destructive button story
export const Destructive: Story = {
  args: {
    variant: "destructive",
    size: "default",
    children: "Destructive",
  },
};

// Outline button story
export const Outline: Story = {
  args: {
    variant: "outline",
    size: "default",
    children: "Outline",
  },
};

// Secondary button story
export const Secondary: Story = {
  args: {
    variant: "secondary",
    size: "default",
    children: "Secondary",
  },
};

// Ghost button story
export const Ghost: Story = {
  args: {
    variant: "ghost",
    size: "default",
    children: "Ghost",
  },
};

// Link button story
export const Link: Story = {
  args: {
    variant: "link",
    size: "default",
    children: "Link",
  },
};

// Large button story
export const Large: Story = {
  args: {
    variant: "default",
    size: "lg",
    children: "Large Button",
  },
};

// Small button story
export const Small: Story = {
  args: {
    variant: "default",
    size: "sm",
    children: "Small Button",
  },
};
