import './globals.css';

import Navbar from '@/components/Navbar';
import SiteFooter from '@/components/SiteFooter';

import Providers from './providers';

export const metadata = {
  title: 'Stéphane Gelibert - Portfolio',
  description: 'Photography Portfolio',
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
