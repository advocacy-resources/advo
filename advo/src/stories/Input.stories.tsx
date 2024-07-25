// Input.stories.tsx

import React from 'react';
import { Meta, Story } from '@storybook/react';
import { Input, InputProps } from '@/components/ui/input';
import { action } from '@storybook/addon-actions';

const meta: Meta<typeof Input> = {
  title: 'Example/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    type: {
      control: { type: 'select', options: ['text', 'email', 'password', 'number'] },
    },
    placeholder: { control: 'text' },
    value: { control: 'text' },
  },
  tags: ['autodocs'],
};

export default meta;

type Story = Story<typeof meta>;

// Default Input story
export const Default: Story = {
  args: {
    type: 'text',
    placeholder: 'Enter text...',
  },
};

// Email Input story
export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'Enter your email...',
  },
};

// Password Input story
export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter your password...',
  },
};

// Number Input story
export const Number: Story = {
  args: {
    type: 'number',
    placeholder: 'Enter a number...',
  },
};