import type { Metadata } from 'next';
import { AuthProvider } from '@/lib/auth/context';
import './globals.css';

export const metadata: Metadata = {
  title: 'InnovatMind School OS | Modern Multi-Tenant School ERP & STEM EdTech Ecosystem',
  description: 'An executive school operating system combining institutional management with futuristic Grade 1-12 Computer, Coding, Robotics, and AI education.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#f8fafc] font-sans text-slate-800 antialiased selection:bg-indigo-500/20 selection:text-indigo-700">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
