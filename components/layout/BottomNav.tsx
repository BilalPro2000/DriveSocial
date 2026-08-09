'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Navigation, Users, Map, Car, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDriveStore } from '@/store/useDriveStore';
import { triggerHaptic } from '@/lib/haptics';

export function BottomNav() {
  const pathname = usePathname();
  const isActiveDrive = useDriveStore((state) => state.isActive);

  // Hide nav during active drive
  if (isActiveDrive) return null;

  const tabs = [
    { name: 'Home', href: '/', icon: Navigation },
    { name: 'Social', href: '/social', icon: Users },
    { name: 'Convoys', href: '/convoys', icon: Map },
    { name: 'Garage', href: '/garage', icon: Car },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 z-[100] w-full h-16 bg-[#0B0F17]/95 backdrop-blur-xl border-t border-white/10 pointer-events-auto select-none" style={{ touchAction: 'manipulation' }}>
      <div className="grid h-full max-w-lg grid-cols-5 mx-auto font-medium">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              onClick={() => triggerHaptic(10)}
              className={cn(
                'inline-flex flex-col items-center justify-center px-1 py-1 hover:bg-white/5 active:scale-95 transition-all cursor-pointer group touch-manipulation',
                active ? 'text-[#FF3B30]' : 'text-gray-400 hover:text-white'
              )}
            >
              <Icon className={cn("w-5 h-5 mb-0.5", active ? "stroke-[2.5px]" : "stroke-2")} />
              <span className="text-[10px] uppercase tracking-wider font-bold leading-none">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

