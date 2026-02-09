export default function Input() {
  return (
    <main className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
      <section className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-16 px-10">

        {/* LEFT: MEDIA UPLOAD */}
        <div className="flex items-center justify-center">
          <div className="w-full h-[420px] border-2 border-dashed border-gray-300 rounded-3xl bg-white flex flex-col items-center justify-center shadow-lg">
            <p className="text-gray-500 text-center">
              Upload Image or Video<br />
              <span className="text-sm">(Drag & Drop or Click)</span>
            </p>
          </div>
        </div>

        {/* RIGHT: FORM */}
        <div className="bg-white rounded-3xl shadow-xl p-10">
          <h2
            className="text-3xl font-bold mb-8"
            style={{ fontFamily: "Times New Roman" }}
          >
            Post Details
          </h2>

          <div className="space-y-5">
            <input
              className="w-full border rounded-lg p-3"
              placeholder="Caption length"
            />
            <input
              className="w-full border rounded-lg p-3"
              placeholder="Number of hashtags"
            />
            <input
              className="w-full border rounded-lg p-3"
              placeholder="Posting time (e.g., 18:30)"
            />
            <select className="w-full border rounded-lg p-3">
              <option>Content Type</option>
              <option>Image</option>
              <option>Video</option>
              <option>Text</option>
            </select>
          </div>

          <button
            className="mt-10 w-full py-4 rounded-full bg-black text-white tracking-wide hover:opacity-90"
            style={{ fontFamily: "Times New Roman" }}
          >
            Analyze Engagement
          </button>
        </div>

      </section>
    </main>
  );
}
