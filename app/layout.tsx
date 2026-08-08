import type { Metadata, Viewport } from 'next';
import './globals.css'; // Global styles
import { BottomNav } from '@/components/layout/BottomNav';
import { PWAInstallPrompt } from '@/components/pwa/PWAInstallPrompt';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { GlobalMapBackground } from '@/components/map/GlobalMapBackground';

export const metadata: Metadata = {
  title: 'Drive Social',
  description: 'Social driving, vehicle telemetry, and squad management.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Drive Social',
  },
  icons: {
    apple: '/icon-192x192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#0B0F17',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className="bg-[#0B0F17] text-white antialiased overflow-hidden select-none"
        suppressHydrationWarning
      >
        <GlobalMapBackground />
        <ToastContainer />
        <PWAInstallPrompt />
        <main className="relative z-10 h-[100dvh] w-full overflow-y-auto pb-16 pointer-events-none [&>*]:pointer-events-auto">
          {children}
        </main>
        <div className="relative z-20 pointer-events-auto">
          <BottomNav />
        </div>
      </body>
    </html>
  );
}

