import { getTechHoursSummary } from '@/lib/data/reports'
import { TechHoursClient } from './client'

export default async function TechHoursPage() {
  const data = await getTechHoursSummary()

  return <TechHoursClient initialData={data} />
}
