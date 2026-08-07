'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Navigation, Users, Map, Car, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDriveStore } from '@/store/useDriveStore';

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
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-[#0B0F17]/90 backdrop-blur-xl border-t border-white/10">
      <div className="grid h-full max-w-lg grid-cols-5 mx-auto font-medium">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                'inline-flex flex-col items-center justify-center px-5 hover:bg-white/5 transition-colors group',
                active ? 'text-[#FF3B30]' : 'text-gray-400 hover:text-white'
              )}
            >
              <Icon className={cn("w-6 h-6 mb-1", active ? "stroke-[2.5px]" : "stroke-2")} />
              <span className="text-[10px] uppercase tracking-wider">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
