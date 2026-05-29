import React from "react"

interface DocumentPreviewPanelProps {
  previewContent: string
}

export function DocumentPreviewPanel({ previewContent }: DocumentPreviewPanelProps) {
  return (
    <div className="w-[60%] bg-[#e1e1e1] flex flex-col justify-between overflow-hidden relative">
      <div className="w-full p-3 bg-[#cfcfcf] border-b border-[#c0c0c0] flex items-center justify-center shadow-inner z-10 shrink-0">
        <span className="text-[13px] font-medium text-[#555] uppercase tracking-wider">
          Chế độ xem trước (Real-time Preview)
        </span>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 flex justify-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
        <div
          className="bg-white w-full max-w-[794px] min-h-[1123px] shadow-[0_10px_40px_rgba(0,0,0,0.15)] mx-auto p-[60px] text-black border border-[#d1d1d1]"
          dangerouslySetInnerHTML={{ __html: previewContent }}
        />
      </div>
    </div>
  )
}
