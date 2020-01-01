import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireMember } from "@/lib/member-auth";

export async function GET(request: NextRequest) {
  let member;
  try {
    member = await requireMember(request);
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    profile: {
      id: member.id,
      displayName: member.displayName,
      bio: member.bio,
      photoUrl: member.photoUrl,
      email: member.email,
      role: member.role,
      createdAt: member.createdAt,
    },
  });
}

export async function PATCH(request: NextRequest) {
  let member;
  try {
    member = await requireMember(request);
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data: Record<string, string | null> = {};

    if (typeof body.displayName === "string") {
      const name = body.displayName.trim();
      if (name.length < 2) {
        return NextResponse.json({ error: "Display name must be at least 2 characters" }, { status: 400 });
      }
      data.displayName = name;
    }

    if (body.bio !== undefined) {
      if (body.bio === null || body.bio === "") {
        data.bio = null;
      } else if (typeof body.bio === "string") {
        if (body.bio.length > 500) {
          return NextResponse.json({ error: "Bio must be 500 characters or less" }, { status: 400 });
        }
        data.bio = body.bio;
      }
    }

    if (body.photoUrl !== undefined) {
      if (body.photoUrl === null || body.photoUrl === "") {
        data.photoUrl = null;
      } else if (typeof body.photoUrl === "string") {
        data.photoUrl = body.photoUrl.trim();
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const updated = await prisma.member.update({
      where: { id: member.id },
      data,
      select: {
        id: true,
        displayName: true,
        bio: true,
        photoUrl: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ profile: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
