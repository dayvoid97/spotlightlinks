import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-surface text-center">
      <p className="text-brand text-5xl font-bold">404</p>
      <p className="text-ink-50">That page doesn't exist.</p>
      <Link to="/" className="text-sm text-brand hover:underline">
        Back to home
      </Link>
    </div>
  )
}
