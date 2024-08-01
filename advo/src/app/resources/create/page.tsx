"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Resource } from '../../../interfaces/resource';
import { Button } from '@/components/ui/button';

const ResourceForm = () => {
  const [formData, setFormData] = useState<Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    description: '',
    type: [],
    category: [],
    contact: {
      phone: '',
      email: '',
      website: '',
    },
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      latitude: 0,
      longitude: 0,
    },
    operatingHours: {
      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
      saturday: '',
      sunday: '',
    },
    eligibilityCriteria: '',
    servicesProvided: [],
    targetAudience: [],
    accessibilityFeatures: [],
    cost: '',
    ratings: {
      averageRating: 0,
      numberOfReviews: 0,
    },
    geoLocation: {
      latitude: 0,
      longitude: 0,
    },
    policies: [],
    tags: [],
  });

  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleNestedChange = (e: React.ChangeEvent<HTMLInputElement>, section: string) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [section]: {
        ...formData[section],
        [name]: value,
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        router.push('/resources');
      } else {
        console.error('Failed to create resource');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (<>
    <form onSubmit={handleSubmit} className='max-w-lg mx-auto p-4 bg-white shadow-md rounded-md'>
      <h1 className='text-2xl font-bold mb-4'>Create a new resource</h1>
      <input
        className='block text-sm font-medium text-gray-700'
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Name"
      />
      <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Description"
      />
      {/* Add fields for type, category, contact, address, etc. */}
      <h3>Contact Information</h3>
      <input
        type="text"
        name="phone"
        value={formData.contact.phone}
        onChange={(e) => handleNestedChange(e, 'contact')}
        placeholder="Phone"
      />
      <input
        type="email"
        name="email"
        value={formData.contact.email}
        onChange={(e) => handleNestedChange(e, 'contact')}
        placeholder="Email"
      />
      <input
        type="text"
        name="website"
        value={formData.contact.website}
        onChange={(e) => handleNestedChange(e, 'contact')}
        placeholder="Website"
      />

      <h3>Address</h3>
      <input
        type="text"
        name="street"
        value={formData.address.street}
        onChange={(e) => handleNestedChange(e, 'address')}
        placeholder="Street"
      />
      <input
        type="text"
        name="city"
        value={formData.address.city}
        onChange={(e) => handleNestedChange(e, 'address')}
        placeholder="City"
      />
      <input
        type="text"
        name="state"
        value={formData.address.state}
        onChange={(e) => handleNestedChange(e, 'address')}
        placeholder="State"
      />
      <input
        type="text"
        name="zipCode"
        value={formData.address.zipCode}
        onChange={(e) => handleNestedChange(e, 'address')}
        placeholder="Zip Code"
      />
      <input
        type="text"
        name="country"
        value={formData.address.country}
        onChange={(e) => handleNestedChange(e, 'address')}
        placeholder="Country"
      />
      <input
        type="number"
        name="latitude"
        value={formData.address.latitude}
        onChange={(e) => handleNestedChange(e, 'address')}
        placeholder="Latitude"
      />
      <input
        type="number"
        name="longitude"
        value={formData.address.longitude}
        onChange={(e) => handleNestedChange(e, 'address')}
        placeholder="Longitude"
      />

      <h3>Operating Hours</h3>
      <input
        type="text"
        name="monday"
        value={formData.operatingHours.monday}
        onChange={(e) => handleNestedChange(e, 'operatingHours')}
        placeholder="Monday"
      />
      <input
        type="text"
        name="tuesday"
        value={formData.operatingHours.tuesday}
        onChange={(e) => handleNestedChange(e, 'operatingHours')}
        placeholder="Tuesday"
      />
      <input
        type="text"
        name="wednesday"
        value={formData.operatingHours.wednesday}
        onChange={(e) => handleNestedChange(e, 'operatingHours')}
        placeholder="Wednesday"
      />
      <input
        type="text"
        name="thursday"
        value={formData.operatingHours.thursday}
        onChange={(e) => handleNestedChange(e, 'operatingHours')}
        placeholder="Thursday"
      />
      <input
        type="text"
        name="friday"
        value={formData.operatingHours.friday}
        onChange={(e) => handleNestedChange(e, 'operatingHours')}
        placeholder="Friday"
      />
      <input
        type="text"
        name="saturday"
        value={formData.operatingHours.saturday}
        onChange={(e) => handleNestedChange(e, 'operatingHours')}
        placeholder="Saturday"
      />
      <input
        type="text"
        name="sunday"
        value={formData.operatingHours.sunday}
        onChange={(e) => handleNestedChange(e, 'operatingHours')}
        placeholder="Sunday"
      />

      {/* Add fields for eligibilityCriteria, servicesProvided, targetAudience, accessibilityFeatures, cost, ratings, geoLocation, policies, tags */}
      <h3 className='text-center'>Eligibility Criteria</h3>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Eligibility Criteria</label>
        <input
          type="text"
          name="eligibilityCriteria"
          value={formData.eligibilityCriteria}
          onChange={handleChange}
          placeholder="Eligibility Criteria"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div className="mb-4">
  <label className="block text-sm font-medium text-gray-700">Services Provided</label>
  <input
    type="text"
    name="servicesProvided"
    value={formData.servicesProvided.join(', ')}
    onChange={(e) => handleChange({ ...e, target: { ...e.target, value: e.target.value.split(', ') } })}
    placeholder="Services Provided (comma separated)"
    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
  />
</div>
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700">Target Audience</label>
  <input
    type="text"
    name="targetAudience"
    value={formData.targetAudience.join(', ')}
    onChange={(e) => handleChange({ ...e, target: { ...e.target, value: e.target.value.split(', ') } })}
    placeholder="Target Audience (comma separated)"
    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
  />
</div>
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700">Accessibility Features</label>
  <input
    type="text"
    name="accessibilityFeatures"
    value={formData.accessibilityFeatures.join(', ')}
    onChange={(e) => handleChange({ ...e, target: { ...e.target, value: e.target.value.split(', ') } })}
    placeholder="Accessibility Features (comma separated)"
    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
  />
</div>
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700">Cost</label>
  <input
    type="text"
    name="cost"
    value={formData.cost}
    onChange={handleChange}
    placeholder="Cost"
    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
  />
</div>
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700">Average Rating</label>
  <input
    type="number"
    name="averageRating"
    value={formData.ratings.averageRating}
    onChange={(e) => handleNestedChange(e, 'ratings')}
    placeholder="Average Rating"
    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
  />
</div>
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700">Number of Reviews</label>
  <input
    type="number"
    name="numberOfReviews"
    value={formData.ratings.numberOfReviews}
    onChange={(e) => handleNestedChange(e, 'ratings')}
    placeholder="Number of Reviews"
    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
  />
</div>
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700">Policies</label>
  <input
    type="text"
    name="policies"
    value={formData.policies.join(', ')}
    onChange={(e) => handleChange({ ...e, target: { ...e.target, value: e.target.value.split(', ') } })}
    placeholder="Policies (comma separated)"
    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
  />
</div>
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700">Tags</label>
  <input
    type="text"
    name="tags"
    value={formData.tags.join(', ')}
    onChange={(e) => handleChange({ ...e, target: { ...e.target, value: e.target.value.split(', ') } })}
    placeholder="Tags (comma separated)"
    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
  />
</div>
      <Button
        type="submit"

      >Create Resource</Button>
    </form>
  </>
  );
};

export default ResourceForm;