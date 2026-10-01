"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { QuoteIcon, RefreshIcon } from "@/components/ui/icons";
import { quotes } from "@/data/site";

export default function QuoteOfTheDay() {
  const [index, setIndex] = useState(0);
  const quote = quotes.items[index % quotes.items.length];

  return (
    <figure className="mx-auto mt-24 flex max-w-3xl flex-col items-center text-center md:mt-32">
      <QuoteIcon aria-hidden className="size-10 text-muted" />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-6"
        >
          <blockquote className="text-xl leading-relaxed font-light text-body italic md:text-2xl">
            &ldquo;{quote.text}&rdquo;
          </blockquote>
          <figcaption className="mt-6 font-medium text-muted">{quote.author}</figcaption>
        </motion.div>
      </AnimatePresence>
      <p className="mt-6 text-xs font-medium tracking-[0.2em] text-muted uppercase">
        {quotes.label}
      </p>
      <button
        type="button"
        aria-label={quotes.nextLabel}
        onClick={() => setIndex((value) => value + 1)}
        className="mt-3 rounded-full p-2 text-muted transition-colors outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-white/40"
      >
        <motion.span
          className="flex"
          animate={{ rotate: index * 180 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <RefreshIcon aria-hidden className="size-4" />
        </motion.span>
      </button>
    </figure>
  );
}
