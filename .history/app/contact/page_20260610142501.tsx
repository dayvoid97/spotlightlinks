export default function ContactPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="max-w-xl w-full text-center space-y-6">
        <h1 className="text-4xl font-semibold tracking-tight">Contact Spotlight Links</h1>

        <p className="text-white/60 text-sm leading-relaxed">
          For partnerships, advertising infrastructure, media deals, or technical builds, reach out
          and we’ll respond within 24–48 hours.
        </p>

        <div className="flex flex-col gap-3 pt-4">
          <a
            href="mailto:sharma.kanchan3154@gmail.com"
            className="w-full rounded-full border border-white/20 py-3 text-sm hover:bg-white hover:text-black transition"
          >
            Email Us
          </a>

          <a
            href="tel:+12019545235"
            className="w-full rounded-full border border-white/20 py-3 text-sm hover:bg-white hover:text-black transition"
          >
            Call Us
          </a>
        </div>

        <p className="text-xl text-white/40 pt-6">
          We typically respond same day for active deals.
        </p>
      </div>
    </div>
  )
}
