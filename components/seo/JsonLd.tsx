/** Renders one or more schema.org objects as JSON-LD. Nulls are skipped. */
export function JsonLd({
  data,
}: {
  data: Record<string, unknown> | (Record<string, unknown> | null)[] | null;
}) {
  const items = (Array.isArray(data) ? data : [data]).filter(Boolean);
  if (!items.length) return null;
  // Escape "<" so content can never close the script tag.
  const json = JSON.stringify(items.length === 1 ? items[0] : items).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
