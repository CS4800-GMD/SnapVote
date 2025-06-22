import PollClient from './PollClient'
import { use } from 'react'

export default function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params)
  return <PollClient id={id} />
}