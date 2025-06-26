import PollClient from './PollClient'

export default async function PollPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <PollClient id={id} />
}