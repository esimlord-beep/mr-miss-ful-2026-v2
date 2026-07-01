import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    console.log("Content-Type:", request.headers.get("content-type"));

    const raw = await request.text();
    console.log("Raw body:", raw);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
