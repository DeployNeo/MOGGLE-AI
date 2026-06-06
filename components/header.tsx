"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Bell,
  LayoutDashboard,
  LogOut,
  Scan,
  Settings,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/#analyze", label: "Analyze" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/profile", label: "Profile" },
];

export function Header() {
  const pathname = usePathname();
  const { user, profile, configured, logOut, loading } = useAuth();

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/10">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 gap-3">
        <Link href="/" className="flex items-center gap-2.5 min-w-0 group">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-electric/15 border border-electric/25 glow-electric"
          >
            <Scan className="h-4 w-4 text-electric" />
          </motion.div>
          <span className="font-semibold tracking-tight">
            Moggle <span className="text-electric">AI</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-3 py-2 text-sm rounded-lg transition-colors",
                pathname === item.href || (item.href === "/#analyze" && pathname === "/")
                  ? "text-foreground bg-white/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          {configured && user && (
            <>
              <Link href="/settings">
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                  <Bell className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="h-9 gap-1.5 hidden sm:flex">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="text-xs">{profile?.displayName?.split(" ")[0] ?? "Dashboard"}</span>
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                  <User className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0"
                onClick={() => logOut()}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          )}

          {configured && !user && !loading && (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-xs h-9">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="text-xs h-9">
                  Get Started
                </Button>
              </Link>
            </>
          )}

          {!configured && (
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-xs h-9 gap-1">
                <Settings className="h-3.5 w-3.5" />
                Demo
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
