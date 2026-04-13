// app/debug-env/page.tsx
export default function DebugEnv() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Debug</h1>
      <div className="space-y-4">
        <div>
          <strong>NEXT_PUBLIC_SUPABASE_URL:</strong>
          <div className="bg-gray-100 p-2 rounded font-mono text-sm">
            {process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET'}
          </div>
        </div>
        <div>
          <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong>
          <div className="bg-gray-100 p-2 rounded font-mono text-sm">
            {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET (hidden for security)' : 'NOT SET'}
          </div>
        </div>
        <div>
          <strong>Key Length:</strong>
          <div className="bg-gray-100 p-2 rounded font-mono text-sm">
            {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0} characters
          </div>
        </div>
      </div>
    </div>
  )
}