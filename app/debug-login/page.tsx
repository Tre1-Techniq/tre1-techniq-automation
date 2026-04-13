// app/debug-login/page.tsx - MINIMAL TEST
'use client'
import { useState } from 'react'

export default function DebugLogin() {
  const [email, setEmail] = useState('')
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('✅ Form submitted, email:', email)
    alert('Form submitted without refresh! Email: ' + email)
    // Try redirect
    window.location.href = '/members'
  }
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Form Test</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="test@example.com"
          className="border p-2 mr-2"
        />
        <button type="submit" className="bg-blue-500 text-white p-2">
          Test Submit
        </button>
      </form>
      <p className="mt-4">If this form refreshes, JavaScript is broken.</p>
    </div>
  )
}