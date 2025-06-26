'use client'

import { useState, useEffect } from 'react'

export default function DebugEnv() {
  const [envInfo, setEnvInfo] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const gatherInfo = () => {
      const info = {
        // Environment variables (only public ones)
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
        
        // Runtime environment
        NODE_ENV: process.env.NODE_ENV,
        
        // Browser info
        userAgent: navigator.userAgent,
        location: window.location.href,
        protocol: window.location.protocol,
        hostname: window.location.hostname,
        port: window.location.port,
        
        // Build info
        buildTime: new Date().toISOString(),
        
        // Feature detection
        crypto: typeof crypto !== 'undefined' ? 'Available' : 'Not Available',
        cryptoRandomUUID: typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? 'Available' : 'Not Available',
        
        // Network info
        online: navigator.onLine,
        connection: (navigator as any).connection ? 'Available' : 'Not Available'
      }
      
      setEnvInfo(info)
      setLoading(false)
    }

    gatherInfo()
  }, [])

  const testSupabaseConnection = async () => {
    try {
      const { createClient } = await import('@supabase/supabase-js')
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseAnonKey) {
        alert('Missing Supabase environment variables!')
        return
      }
      
      const supabase = createClient(supabaseUrl, supabaseAnonKey)
      
      // Test connection
      const { data, error } = await supabase
        .from('polls')
        .select('count')
        .limit(1)
      
      if (error) {
        alert(`Connection failed: ${error.message}`)
      } else {
        alert('Supabase connection successful!')
      }
    } catch (error) {
      alert(`Error testing connection: ${error}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Environment Debug</h1>
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Environment Debug</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(envInfo).map(([key, value]) => (
                <div key={key} className="border p-3 rounded">
                  <div className="font-medium text-sm text-gray-600">{key}</div>
                  <div className={`font-mono text-sm ${
                    value === 'Set' || value === 'Available' ? 'text-green-600' : 
                    value === 'Missing' || value === 'Not Available' ? 'text-red-600' : 
                    'text-gray-800'
                  }`}>
                    {String(value)}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            <div className="space-y-4">
              <button
                onClick={testSupabaseConnection}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Test Supabase Connection
              </button>
              
              <div className="text-sm text-gray-600">
                <p><strong>Instructions:</strong></p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Check if environment variables are set correctly</li>
                  <li>Verify Supabase connection works</li>
                  <li>Compare local vs deployed environment info</li>
                  <li>Check if crypto.randomUUID() is available</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Common Deployment Issues</h2>
            <div className="text-sm text-gray-600 space-y-2">
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <strong>Environment Variables:</strong> Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your deployment platform (Vercel, Netlify, etc.)
              </div>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <strong>CORS Issues:</strong> Check if your Supabase project allows requests from your deployed domain
              </div>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <strong>Build Issues:</strong> Ensure your deployment platform supports the Node.js version and build process
              </div>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <strong>Crypto API:</strong> Some older browsers or environments might not support crypto.randomUUID()
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 