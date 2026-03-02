import { NextResponse } from "next/server";
import { TERRA_BASE, terraHeaders } from "@/lib/terra/config";

export async function POST() {
  try {
    const devId = process.env.TERRA_DEV_ID;
    const apiKey = process.env.TERRA_API_KEY;

    if (!devId || !apiKey) {
      return NextResponse.json(
        { error: "TERRA_DEV_ID or TERRA_API_KEY is not set" },
        { status: 500 },
      );
    }

    const response = await fetch(`${TERRA_BASE}/auth/generateWidgetSession`, {
      method: "POST",
      headers: terraHeaders(),
      body: JSON.stringify({
        language: "en",
        reference_id: "demo_connection",
        auth_success_redirect_url: process.env.NEXT_PUBLIC_BASE_URL
          ? `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?terra_status=success`
          : "http://localhost:3000/dashboard?terra_status=success",
        auth_failure_redirect_url: process.env.NEXT_PUBLIC_BASE_URL
          ? `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?terra_status=failure`
          : "http://localhost:3000/dashboard?terra_status=failure",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Terra API error:", data);
      return NextResponse.json(
        { error: "Failed to generate widget session", details: data },
        { status: response.status },
      );
    }

    return NextResponse.json({ url: data.url, session_id: data.session_id });
  } catch (error: any) {
    console.error("Internal API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
