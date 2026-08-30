import Link from 'next/link'
import { Suspense } from 'react'
import { LoginForm } from './LoginForm'

export default function AdminLoginPage() {
  return (
    <main className="band admin-login-page">
      <div className="shell admin-login-shell">
        <section>
          <Link href="/" className="admin-back">Back to site</Link>
          <p className="kicker"><i aria-hidden="true" />Protected area</p>
          <h1 className="admin-title">Admin login</h1>
          <p className="admin-lede">
            Sign in to review demo submissions and artist contact details.
          </p>
        </section>

        <Suspense fallback={<div className="admin-login-form glass" />}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  )
}
