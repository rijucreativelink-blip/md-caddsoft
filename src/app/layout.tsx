import type { Metadata, Viewport } from 'next';
import { Inter, Sora } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { ToastProvider } from '@/components/providers/ToastProvider';
import { site } from '@/content/site';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const sora = Sora({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://caddsoftware.in'),
  title: {
    default: `${site.shortName}, Agartala, Tripura | CAD Training Institute`,
    template: `%s | ${site.shortName}`,
  },
  description: site.whoWeAre,
  keywords: [
    'CADD Software',
    'CAD training Agartala',
    'AutoCAD course Tripura',
    'Revit training',
    'StaadPro',
    'ETABS',
    'SolidWorks',
    'CATIA',
    'Primavera',
    'civil CADD',
    'mechanical CADD',
  ],
  openGraph: {
    title: `${site.name} | ${site.tagline}`,
    description: site.whoWeAre,
    type: 'website',
    locale: 'en_IN',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#060a14' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`} suppressHydrationWarning>
      <body className="min-h-screen">
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
