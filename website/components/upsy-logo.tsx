"use client";

import React from "react";
import { motion, SVGMotionProps } from "framer-motion";

export interface Props extends SVGMotionProps<SVGSVGElement> {
  size?: number;
}

export default function UpsyLogo({ size = 48, ...props }: Props) {
  const [repeat, setRepeat] = React.useState(1);

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      width={size}
      height={size}
      viewBox="0 0 52 52"
      initial="hidden"
      animate={repeat === 2 ? "smile" : repeat === 1 ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 0, scale: 0.6, rotate: 23 },
        visible: { opacity: 1, scale: 1, rotate: 0 },
        smile: { opacity: 1, scale: 0.9, rotate: 0 },
      }}
      onClick={() => {
        if (repeat === 2) return setRepeat(1);
        setRepeat(2);
        setTimeout(() => setRepeat(1), 800);
      }}
      {...props}
    >
      <motion.rect
        width="48"
        height="48"
        x="2"
        y="2"
        fill="#fff"
        stroke="currentColor"
        strokeWidth="4"
        rx="10"
        variants={{
          hidden: {
            pathLength: 0,
          },
          visible: {
            pathLength: 1,
          },
          smile: {
            pathLength: 1,
          },
        }}
      />

      {/* eyes */}
      <motion.path
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="5"
        d="M26 15v9"
        variants={{
          hidden: { opacity: 0, scale: 0, pathLength: 0 },
          visible: {
            opacity: 1,
            scale: 1,
            pathLength: 1,
            transition: { delay: 0.3 },
          },
          smile: {
            opacity: 0,
            scale: 0,
            pathLength: 0,
          },
        }}
      />
      <motion.path
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="5"
        d="M35 15v9"
        variants={{
          hidden: { opacity: 0, y: 6, pathLength: 0 },
          visible: {
            opacity: 1,
            y: 0,

            pathLength: 1,
            transition: { delay: 0.5 },
          },
          smile: {
            opacity: 0,
            y: 0,
            pathLength: 0,
          },
        }}
      />

      {/* eye line */}
      <motion.path
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="5"
        d="M17 18v3M26 18v3M35 18v3M44 18v3M8 18v3"
        opacity=".2"
        variants={{
          hidden: { x: -9, opacity: 0 },
          visible: {
            x: 0,
            opacity: 0.2,
            transition: { delay: 0.3 },
          },
          smile: {
            x: 9,
            opacity: 0.2,
            transition: { delay: 0, duration: 0.1, repeat: 9 },
          },
        }}
      />

      {/* mouth */}
      <motion.path
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="4"
        d="M19.5 34C25 39 35 39 40 34"
        variants={{
          hidden: {
            opacity: 0,
            pathLength: 0,
            d: "M19.5 34C26.5 34 34 34 40 34",
          },
          visible: {
            opacity: 1,
            pathLength: 1,
            d: "M19.5 34C25 39 35 39 40 34",
            transition: { delay: 0.5 },
          },
          smile: {
            opacity: 1,
            pathLength: 0.8,
            d: "M19.5 34C26.5 34 34 34 40 34",
            transition: { delay: 0 },
          },
        }}
      />
    </motion.svg>
  );
}
