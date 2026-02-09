export default function GlassCard({ children }) {
  return (
    <div
      className="rounded-3xl p-8 backdrop-blur-md
      bg-white/70 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)]
      border border-white/60"
    >
      {children}
    </div>
  )
}
