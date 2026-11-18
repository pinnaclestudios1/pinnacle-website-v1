import { LegalDoc } from "@/components/legal/LegalDoc";
import { Todo } from "@/components/ui/Todo";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Terms of use",
  description: "Terms for using the Pinnacle Studios website.",
  path: "/terms",
});

/** Terms of use for the website (not client contracts). DRAFT: legal review required. */
export default function TermsPage() {
  return (
    <LegalDoc
      title="Terms of use"
      intro={
        <p>
          These terms cover your use of this website. Client projects are governed by separate
          written agreements.
        </p>
      }
      sections={[
        {
          id: "about",
          title: "About us",
          body: (
            <p>
              This website is operated by {site.legalName ?? <Todo>registered company name</Todo>},{" "}
              {site.contact.address ?? <Todo>registered address</Todo>}
              {site.registrationNumber ? (
                `, ${site.registrationNumber}`
              ) : (
                <>
                  {" "}
                  (<Todo>GST / registration number</Todo>)
                </>
              )}
              .
            </p>
          ),
        },
        {
          id: "use",
          title: "Using the site",
          body: (
            <ul>
              <li>
                Use the site lawfully and don’t try to disrupt it, probe its security or overload
                its forms.
              </li>
              <li>Information you send through our forms must be accurate and yours to share.</li>
              <li>We may update, suspend or withdraw any part of the site without notice.</li>
            </ul>
          ),
        },
        {
          id: "ip",
          title: "Intellectual property",
          body: (
            <p>
              The site’s design, code, text, the Pinnacle Studios name and logo, and the Dot
              character belong to us or our licensors. Case studies are shown with our clients’
              permission and their trademarks belong to them. You may share links to our pages, but
              please don’t copy or reuse our content or characters without written permission.
            </p>
          ),
        },
        {
          id: "content",
          title: "Information on the site",
          body: (
            <p>
              We work hard to keep information accurate, but it’s general and may change. Prices,
              timelines and capabilities described here are indicative — the proposal and contract
              for your project are what count.
            </p>
          ),
        },
        {
          id: "links",
          title: "Links to other sites",
          body: (
            <p>
              We link to third-party sites (for example social networks and booking tools). We’re
              not responsible for their content or practices.
            </p>
          ),
        },
        {
          id: "liability",
          title: "Liability",
          body: (
            <p>
              To the extent the law allows, we aren’t liable for indirect or consequential loss
              arising from use of this website. Nothing in these terms limits liability that cannot
              legally be limited. <Todo>lawyer to confirm wording</Todo>
            </p>
          ),
        },
        {
          id: "law",
          title: "Governing law",
          body: (
            <p>
              These terms are governed by the laws of India, and the courts of <Todo>city</Todo>{" "}
              have jurisdiction.
            </p>
          ),
        },
        {
          id: "contact",
          title: "Contact",
          body: (
            <p>
              Questions about these terms:{" "}
              {site.contact.email ? (
                <a href={`mailto:${site.contact.email}`} className="underline">
                  {site.contact.email}
                </a>
              ) : (
                <Todo>contact email</Todo>
              )}
              .
            </p>
          ),
        },
      ]}
    />
  );
}
