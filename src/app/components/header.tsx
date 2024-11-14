import './header.css'
import Image from 'next/image';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import Link from 'next/link'
import NavLink from './nav-link'

const Header = () => {
    return (
        <nav>
            <div className='flex items-center space-x-8 pl-10 pt-1'>
                <Link href='/home'>
                <Image src="/TallySight.png"
                       alt="TallySight Logo"
                       width={150}
                       height={100}
                       quality={100}
                       className='m1-16'/>
                </Link>
                <ul>
                    <li><NavLink href='/leaderboards'>Leaderboards</NavLink></li>
                    <li><NavLink href='/contests'>Contests</NavLink></li>
                    <li><NavLink href='/quickPicks'>Quick Picks</NavLink></li>
                </ul>
            </div>
            <div>
                <div className='mr-4 pt-2'>
                <SignedOut>
                    <div className='flex justify-end p-3 text-white rounded-lg bg-[#008AFF] hover:scale-105'>
                        <SignInButton />
                    </div>
                </SignedOut>
                </div>
                <SignedIn>
                    <div className='flex justify-end'>
                        <UserButton />
                    </div>
                </SignedIn>
            </div>
        </nav>
    );
};

export default Header;