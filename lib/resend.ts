import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendWelcomeEmail(
  to: string,
  name: string,
  company: string,
  accessUrl: string
) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Tre1 TechnIQ <success@tre1-techniq.com>',
      to: [to],
      subject: 'Access Your Initial Automation Audit - Tre1 TechnIQ',
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Access Your Audit</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #00B5A5 0%, #008080 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #00B5A5; color: white !important; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 16px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
          .highlight { background: #e6f7f5; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #00B5A5; }
          .warning { background: #fff8e6; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #FF8A3D; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔐 Your Audit Access Link Is Ready</h1>
        </div>
        <div class="content">
          <p>Hi <strong>${name}</strong>,</p>

          <p>Thank you for requesting a workflow automation audit for <strong>${company}</strong>.</p>

          <div class="highlight">
            <p><strong>Your initial audit access is ready.</strong></p>
            <p>Use the secure link below to review the first stage of your audit request.</p>
          </div>

          <p style="text-align:center;">
            <a href="${accessUrl}" class="button">Access Your Initial Audit</a>
          </p>

          <div class="warning">
            <p><strong>Important:</strong></p>
            <p>Please use the same email/account associated with your submission when accessing your report. This helps us keep your audit record secure and your contact information accurate.</p>
          </div>

          <p><strong>What happens next:</strong></p>
          <ol>
            <li>You open your secure audit access link</li>
            <li>You sign in to verify your identity</li>
            <li>You review your initial audit snapshot</li>
            <li>We continue refining your workflow recommendations</li>
          </ol>

          <p>If the button above does not work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #00B5A5;">${accessUrl}</p>

          <div class="footer">
            <p>Best regards,<br><strong>The Tre1 TechnIQ Team</strong></p>
            <p style="font-size: 12px; color: #999;">
              Tre1 TechnIQ Automation<br>
              <a href="https://tre1-techniq.com" style="color: #00B5A5;">tre1-techniq.com</a>
            </p>
          </div>
        </div>
      </body>
      </html>
      `,
      text: `
Hi ${name},

Thank you for requesting a workflow automation audit for ${company}.

Your initial audit access is ready.

Use this secure link to review the first stage of your audit request:
${accessUrl}

Important:
Please use the same email/account associated with your submission when accessing your report. This helps us keep your audit record secure and your contact information accurate.

What happens next:
1. You open your secure audit access link
2. You sign in to verify your identity
3. You review your initial audit snapshot
4. We continue refining your workflow recommendations

Best regards,
The Tre1 TechnIQ Team

tre1-techniq.com
      `,
    })

    if (error) {
      console.error('❌ Resend error:', error)
      return { success: false, error }
    }

    console.log('✅ Welcome email sent to:', to)
    return { success: true, data }
  } catch (error) {
    console.error('❌ Email send error:', error)
    return { success: false, error }
  }
}

export async function sendAuditCompletedEmail(
  to: string,
  name: string,
  company: string,
  auditId: string
) {
  try {
    const auditUrl = `${
      process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    }/audit/access/${auditId}`

    const { data, error } = await resend.emails.send({
      from: 'Tre1 TechnIQ <success@tre1-techniq.com>',
      to: [to],
      subject: 'Your Automation Audit Is Ready - Tre1 TechnIQ',
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Audit Is Ready</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #00B5A5 0%, #008080 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #00B5A5; color: white !important; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 16px 0; }
          .highlight { background: #e6f7f5; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #00B5A5; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>✅ Your Automation Audit Is Ready</h1>
        </div>
        <div class="content">
          <p>Hi <strong>${name}</strong>,</p>

          <p>Your workflow automation audit for <strong>${company}</strong> has been marked complete.</p>

          <div class="highlight">
            <p><strong>Your next-step audit access is ready.</strong></p>
            <p>Use the secure link below to review your audit status and continue into the member platform.</p>
          </div>

          <p style="text-align:center;">
            <a href="${auditUrl}" class="button">Review Your Audit</a>
          </p>

          <p>If the button above does not work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #00B5A5;">${auditUrl}</p>

          <p><strong>What this means:</strong></p>
          <ul>
            <li>Your audit has advanced to the completed stage</li>
            <li>Your request is now ready for follow-up and next-step action</li>
            <li>You can continue into the secure member experience from the provided access point</li>
          </ul>

          <div class="footer">
            <p>Best regards,<br><strong>The Tre1 TechnIQ Team</strong></p>
            <p style="font-size: 12px; color: #999;">
              Tre1 TechnIQ Automation<br>
              <a href="https://tre1-techniq.com" style="color: #00B5A5;">tre1-techniq.com</a>
            </p>
          </div>
        </div>
      </body>
      </html>
      `,
      text: `
Hi ${name},

Your workflow automation audit for ${company} has been marked complete.

Review your audit here:
${auditUrl}

What this means:
- Your audit has advanced to the completed stage
- Your request is now ready for follow-up and next-step action
- You can continue into the secure member experience from the provided access point

Best regards,
The Tre1 TechnIQ Team

tre1-techniq.com
      `,
    })

    if (error) {
      console.error('❌ Audit completed email error:', error)
      return { success: false, error }
    }

    console.log('✅ Audit completed email sent to:', to)
    return { success: true, data }
  } catch (error) {
    console.error('❌ Audit completed email send error:', error)
    return { success: false, error }
  }
}

