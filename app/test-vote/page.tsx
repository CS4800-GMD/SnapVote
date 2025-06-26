'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function TestVote() {
  const [testOptionId, setTestOptionId] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    setResult('Testing database connection...')

    try {
      // Test basic connection
      const { data, error } = await supabase
        .from('polls')
        .select('count')
        .limit(1)

      if (error) {
        setResult(`Connection failed: ${error.message}`)
        return
      }

      setResult('Database connection successful!')
    } catch (error) {
      setResult(`Connection error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const testVote = async () => {
    if (!testOptionId) {
      setResult('Please enter an option ID')
      return
    }

    setLoading(true)
    setResult('Testing vote insertion...')

    try {
      console.log('Testing vote insertion for option ID:', testOptionId)
      
      // First, check if the option exists
      const { data: optionData, error: optionError } = await supabase
        .from('options')
        .select('id, text')
        .eq('id', testOptionId)
        .single()

      if (optionError) {
        console.error('Option not found:', optionError)
        setResult(`Error: Option not found - ${optionError.message}\nCode: ${optionError.code}\nDetails: ${optionError.details}`)
        return
      }

      console.log('Option found:', optionData)

      // Try to insert a vote
      const { data: voteData, error: voteError } = await supabase
        .from('votes')
        .insert([{ 
          option_id: testOptionId,
          session_id: crypto.randomUUID()
        }])
        .select()

      if (voteError) {
        console.error('Vote insertion failed:', voteError)
        setResult(`Error: Vote insertion failed\nMessage: ${voteError.message}\nCode: ${voteError.code}\nDetails: ${voteError.details}\nHint: ${voteError.hint}`)
        return
      }

      console.log('Vote inserted successfully:', voteData)
      setResult(`Success! Vote inserted with ID: ${voteData[0].id}`)

    } catch (error) {
      console.error('Test failed:', error)
      setResult(`Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const listOptions = async () => {
    setLoading(true)
    setResult('Fetching options...')

    try {
      const { data, error } = await supabase
        .from('options')
        .select('id, text, poll_id')

      if (error) {
        setResult(`Error fetching options: ${error.message}`)
        return
      }

      console.log('Available options:', data)
      setResult(`Found ${data.length} options:\n${data.map(opt => `${opt.id}: ${opt.text} (poll: ${opt.poll_id})`).join('\n')}`)

    } catch (error) {
      setResult(`Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const checkPolicies = async () => {
    setLoading(true)
    setResult('Checking database policies...')

    try {
      // Test read access to votes
      const { data: votesData, error: votesError } = await supabase
        .from('votes')
        .select('count')
        .limit(1)

      if (votesError) {
        setResult(`Votes read policy issue: ${votesError.message}`)
        return
      }

      // Test insert access to votes (without actually inserting)
      const { error: insertTestError } = await supabase
        .from('votes')
        .insert([{ option_id: '00000000-0000-0000-0000-000000000000' }])

      if (insertTestError && !insertTestError.message.includes('foreign key')) {
        setResult(`Votes insert policy issue: ${insertTestError.message}`)
        return
      }

      setResult('Database policies appear to be working correctly!')

    } catch (error) {
      setResult(`Policy check error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Vote Test Page</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Option ID to test:</label>
            <input
              type="text"
              value={testOptionId}
              onChange={(e) => setTestOptionId(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter option ID"
            />
          </div>
          
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={testConnection}
              disabled={loading}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Connection'}
            </button>
            
            <button
              onClick={checkPolicies}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Checking...' : 'Check Policies'}
            </button>
            
            <button
              onClick={listOptions}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'List Options'}
            </button>
            
            <button
              onClick={testVote}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Vote'}
            </button>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Result:</label>
            <pre className="bg-gray-100 p-4 rounded text-sm whitespace-pre-wrap">
              {result || 'No result yet'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
} 