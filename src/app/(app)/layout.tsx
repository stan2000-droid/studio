
import { AppSidebar } from '@/components/layout/app-sidebar';
import type { PropsWithChildren } from 'react';

export default function AppLayout({ children }: PropsWithChildren) {
  return (
    // The outer div retains bg-background for fallback and overall page structure
    <div className="flex min-h-screen bg-background">
      <AppSidebar /> {/* Sidebar is fixed and has its own background */}
      <main
        className="flex-1 pl-64 bg-cover bg-center bg-fixed" // Tailwind classes for background properties
        style={{
          // Placeholder image URL for the underground mine hoisting environment
          backgroundImage: "url('https://placehold.co/1920x1080.png')",
        }}
        data-ai-hint="mine hoisting" // AI hint for image search
      >
        {/* This div wraps both the overlay and the content, allowing content to be z-indexed above overlay */}
        <div className="relative h-full"> {/* Ensures this div takes full height of main */}
          {/* Overlay to enhance readability of content over the background image */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div> {/* Semi-transparent black overlay with blur */}
          
          {/* Content container, positioned above the overlay */}
          <div className="relative z-10 container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
