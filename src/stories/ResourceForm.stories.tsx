import type { Meta, StoryObj } from "@storybook/react";
import { within, userEvent } from "@storybook/test";
import ResourceForm from "@/components/resources/ResourceForm";
import { jest } from "@jest/globals";

// Mock the useRouter hook
const mockUseRouter = jest.fn(() => ({
  push: jest.fn(),
  // Add any other router methods you use in your component
}));

// Mock the next/navigation module
jest.mock("next/navigation", () => ({
  useRouter: () => mockUseRouter(),
}));

const meta: Meta<typeof ResourceForm> = {
  title: "Forms/ResourceForm",
  component: ResourceForm,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ResourceForm>;

export const Default: Story = {
  args: {},
};

export const Filled: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Fill in some example data
    await userEvent.type(
      canvas.getByPlaceholderText("e.g. Advocacy Resources, Inc."),
      "Example Resource Center",
    );
    await userEvent.type(
      canvas.getByPlaceholderText("Description"),
      "This is an example resource center providing various services.",
    );
    await userEvent.type(canvas.getByPlaceholderText("Phone"), "123-456-7890");
    await userEvent.type(
      canvas.getByPlaceholderText("Email"),
      "contact@example.com",
    );
    await userEvent.type(
      canvas.getByPlaceholderText("Website"),
      "https://example.com",
    );

    // Fill in some address details
    await userEvent.type(canvas.getByPlaceholderText("Street"), "123 Main St");
    await userEvent.type(canvas.getByPlaceholderText("City"), "Anytown");
    await userEvent.type(canvas.getByPlaceholderText("State"), "CA");
    await userEvent.type(canvas.getByPlaceholderText("Zip Code"), "12345");
    await userEvent.type(canvas.getByPlaceholderText("Country"), "USA");

    // Fill in some operating hours
    await userEvent.type(canvas.getAllByPlaceholderText("Open")[0], "9:00 AM");
    await userEvent.type(canvas.getAllByPlaceholderText("Close")[0], "5:00 PM");

    // Fill in some other fields
    await userEvent.type(
      canvas.getByPlaceholderText("e.g. Serves individuals under 25 years old"),
      "Serves all ages",
    );
    await userEvent.type(
      canvas.getByPlaceholderText("e.g. Rental Assistance"),
      "Counseling, Job Training",
    );
    await userEvent.type(
      canvas.getByPlaceholderText("e.g. Women or Homeless Youth"),
      "General Public",
    );
    await userEvent.type(
      canvas.getByPlaceholderText("e.g. Website accessible via screen reader"),
      "Wheelchair Accessible",
    );
    await userEvent.type(
      canvas.getByPlaceholderText("e.g. $40 / month"),
      "Free",
    );
    await userEvent.type(
      canvas.getByPlaceholderText("e.g. Gender Affirming"),
      "Non-Discriminatory",
    );
    await userEvent.type(
      canvas.getByPlaceholderText("e.g. LGBTQ+"),
      "Community Support, Education",
    );
  },
};
