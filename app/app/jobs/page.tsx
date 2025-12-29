import { redirect } from 'next/navigation'

export default function JobsPage() {
  // Redirect to projects page (Jobs is an alias)
  redirect('/app/projects')
}
