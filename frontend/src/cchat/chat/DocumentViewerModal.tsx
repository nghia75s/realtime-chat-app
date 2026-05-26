import { useEffect } from "react"
import { X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react"
import { useState } from "react"

interface DocumentViewerModalProps {
  htmlContent: string
  templateName: string
  onClose: () => void
}

export function DocumentViewerModal({ htmlContent, templateName, onClose }: DocumentViewerModalProps) {
  const [scale, setScale] = useState(1)

  // Đóng bằng phím Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Top bar (Zalo style) */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 py-3 bg-black/60 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#0052cc]/20 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-[#0052cc]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="text-white font-semibold text-[15px]">{templateName}</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <button
            onClick={() => setScale(s => Math.max(0.5, s - 0.15))}
            className="p-2 text-[#a1a1a1] hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Thu nhỏ"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-[#a1a1a1] text-[12px] min-w-[44px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale(s => Math.min(2, s + 0.15))}
            className="p-2 text-[#a1a1a1] hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Phóng to"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setScale(1)}
            className="p-2 text-[#a1a1a1] hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Reset zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-white/20 mx-1" />
          <button
            onClick={onClose}
            className="p-2 text-[#a1a1a1] hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Document content area */}
      <div
        className="overflow-auto max-h-screen max-w-full p-[80px_24px_24px] w-full flex justify-center"
        style={{ maxHeight: "100vh" }}
      >
        <div
          className="bg-white shadow-2xl origin-top transition-transform duration-200"
          style={{
            width: `${794 * scale}px`,
            minHeight: `${1123 * scale}px`,
            padding: `${60 * scale}px`,
            transform: `scale(1)`,
            transformOrigin: "top center",
          }}
        >
          <div
            style={{ fontSize: `${16 * scale}px`, lineHeight: 1.5, color: "black" }}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>
      </div>
    </div>
  )
}
