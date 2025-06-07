
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NAV_ITEMS, APP_NAME } from '@/lib/constants';
import { Separator } from '@/components/ui/separator';
import { Bot } from 'lucide-react';


export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-10 flex h-full w-64 flex-col border-r bg-sidebar text-sidebar-foreground shadow-md">
      <div className="flex h-16 items-center justify-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Bot className="h-8 w-8 text-primary" />
          <h1 className="font-headline text-xl font-semibold text-primary">{APP_NAME}</h1>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              'group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors duration-150 ease-in-out',
              pathname === item.href
                ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90'
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              item.disabled && 'cursor-not-allowed opacity-50'
            )}
            aria-disabled={item.disabled}
            tabIndex={item.disabled ? -1 : undefined}
          >
            <item.icon className={cn('mr-3 h-5 w-5 shrink-0')} />
            <span className="truncate">{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="mt-auto p-4">
        <Separator className="my-2 bg-sidebar-border" />
        <p className="text-center text-xs text-sidebar-foreground/70">
          &copy; {new Date().getFullYear()} {APP_NAME}
        </p>
      </div>
    </aside>
  );
}
