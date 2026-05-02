'use client'

import { useState } from 'react'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import {
  PayPalScriptProvider,
  PayPalButtons,
} from '@paypal/react-paypal-js'

export default function UpgradePrompt({
  title,
  body,
  cta = 'Unlock Full Report',
}: {
  title: string
  body: string
  cta?: string
}) {
  const [showPayment, setShowPayment] = useState(false)

  return (
    <section className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center">
      
      <p className="text-sm font-semibold text-tre1-teal">
        🔒 {title}
      </p>

      <p className="mx-auto mt-2 max-w-xl text-sm text-gray-600">
        {body}
      </p>

      {!showPayment ? (
        <button
          onClick={() => setShowPayment(true)}
          className="mt-5 inline-flex items-center rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-600"
        >
          {cta}
          <ArrowRightIcon className="ml-2 h-4 w-4" />
        </button>
      ) : (
        <div className="mt-6">

          <p className="mb-3 text-xs text-gray-500">
            Secure checkout powered by PayPal
          </p>

          {/* 🔥 CRITICAL FIX: Provider wraps buttons */}
          <div className="mx-auto mt-4 w-full max-w-sm">
          <PayPalScriptProvider
            options={{
              clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
              currency: 'USD',
              intent: 'capture',
              components: 'buttons',
              disableFunding: 'paylater,card',
            }}
          >
            <PayPalButtons
              style={{
                layout: 'vertical',
                shape: 'pill',
                label: 'paypal',
              }}
              createOrder={async () => {
                const res = await fetch('/api/paypal/create-order', {
                  method: 'POST',
                })

                const data = await res.json()

                if (!data.id) {
                  console.error('[PAYPAL] Missing order ID', data)
                  throw new Error('PayPal order ID missing')
                }

                return data.id
              }}
              onApprove={async (data) => {
                console.log('[PAYPAL FRONTEND] onApprove fired', data)

                const res = await fetch('/api/paypal/capture-order', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ orderID: data.orderID }),
                })

                const result = await res.json()
                console.log('[PAYPAL FRONTEND] capture result', result)

                if (!res.ok || !result.unlocked) {
                  alert('Payment was not confirmed. Check logs.')
                  return
                }

                window.location.reload()
              }}
            />
          </PayPalScriptProvider>
        </div>

          <button
            onClick={() => setShowPayment(false)}
            className="mt-4 text-xs text-gray-400 underline"
          >
            ← Back
          </button>
        </div>
      )}
    </section>
  )
}