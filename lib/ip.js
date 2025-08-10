"use server";

import { headers } from "next/headers";

// this works on client and server side
export async function getUserIpAddress() {
  const headerss = await headers()

  const forwardedFor = headerss.get("x-forwarded-for")
  const realIp = headerss.get("x-real-ip")

  // Different hosting providers use different headers
  // Vercel uses x-forwarded-for, some others use x-real-ip
  const ip = forwardedFor ? forwardedFor.split(",")[0] : realIp ? realIp : null 

  return ip
}


