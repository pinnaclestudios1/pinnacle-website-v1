import { site } from "@/lib/site";

/**
 * Plain, robust HTML emails (tables + inline styles, no web fonts) so they render
 * in Gmail, Outlook and Apple Mail. The Dot appears in the signature as a PNG
 * (app/email/dot.png) because email clients don't render SVG reliably.
 */

const esc = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );

const nl2br = (s: string) => esc(s).replace(/\n/g, "<br>");

const shell = (
  inner: string,
) => `<!doctype html><html><body style="margin:0;padding:0;background:#f6f1e7;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f1e7;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fbf8f2;border:1px solid #e4ded2;border-radius:8px;">
<tr><td style="padding:32px;font-family:Arial,Helvetica,sans-serif;color:#1e1e1e;font-size:15px;line-height:1.6;">${inner}</td></tr>
</table></td></tr></table></body></html>`;

export type TeamRow = { label: string; value: string };

export function teamEmail(opts: {
  title: string;
  rows: TeamRow[];
  tier: "high" | "medium" | "low" | null;
  ref: string;
}) {
  const badge =
    opts.tier === "high"
      ? `<p style="margin:0 0 20px;padding:10px 14px;background:#1e1e1e;color:#fbf8f2;border-radius:6px;font-weight:bold;">High-value lead — call within 2 hours</p>`
      : "";
  const rows = opts.rows
    .filter((r) => r.value)
    .map(
      (r) =>
        `<tr><td style="padding:8px 12px 8px 0;color:#5e5e5c;vertical-align:top;white-space:nowrap;">${esc(r.label)}</td><td style="padding:8px 0;">${nl2br(r.value)}</td></tr>`,
    )
    .join("");
  return shell(`
<p style="margin:0 0 6px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#5e5e5c;">${esc(site.name)} · ${esc(opts.ref)}</p>
<h1 style="margin:0 0 20px;font-family:Georgia,serif;font-weight:normal;font-size:24px;">${esc(opts.title)}</h1>
${badge}
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-top:1px solid #e4ded2;">${rows}</table>`);
}

export function deckEmail(deckUrl: string) {
  return shell(`
<p style="margin:0 0 16px;">Hi,</p>
<p style="margin:0 0 16px;">Here’s our capabilities deck — who we are, what we build and how we work.</p>
<p style="margin:0 0 24px;"><a href="${esc(deckUrl)}" style="display:inline-block;padding:12px 20px;background:#ff5b27;color:#1e1e1e;text-decoration:none;border-radius:8px;font-weight:bold;">Download the deck</a></p>
<p style="margin:0 0 16px;">If something in it sparks an idea, just reply — ${esc(site.contact.responsePromise.toLowerCase())}.</p>
<p style="margin:0;color:#5e5e5c;">— ${esc(site.name)}</p>`);
}

export function applicationReplyEmail(firstName: string) {
  return shell(`
<p style="margin:0 0 16px;">Hi ${esc(firstName)},</p>
<p style="margin:0 0 16px;">Thanks for wanting to climb with us — your application is in. We read every one and will get back to you either way.</p>
<p style="margin:0;color:#5e5e5c;">— ${esc(site.name)}</p>`);
}

export function autoReplyEmail(opts: {
  firstName: string;
  replierName: string | null;
  replierRole: string | null;
}) {
  const sender = opts.replierName ?? site.name;
  const dot = `${site.url}/email/dot.png`;
  return shell(`
<p style="margin:0 0 16px;">Hi ${esc(opts.firstName)},</p>
<p style="margin:0 0 16px;">Thanks for telling us about your project — it’s safely at base camp with us. ${esc(site.contact.responsePromise)}.</p>
<p style="margin:0 0 8px;"><strong>What happens next</strong></p>
<ol style="margin:0 0 16px;padding-left:20px;">
  <li>We read your brief and reply within 24 hours.</li>
  <li>A short discovery call to understand your goals.</li>
  <li>A clear proposal within 3–5 days.</li>
</ol>
<p style="margin:0 0 24px;">If anything changes in the meantime, just reply to this email.</p>
<table role="presentation" cellpadding="0" cellspacing="0"><tr>
  <td style="padding-right:14px;vertical-align:middle;"><img src="${dot}" width="44" height="44" alt="" style="display:block;border:0;"></td>
  <td style="vertical-align:middle;font-size:14px;line-height:1.4;">
    <strong>${esc(sender)}</strong><br>
    <span style="color:#5e5e5c;">${esc(opts.replierRole ? `${opts.replierRole}, ${site.name}` : site.name)}</span>
  </td>
</tr></table>`);
}
