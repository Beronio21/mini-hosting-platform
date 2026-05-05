import { Outfit } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import SoftBackdrop from "@/components/SoftBackdrop";
import LenisScroll from "@/components/lenis";
import { Metadata } from "next";

const outfit = Outfit({
    variable: "--font-sans",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: {
        default: "Mini Hosting Platform",
        template: "%s | Mini Hosting Platform",
    },
    description:
        "Mini Hosting Platform is a lightweight SaaS host for launching n8n, bot, and API containers behind public subdomains.",
    keywords: [
        "Pixel.io",
        "PrebuiltUI",
        "digital agency template",
        "Next.js agency website",
        "UI UX agency",
        "startup website template",
        "web development services",
        "design and development agency",
    ],
    authors: [{ name: "PrebuiltUI" }],
    creator: "PrebuiltUI",
    publisher: "PrebuiltUI",

    openGraph: {
        title: "Mini Hosting Platform",
        description:
            "Launch containerized services with a Next.js dashboard, Docker, and automatic subdomain routing.",
        siteName: "Mini Hosting Platform",
        type: "website",
    },

    twitter: {
        card: "summary_large_image",
        title: "Mini Hosting Platform",
        description:
            "A Next.js + Docker hosting platform for n8n, bots, and APIs.",
        creator: "@githubcopilot",
    },

    robots: {
        index: true,
        follow: true,
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <SoftBackdrop />
                <LenisScroll />
                <Navbar />
                {children}
                <Footer />
            </body>
        </html>
    );
}
