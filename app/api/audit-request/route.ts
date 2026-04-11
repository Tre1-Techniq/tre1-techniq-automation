// app/api/audit-request/route.ts - COMPLETE WITH DEBUGGING
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sendSlackNotification } from '@/lib/slack'
import { TablesInsert } from '@/lib/database.types'
import { sendWelcomeEmail, sendTeamAuditNotification } from '@/lib/resend'

export async function POST(request: NextRequest) {
  console.log('🔍 API Route called at:', new Date().toISOString())
  
  try {
    const data = await request.json()
    console.log('📥 Received request body:', JSON.stringify(data, null, 2))
    
    // Create properly typed insert data
    const insertData: TablesInsert<'audit_requests'> = {
      company_name: data.companyName || null,
      industry: data.industry || null,
      company_size: data.companySize || null,
      zip_code: data.zip_code || null,
      primary_pain: data.primaryPain || null,
      time_wasters: data.timeWasters || null,
      automation_goals: data.automationGoals || null,
      current_tools: data.currentTools || null,
      integration_needs: data.integrationNeeds || null,
      budget: data.budget || null,
      contact_name: data.contactName,
      contact_email: data.contactEmail,
      contact_phone: data.contactPhone || null,
      preferred_contact: data.preferredContact || null,
      submitted_at: data.submittedAt || new Date().toISOString(),
      source: data.source || 'multi-step-audit-form',
      status: 'pending'
    }

    console.log('📝 Insert data prepared:', JSON.stringify(insertData, null, 2))

    // Insert into Supabase and get the response
    const { data: insertedData, error: supabaseError } = await supabaseAdmin
      .from('audit_requests')
      .insert(insertData)
      .select('*')  // Explicitly select all columns
      .single()

    if (supabaseError) {
      console.error('❌ Supabase error:', supabaseError)
      throw new Error('Database insertion failed')
    }

    console.log('✅ Database insertion successful. Inserted data:', JSON.stringify(insertedData, null, 2))
    
    // Check what's actually in insertedData
    console.log('🔍 insertedData structure:', {
      hasData: !!insertedData,
      keys: insertedData ? Object.keys(insertedData) : 'null',
      contact_name: insertedData?.contact_name,
      company_name: insertedData?.company_name,
      contact_email: insertedData?.contact_email
    })

    // STEP 3: Use prepared data if insertedData is null
    const slackData = insertedData || insertData
    console.log('📤 Slack data to send:', JSON.stringify(slackData, null, 2))

    // Send Slack notification using the actual data
    await sendSlackNotification({
      text: `🎯 New Workflow Audit Request from ${slackData.contact_name}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🎯 New Workflow Audit Request'
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Name:*\n${slackData.contact_name}`
            },
            {
              type: 'mrkdwn',
              text: `*Company:*\n${slackData.company_name || 'Not provided'}`
            },
            {
              type: 'mrkdwn',
              text: `*Email:*\n${slackData.contact_email}`
            },
            {
              type: 'mrkdwn',
              text: `*Industry:*\n${slackData.industry || 'Not provided'}`
            }
          ]
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Primary Pain Point:*\n${slackData.primary_pain || 'Not specified'}`
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Budget:*\n${slackData.budget || 'Not specified'}`
            },
            {
              type: 'mrkdwn',
              text: `*Company Size:*\n${slackData.company_size || 'Not specified'}`
            },
            {
              type: 'mrkdwn',
              text: `*Zip Code:*\n${slackData.zip_code || 'Not specified'}`
            },
            {
              type: 'mrkdwn',
              text: `*Preferred Contact:*\n${slackData.preferred_contact || 'Email'}`
            }
          ]
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Time Wasters:*\n${
              Array.isArray(slackData.time_wasters) 
                ? slackData.time_wasters.join(', ') 
                : 'Not specified'
            }`
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Current Tools:*\n${
              Array.isArray(slackData.current_tools) 
                ? slackData.current_tools.join(', ') 
                : 'Not specified'
            }`
          }
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View in Dashboard'
              },
              url: `https://app.supabase.com/project/oxkjtscvufysbztemoby/editor/audit_requests`
            }
          ]
        }
      ]
    })

    // Send team notification
    await sendTeamAuditNotification(insertedData)

    console.log('✅ Slack notification sent')

    console.log('📧 Sending welcome email to:', insertedData.contact_email)

    try {
      const emailResult = await sendWelcomeEmail(
        insertedData.contact_email,
        insertedData.contact_name,
        insertedData.company_name || 'your company'
      )
      
      if (emailResult.success) {
        console.log('✅ Welcome email sent successfully')
      } else {
        console.warn('⚠️ Welcome email failed:', emailResult.error)
        // Don't fail the whole request if email fails
      }
    } catch (emailError) {
      console.warn('⚠️ Email sending error (non-critical):', emailError)
    }

    return NextResponse.json(
      { success: true, message: 'Audit request submitted successfully' },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('❌ API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit audit request' },
      { status: 500 }
    )
  }
  
}