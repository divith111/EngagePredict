function PostAnalysis() {
  return (
    <div className="min-h-screen flex justify-center items-start bg-white">
      <div className="w-full max-w-3xl mx-auto px-6 py-10">
        
       <label className="block text-lg font-semibold mb-1">
  Posting Time
</label>

<p className="text-sm text-gray-500 mb-2">
  Select the time you plan to publish the post (24-hour format).
</p>

<input
  type="time"
  className="w-full border rounded-md px-4 py-2"
/>

      </div>
    </div>
  );
}

export default PostAnalysis;
