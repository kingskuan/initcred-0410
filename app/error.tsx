'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        <h2 className="text-2xl font-bold mb-4">出现了错误</h2>
        <p className="text-gray-400 mb-6">{error.message || '页面加载时发生意外错误'}</p>
        <button
          onClick={reset}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 font-medium hover:opacity-90 transition-all"
        >
          重试
        </button>
      </div>
    </div>
  )
}
