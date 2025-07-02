'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { generateUUID, getPersistentSessionId } from '../../../lib/utils'
import Link from 'next/link'

type Option = {
  id: string
  text: string
  vote_count: number
}

export default function PollClient({ id }: { id: string }) {
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState<Option[]>([])
  // const [totalVotes, setTotalVotes] = useState(0)
  const totalVotes = options.reduce((sum, opt) => sum + (opt.vote_count || 0), 0)
  const [votedOption, setVotedOption] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isVoting, setIsVoting] = useState(false)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [isExpired, setIsExpired] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const [voteError, setVoteError] = useState('')

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        console.log('Fetching poll data for ID:', id)
        // Fetch poll data
        const { data: pollData, error: pollError } = await supabase
          .from('polls')
          .select('question, expires_at')
          .eq('id', id)
          .single()

        if (pollError) {
          console.error('Error fetching poll:', pollError)
          throw pollError
        }
        
        console.log('Poll data fetched:', pollData)
        if (pollData) {
          setQuestion(pollData.question)
          setExpiresAt(pollData.expires_at)
          
          // Check if poll is expired
          if (pollData.expires_at) {
            const now = new Date()
            const expirationDate = new Date(pollData.expires_at)
            setIsExpired(now > expirationDate)
          }
        }

        // Fetch options
        console.log('Fetching options with aggregated vote counts...')
        const { data: optionsData, error: optionsError } = await supabase
          .from('options')
          .select('id, text, votes(count)')
          .eq('poll_id', id)

        if (optionsError) {
          console.error('Error fetching options:', optionsError)
          throw optionsError
        }

        console.log('Options data fetched:', optionsData)
        if (optionsData && optionsData.length > 0) {
          const typedOpts = optionsData as Array<{ id: string; text: string; votes: Array<{ count: number }> }>

          const optionsWithVotes = typedOpts.map((opt) => ({
            id: opt.id,
            text: opt.text,
            vote_count: opt.votes?.[0]?.count ?? 0,
          }))

          console.log('Options with aggregated vote counts:', optionsWithVotes)
          setOptions(optionsWithVotes)
          // setTotalVotes(optionsWithVotes.reduce((sum: number, opt) => sum + opt.vote_count, 0))
        }
      } catch (error) {
        console.error('Error fetching poll:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPoll()
  }, [id])

  useEffect(() => {
    const channel = supabase
      .channel('votes-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'votes',
        },
        (payload) => {
          const newVote = payload.new
          const votedOptionId = newVote.option_id

          setOptions((prevOptions) =>
            prevOptions.map((opt) =>
              opt.id === votedOptionId
                ? { ...opt, vote_count: (opt.vote_count || 0) + 1 }
                : opt
            )
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleVote = async (optionId: string) => {
    if (votedOption || isExpired) return // Prevent voting if already voted or expired
    
    console.log('=== VOTE DEBUG START ===')
    console.log('Attempting to vote for option:', optionId)
    console.log('Current environment:', process.env.NODE_ENV)
    console.log('Supabase URL available:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('Supabase Key available:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    console.log('Network status:', navigator.onLine ? 'Online' : 'Offline')
    console.log('Current URL:', window.location.href)
    
    setIsVoting(true)
    setVotedOption(optionId)

    try {
      console.log('Generating session ID...')
      const sessionId = getPersistentSessionId()
      console.log('Generated session ID:', sessionId)
      
      console.log('Creating vote payload:', {
        option_id: optionId,
        poll_id: id,
        session_id: sessionId
      })
      
      console.log('Making Supabase request...')
      const startTime = Date.now()
      const { data, error } = await supabase
        .from('votes')
        .insert([{ 
          option_id: optionId,
          poll_id: id,
          session_id: sessionId
        }])
        .select()
      const endTime = Date.now()
      
      console.log(`Request completed in ${endTime - startTime}ms`)
      console.log('Supabase response received:', { 
        hasData: !!data, 
        dataLength: data?.length,
        hasError: !!error,
        errorMessage: error?.message,
        errorCode: error?.code,
        errorDetails: error?.details
      })

      if (error) {
        console.error('=== SUPABASE ERROR ===')
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        })
        throw error
      }
      
      console.log('Vote successfully inserted:', data)
      console.log('=== VOTE SUCCESS ===')
      
    } catch (error) {
      console.error('=== VOTE ERROR ===')
      console.error('Error type:', typeof error)
      console.error('Error constructor:', error?.constructor?.name)
      console.error('Full error object:', error)
      
      if (error && typeof error === 'object') {
        console.error('Error keys:', Object.keys(error))
        const errorObj = error as Record<string, any>
        if (errorObj.message) {
          console.error('Error message:', errorObj.message)
        }
        if (errorObj.stack) {
          console.error('Error stack:', errorObj.stack)
        }
      }
      
      setVotedOption(null)
      
      let errorMessage = 'Unknown error'
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (error && typeof error === 'object') {
        const errorObj = error as Record<string, any>
        if (errorObj.message) {
          errorMessage = String(errorObj.message)
        }
      } else if (error) {
        errorMessage = String(error)
      }
      
      console.error('Final error message:', errorMessage)
      setVoteError(errorMessage)
    } finally {
      setIsVoting(false)
      console.log('=== VOTE DEBUG END ===')
    }
  }

  const getPercentage = (votes: number) => {
    if (totalVotes === 0) return 0
    return Math.round((votes / totalVotes) * 100)
  }

  const formatTimeRemaining = () => {
    if (!expiresAt) return null
    
    const now = new Date()
    const expirationDate = new Date(expiresAt)
    const timeDiff = expirationDate.getTime() - now.getTime()
    
    if (timeDiff <= 0) return 'Expired'
    
    const hours = Math.floor(timeDiff / (1000 * 60 * 60))
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`
    } else {
      return `${minutes}m remaining`
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="max-w-2xl w-full mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-xl mb-4" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-6 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {question}
          </h1>
          <div className="flex items-center justify-center gap-4 text-gray-600 dark:text-gray-300">
            <span>{totalVotes} vote{totalVotes !== 1 ? 's' : ''} • Real-time results</span>
            {expiresAt && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                isExpired 
                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
              }`}>
                {formatTimeRemaining()}
              </span>
            )}
          </div>
        </div>

        {/* Expired Warning */}
        {isExpired && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">This poll has expired. Voting is no longer allowed.</span>
              </div>
            </div>
          </div>
        )}

        {/* Poll Options */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
            <div className="space-y-4">
              {options.map((option) => {
                const percentage = getPercentage(option.vote_count)
                const isVoted = votedOption === option.id
                const isLeading = option.vote_count > 0 && option.vote_count === Math.max(...options.map(o => o.vote_count))
                
                return (
                  <div
                    key={option.id}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                      isVoted
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    {/* Progress Bar */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl opacity-0 transition-opacity duration-300"
                         style={{ opacity: percentage > 0 ? 0.3 : 0 }}
                    />
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                          {option.text}
                        </h3>
                        <div className="flex items-center gap-2">
                          {isLeading && option.vote_count > 0 && (
                            <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded-full">
                              Leading
                            </span>
                          )}
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            {option.vote_count} vote{option.vote_count !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {percentage}%
                        </span>
                        
                        {!votedOption && !isExpired && (
                          <button
                            onClick={() => handleVote(option.id)}
                            disabled={isVoting}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isVoting ? 'Voting...' : 'Vote'}
                          </button>
                        )}
                        
                        {isVoted && option.id === votedOption && (
                          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-sm font-medium">Voted</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            
            {votedOption && (
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">Thanks for voting! Results update in real-time.</span>
                </div>
              </div>
            )}
          </div>

          {/* Share Section */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-300 mb-4">Share this poll with others:</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(window.location.href)
                  setCopySuccess(true)
                  setTimeout(() => setCopySuccess(false), 2000)
                }}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Link
                {copySuccess && <span className="ml-2 text-green-500">Copied!</span>}
              </button>
            </div>
          </div>
        </div>
      </div>
      {voteError && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-sm">{voteError}</div>
      )}
    </div>
  )
}

