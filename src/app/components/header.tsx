import Image from 'next/image';

import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';

const Header: React.FC = () => {
    return (
        <nav className='flex items-center justify-between px-6 py-4 mb-5 bg-[#686A6C]'>
            <div className='flex items-center'>
                <Image src="/TallySight.png"
                     alt="TallySight Logo"
                       width={400} // Provide an appropriate width
                       height={400} // Provide an appropriate height
                       quality={100}
                       className='m1-16'/>
            </div>
            <div className='flex items-center text-white'>
                <SignedOut>
                    <div className="flex justify-end p-4 rounded-full bg-[#5E6061] hover:scale-105">
                        <SignInButton />
                    </div>
                </SignedOut>
                <SignedIn>
                    <div className='relative'>
                        <div className='absolute top-0 right-0 flex justify-end items-start p-4'>
                            <UserButton />
                        </div>
                    </div>
                </SignedIn>
            </div>
        </nav>
    );
};

export default Header;