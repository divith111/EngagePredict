export default function LuxuryContainer({ children }) {
  return (
    <div className="min-h-screen flex justify-center px-6 py-20">
      <div className="w-full max-w-4xl">
        {children}
      </div>
    </div>
  )
}
