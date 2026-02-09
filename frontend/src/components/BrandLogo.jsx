export default function BrandLogo() {
  return (
    <div className="text-center">
      <h1
        className="text-6xl md:text-7xl font-bold tracking-tight"
        style={{
          fontFamily: "Times New Roman",
        }}
      >
        <span className="text-black">Engage</span>
        <span
          className="ml-2"
          style={{
            background: "linear-gradient(90deg, #D4AF37, #B8962E)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Predict
        </span>
      </h1>

      <p
        className="mt-4 text-sm uppercase tracking-[0.3em] text-gray-500"
        style={{ fontFamily: "Times New Roman" }}
      >
        Predict Engagement · Engineer Virality
      </p>
    </div>
  );
}
