// lib/resend.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendWelcomeEmail(to: string, name: string, company: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Tre1 TechnIQ <success@tre1-techniq.com>',
      to: [to],
      subject: `Your Free Automation Audit Request - Tre1 TechnIQ`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Tre1 TechnIQ</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #00B5A5 0%, #008080 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #00B5A5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 10px 0; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
            .highlight { background: #e6f7f5; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #00B5A5; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎯 Your Automation Audit is Confirmed</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${name}</strong>,</p>
            
            <p>Thank you for requesting a workflow automation audit for <strong>${company}</strong>.</p>
            
            <div class="highlight">
              <p><strong>What happens next:</strong></p>
              <ol>
                <li>Our automation experts review your submission (within 24 hours)</li>
                <li>We analyze your workflow pain points and opportunities</li>
                <li>Prepare a custom automation strategy with ROI estimates</li>
                <li>Schedule a 30-minute consultation call</li>
                <li>Deliver actionable recommendations within 48 hours</li>
              </ol>
            </div>
            
            <p><strong>Next Steps:</strong></p>
            <ul>
              <li>Keep an eye on your inbox for our analysis</li>
              <li>Add <strong>team@tre1-techniq.com</strong> to your contacts to ensure delivery</li>
              <li>Prepare any questions about your current workflow challenges</li>
            </ul>
            
            <p>In the meantime, you can:</p>
            <p>
              <a href="https://tre1-techniq.com/about-lite" class="button">Learn About Our Services</a>
            </p>
            
            <p><strong>Need immediate assistance?</strong><br>
            Reply to this email or call us at (555) 123-4567</p>
            
            <div class="footer">
              <p>Best regards,<br>
              <strong>The Tre1 TechnIQ Team</strong></p>
              <p style="font-size: 12px; color: #999;">
                Tre1 TechnIQ Automation<br>
                123 Automation Way, Suite 100<br>
                Irvine, CA 92618<br>
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

What happens next:
1. Our automation experts review your submission (within 24 hours)
2. We analyze your workflow pain points and opportunities
3. Prepare a custom automation strategy with ROI estimates
4. Schedule a 30-minute consultation call
5. Deliver actionable recommendations within 48 hours

Next Steps:
- Keep an eye on your inbox for our analysis
- Add team@tre1-techniq.com to your contacts
- Prepare any questions about your current workflow challenges

In the meantime, you can learn about our services at: https://tre1-techniq.com/about-lite

Need immediate assistance?
Reply to this email or call us at (555) 123-4567

Best regards,
The Tre1 TechnIQ Team

Tre1 TechnIQ Automation
123 Automation Way, Suite 100
Irvine, CA 92618
https://tre1-techniq.com
      `
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

export async function sendAuditCompletedEmail(to: string, name: string, company: string, auditId: string) {
  // We'll implement this later when we have PDF reports
  console.log('📧 Audit completed email would be sent to:', to)
  return { success: true, message: 'Placeholder for audit completed email' }
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
      `
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

// In lib/resend.ts - ADD THIS FUNCTION
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
      `
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

// In lib/resend.ts - ADD THIS FUNCTION
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
      `
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