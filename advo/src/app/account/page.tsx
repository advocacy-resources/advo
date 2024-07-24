"use client";
import Navbar from '@/components/Navbar';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';


const AccountPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (session) {
    const userImage = session.user?.image;
    return (
      <>
        <Navbar />
        <h3 className='text-2xl p-8'>Congratulations, {session.user?.email}, you have made it to the account page.</h3>
        <img src={userImage} alt="" />
      </>
    );
  }

  return null;
};

export default AccountPage;