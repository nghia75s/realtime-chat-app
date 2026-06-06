import { useState } from "react"
import { ChevronLeft, Search, ChevronDown } from "lucide-react"

interface ArchivePanelProps {
  initialTab: "media" | "file" | "link";
  onBack: () => void;
}

export function ArchivePanel({ initialTab, onBack }: ArchivePanelProps) {
  const [activeTab, setActiveTab] = useState<"media" | "file" | "link">(initialTab)

  const tabs = [
    { id: "media", label: "Ảnh/Video" },
    { id: "file", label: "File" },
    { id: "link", label: "Link" },
  ] as const;

  const getSearchPlaceholder = () => {
    switch (activeTab) {
      case "media": return "Tìm kiếm Ảnh/Video";
      case "file": return "Tìm kiếm File";
      case "link": return "Tìm kiếm Link";
    }
  }

  return (
    <div className="flex w-[340px] shrink-0 flex-col border-l border-chat-border h-full overflow-hidden text-chat-text" style={{ background: 'var(--chat-bg-sidebar)' }}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-chat-border px-4 py-[14px] shrink-0 font-medium text-[16px] text-chat-text shadow-sm z-10" style={{ background: 'var(--chat-bg-sidebar)' }}>
        <button 
          onClick={onBack}
          className="p-1 -ml-1 hover:bg-chat-hover rounded text-chat-muted transition-colors shrink-0"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="flex-1 text-center font-bold">Kho lưu trữ</span>
        <button className="text-[14px] font-semibold text-[#0052cc] px-2 py-1 hover:bg-[#0052cc]/10 rounded transition-colors shrink-0">
          Chọn
        </button>
      </div>

      {/* Tabs Sub-Navigation */}
      <div className="flex border-b border-chat-border px-2 shrink-0" style={{ background: 'var(--chat-bg-sidebar)' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-3 text-[14px] font-medium transition-colors border-b-[2px] ${
              activeTab === tab.id 
                ? "border-[#0052cc] text-[#0052cc]" 
                : "border-transparent text-chat-muted hover:text-chat-text"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sticky Filters Area */}
      <div className="flex flex-col px-4 pt-3 pb-2 shrink-0 shadow-sm z-10 border-b border-chat-border" style={{ background: 'var(--chat-bg-sidebar)' }}>
        <div className="relative mb-2">
           <Search className="absolute left-2.5 top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-chat-muted" />
           <input
             placeholder={getSearchPlaceholder()}
             className="w-full rounded-md py-[6px] pl-[30px] pr-3 text-[14px] text-chat-text outline-none placeholder:text-chat-muted focus:ring-1 focus:ring-[#0052cc] transition-all border border-chat-border"
             style={{ background: 'var(--chat-bg-main)' }}
           />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button className="flex items-center gap-1 rounded-full border border-chat-border px-3 py-1 text-[13px] text-chat-muted hover:bg-chat-hover shrink-0 whitespace-nowrap" style={{ background: 'var(--chat-bg-sidebar)' }}>
            {activeTab === 'link' ? 'Tên miền' : 'Loại'}
            <ChevronDown className="h-3.5 w-3.5 text-chat-muted" />
          </button>
          <button className="flex items-center gap-1 rounded-full border border-chat-border px-3 py-1 text-[13px] text-chat-muted hover:bg-chat-hover shrink-0 whitespace-nowrap" style={{ background: 'var(--chat-bg-sidebar)' }}>
            Người gửi
            <ChevronDown className="h-3.5 w-3.5 text-chat-muted" />
          </button>
          <button className="flex items-center gap-1 rounded-full border border-chat-border px-3 py-1 text-[13px] text-chat-muted hover:bg-chat-hover shrink-0 whitespace-nowrap" style={{ background: 'var(--chat-bg-sidebar)' }}>
            Ngày gửi
            <ChevronDown className="h-3.5 w-3.5 text-chat-muted" />
          </button>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar flex items-center justify-center" style={{ background: 'var(--chat-bg-main)' }}>
         <span className="text-[13px] text-chat-muted">Chưa có dữ liệu</span>
      </div>
    </div>
  )
}
