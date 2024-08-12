import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import ResourceForm from "#/resource/ResourceForm"; // Update this path based on your project structure

export default {
  title: "Forms/ResourceForm",
  component: ResourceForm,
  parameters: {
    layout: "centered", // Center the form in the Storybook view
  },
} as Meta;

// Template for rendering the component
const Template: StoryFn = (args) => <ResourceForm {...args} />;

// Default story: empty form
export const Default = Template.bind({});

Default.args = {
  // By default, the form will render with empty fields as per your component's initial state.
};

// Pre-filled form story
export const PreFilled = Template.bind({});

PreFilled.args = {
  // Example of pre-filling the form with data
  formData: {
    name: "Sample Resource",
    description: "This is a sample resource.",
    type: ["Service"],
    category: ["Education"],
    contact: {
      phone: "123-456-7890",
      email: "sample@example.com",
      website: "https://example.com",
    },
    address: {
      street: "123 Main St",
      city: "Sample City",
      state: "CA",
      zipCode: "12345",
      country: "USA",
      latitude: 34.0522,
      longitude: -118.2437,
    },
    operatingHours: {
      monday: "9:00 AM - 5:00 PM",
      tuesday: "9:00 AM - 5:00 PM",
      wednesday: "9:00 AM - 5:00 PM",
      thursday: "9:00 AM - 5:00 PM",
      friday: "9:00 AM - 5:00 PM",
      saturday: "Closed",
      sunday: "Closed",
    },
    eligibilityCriteria: "Must be a resident of the city.",
    servicesProvided: ["Tutoring", "Mentorship"],
    targetAudience: ["Students", "Adults"],
    accessibilityFeatures: ["Wheelchair Accessible", "Sign Language Support"],
    cost: "Free",
    ratings: {
      averageRating: 4.5,
      numberOfReviews: 10,
    },
    geoLocation: {
      latitude: 34.0522,
      longitude: -118.2437,
    },
    policies: ["No smoking", "No pets"],
    tags: ["education", "mentorship", "community"],
  },
};
