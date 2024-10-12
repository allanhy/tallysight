import Link from 'next/link';
import {
    SignedIn,
    SignedOut,
    SignInButton,
    UserButton
  } from '@clerk/nextjs'

const Header = () => {

  return (
    <nav className='flex items-center justify-between px-6 py-4 mb-5 bg-[#686A6C]'>
      <div className='flex items-center'>
        <Link href='/'>
          <div className='text-3xl font-bold italic text-white uppercase'>
            TALLYSIGHT
          </div>
        </Link>
      </div>
      <div className='flex items-center text-white'>
        <SignedOut>
            <div className="flex justify-end p-4 rounded-full bg-[#5E6061] hover:scale-105">
              <SignInButton />
            </div>
        </SignedOut>
        <SignedIn>
            <div className= 'flex justify-end items-start absolute top-0 right-0 p-4'>
              <UserButton />
            </div>
          </SignedIn>
      </div>
    </nav>
  )
};

export default Header;