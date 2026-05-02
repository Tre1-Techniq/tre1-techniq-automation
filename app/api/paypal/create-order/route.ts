import { NextResponse } from "next/server";

export async function POST() {
  console.log('[PAYPAL API] create-order called')

  const response = await fetch(
    "https://api-m.sandbox.paypal.com/v2/checkout/orders",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(
          process.env.PAYPAL_CLIENT_ID + ":" + process.env.PAYPAL_CLIENT_SECRET
        ).toString("base64")}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: "19.00",
            },
          },
        ],
      }),
    }
  )

  const data = await response.json()

  console.log('[PAYPAL API] response:', data)

  if (!data.id) {
    console.error('[PAYPAL API] ERROR: No order ID returned')
    return new Response(JSON.stringify(data), { status: 500 })
  }

  return Response.json({ id: data.id })
}