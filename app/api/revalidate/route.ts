import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

/**
 * Sanity webhook → refresh cached content the moment the team publishes.
 * Sanity: Project → API → Webhooks → POST to https://<site>/api/revalidate,
 * with a secret matching SANITY_REVALIDATE_SECRET. TODO(keys).
 */
export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret)
    return NextResponse.json({ message: "Revalidation not configured" }, { status: 501 });
  try {
    const { isValidSignature, body } = await parseBody<{ _type?: string }>(req, secret);
    if (!isValidSignature)
      return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
    revalidateTag("sanity", "max");
    return NextResponse.json({ revalidated: true, type: body?._type ?? null });
  } catch (err) {
    console.error("[revalidate]", err);
    return NextResponse.json({ message: "Bad request" }, { status: 400 });
  }
}
