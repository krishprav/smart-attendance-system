'use client';

import './globals.css';
import ToastProvider from '@/components/providers/ToastProvider';
import Providers from '@/components/providers/Providers';
import Navbar from '@/components/layout/Navbar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-100">
        <Providers>
          <Navbar />
          {children}
          <ToastProvider />
        </Providers>
      </body>
    </html>
  );
}
