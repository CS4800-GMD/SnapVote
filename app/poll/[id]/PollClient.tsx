'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'

type Option = {
  id: string
  text: string
  vote_count: number
}

export default function PollClient({ id }: { id: string }) {
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState<Option[]>([])

  useEffect(() => {
    const fetchPoll = async () => {
      const { data: pollData, error: pollError } = await supabase
        .from('polls')
        .select('question')
        .eq('id', id)
        .single()

        console.log('pollData', pollData)
        console.log('pollError', pollError)

      if (pollData) setQuestion(pollData.question)

      const { data: optionsData } = await supabase
        .from('options')
        .select('id, text')
        .eq('poll_id', id)

      if (optionsData) {
        setOptions(
          optionsData.map((opt) => ({
            ...opt,
            vote_count: 0,
          }))
        )
      }
    }

    fetchPoll()
  }, [id])

  useEffect(() => {
    const channel = supabase
      .channel('votes-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'votes' },
        (payload) => {
          const votedOptionId = payload.new.option_id

          setOptions((prevOptions) =>
            prevOptions.map((opt) =>
              opt.id === votedOptionId
                ? { ...opt, vote_count: opt.vote_count + 1 }
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

  return (
    <div style={{ padding: 20 }}>
      <h1>{question || 'Loading poll...'}</h1>
      <ul>
        {options.map((opt) => (
          <li key={opt.id}>
            {opt.text} — <strong>{opt.vote_count}</strong> votes
          </li>
        ))}
      </ul>
    </div>
  )
}

