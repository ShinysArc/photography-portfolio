export const runtime = 'nodejs'; // ensure Node runtime (Nodemailer needs Node, not Edge)

import nodemailer from 'nodemailer';

type Payload = {
  name: string;
  email: string;
  subject?: string;
  message: string;
  hp?: string; // honeypot
  startedAt?: number; // ms timestamp from client
};

function isValidEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Payload;

    // Basic validation
    const name = (body.name || '').trim();
    const email = (body.email || '').trim();
    const subject = (body.subject || '').trim();
    const message = (body.message || '').trim();

    if (!name || !email || !message) {
      return Response.json({ ok: false, error: 'Missing required fields' }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return Response.json({ ok: false, error: 'Invalid email' }, { status: 400 });
    }
    if (message.length > 5000) {
      return Response.json({ ok: false, error: 'Message too long' }, { status: 400 });
    }

    // Anti-spam: honeypot + min fill time
    if (body.hp && body.hp.trim() !== '') {
      return Response.json({ ok: true }); // silently accept
    }
    const minMs = 3000;
    if (typeof body.startedAt === 'number' && Date.now() - body.startedAt < minMs) {
      return Response.json({ ok: true }); // silently accept fast bots
    }

    const to = process.env.CONTACT_TO!;
    const from = process.env.CONTACT_FROM!;
    const host = process.env.SMTP_HOST!;
    const port = Number(process.env.SMTP_PORT || '587');
    const user = process.env.SMTP_USER!;
    const pass = process.env.SMTP_PASS!;
    if (!to || !from || !host || !port || !user || !pass) {
      return Response.json({ ok: false, error: 'Server not configured' }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for 587/25
      auth: { user, pass },
    });

    const subjectLine = `[Photo] ${name}${subject ? ` — ${subject}` : ''}`;
    const text = `From: ${name} <${email}>\n\n${message}`;
    const html = `
      <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
        <p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
        ${subject ? `<p><strong>Subject:</strong> ${escapeHtml(subject)}</p>` : ''}
        <hr/>
        <pre style="white-space:pre-wrap;font:inherit">${escapeHtml(message)}</pre>
      </div>
    `;

    await transporter.sendMail({
      from,
      to,
      subject: subjectLine,
      replyTo: email,
      text,
      html,
    });

    return Response.json({ ok: true });
  } catch (err) {
    console.error(err);
    return Response.json({ ok: false, error: 'Failed to send' }, { status: 500 });
  }
}

function escapeHtml(s: string) {
  return s.replace(
    /[&<>"']/g,
    (c) => (({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }) as any)[c],
  );
}
