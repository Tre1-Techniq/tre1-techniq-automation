// app/api/newsletter/route.ts - COMPLETE FILE
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sendNewsletterWelcomeEmail, sendTeamNewsletterNotification } from '@/lib/resend'

export async function POST(request: NextRequest) {
  console.log('📬 Newsletter API called')
  
  try {
    const { email } = await request.json()
    
    console.log('📧 Processing newsletter signup for:', email)
    
    if (!email || !email.includes('@')) {
      console.warn('❌ Invalid email:', email)
      return NextResponse.json(
        { success: false, error: 'Valid email address required' },
        { status: 400 }
      )
    }

    // 1. Save to Supabase
    const { error: supabaseError } = await supabaseAdmin
      .from('newsletter_subscribers')
      .insert({
        email: email,
        subscribed_at: new Date().toISOString(),
        source: 'website-footer',
        status: 'active'
      })

    if (supabaseError) {
      // Duplicate email - still return success
      if (supabaseError.code === '23505') {
        console.log('ℹ️ Duplicate email, already subscribed:', email)
        return NextResponse.json(
          { success: true, message: 'You are already subscribed!' },
          { status: 200 }
        )
      }
      
      console.error('❌ Supabase error:', supabaseError)
      throw new Error('Database insertion failed')
    }

    console.log('✅ Subscriber saved to database:', email)

    // 2. Send welcome email to subscriber
    const emailResult = await sendNewsletterWelcomeEmail(email)
    
    if (emailResult.success) {
      console.log('✅ Welcome email sent to subscriber:', email)
    } else {
      console.warn('⚠️ Welcome email failed (non-critical):', emailResult.error)
    }

    // 3. Send notification to team
    const teamResult = await sendTeamNewsletterNotification(email)
    
    if (teamResult.success) {
      console.log('✅ Team notification sent for new subscriber')
    } else {
      console.warn('⚠️ Team notification failed (non-critical):', teamResult.error)
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Subscribed successfully! Check your email for automation insights.' 
      },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('❌ Newsletter API error:', error)
    return NextResponse.json(
      { success: false, error: 'Subscription failed. Please try again.' },
      { status: 500 }
    )
  }
}

// Optional: GET endpoint to check subscription status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')
  
  if (!email) {
    return NextResponse.json(
      { success: false, error: 'Email parameter required' },
      { status: 400 }
    )
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('email, subscribed_at, status')
      .eq('email', email)
      .single()

    if (error) {
      return NextResponse.json(
        { success: true, subscribed: false },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { 
        success: true, 
        subscribed: true,
        data 
      },
      { status: 200 }
    )
    
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Check failed' },
      { status: 500 }
    )
  }
}