import { NextResponse } from "next/server";
import packageJson from "../../../../package.json";

export async function GET() {
  const version =
    process.env.NEXT_PUBLIC_WEB_VERSION ||
    process.env.WEB_VERSION ||
    packageJson.version ||
    "unknown";

  return NextResponse.json({ version });
}
