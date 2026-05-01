import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    await connectDB();

    // 1. Find the user
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    // 2. Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    // 3. Create JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    // 4. Set token in cookie
    const response = NextResponse.json({ message: "Login successful", userId: user._id }, { status: 200 });
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });
    return response;

  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}