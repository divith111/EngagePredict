export default function GoldButton({ children }) {
  return (
    <button
  onClick={onStart}
  className="
    mt-14 px-14 py-5 rounded-full
    bg-gradient-to-r from-[#d4af37] to-[#b8962e]
    text-black font-semibold text-lg
    shadow-[0_25px_80px_rgba(212,175,55,0.45)]
    hover:shadow-[0_30px_100px_rgba(212,175,55,0.6)]
    hover:scale-[1.04]
    transition-all duration-300
  "
>
  Start Analysis
</button>

  )
}
