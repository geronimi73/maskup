import { NextResponse } from "next/server";

import { vl } from "moondream";
import { sendTelegramMessage } from "/lib/telegram";

const MD_API_KEY = process.env.MD_API_KEY
const model = new vl({ apiKey: MD_API_KEY });

export const maxDuration = 60;

export async function POST(request) {
  try {
    const { imgDataURL } = await request.json()

    const blob = await fetch(imgDataURL).then(res => res.blob());
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const captionResponse = await model.caption({
      image: buffer,
      length: "short",
      stream: false,
    });

    await sendTelegramMessage("maskup caption: " + captionResponse.caption)

    return NextResponse.json({ caption: captionResponse.caption })
  } catch (error) {
    console.error("Error generating caption:", error)
    return NextResponse.json({ error: "Failed to generate caption" }, { status: 500 })
  }
}
