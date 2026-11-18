import { site } from "@/lib/site";
import { canCaptureLeads, config } from "./config";
import {
  applicationReplyEmail,
  autoReplyEmail,
  deckEmail,
  teamEmail,
  type TeamRow,
} from "./email-templates";

/**
 * Lead delivery (brief §8 "Follow-up automation"), all channels in parallel:
 *   team email (Resend) · auto-reply from a real person (Resend) · CRM webhook · Slack alert
 * A lead counts as captured if ANY of team email / CRM / Slack succeeded;
 * the auto-reply is a courtesy and never blocks success.
 */

export type Lead = {
  /** brief / quick → sales; deck → capabilities-deck request; application → careers. */
  kind: "brief" | "quick" | "deck" | "application";
  ref: string;
  createdAt: string;
  name: string;
  email: string;
  title: string;
  rows: TeamRow[];
  score: { score: number; tier: "high" | "medium" | "low" } | null;
  /** Everything else for the CRM payload. */
  data: Record<string, unknown>;
  meta: { ip: string; userAgent: string; referrer: string; utm: Record<string, string> };
};

type ChannelResult = "sent" | "skipped" | "failed";
export type DeliveryReport = {
  captured: boolean;
  channels: Record<"teamEmail" | "autoReply" | "crm" | "slack", ChannelResult>;
};

export function newRef(kind: Lead["kind"]) {
  const stamp = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  const prefix = { brief: "PB", quick: "PQ", deck: "PD", application: "PA" }[kind];
  return `${prefix}-${stamp}-${rand}`;
}

const KIND_LABEL: Record<Lead["kind"], string> = {
  brief: "project brief",
  quick: "enquiry",
  deck: "deck request",
  application: "job application",
};

async function post(url: string, body: unknown, headers: Record<string, string> = {}) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok)
    throw new Error(`${url} → ${res.status} ${await res.text().catch(() => "")}`.slice(0, 300));
}

async function sendEmail(to: string, subject: string, html: string, replyTo?: string) {
  if (!config.resend.apiKey || !config.resend.from) return "skipped" as const;
  await post(
    `${config.resend.apiUrl}/emails`,
    {
      from: config.resend.from,
      to: [to],
      subject,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
    },
    { authorization: `Bearer ${config.resend.apiKey}` },
  );
  return "sent" as const;
}

async function teamChannel(lead: Lead): Promise<ChannelResult> {
  const to =
    lead.kind === "application" ? (config.careersTo ?? config.resend.to) : config.resend.to;
  if (!to) return "skipped";
  const subject = `${lead.score?.tier === "high" ? "🔥 " : ""}New ${KIND_LABEL[lead.kind]} — ${lead.name} (${lead.ref})`;
  return sendEmail(
    to,
    subject,
    teamEmail({
      title: lead.title,
      rows: lead.rows,
      tier: lead.score?.tier ?? null,
      ref: lead.ref,
    }),
    lead.email,
  );
}

async function autoReplyChannel(lead: Lead): Promise<ChannelResult> {
  const { replier } = site.contact;
  const first = lead.name.split(" ")[0] ?? lead.name;
  if (lead.kind === "deck") {
    if (!config.deckUrl) return "skipped";
    return sendEmail(lead.email, `Our capabilities deck — ${site.name}`, deckEmail(config.deckUrl));
  }
  if (lead.kind === "application") {
    return sendEmail(lead.email, `Thanks for applying, ${first}`, applicationReplyEmail(first));
  }
  return sendEmail(
    lead.email,
    `Thanks, ${lead.name.split(" ")[0]} — we’ve got your brief`,
    autoReplyEmail({
      firstName: lead.name.split(" ")[0] ?? lead.name,
      replierName: replier.name,
      replierRole: replier.role,
    }),
  );
}

