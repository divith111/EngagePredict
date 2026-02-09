export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111827]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  )
}
