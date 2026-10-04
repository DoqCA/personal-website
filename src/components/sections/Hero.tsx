import { hero } from "@/data/site";

// CSS-only entrance so the heading (the LCP element) paints with the HTML instead of waiting
// for JavaScript to hydrate.
const rise = "animate-rise motion-reduce:animate-none";

export default function Hero() {
  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="flex min-h-svh scroll-mt-24 items-center justify-center px-6 text-center md:px-8 lg:px-10"
    >
      <div>
        <h1
          id="hero-heading"
          className={`text-5xl font-bold tracking-tight text-white sm:text-7xl lg:text-8xl ${rise}`}
        >
          {hero.greeting}
        </h1>
        <p
          className={`mt-6 text-xl font-light text-white [animation-delay:150ms] sm:text-2xl lg:text-3xl ${rise}`}
        >
          {hero.subtitle}
        </p>
      </div>
    </section>
  );
}
