"use client";

import { motion, type HTMLMotionProps, type Variants } from "framer-motion";
import { type ElementType, type ReactNode } from "react";

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.7, ease: "easeOut" } }
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12
    }
  }
};

export const scaleOnHover = {
  whileHover: { scale: 1.025, y: -4 },
  transition: { type: "spring", stiffness: 260, damping: 22 }
} as const;

type MotionWrapperProps = HTMLMotionProps<"div"> & {
  as?: ElementType;
  children: ReactNode;
};

export function MotionWrapper({ as = "div", children, ...props }: MotionWrapperProps) {
  const Component = motion(as);

  return <Component {...props}>{children}</Component>;
}
