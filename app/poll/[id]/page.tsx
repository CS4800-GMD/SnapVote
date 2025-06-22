import PollClient from './PollClient'

export default function Page({ params }: { params: { id: string } }) {
  return <PollClient id={params.id} />
}
