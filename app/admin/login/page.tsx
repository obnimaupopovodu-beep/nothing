import { redirect } from 'next/navigation'
import { safeNext } from '@/lib/portal/validation'
export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = await searchParams
  redirect(`/login?workspace=admin&next=${encodeURIComponent(safeNext(next, '/admin'))}`)
}
