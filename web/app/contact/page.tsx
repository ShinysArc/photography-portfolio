'use client';

import clsx from 'clsx';
import { useEffect, useMemo, useState } from 'react';

export default function ContactPage() {
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const [ok, setOk] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  // honeypot (hidden)
  const [hp, setHp] = useState('');

  useEffect(() => setStartedAt(Date.now()), []);

  const canSend = useMemo(() => {
    return !sending && name.trim() && email.trim() && message.trim();
  }, [sending, name, email, message]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSend) return;

    setSending(true);
    setOk(null);
    setError(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
          hp,
          startedAt,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Failed');
      setOk(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setOk(false);
      setError(err?.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-[var(--container-w)]">
      <h1 className="text-2xl font-bold mb-2">Contact</h1>
      <p className="opacity-80 mb-6">Send me a note and I’ll get back to you as soon as I can.</p>

      <form onSubmit={onSubmit} className="grid gap-4 max-w-2xl">
        {/* Honeypot field (hidden) */}
        <div className="hidden">
          <label className="block text-sm">Website</label>
          <input
            value={hp}
            onChange={(e) => setHp(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            placeholder="Leave this empty"
          />
        </div>

        <div>
          <label className="block text-sm">Name *</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="block text-sm">Email *</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            placeholder="you@email.com"
          />
        </div>

        <div>
          <label className="block text-sm">Subject</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            placeholder="Optional"
          />
        </div>

        <div>
          <label className="block text-sm">Message *</label>
          <textarea
            required
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mt-1 w-full resize-y rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            placeholder="How can I help?"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={!canSend}
            className={clsx(
              'rounded-md px-4 py-2 text-sm font-medium transition-colors',
              canSend
                ? 'bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200'
                : 'bg-neutral-300 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-500 cursor-not-allowed',
            )}
          >
            {sending ? 'Sending…' : 'Send'}
          </button>
          {ok && (
            <span className="text-green-600 dark:text-green-400 text-sm">Sent! Thank you.</span>
          )}
          {ok === false && <span className="text-red-600 dark:text-red-400 text-sm">{error}</span>}
        </div>
      </form>
    </section>
  );
}
