import { NextRequest, NextResponse } from "next/server"

// ────────────────────────────────────────────────────────────
// POST /api/subscribe
// Saves an email subscription to Airtable.
// Required env vars (same as inquiry):
//   AIRTABLE_API_KEY
//   AIRTABLE_BASE_ID
// ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = body

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      )
    }

    const apiKey = process.env.AIRTABLE_API_KEY
    const baseId = process.env.AIRTABLE_BASE_ID
    const table  = "Subscribers"

    if (!apiKey || !baseId) {
      console.error("Missing AIRTABLE environment variables.")
      return NextResponse.json(
        { error: "Server configuration error." },
        { status: 500 }
      )
    }

    const airtableRes = await fetch(
      `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: {
            "Email": email,
          },
        }),
      }
    )

    if (!airtableRes.ok) {
      const errText = await airtableRes.text()
      console.error("Airtable subscription error:", errText)
      return NextResponse.json(
        { error: "Failed to save subscription. Please try again." },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error("Subscription API error:", err)
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    )
  }
}
