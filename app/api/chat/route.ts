import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { message } = await req.json();

  // Example: call an external API or AI model here
  const reply = `You said: "${message}" — but this time from an API!`;

  return NextResponse.json({ reply });
}