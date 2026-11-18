import { DotLab } from "@/components/dot/DotLab";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Dot Lab",
  description: "Internal demo of the Dot mascot's states, triggers and easter eggs.",
  path: "/dot-lab",
  noIndex: true,
});

/** Phase 2 demo page. Not linked anywhere, excluded from the sitemap, blocked in robots.txt. */
export default function DotLabPage() {
  return <DotLab />;
}
