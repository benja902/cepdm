"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  LogOut,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/app/dashboard", label: "CAMPO BASE", icon: <LayoutDashboard size={15} /> },
  { href: "/app/courses", label: "CURSOS", icon: <BookOpen size={15} /> },
  { href: "/app/reports", label: "REPORTES", icon: <BarChart3 size={15} /> },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.user_metadata?.role === "admin") setIsAdmin(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <header className="relative z-20 border-b border-valo-border/70 bg-valo-surface/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
        {/* Logo */}
        <Link href="/app/dashboard" className="flex items-center gap-2 group">
          <div
            className="w-8 h-8 bg-valo-accent/15 border border-valo-accent/40 flex items-center justify-center text-valo-accent font-mono text-xs font-black transition-all group-hover:bg-valo-accent/25"
            style={{ clipPath: "polygon(3px 0,100% 0,100% calc(100% - 3px),calc(100% - 3px) 100%,0 100%,0 3px)" }}
          >
            CP
          </div>
          <span className="font-mono font-bold tracking-wider text-sm hidden sm:block">
            CEPREVAL<span className="text-valo-accent">PREP</span>
          </span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-2 font-mono text-xs tracking-widest transition-all",
                  active
                    ? "text-valo-accent"
                    : "text-valo-muted hover:text-valo-text"
                )}
              >
                {item.icon}
                <span className="hidden md:block">{item.label}</span>
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-0 right-0 h-px bg-valo-accent"
                    transition={{ duration: 0.2 }}
                  />
                )}
              </Link>
            );
          })}

          {isAdmin && (
            <Link
              href="/app/admin"
              className={cn(
                "relative flex items-center gap-2 px-4 py-2 font-mono text-xs tracking-widest transition-all",
                pathname.startsWith("/app/admin")
                  ? "text-valo-gold"
                  : "text-valo-muted hover:text-valo-gold"
              )}
            >
              <Shield size={15} />
              <span className="hidden md:block">ADMIN</span>
              {pathname.startsWith("/app/admin") && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute bottom-0 left-0 right-0 h-px bg-valo-gold"
                  transition={{ duration: 0.2 }}
                />
              )}
            </Link>
          )}
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-valo-muted hover:text-valo-red transition-colors font-mono text-xs tracking-wider"
        >
          <LogOut size={14} />
          <span className="hidden sm:block">SALIR</span>
        </button>
      </div>
    </header>
  );
}
