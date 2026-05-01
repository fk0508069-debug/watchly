import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );

    // This clears the "token" cookie
     response.cookies.set("token", "", {
    httpOnly: true,
    secure: false, // must match login EXACTLY
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });

    return response;
  } catch (error) {
    return NextResponse.json({ message: "Logout failed" }, { status: 500 });
  }
}     