'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import Providers from '@/components/providers/Providers';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-white">
      <head>
        <title>Smart Attendance System</title>
        <meta name="description" content="AI-Powered Smart Attendance & Behavior Monitoring System" />
      </head>
      <body className={`${inter.className} bg-white`}>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <main className="flex-grow">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
