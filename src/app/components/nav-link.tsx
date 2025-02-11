/* eslint-disable prefer-const */
'use client';

import Link from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';
import { ReactNode } from 'react';

interface NavLinkProps {
    href: string;
    children: ReactNode;
}

export default function NavLink({ href, children }: NavLinkProps) {
    let segment = useSelectedLayoutSegment();
    let active = href === `/${segment}`;
    return <Link className = {active ? "nav-active" : ""} href={href}>{children}</Link>;
}
