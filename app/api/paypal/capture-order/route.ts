import { NextResponse } from "next/server";
import { createClient } from "@/lib/server/supabase";
import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  console.log('[PAYPAL API] capture-order called')

  const { orderID } = await req.json();

  const capture = await fetch(
    `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderID}/capture`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(
          process.env.PAYPAL_CLIENT_ID + ":" + process.env.PAYPAL_CLIENT_SECRET
        ).toString("base64")}`,
      },
      body: JSON.stringify({}),
    }
  );

  const paymentData = await capture.json();

  console.log("[PAYPAL API] capture response", paymentData);

  if (paymentData.status !== "COMPLETED") {
    return NextResponse.json(
      { error: "Payment not completed", paymentData },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const supabaseAdmin = createSupabaseAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  

  
  // 🔥 1. GET USER
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  console.log("[PAYPAL API] auth user", {
    userId: user?.id,
    email: user?.email,
    userError,
  });

  if (userError || !user) {
    return NextResponse.json(
      { error: "Unauthorized", userError },
      { status: 401 }
    );
  }

  // 🔥 2. FIND LATEST AUDIT
const normalizedEmail = user.email?.trim().toLowerCase()

if (!normalizedEmail) {
  return NextResponse.json(
    { error: "User email not found" },
    { status: 400 }
  )
}

const { data: audit, error: auditError } = await supabaseAdmin
  .from("audit_requests")
  .select("id, submitted_by_user_id, contact_email, submitted_email")
  .or(
    `submitted_by_user_id.eq.${user.id},contact_email.eq.${normalizedEmail},submitted_email.eq.${normalizedEmail}`
  )
  .order("created_at", { ascending: false })
  .limit(1)
  .maybeSingle()

console.log("[PAYPAL API] audit lookup", { audit, auditError })

if (auditError) {
  return NextResponse.json(
    { error: "Audit lookup failed", auditError },
    { status: 500 }
  )
}

if (!audit) {
  return NextResponse.json(
    { error: "Audit not found" },
    { status: 404 }
  )
}

// Backfill ownership if this audit was captured by email before auth linkage.
if (!audit.submitted_by_user_id) {
  const { error: linkAuditError } = await supabaseAdmin
    .from("audit_requests")
    .update({ submitted_by_user_id: user.id })
    .eq("id", audit.id)
    .is("submitted_by_user_id", null)

  if (linkAuditError) {
    console.error("[PAYPAL API] Failed to link audit to user", {
      auditId: audit.id,
      userId: user.id,
      linkAuditError,
    })
  }
}

  // 🔥 3. UNLOCK REPORT (WITH VERIFICATION)
  const { data: unlockData, error: unlockError } = await supabaseAdmin
    .from("audit_reports")
    .upsert(
      {
        audit_request_id: audit.id,
        unlocked: true,
      },
      { onConflict: "audit_request_id" }
    )
    .select("audit_request_id, unlocked")
    .single()

  console.log("[PAYPAL API] unlock update", {
    unlockData,
    unlockError,
  });

  if (unlockError || !unlockData) {
    return NextResponse.json(
      { error: "Unlock failed", unlockError },
      { status: 500 }
    );
  }

  // 🔥 SUCCESS
  return NextResponse.json({
    success: true,
    unlocked: unlockData.unlocked,
    audit_request_id: unlockData.audit_request_id,
  });
}