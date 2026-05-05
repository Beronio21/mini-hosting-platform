'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Footer() {

    return (
        <motion.footer className="bg-white/6 border-t border-white/6 pt-10 text-gray-300"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", duration: 0.5 }}
        >
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex flex-col md:flex-row items-start justify-between gap-10 py-10 border-b border-white/10">
                    <div>
                        <img src='/logo.svg' alt="logo" className="h-8" />
                        <p className="max-w-[410px] mt-6 text-sm leading-relaxed">
                            Mini Hosting Platform helps users launch n8n, bot, and API containers behind a single dashboard and automatic subdomain routing.
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-between w-full md:w-[45%] gap-5 text-sm">
                        <div>
                            <h3 className="font-semibold text-base text-white md:mb-5 mb-2">Product</h3>
                            <ul className="space-y-1">
                                <li><Link href="/#features" className="hover:text-white transition">Features</Link></li>
                                <li><Link href="/#pricing" className="hover:text-white transition">Pricing</Link></li>
                                <li><Link href="/login" className="hover:text-white transition">Sign in</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-base text-white md:mb-5 mb-2">Platform</h3>
                            <ul className="space-y-1">
                                <li><a href="/" className="hover:text-white transition">Home</a></li>
                                <li><a href="/#faq" className="hover:text-white transition">FAQ</a></li>
                                <li><Link href="/register" className="hover:text-white transition">Create account</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <p className="py-4 text-center text-sm text-gray-400">
                    © {new Date().getFullYear()} {' '}
                    Mini Hosting Platform. All rights reserved.
                </p>
            </div>
        </motion.footer>
    );
};