export default function InputForm({ onSubmit }) {
  const handleSubmit = (e) => {
    e.preventDefault();

    const data = {
      caption: e.target.caption.value,
      hashtags: e.target.hashtags.value,
      platform: e.target.platform.value,
      time: e.target.time.value,
      file: e.target.media.files[0],
    };

    onSubmit(data);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto mt-20 p-10 border"
    >
      <h2 className="text-2xl mb-6 text-center">Post Analysis</h2>

      <input
  name="media"
  type="file"
  className="w-full mb-4 border px-3 py-2 rounded"
/>

      <textarea
  name="caption"
  placeholder="Post caption"
  className="w-full mb-4 border px-3 py-2 rounded"
  required
/>


      <input
  name="hashtags"
  type="number"
  placeholder="Hashtag count"
  className="w-full mb-4 border px-3 py-2 rounded"
  required
/>


      <select
  name="platform"
  className="w-full mb-4 border px-3 py-2 rounded"
  required
>

        <option value="">Select platform</option>
        <option>Instagram</option>
        <option>YouTube</option>
        <option>X</option>
      </select>

      <label className="block mb-1 font-semibold">
  Posting Time
</label>

<p className="text-sm text-gray-600 mb-2">
  Select the time you plan to publish the post (24-hour format).
</p>

<input
  name="time"
  type="time"
  className="w-full mb-6 border px-3 py-2 rounded"
  required
/>


      <button
  type="submit"
  className="w-full border py-3 font-semibold hover:bg-black hover:text-white transition rounded"
>
  Analyze Engagement
</button>

    </form>
  );
}
