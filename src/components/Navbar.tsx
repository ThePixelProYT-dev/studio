"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LogoIcon } from "@/components/icons/LogoIcon";
import { GalleryVerticalEnd, Home } from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/collections", label: "Collections", icon: GalleryVerticalEnd },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <LogoIcon className="h-6 w-6 text-primary" />
          <span className="font-bold font-headline sm:inline-block text-foreground">
            Photo Poet
          </span>
        </Link>
        <nav className="flex flex-1 items-center space-x-4 sm:space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === item.href
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5 md:hidden" />
              <span className="hidden md:inline">{item.label}</span>
            </Link>
          ))}
        </nav>
        {/* Future user auth can go here */}
      </div>
    </header>
  );
}
