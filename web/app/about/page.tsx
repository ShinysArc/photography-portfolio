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
          I'm Stéphane, and welcome to my photogtaphy portfolio. I've always had a camera close by,
          what started as a small hobby quickly became something I can't imagine leaving behind.
          During my time as president of my uni's photography club{' '}
          <Link
            href="https://ephemere.photo/"
            className="relative font-medium text-accent hover:text-accent/90
                       underline decoration-accent/60 decoration-2 underline-offset-4
                       transition-colors hover:decoration-accent hover:decoration-4
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded-sm"
          >
            Ephemere
          </Link>
          , I spent countless nights shooting parties, and events. Those experiences taught me how
          to capture people's energy, movement, and the atmosphere of a moment before it fades.
        </p>

        <p>
          Outside of events, I take my camera everywhere I go. When I travel, it's always one of the
          first things I pack. I love taking portraits of friends, wandering through new streets,
          and finding beauty in small, quiet details that most people might overlook.
        </p>

        <p>
          I also enjoy simple walks with no destination, just me and my camera, seeing what catches
          my eye.
        </p>

        <p>
          If you like my work or just want to talk photography, feel free to reach out through the{' '}
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
