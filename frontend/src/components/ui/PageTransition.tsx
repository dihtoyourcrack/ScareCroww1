"use client";

import { ReactNode } from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { usePathname } from "next/navigation";

type Props = { children: ReactNode };

export default function PageTransition({ children }: Props) {
  const pathname = usePathname() || "/";

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.28, ease: [0.22, 0.9, 0.2, 1] }}
          style={{ minHeight: 'calc(100vh - 0px)' }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </MotionConfig>
  );
}