export async function sendNewsletterWelcomeEmail(to: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Tre1 TechnIQ <join@tre1-techniq.com>',
      to: [to],
      subject: 'Welcome to the Tre1 TechnIQ Newsletter!',
      html: `
      <!DOCTYPE html>
      <html>
      <head>
      <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #FF8A3D 0%, #E67E22 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
      .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
      .tip { background: #fff8e6; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #FF8A3D; }
      .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
      </style>
      </head>
      <body>
      <div class="header">
      <h1>🤖 Welcome to Automation Insights!</h1>
      </div>
      <div class="content">
      <p>Thank you for joining the Tre1 TechnIQ newsletter!</p>

      <p>You'll now receive:</p>
      <ul>
      <li>Weekly automation tips & tricks</li>
      <li>Case studies from real businesses</li>
      <li>New tool recommendations</li>
      <li>Exclusive content for subscribers</li>
      </ul>

      <div class="tip">
      <p><strong>This Week's Tip:</strong></p>
      <p>Start by automating one repetitive task this week. Even saving 30 minutes daily adds up to 10 hours per month!</p>
      </div>

      <p><strong>First steps to automation success:</strong></p>
      <ol>
      <li>Identify your most time-consuming repetitive task</li>
      <li>Document the current process step-by-step</li>
      <li>Research tools that could automate it (Zapier, Make, etc.)</li>
      <li>Test the automation on a small scale first</li>
      </ol>

      <p>Need help getting started?<br>
      <a href="https://tre1-techniq.com/audit" style="color: #00B5A5; font-weight: bold;">Request a free workflow audit</a></p>

      <div class="footer">
      <p>Best regards,<br>
      <strong>The Tre1 TechnIQ Team</strong></p>
      <p style="font-size: 12px; color: #999;">
      You're receiving this email because you subscribed to Tre1 TechnIQ updates.<br>
      <a href="https://tre1-techniq.com/unsubscribe?email=${encodeURIComponent(to)}" style="color: #999;">Unsubscribe</a> |
      <a href="https://tre1-techniq.com/privacy" style="color: #999; margin-left: 10px;">Privacy Policy</a>
      </p>
      </div>
      </div>
      </body>
      </html>
      `,
      text: `
Welcome to the Tre1 TechnIQ Newsletter!

Thank you for joining! You'll now receive:
- Weekly automation tips & tricks
- Case studies from real businesses
- New tool recommendations
- Exclusive content for subscribers

This Week's Tip:
Start by automating one repetitive task this week. Even saving 30 minutes daily adds up to 10 hours per month!

First steps to automation success:
1. Identify your most time-consuming repetitive task
2. Document the current process step-by-step
3. Research tools that could automate it (Zapier, Make, etc.)
4. Test the automation on a small scale first

Need help getting started?
Request a free workflow audit: https://tre1-techniq.com/audit

Best regards,
The Tre1 TechnIQ Team

You're receiving this email because you subscribed to Tre1 TechnIQ updates.
Unsubscribe: https://tre1-techniq.com/unsubscribe
Privacy Policy: https://tre1-techniq.com/privacy
      `,
    })

    if (error) {
      console.error('❌ Newsletter welcome email error:', error)
      return { success: false, error }
    }

    console.log('✅ Newsletter welcome email sent to:', to)
    return { success: true, data }
  } catch (error) {
    console.error('❌ Newsletter email error:', error)
    return { success: false, error }
  }
}

