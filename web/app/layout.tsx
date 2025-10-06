import './globals.css';

import Navbar from '@/components/Navbar';
import SiteFooter from '@/components/SiteFooter';

import Providers from './providers';
import { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://photo.stephanegelibert.com'),
  title: {
    default: 'Stéphane Gelibert — Photo Portfolio',
    template: '%s · Stéphane Gelibert',
  },
  description: "Stéphane Gelibert's photo portfolio",
  applicationName: 'Photo Portfolio',
  authors: [{ name: 'Stéphane Gelibert', url: 'https://photo.stephanegelibert.com' }],
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },

  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [{ url: '/apple-touch-icon.png' }],
    shortcut: ['/favicon.ico'],
    other: [{ rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#000000' }],
  },

  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#0b0b0c' },
  ],

  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'Stéphane Gelibert',
    title: 'Stéphane Gelibert — Photo Portfolio',
    description: 'Selected work and gear I love.',
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: 'Gallery preview' }],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Stéphane Gelibert — Photo Portfolio',
    description: 'Selected work, and gear I love.',
    images: ['/og.jpg'],
  },

  manifest: '/site.webmanifest',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <Navbar />
          {children}
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
