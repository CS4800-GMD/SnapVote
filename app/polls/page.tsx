import React from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabaseClient'

interface Poll {
  id: string
  question: string
  created_at: string
  expires_at: string | null
}

export const dynamic = 'force-dynamic'

export default async function PollsPage() {
  // Fetch all polls with option counts
  const { data: polls, error } = await supabase
    .from('polls')
    .select('id, question, created_at, expires_at')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch polls: ${error.message}`)
  }

  if (!polls || polls.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-gray-600">No polls found.</p>
          <Link
            href="/"
            className="text-blue-600 hover:underline"
          >
            Create your first poll
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-10">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">All Polls</h1>
        <ul className="space-y-4">
          {polls.map((poll) => (
            <li key={poll.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{poll.question}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Created {new Date(poll.created_at).toLocaleString()}
                  {poll.expires_at && ` • Expires ${new Date(poll.expires_at).toLocaleString()}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/poll/${poll.id}`}
                  className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  View
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
} 