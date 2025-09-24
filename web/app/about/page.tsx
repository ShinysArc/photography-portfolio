import Image from 'next/image';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <section className="grid gap-8 md:grid-cols-3 items-start">
      <div className="md:col-span-1">
        <div className="relative w-full aspect-[4/5] overflow-hidden rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-800 dark:to-neutral-900">
          <Image
            src="/me.jpg"
            alt="Portrait"
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
            priority
          />
        </div>
      </div>

      <article className="md:col-span-2 prose dark:prose-invert max-w-none">
        <h1 className="text-2xl font-bold mb-2">About</h1>
        <p>
          Hey! I’m Stéphane — a software engineer and photographer. This is my online portfolio
          powered by <strong>Immich</strong> and <strong>Next.js</strong>.
        </p>
        <p>
          I love clean compositions, honest light, and candid moments. When I’m not shooting, I’m
          probably tinkering with my homelab or building developer tools.
        </p>
        <p>
          On this site you’ll find selected projects, travel albums, and the gear I use. If you have
          a question or a project in mind, feel free to reach out via the{' '}
          <Link
            href="/contact"
            className="relative font-medium text-accent hover:text-accent/90
                       underline decoration-accent/60 decoration-2 underline-offset-4
                       transition-colors hover:decoration-accent hover:decoration-4
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded-sm"
          >
            contact page
          </Link>
          .
        </p>
      </article>
    </section>
  );
}
