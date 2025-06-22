import PollClient from './PollClient'

export default async function Page({
  params,
}: {
  params: Record<string, string>
}) {
  return <PollClient id={params.id} />
}