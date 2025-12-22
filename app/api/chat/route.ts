import { NextResponse } from "next/server";

const API_URL = "http://127.0.0.1:8000/ask";

export async function POST(req: Request) {
  const { query, userId } = await req.json();

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, user_id: userId }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch from external API");
    }

    // Stream the response back to the client
    return new NextResponse(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}