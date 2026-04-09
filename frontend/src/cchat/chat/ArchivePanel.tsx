import { useState } from "react"
import { ChevronLeft, Search, Play, Link as LinkIcon, Download, MoreHorizontal, ChevronDown } from "lucide-react"

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

  // Mock data for File Tab
  const mockFiles = [
    { dateGroup: "Ngày 27 Tháng 3", items: [
      { id: 1, name: "Bao_cao_Tai_chinh_Q1_2026.pdf", size: "2.4 MB", ext: "PDF" },
      { id: 2, name: "Danh_sach_Khach_hang_Moi.xlsx", size: "850 KB", ext: "XLSX" },
    ]},
    { dateGroup: "Ngày 21 Tháng 3", items: [
      { id: 3, name: "Hop_dong_Hop_tac_Kinh_doanh_Final_V2_Edited.docx", size: "1.1 MB", ext: "DOCX" },
    ]}
  ];

  // Mock data for Media Tab
  const mockMedia = [
    { dateGroup: "Ngày 25 Tháng 3", items: [
      { id: 1, type: "image", src: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=300" },
      { id: 2, type: "image", src: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=300" },
      { id: 3, type: "video", src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=300", duration: "0:45" },
      { id: 4, type: "image", src: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=300" },
      { id: 5, type: "image", src: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=300" },
      { id: 6, type: "video", src: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=300", duration: "2:15" },
    ]},
    { dateGroup: "Hôm qua", items: [
      { id: 7, type: "image", src: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=300" },
    ]}
  ];

  // Mock data for Link Tab
  const mockLinks = [
    { dateGroup: "Tháng trước", items: [
      { id: 1, title: "Zalo Developers - Official Documentation", url: "https://developers.zalo.me/docs", domain: "developers.zalo.me", icon: "🌐" },
      { id: 2, title: "Figma Design System 2026 UI Kit", url: "https://figma.com/file/xyz123", domain: "figma.com", icon: "🎨" },
    ]}
  ];

  return (
    <div className="flex w-[340px] shrink-0 flex-col bg-white border-l border-zinc-200 h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-[14px] shrink-0 font-medium text-[16px] text-zinc-900 shadow-sm z-10 bg-white">
        <button 
          onClick={onBack}
          className="p-1 -ml-1 hover:bg-zinc-100 rounded text-zinc-600 transition-colors shrink-0"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="flex-1 text-center font-bold">Kho lưu trữ</span>
        <button className="text-[14px] font-semibold text-[#7c3aed] px-2 py-1 hover:bg-purple-50 rounded transition-colors shrink-0">
          Chọn
        </button>
      </div>

      {/* Tabs Sub-Navigation */}
      <div className="flex border-b border-zinc-200 px-2 shrink-0 bg-white">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-3 text-[14px] font-medium transition-colors border-b-[2px] ${
              activeTab === tab.id 
                ? "border-[#7c3aed] text-[#7c3aed]" 
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sticky Filters Area */}
      <div className="flex flex-col px-4 pt-3 pb-2 shrink-0 bg-white shadow-sm z-10 border-b border-zinc-100">
        <div className="relative mb-2">
           <Search className="absolute left-2.5 top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-zinc-500" />
           <input
             placeholder={getSearchPlaceholder()}
             className="w-full rounded-md bg-[#eaedf0] py-[6px] pl-[30px] pr-3 text-[14px] text-zinc-900 outline-none placeholder:text-zinc-500 focus:bg-white focus:ring-1 focus:ring-[#7c3aed] transition-all"
           />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button className="flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[13px] text-zinc-600 hover:bg-zinc-50 shrink-0 whitespace-nowrap">
            {activeTab === 'link' ? 'Tên miền' : 'Loại'}
            <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
          </button>
          <button className="flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[13px] text-zinc-600 hover:bg-zinc-50 shrink-0 whitespace-nowrap">
            Người gửi
            <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
          </button>
          <button className="flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[13px] text-zinc-600 hover:bg-zinc-50 shrink-0 whitespace-nowrap">
            Ngày gửi
            <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
          </button>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto min-h-0 bg-white custom-scrollbar pb-6">
        
        {/* Render Tab: File */}
        {activeTab === "file" && (
          <div className="flex flex-col">
            {mockFiles.map((group, idx) => (
              <div key={idx} className="flex flex-col">
                <div className="bg-[#f3f4f6] px-4 py-1.5 z-0 sticky top-0 font-semibold text-[13px] text-zinc-600 border-b border-zinc-200/50">
                  {group.dateGroup}
                </div>
                <div className="flex flex-col">
                  {group.items.map(item => (
                    <div key={item.id} className="group flex items-center justify-between px-4 py-3 border-b border-zinc-100 hover:bg-zinc-50 cursor-pointer">
                      <div className="flex items-start gap-3 min-w-0 pr-3">
                        <div className={`flex shrink-0 h-10 w-10 items-center justify-center rounded-lg font-bold text-[12px] uppercase ${item.ext === 'PDF' ? 'bg-red-100 text-red-600' : 'bg-purple-100 text-purple-600'}`}>
                          {item.ext}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="truncate text-[14px] font-medium text-zinc-800 leading-tight mb-0.5">{item.name}</span>
                          <span className="text-[12px] text-zinc-500">{item.size}</span>
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                        <button className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200 rounded-md transition-colors"><MoreHorizontal className="h-4 w-4" /></button>
                        <button className="p-1.5 text-zinc-400 hover:text-[#7c3aed] hover:bg-purple-50 rounded-md transition-colors"><Download className="h-4 w-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Render Tab: Media (Image/Video Grid) */}
        {activeTab === "media" && (
           <div className="flex flex-col">
             {mockMedia.map((group, idx) => (
              <div key={idx} className="flex flex-col">
                <div className="bg-[#f3f4f6] px-4 py-1.5 z-0 sticky top-0 font-semibold text-[13px] text-zinc-600 border-b border-zinc-200/50">
                  {group.dateGroup}
                </div>
                <div className="grid grid-cols-3 gap-1 px-1 py-1">
                  {group.items.map(item => (
                    <div key={item.id} className="relative aspect-square cursor-pointer group hover:opacity-90 overflow-hidden">
                      <img src={item.src} alt="media object" className="w-full h-full object-cover" />
                      {item.type === 'video' && (
                        <>
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
                          <Play className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-white fill-white/80" />
                          <span className="absolute bottom-1 right-1 px-1 rounded bg-black/60 text-white text-[10px] font-medium tracking-wide">
                            {item.duration}
                          </span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
           </div>
        )}

        {/* Render Tab: Links */}
        {activeTab === "link" && (
           <div className="flex flex-col">
            {mockLinks.map((group, idx) => (
              <div key={idx} className="flex flex-col">
                <div className="bg-[#f3f4f6] px-4 py-1.5 z-0 sticky top-0 font-semibold text-[13px] text-zinc-600 border-b border-zinc-200/50">
                  {group.dateGroup}
                </div>
                <div className="flex flex-col">
                  {group.items.map(item => (
                    <div key={item.id} className="group flex items-start px-4 py-3 border-b border-zinc-100 hover:bg-zinc-50 cursor-pointer">
                      <div className="flex shrink-0 h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 text-xl border border-zinc-200">
                        {item.icon}
                      </div>
                      <div className="flex flex-col min-w-0 ml-3 pr-2">
                        <span className="truncate text-[14px] font-semibold text-zinc-800 leading-tight mb-[3px] group-hover:text-[#7c3aed]">{item.title}</span>
                        <div className="flex items-center gap-1.5">
                          <LinkIcon className="h-3 w-3 text-zinc-400" />
                          <span className="text-[12px] text-zinc-500 truncate">{item.domain}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
           </div>
        )}
      </div>
    </div>
  )
}

