"use client";

import { motion } from "framer-motion";
import Navbar from "./Navbar";

interface HudLayoutProps {
  children: React.ReactNode;
}

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export default function HudLayout({ children }: HudLayoutProps) {
  return (
    <div className="min-h-screen bg-valo-bg flex flex-col">
      {/* Ambient BG */}
      <div
        className="fixed inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,212,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.04) 1px,transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="fixed inset-0 pointer-events-none bg-hero-gradient" />

      <Navbar />

      <main className="flex-1 relative z-10">
        <motion.div
          key="page"
          variants={pageVariants}
          initial="initial"
          animate="enter"
          exit="exit"
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="h-full"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
