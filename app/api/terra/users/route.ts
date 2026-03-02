import { NextResponse } from "next/server";
import { TERRA_BASE, terraHeaders } from "@/lib/terra/config";

/**
 * GET /api/terra/users
 * Returns all connected Terra users (each representing a different device/provider).
 * Calls Terra's GET /v2/subscriptions endpoint.
 */
export async function GET() {
  try {
    const res = await fetch(`${TERRA_BASE}/subscriptions`, {
      method: "GET",
      headers: terraHeaders(),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch users", details: data },
        { status: res.status },
      );
    }

    // Terra returns { users: [...] }
    const users = data.users || [];

    return NextResponse.json({ users });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}