async function crmChannel(lead: Lead): Promise<ChannelResult> {
  // Job applications never go into the sales CRM.
  if (!config.crm.webhook || lead.kind === "application") return "skipped";
  await post(
    config.crm.webhook,
    {
      source: "pinnacle-website",
      ref: lead.ref,
      kind: lead.kind,
      createdAt: lead.createdAt,
      name: lead.name,
      email: lead.email,
      score: lead.score,
      ...lead.data,
      meta: lead.meta,
    },
    config.crm.secret ? { "x-webhook-secret": config.crm.secret } : {},
  );
  return "sent";
}

async function slackChannel(lead: Lead): Promise<ChannelResult> {
  if (!config.slackWebhook) return "skipped";
  const hot = lead.score?.tier === "high";
  const fields = lead.rows
    .filter((r) => r.value)
    .slice(0, 10)
    .map((r) => ({ type: "mrkdwn", text: `*${r.label}*\n${r.value.slice(0, 300)}` }));
  await post(config.slackWebhook, {
    text: `${hot ? "🔥 High-value lead — call within 2 hours: " : "New lead: "}${lead.name} (${lead.ref})`,
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: `${hot ? "🔥 " : ""}${lead.title}` },
      },
      ...(hot
        ? [
            {
              type: "section",
              text: { type: "mrkdwn", text: "*High-value lead — call within 2 hours.*" },
            },
          ]
        : []),
      { type: "section", fields },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `${lead.ref} · score ${lead.score?.score ?? "–"} · ${lead.meta.utm.utm_source ?? "direct"}`,
          },
        ],
      },
    ],
  });
  return "sent";
}

const settle = async (fn: () => Promise<ChannelResult>, name: string): Promise<ChannelResult> => {
  try {
    return await fn();
  } catch (err) {
    console.error(`[lead] ${name} failed:`, err);
    return "failed";
  }
};

export async function deliverLead(lead: Lead): Promise<DeliveryReport> {
  const deckUnavailable =
    lead.kind === "deck" && !(config.deckUrl && config.resend.apiKey && config.resend.from);
  if (!canCaptureLeads() || deckUnavailable) {
    if (config.dryRun) {
      console.info(
        `[lead:dry-run] ${lead.ref}`,
        JSON.stringify({ ...lead, meta: { ...lead.meta, ip: "redacted" } }),
      );
      return {
        captured: true,
        channels: { teamEmail: "skipped", autoReply: "skipped", crm: "skipped", slack: "skipped" },
      };
    }
    console.error(`[lead] ${lead.ref}: no delivery channel configured in production`);
    return {
      captured: false,
      channels: { teamEmail: "skipped", autoReply: "skipped", crm: "skipped", slack: "skipped" },
    };
  }

  const [teamEmailR, crm, slack, autoReply] = await Promise.all([
    settle(() => teamChannel(lead), "team email"),
    settle(() => crmChannel(lead), "crm"),
    settle(() => slackChannel(lead), "slack"),
    settle(() => autoReplyChannel(lead), "auto-reply"),
  ]);
  // A deck request only succeeds if the deck actually reached the visitor.
  const captured =
    lead.kind === "deck" ? autoReply === "sent" : [teamEmailR, crm, slack].includes("sent");
  if (!captured)
    console.error(`[lead] ${lead.ref}: delivery failed`, { teamEmailR, crm, slack, autoReply });
  return { captured, channels: { teamEmail: teamEmailR, autoReply, crm, slack } };
}

/** Newsletter (provider: Brevo — TODO: confirm vs Mailchimp). */
export async function subscribe(email: string): Promise<"sent" | "skipped" | "failed"> {
  if (!config.brevo.apiKey || !config.brevo.listId) {
    if (config.dryRun) {
      console.info("[newsletter:dry-run]", email.replace(/(.).*@/, "$1***@"));
      return "skipped";
    }
    return "failed";
  }
  try {
    await post(
      `${config.brevo.apiUrl}/contacts`,
      { email, listIds: [Number(config.brevo.listId)], updateEnabled: true },
      { "api-key": config.brevo.apiKey },
    );
    return "sent";
  } catch (err) {
    console.error("[newsletter] failed:", err);
    return "failed";
  }
}
