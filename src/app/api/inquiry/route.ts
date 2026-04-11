import { NextRequest, NextResponse } from "next/server"

// ────────────────────────────────────────────────────────────
// POST /api/inquiry
// Saves a demo inquiry to Airtable.
// Required env vars:
//   AIRTABLE_API_KEY      — personal access token (starts with "pat…")
//   AIRTABLE_BASE_ID      — base ID (starts with "app…")
//   AIRTABLE_TABLE_NAME   — table name, default "Demo Inquiries"
// ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, businessSize, message } = body

    // Basic validation
    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: "Name, email, and contact number are required." },
        { status: 400 }
      )
    }

    const apiKey   = process.env.AIRTABLE_API_KEY
    const baseId   = process.env.AIRTABLE_BASE_ID
    const table    = process.env.AIRTABLE_TABLE_NAME ?? "Demo Inquiries"

    if (!apiKey || !baseId) {
      console.error("Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID env vars.")
      return NextResponse.json(
        { error: "Server configuration error. Please contact support." },
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
            "Name":             name,
            "Email":            email,
            "Contact Number":   phone,
            "Business Size":    businessSize ?? "",
            "Message":          message ?? "",
            "Submitted At":     new Date().toISOString(),
          },
        }),
      }
    )

    if (!airtableRes.ok) {
      const errText = await airtableRes.text()
      console.error("Airtable error:", errText)
      return NextResponse.json(
        { error: "Failed to save inquiry. Please try again." },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error("Inquiry API error:", err)
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    )
  }
}
