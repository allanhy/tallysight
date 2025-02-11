'use client';

import Link from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';

export default function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
    const segment = useSelectedLayoutSegment();
    const active = href === `/${segment || ''}`;

    return (
        <Link
            className={`${
                active ? 'text-white bg-gray-900' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            } rounded-md px-3 py-2 text-sm font-medium`}
            href={href}
        >
            {children}
        </Link>
    );
}
