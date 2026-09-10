import 'server-only'
import { Resend } from 'resend'

/**
 * Sends a single, minimal email notification whenever a new demo
 * submission arrives. Intentionally does NOT include the submission's
 * content (artist, links, message) in the email body — the admin inbox
 * at /admin remains the single source of truth. This keeps the email
 * itself simple and avoids leaking user-submitted content/links into a
 * transactional email.
 *
 * Failure to send this notification must never block or fail the demo
 * submission request. Callers should wrap this in a try/catch and log
 * on error, but still return a success response to the submitter.
 */
export async function sendDemoNotification() {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM
  const to = process.env.DEMO_NOTIFICATION_EMAIL
  const adminUrl = process.env.ADMIN_URL ?? 'https://nothingrecords.site/admin'

  if (!apiKey || !from || !to) {
    throw new Error(
      'Demo notification email is not configured: missing RESEND_API_KEY, EMAIL_FROM, or DEMO_NOTIFICATION_EMAIL'
    )
  }

  const resend = new Resend(apiKey)

  const { data, error } = await resend.emails.send({
    from,
    to: [to],
    subject: 'New demo submission',
    text: [
      'A new demo has been submitted on Nothing Records.',
      '',
      `Open admin inbox: ${adminUrl}`,
    ].join('\n'),
    html: [
      '<p>A new demo has been submitted on Nothing Records.</p>',
      `<p><a href="${adminUrl}">Open admin inbox</a></p>`,
    ].join(''),
  })

  if (error) {
    throw new Error(`Resend failed to send demo notification: ${error.message}`)
  }

  return data
}
