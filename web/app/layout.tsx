import './globals.css';
import Providers from './providers';

import Navbar from '@/components/Navbar';
import PageTransition from '@/components/PageTransition';
import SiteFooter from '@/components/SiteFooter';

export const metadata = {
  title: 'Stéphane Gelibert - Portfolio',
  description: 'Portfolio de Stéphane Gelibert',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <Navbar />
          <PageTransition>{children}</PageTransition>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}