'use client';
import { MenuIcon, XIcon } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    const navLinks = [
        { name: 'Home', href: '/#home' },
        { name: 'Features', href: '/#features' },
        { name: 'Pricing', href: '/#pricing' },
        { name: 'FAQ', href: '/#faq' },
    ];

    return (
        <motion.nav className='fixed top-5 left-0 right-0 z-50 px-4'
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 250, damping: 70, mass: 1 }}
        >
            <div className='max-w-6xl mx-auto flex items-center justify-between bg-black/50 backdrop-blur-md border border-white/4 rounded-2xl p-3'>
                <a href='/#home'>
                    <img src='/logo.svg' alt="logo" className="h-8" />
                </a>

                <div className='hidden md:flex items-center gap-8 text-sm font-medium text-gray-300'>
                    {navLinks.map((link) => (
                        <a href={link.href} key={link.name} className="hover:text-white transition">
                            {link.name}
                        </a>
                    ))}
                </div>

                <div className='hidden md:flex items-center gap-3'>
                    <Link href='/login' className='text-sm font-medium text-gray-300 hover:text-white transition max-sm:hidden'>
                        Sign in
                    </Link>
                    <Link href='/register' className='inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-medium bg-linear-to-br from-indigo-500 to-indigo-600 hover:opacity-90 active:scale-95 transition-all max-sm:text-xs hidden sm:inline-flex'>
                        Get Started
                    </Link>
                </div>

                <button onClick={() => setIsOpen(!isOpen)} className='md:hidden'>
                    <MenuIcon className='size-6' />
                </button>
            </div>
            <div className={`flex flex-col items-center justify-center gap-6 text-lg font-medium fixed inset-0 bg-black/40 backdrop-blur-md z-50 transition-all duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
                {navLinks.map((link) => (
                    <a key={link.name} href={link.href} onClick={() => setIsOpen(false)}>
                        {link.name}
                    </a>
                ))}

                <Link href='/login' onClick={() => setIsOpen(false)} className='font-medium text-gray-300 hover:text-white transition'>
                    Sign in
                </Link>
                <Link href='/register' onClick={() => setIsOpen(false)} className='inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-medium bg-linear-to-br from-indigo-500 to-indigo-600 hover:opacity-90 active:scale-95 transition-all'>
                    Get Started
                </Link>

                <button
                    onClick={() => setIsOpen(false)}
                    className="rounded-md bg-white p-2 text-gray-800 ring-white active:ring-2"
                >
                    <XIcon />
                </button>
            </div>
        </motion.nav>
    );
};