// file: app/api/international-join/route.ts
import { NextRequest, NextResponse } from "next/server";

interface InternationalJoinData {
  name: string;
  email: string;
  country: string;
  languages?: string;
  interest: string;
  message?: string;
  consent: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const data: InternationalJoinData = await request.json();

    // Validate required fields
    if (!data.name || !data.email || !data.country || !data.interest) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate consent
    if (!data.consent) {
      return NextResponse.json(
        { error: "Consent is required" },
        { status: 400 }
      );
    }

    // Log the submission (for development/debugging)
    console.log("International Wing Registration:", {
      name: data.name,
      email: data.email,
      country: data.country,
      languages: data.languages || "Not specified",
      interest: data.interest,
      message: data.message || "No message",
      timestamp: new Date().toISOString(),
    });

    // In the future, this could:
    // 1. Save to database
    // 2. Send email notification to admin
    // 3. Send confirmation email to user
    // 4. Add to newsletter/CRM system

    // For now, just return success
    return NextResponse.json({
      success: true,
      message: "Registration received successfully",
    });
  } catch (error) {
    console.error("International join error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
