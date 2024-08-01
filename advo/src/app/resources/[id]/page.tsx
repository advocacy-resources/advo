import  prisma  from '../../prisma/client'; // adjust the path as necessary
import { Resource } from '../../../interfaces/resource';
import React from 'react';
import Navbar from '@/components/Navbar';
import Footbar from '@/components/Footbar';

interface ResourcePageProps {
  params: { id: string };
}

const fetchResource = async (id: string): Promise<Resource | null> => {
  const resource = await prisma.resource.findUnique({
    where: { id },
  });
  return resource;
};

const ResourcePage = async ({ params }: ResourcePageProps) => {
  const resource = await fetchResource(params.id);

  if (!resource) {
    return <div>Resource not found</div>;
  }

  return (
    <div>
      <Navbar />
    <div className="max-w-4xl mx-auto p-8 ">
      <div className='container min-h-screen'>
      <h1 className="text-3xl font-bold mb-4">{resource.name}</h1>
      <p>{resource.description}</p>
      {/* Add more fields as necessary */}
      </div>
     <Footbar />
      </div>
    </div>
  );
};

export default ResourcePage;