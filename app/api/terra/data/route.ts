import { NextRequest, NextResponse } from "next/server";
import { TERRA_BASE, terraHeaders } from "@/lib/terra/config";

/**
 * GET /api/terra/data?user_id=xxx&type=daily|sleep|body|activity&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
 *
 * Proxies a request to Terra's REST API to fetch health data for a given user.
 * Uses `to_webhook=false` to get data directly in the response (no webhook needed).
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("user_id");
    const type = searchParams.get("type") || "daily"; // daily | sleep | body | activity
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    if (!userId) {
      return NextResponse.json(
        { error: "user_id is required" },
        { status: 400 },
      );
    }

    // Default to last 7 days if no dates provided
    const now = new Date();
    const defaultEnd = now.toISOString().split("T")[0];
    const defaultStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const params = new URLSearchParams({
      user_id: userId,
      start_date: startDate || defaultStart,
      end_date: endDate || defaultEnd,
      to_webhook: "false",
    });

    const terraUrl = `${TERRA_BASE}/${type}?${params.toString()}`;

    const res = await fetch(terraUrl, {
      method: "GET",
      headers: terraHeaders(),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: `Failed to fetch ${type} data`, details: data },
        { status: res.status },
      );
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
