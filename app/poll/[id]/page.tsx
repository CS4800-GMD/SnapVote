import PollClient from './PollClient'

export default async function Page({ params }: { params: { id: string } }) {
  return <PollClient id={params.id} />
}
