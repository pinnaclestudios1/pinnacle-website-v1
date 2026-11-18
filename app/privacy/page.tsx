import { LegalDoc } from "@/components/legal/LegalDoc";
import { Todo } from "@/components/ui/Todo";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Privacy policy",
  description:
    "How Pinnacle Studios collects, uses and protects personal data under India’s DPDP Act 2023 and the GDPR.",
  path: "/privacy",
});

const email = site.contact.email;

/** Privacy policy — DPDP Act 2023 (India) + GDPR (EU visitors). DRAFT: legal review required. */
export default function PrivacyPage() {
  return (
    <LegalDoc
      title="Privacy policy"
      intro={
        <p>
          This policy explains what personal data {site.name} collects through this website, why,
          how long we keep it, who we share it with, and the rights you have under India’s Digital
          Personal Data Protection Act, 2023 (“DPDP Act”) and, for visitors in the EU/EEA and UK,
          the General Data Protection Regulation (“GDPR”).
        </p>
      }
      sections={[
        {
          id: "who",
          title: "Who we are",
          body: (
            <>
              <p>
                The data fiduciary (DPDP Act) and controller (GDPR) is{" "}
                {site.legalName ?? <Todo>registered company name</Todo>},{" "}
                {site.contact.address ?? <Todo>registered address</Todo>}
                {site.registrationNumber ? `, registration ${site.registrationNumber}` : ""}.
              </p>
              <p>
                Contact for privacy questions:{" "}
                {email ? (
                  <a href={`mailto:${email}`} className="underline">
                    {email}
                  </a>
                ) : (
                  <Todo>privacy contact email</Todo>
                )}
                .
              </p>
            </>
          ),
        },
        {
          id: "what",
          title: "What we collect and why",
          body: (
            <ul>
              <li>
                <strong>Project brief and quick enquiry forms:</strong> name, email, and optionally
                company, phone, your project description, budget range, timeline and how you heard
                about us. Purpose: to reply to your enquiry and prepare a proposal. Basis: your
                consent (DPDP Act s.6; GDPR Art. 6(1)(a)) and steps before a contract (GDPR Art.
                6(1)(b)).
              </li>
              <li>
                <strong>Newsletter:</strong> your email address. Purpose: occasional studio emails.
                Basis: consent — you can unsubscribe at any time.
              </li>
              <li>
                <strong>Capabilities deck requests:</strong> your email address, to send you the
                deck.
              </li>
              <li>
                <strong>Job applications:</strong> name, email, portfolio/CV link and your message.
                Purpose: to assess your application. Basis: consent and steps before an employment
                contract.
              </li>
              <li>
                <strong>Technical data:</strong> IP address, browser type and referring page, used
                to protect forms from spam and abuse (legitimate interest, GDPR Art. 6(1)(f)), and
                campaign tags (UTM parameters) to understand which campaigns bring enquiries.
              </li>
              <li>
                <strong>Analytics:</strong> only if you accept analytics cookies — see the{" "}
                <a href="/cookies" className="underline">
                  cookie policy
                </a>
                .
              </li>
            </ul>
          ),
        },
        {
          id: "share",
          title: "Who we share it with",
          body: (
            <>
              <p>We never sell your data. We use trusted processors who act on our instructions:</p>
              <ul>
                <li>
                  Website hosting — <Todo>hosting provider (e.g. Vercel)</Todo>
                </li>
                <li>Email delivery — Resend</li>
                <li>
                  CRM — <Todo>HubSpot / Zoho / Notion</Todo>
                </li>
                <li>Team notifications — Slack</li>
                <li>Spam protection — Cloudflare Turnstile</li>
                <li>
                  Newsletter — <Todo>Brevo or Mailchimp</Todo>
                </li>
                <li>Content management — Sanity</li>
                <li>
                  Call booking — <Todo>Cal.com or Calendly</Todo>
                </li>
                <li>
                  Analytics (with consent) — <Todo>GA4 + Microsoft Clarity, or Plausible</Todo>
                </li>
              </ul>
              <p>
                Some processors store data outside India or the EU. Where we transfer EU personal
                data abroad we rely on appropriate safeguards such as Standard Contractual Clauses.{" "}
                <Todo>confirm transfer mechanisms</Todo>
              </p>
            </>
          ),
        },
        {
          id: "retention",
          title: "How long we keep it",
          body: (
            <ul>
              <li>
                Enquiries that don’t become projects: <Todo>retention period</Todo>, then deleted.
              </li>
              <li>
                Client records: for the duration of the engagement and as required by law (e.g. tax
                records).
              </li>
              <li>Newsletter: until you unsubscribe.</li>
              <li>
                Job applications: <Todo>retention period</Todo>, unless you agree to a longer
                period.
              </li>
            </ul>
          ),
        },
        {
          id: "rights",
          title: "Your rights",
          body: (
            <>
              <p>
                Under the DPDP Act you can: access a summary of your data; ask us to correct,
                complete, update or erase it; withdraw consent at any time; nominate someone to
                exercise your rights; and raise a grievance with us.
              </p>
              <p>
                Under the GDPR you also have the rights to restriction, portability and objection,
                and you can complain to your local data protection authority.
              </p>
              <p>
                To exercise any right, email{" "}
                {email ? (
                  <a href={`mailto:${email}`} className="underline">
                    {email}
                  </a>
                ) : (
                  <Todo>privacy contact email</Todo>
                )}
                . We reply within <Todo>response time</Todo>.
              </p>
            </>
          ),
        },
        {
          id: "grievance",
          title: "Grievance officer",
          body: (
            <p>
              Grievance Officer: <Todo>name, email</Todo>. If you are not satisfied with our
              response, you may approach the Data Protection Board of India.
            </p>
          ),
        },
        {
          id: "browser",
          title: "Data stored in your browser",
          body: (
            <p>
              We store a few small items in your browser to make the site work: whether you’ve seen
              the intro animation, the answers you’ve typed into the project brief (so you don’t
              lose them), and campaign tags for the current visit. These never leave your device
              unless you submit a form. Details in the{" "}
              <a href="/cookies" className="underline">
                cookie policy
              </a>
              .
            </p>
          ),
        },
        {
          id: "security",
          title: "Security",
          body: (
            <p>
              We use HTTPS everywhere, limit access to personal data to people who need it, and
              choose processors with strong security practices. No system is perfectly secure; if a
              breach affects you, we will notify you and the authorities as the law requires.
            </p>
          ),
        },
        {
          id: "children",
          title: "Children",
          body: (
            <p>
              This website is for businesses and job seekers. We don’t knowingly collect data from
              anyone under 18.
            </p>
          ),
        },
        {
          id: "changes",
          title: "Changes to this policy",
          body: (
            <p>
              We’ll update this page when our practices change and revise the “last updated” date
              above.
            </p>
          ),
        },
      ]}
    />
  );
}
