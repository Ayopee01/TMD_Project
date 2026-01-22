import { NextResponse, type NextRequest } from "next/server";
import { deprocProfile } from "@/lib/czpClient"; 

export const runtime = "nodejs";

/**
 * POST /api/auth/login
 * Authenticate user with appId and mToken
 */
export async function POST(req: NextRequest) {
  // Check method
  if (req.method !== "POST") {
    return NextResponse.json(
      { status: "error", message: "Method not allowed" },
      { status: 405 }
    );
  }

  const { appId, mToken } = (await req.json()) as { appId?: string; mToken?: string };

  // Validate parameters
  if (!appId || !mToken) {
    return NextResponse.json(
      { status: "error", message: "Missing appId or mToken" },
      { status: 400 }
    );
  }

  try {
    // Fetch user profile from deproc
    const profile = await deprocProfile(appId, mToken);

    // Return success response
    return NextResponse.json(
      { status: "success", data: profile },
      { status: 200 }
    );
  } catch (error: any) {
    // Return error response
    return NextResponse.json(
      { status: "error", message: error?.message || "Authentication failed" },
      { status: 401 }
    );
  }
}
