export default function App() {
  return (
    <div className="h-screen bg-zinc-900 flex items-center justify-center">
      <button
        data-modal-target="test-modal"
        data-modal-toggle="test-modal"
        className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-500"
      >
        Open Modal
      </button>

      <div
        id="test-modal"
        tabIndex="-1"
        className="fixed left-0 right-0 top-0 z-50 hidden h-screen w-full items-center justify-center bg-black/50"
      >
        <div className="relative w-full max-w-md rounded-lg bg-white p-6">
          <h3 className="mb-4 text-xl font-semibold text-gray-900">
            Flowbite شغال ✅
          </h3>
          <button
            data-modal-hide="test-modal"
            className="rounded bg-red-600 px-4 py-2 text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
