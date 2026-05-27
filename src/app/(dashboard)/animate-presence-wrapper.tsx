"use client";

import { AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/motion/page-transition";
import { usePathname } from "next/navigation";

export function AnimatePresenceWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <AnimatePresence mode="wait">
      <PageTransition key={pathname}>{children}</PageTransition>
    </AnimatePresence>
  );
}
