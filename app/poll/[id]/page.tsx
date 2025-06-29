import PollClient from './PollClient'

export default function PollPage({ params }: { params: { id: string } }) {
  const { id } = params
  return <PollClient id={id} />
}