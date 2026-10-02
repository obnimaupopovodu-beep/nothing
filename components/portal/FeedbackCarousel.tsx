'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, ChatCircleText } from '@phosphor-icons/react'
// Local preview examples. Live feedback stays in the release history and notifications.
export function FeedbackCarousel({ workspace }: { workspace: string }) {
  const [index, setIndex] = useState(0)
  const samples = [
    {
      id: 'preview-2',
      title: 'A little further',
      text: 'Add the missing composer credits before resubmitting.',
      label: 'Changes requested',
    },
    {
      id: 'preview-1',
      title: 'After the silence',
      text: 'We’re checking the credits and preferred release date.',
      label: 'In review',
    },
  ]
  const current = samples[index]
  return (
    <section className="portal-feedback" aria-label="Sample release feedback">
      <div className="portal-feedback-label">
        <ChatCircleText size={24} weight="thin" aria-hidden="true" />
        <span>
          Latest feedback<small>Sample updates</small>
        </span>
      </div>
      <div key={index} className="portal-feedback-copy" aria-live="polite">
        <p className="portal-eyebrow">{current.label}</p>
        <h2>{current.title}</h2>
        <p>{current.text}</p>
        <Link
          className="portal-text-button"
          href={`/preview?workspace=${workspace}&view=release&record=${current.id}`}
        >
          Open release ↗
        </Link>
      </div>
      <div className="portal-feedback-controls">
        <span>
          {index + 1} / {samples.length}
        </span>
        <button
          aria-label="Previous sample update"
          onClick={() => setIndex((index + 1) % samples.length)}
        >
          <ArrowLeft size={18} />
        </button>
        <button
          aria-label="Next sample update"
          onClick={() => setIndex((index + 1) % samples.length)}
        >
          <ArrowRight size={18} />
        </button>
      </div>
    </section>
  )
}
