import { NextRequest, NextResponse } from "next/server";
import { createUser, getUserByEmail } from "@/lib/users";
import { signToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { username, email, password } = body;
  if (!username || !email || !password) {
    return NextResponse.json({ error: "username, email and password required" }, { status: 400 });
  }

  const existing = await getUserByEmail(email);
  if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

  const user = await createUser({ username, email, password });
  const token = signToken({ sub: user.id, username: user.username, email: user.email });

  return NextResponse.json({ token, user }, { status: 201 });
}
