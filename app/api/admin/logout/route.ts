import { POST as auth } from '@/app/api/auth/[action]/route'
export function POST(request: Request) { return auth(request,{ params:Promise.resolve({ action:'logout' }) }) }
