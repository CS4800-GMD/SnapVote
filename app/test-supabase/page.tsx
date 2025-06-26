'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function TestSupabase() {
  const [results, setResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testConnection = async () => {
    setLoading(true)
    setResults([])
    
    try {
      addResult('Starting Supabase connection test...')
      
      // Test 1: Check environment variables
      addResult(`NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing'}`)
      addResult(`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing'}`)
      
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        addResult('❌ Environment variables are missing!')
        return
      }
      
      // Test 2: Test basic connection
      addResult('Testing basic connection...')
      const { data: pollsData, error: pollsError } = await supabase
        .from('polls')
        .select('count')
        .limit(1)
      
      if (pollsError) {
        addResult(`❌ Polls query failed: ${pollsError.message}`)
        return
      }
      
      addResult('✅ Basic connection successful')
      
      // Test 3: Test options query
      addResult('Testing options query...')
      const { data: optionsData, error: optionsError } = await supabase
        .from('options')
        .select('id, text')
        .limit(5)
      
      if (optionsError) {
        addResult(`❌ Options query failed: ${optionsError.message}`)
        return
      }
      
      addResult(`✅ Options query successful (found ${optionsData?.length || 0} options)`)
      
      // Test 4: Test vote insertion (with cleanup)
      if (optionsData && optionsData.length > 0) {
        addResult('Testing vote insertion...')
        const testOptionId = optionsData[0].id
        const testSessionId = crypto.randomUUID ? crypto.randomUUID() : 'test-session-id'
        
        const { data: voteData, error: voteError } = await supabase
          .from('votes')
          .insert([{
            option_id: testOptionId,
            session_id: testSessionId
          }])
          .select()
        
        if (voteError) {
          addResult(`❌ Vote insertion failed: ${voteError.message}`)
          addResult(`Error code: ${voteError.code}`)
          addResult(`Error details: ${voteError.details}`)
        } else {
          addResult('✅ Vote insertion successful')
          
          // Clean up test vote
          if (voteData && voteData[0]) {
            const { error: deleteError } = await supabase
              .from('votes')
              .delete()
              .eq('id', voteData[0].id)
            
            if (deleteError) {
              addResult(`⚠️ Test vote cleanup failed: ${deleteError.message}`)
            } else {
              addResult('✅ Test vote cleaned up')
            }
          }
        }
      }
      
      addResult('🎉 All tests completed!')
      
    } catch (error) {
      addResult(`❌ Unexpected error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Supabase Connection Test</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
          <div>
            <button
              onClick={testConnection}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Testing...' : 'Run Connection Test'}
            </button>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <div className="bg-gray-100 p-4 rounded-lg max-h-96 overflow-y-auto">
              {results.length === 0 ? (
                <p className="text-gray-500">No test results yet. Click the button above to run tests.</p>
              ) : (
                <div className="space-y-1">
                  {results.map((result, index) => (
                    <div key={index} className="text-sm font-mono">
                      {result}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            <h3 className="font-semibold mb-2">What this test checks:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Environment variables are set correctly</li>
              <li>Basic Supabase connection works</li>
              <li>Database queries are successful</li>
              <li>Vote insertion works (with cleanup)</li>
              <li>RLS policies are configured properly</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 