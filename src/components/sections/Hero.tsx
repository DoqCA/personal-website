"use client";

import { motion } from "motion/react";
import { hero } from "@/data/site";

const rise = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Hero() {
  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="flex min-h-svh scroll-mt-24 items-center justify-center px-6 text-center md:px-8 lg:px-10"
    >
      <motion.div
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: 0.15 }}
      >
        <motion.h1
          id="hero-heading"
          variants={rise}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-5xl font-bold tracking-tight text-white sm:text-7xl lg:text-8xl"
        >
          {hero.greeting}
        </motion.h1>
        <motion.p
          variants={rise}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mt-6 text-xl font-light text-white sm:text-2xl lg:text-3xl"
        >
          {hero.subtitle}
        </motion.p>
      </motion.div>
    </section>
  );
}
