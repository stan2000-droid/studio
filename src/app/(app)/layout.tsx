
'use client'; // Make this a client component to use usePathname

import { AppSidebar } from '@/components/layout/app-sidebar';
import type { PropsWithChildren } from 'react';
import { usePathname } from 'next/navigation'; // Import usePathname

export default function AppLayout({ children }: PropsWithChildren) {
  const pathname = usePathname(); // Get current pathname

  // Default background image and hint
  let currentBackgroundImage = "url('https://placehold.co/1920x1080.png')";
  let currentDataAiHint = "mine hoisting";

  // Conditional background for the dashboard page
  if (pathname === '/dashboard') {
    currentBackgroundImage = "url('https://placehold.co/1200x800.png')"; // Placeholder for the user-provided image
    currentDataAiHint = "mine headframe dusk"; // Hint for the user-provided image
  }

  return (
    // The outer div retains bg-background for fallback and overall page structure
    <div className="flex min-h-screen bg-background">
      <AppSidebar /> {/* Sidebar is fixed and has its own background */}
      <main
        className="flex-1 pl-64 bg-cover bg-center bg-fixed" // Tailwind classes for background properties
        style={{
          backgroundImage: currentBackgroundImage, // Apply conditional background image
        }}
        data-ai-hint={currentDataAiHint} // Apply conditional data-ai-hint
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
