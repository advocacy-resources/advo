import React from 'react';
import ResourcesGrid from '../../components/ResourceGrid';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footbar';

const ResourcesPage: React.FC = () => {
  return (
    <>
    <Navbar />
    <div className="max-w-6xl mx-auto p-8 min-h-screen">
      <ResourcesGrid />
    </div>
    <Footer />
    </>
  );
};

export default ResourcesPage;