export async function sendTeamNewsletterNotification(subscriberEmail: string) {
  if (!resend) {
    console.warn('Resend not initialized. Skipping team notification.')
    return { success: false, error: 'Resend not configured' }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Tre1 TechnIQ Newsletter <join@tre1-techniq.com>',
      to: ['team@tre1-techniq.com'],
      subject: `📈 New Newsletter Subscriber: ${subscriberEmail}`,
      html: `
      <!DOCTYPE html>
      <html>
      <head>
      <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #00B5A5 0%, #008080 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; }
      .content { background: #f9f9f9; padding: 25px; border-radius: 0 0 10px 10px; }
      .stats { background: #e6f7f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
      .footer { margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
      </style>
      </head>
      <body>
      <div class="header">
      <h2>🎯 New Newsletter Subscriber</h2>
      </div>
      <div class="content">
      <p><strong>New subscriber joined:</strong></p>
      <div class="stats">
      <p><strong>Email:</strong> ${subscriberEmail}</p>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      <p><strong>Source:</strong> Website Footer Form</p>
      </div>

      <p><strong>Quick Actions:</strong></p>
      <ul>
      <li>Add to email sequence (if using automation platform)</li>
      <li>Check if they're also an audit request lead</li>
      <li>Review subscriber growth metrics</li>
      </ul>

      <p><strong>Subscriber Stats:</strong></p>
      <ul>
      <li>Total subscribers: [Check Supabase dashboard]</li>
      <li>Growth this month: [Track in analytics]</li>
      <li>Most common source: Website footer</li>
      </ul>

      <p><a href="https://app.supabase.com/project/oxkjtscvufysbztemoby/editor/newsletter_subscribers" style="color: #00B5A5; font-weight: bold;">
      View in Supabase Dashboard →
      </a></p>

      <div class="footer">
      <p>This notification was automatically generated by Tre1 TechnIQ.</p>
      </div>
      </div>
      </body>
      </html>
      `,
      text: `
NEW NEWSLETTER SUBSCRIBER
=========================

Email: ${subscriberEmail}
Time: ${new Date().toLocaleString()}
Source: Website Footer Form

Quick Actions:
- Add to email sequence (if using automation platform)
- Check if they're also an audit request lead
- Review subscriber growth metrics

View in Supabase Dashboard:
https://app.supabase.com/project/oxkjtscvufysbztemoby/editor/newsletter_subscribers

This notification was automatically generated by Tre1 TechnIQ.
      `,
    })

    if (error) {
      console.error('❌ Team newsletter notification error:', error)
      return { success: false, error }
    }

    console.log('✅ Team notification sent for new subscriber:', subscriberEmail)
    return { success: true, data }
  } catch (error) {
    console.error('❌ Team notification error:', error)
    return { success: false, error }
  }
}

export async function sendTeamAuditNotification(auditData: any) {
  if (!resend) {
    console.warn('Resend not initialized. Skipping team audit notification.')
    return { success: false, error: 'Resend not configured' }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Tre1 TechnIQ Audits <success@tre1-techniq.com>',
      to: ['team@tre1-techniq.com'],
      subject: `🎯 New Audit Request: ${auditData.company_name || 'No company name'}`,
      html: `
      <!DOCTYPE html>
      <html>
      <head>
      <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #FF8A3D 0%, #E67E22 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; }
      .content { background: #f9f9f9; padding: 25px; border-radius: 0 0 10px 10px; }
      .info { background: #fff8e6; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #FF8A3D; }
      .actions { margin-top: 20px; }
      .button { display: inline-block; background: #00B5A5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-right: 10px; }
      .footer { margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
      </style>
      </head>
      <body>
      <div class="header">
      <h2>🎯 New Workflow Audit Request</h2>
      </div>
      <div class="content">
      <p><strong>Company:</strong> ${auditData.company_name || 'Not provided'}</p>
      <p><strong>Contact:</strong> ${auditData.contact_name} (${auditData.contact_email})</p>
      <p><strong>Industry:</strong> ${auditData.industry || 'Not specified'}</p>
      <p><strong>Budget:</strong> ${auditData.budget || 'Not specified'}</p>

      <div class="info">
      <p><strong>Primary Pain Point:</strong></p>
      <p>${auditData.primary_pain || 'Not specified'}</p>
      </div>

      <p><strong>Time Wasters:</strong><br>
      ${Array.isArray(auditData.time_wasters) ? auditData.time_wasters.join(', ') : 'Not specified'}</p>

      <div class="actions">
        <a href="https://app.supabase.com/project/oxkjtscvufysbztemoby/editor/audit_requests" class="button">
          View in Supabase
        </a>
        <a href="mailto:${auditData.contact_email}" class="button" style="background: #FF8A3D;">
          Email Contact
        </a>
      </div>

      <p><strong>Next Steps:</strong></p>
      <ol>
        <li>Review submission details</li>
        <li>Prepare initial analysis (48-hour deadline)</li>
        <li>Schedule consultation call</li>
        <li>Send welcome email (automated)</li>
      </ol>

      <div class="footer">
        <p>This notification was automatically generated by Tre1 TechnIQ.</p>
      </div>
      </div>
      </body>
      </html>
      `,
      text: `
NEW AUDIT REQUEST
=================

Company: ${auditData.company_name || 'Not provided'}
Contact: ${auditData.contact_name} (${auditData.contact_email})
Industry: ${auditData.industry || 'Not specified'}
Budget: ${auditData.budget || 'Not specified'}

Primary Pain Point:
${auditData.primary_pain || 'Not specified'}

Time Wasters:
${Array.isArray(auditData.time_wasters) ? auditData.time_wasters.join(', ') : 'Not specified'}

Quick Actions:
1. View in Supabase: https://app.supabase.com/project/oxkjtscvufysbztemoby/editor/audit_requests
2. Email contact: ${auditData.contact_email}

Next Steps:
- Review submission details
- Prepare initial analysis (48-hour deadline)
- Schedule consultation call
- Send welcome email (automated)

This notification was automatically generated by Tre1 TechnIQ.
      `,
    })

    if (error) {
      console.error('❌ Team audit notification error:', error)
      return { success: false, error }
    }

    console.log('✅ Team audit notification sent')
    return { success: true, data }
  } catch (error) {
    console.error('❌ Team audit notification error:', error)
    return { success: false, error }
  }
}

export default resend