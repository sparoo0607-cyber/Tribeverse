// Shown while the event is postponed. Remove the usages (landing page and
// dashboard layout) once a new date is confirmed.
export default function PostponedBanner({ className = '' }: { className?: string }) {
  return (
    <div
      role="status"
      className={`rounded-2xl border border-[#FFE600]/40 bg-[#FFE600]/10 px-4 py-3 text-center ${className}`}
    >
      <p className="font-black text-[#FFE600] text-sm tracking-widest font-display">⚠️ EVENT POSTPONED</p>
      <p className="text-white/80 text-sm mt-1">
        TRIBEVERSE V1 has been postponed. The new date will be announced soon, so stay tuned and keep your registration.
      </p>
    </div>
  )
}
