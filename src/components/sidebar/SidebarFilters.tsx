import React from "react";
import { Checkbox } from "@/components/ui/checkbox";

export default function FilterSidebar() {
  return (
    <div className="col-span-2 bg-gray-100 p-4 min-h-screen border-r">
      <div className="text-xl font-bold mb-4">Filter Resources</div>

      {/* Filter by Type */}
      <div className="mb-6">
        <div className="text-lg font-semibold mb-2">Type</div>
        <div className="flex flex-col space-y-2">
          <CheckboxWithText label="Service" />
          <CheckboxWithText label="Product" />
          <CheckboxWithText label="Event" />
        </div>
      </div>

      {/* Filter by Category */}
      <div className="mb-6">
        <div className="text-lg font-semibold mb-2">Category</div>
        <div className="flex flex-col space-y-2">
          <CheckboxWithText label="Education" />
          <CheckboxWithText label="Health" />
          <CheckboxWithText label="Community" />
        </div>
      </div>

      {/* Filter by Cost */}
      <div className="mb-6">
        <div className="text-lg font-semibold mb-2">Cost</div>
        <div className="flex flex-col space-y-2">
          <CheckboxWithText label="Free" />
          <CheckboxWithText label="Paid" />
        </div>
      </div>

      {/* Filter by Accessibility */}
      <div className="mb-6">
        <div className="text-lg font-semibold mb-2">Accessibility</div>
        <div className="flex flex-col space-y-2">
          <CheckboxWithText label="Wheelchair Accessible" />
          <CheckboxWithText label="Sign Language Support" />
          <CheckboxWithText label="Audio Assistance" />
        </div>
      </div>

      {/* Filter by Rating */}
      <div className="mb-6">
        <div className="text-lg font-semibold mb-2">Minimum Rating</div>
        <div className="flex flex-col space-y-2">
          <CheckboxWithText label="1 Star & Up" />
          <CheckboxWithText label="2 Stars & Up" />
          <CheckboxWithText label="3 Stars & Up" />
          <CheckboxWithText label="4 Stars & Up" />
        </div>
      </div>

      {/* Filter by Location */}
      <div className="mb-6">
        <div className="text-lg font-semibold mb-2">Location</div>
        <input
          type="text"
          placeholder="Enter Zip Code"
          className="w-full border border-gray-300 rounded-md p-2"
        />
      </div>

      {/* Reset and Apply Buttons */}
      <div className="flex space-x-4">
        <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md">
          Reset
        </button>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md">
          Apply Filters
        </button>
      </div>
    </div>
  );
}

function CheckboxWithText({ label }: { label: string }) {
  return (
    <div className="items-top flex space-x-2">
      <Checkbox id={label} />
      <label
        htmlFor={label}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
      </label>
    </div>
  );
}
