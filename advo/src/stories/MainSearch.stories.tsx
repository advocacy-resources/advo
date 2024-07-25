// MainSearch.stories.tsx

import React from 'react';
import { Meta, Story } from '@storybook/react';
import MainSearch from '@/components/MainSearch';

const meta: Meta<typeof MainSearch> = {
  title: 'Example/MainSearch',
  component: MainSearch,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = Story<typeof meta>;

const Template: Story = (args) => <MainSearch {...args} />;

// Default story for MainSearch component
export const Default: Story = Template.bind({});
Default.args = {};