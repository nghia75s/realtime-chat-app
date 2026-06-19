import { useMemo, useState, useEffect } from "react"
import { ChevronLeft, Search, ChevronDown, Image, FileText, Link as LinkIcon, Check } from "lucide-react"
import { useChatStore } from "@/store/useChatStore"

interface ArchivePanelProps {
  initialTab: "media" | "file" | "link";
  onBack: () => void;
  onMediaClick?: (messageId: string) => void;
  onMessageClick?: (messageId: string) => void;
  isGroup?: boolean;
}

export function ArchivePanel({ initialTab, onBack, onMediaClick, onMessageClick, isGroup }: ArchivePanelProps) {
  const [activeTab, setActiveTab] = useState<"media" | "file" | "link">(initialTab)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSender, setSelectedSender] = useState<string>("all")
  const [dateOrder, setDateOrder] = useState<"newest" | "oldest">("newest")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [openDropdown, setOpenDropdown] = useState<"sender" | "date" | "type" | null>(null)
  const { messages } = useChatStore()

  useEffect(() => {
    const handleClick = () => setOpenDropdown(null)
    window.addEventListener("click", handleClick)
    return () => window.removeEventListener("click", handleClick)
  }, [])

  useEffect(() => {
    setSelectedType("all")
  }, [activeTab])

  const filterData = useMemo(() => {
    const fileTypes = new Set<string>()
    const domains = new Set<string>()

    messages?.forEach((msg: any) => {
      if (msg.file && msg.file.name) {
        const ext = msg.file.name.split('.').pop()?.toUpperCase()
        if (ext) fileTypes.add(ext)
      }
      const text = msg.file?.url || msg.text || ""
      const match = text.match(/(https?:\/\/|www\.)([^\s/]+)/i)
      if (match) {
        const domain = match[2].replace(/^www\./, '')
        domains.add(domain)
      }
    })

    return {
      fileTypes: Array.from(fileTypes).map(t => ({ id: t, label: t })),
      domains: Array.from(domains).map(d => ({ id: d, label: d }))
    }
  }, [messages])

  const senders = useMemo(() => {
    const map = new Map<string, string>()
    messages?.forEach((msg: any) => {
      const id = typeof msg.senderId === "string" ? msg.senderId : msg.senderId?._id
      const name = typeof msg.senderId === "string" ? "Người dùng" : msg.senderId?.fullname || "Người dùng"
      if (id && name) map.set(id, name)
    })
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [messages])

  const tabs = [
    { id: "media", label: "Ảnh/Video", icon: Image },
    { id: "file", label: "File", icon: FileText },
    { id: "link", label: "Link", icon: LinkIcon },
  ] as const;

  const getSearchPlaceholder = () => {
    switch (activeTab) {
      case "media": return "Tìm kiếm Ảnh/Video";
      case "file": return "Tìm kiếm File";
      case "link": return "Tìm kiếm Link";
    }
  }

  const hasLink = (text?: string) => {
    if (!text) return false
    return /(https?:\/\/|www\.)\S+/i.test(text)
  }

  const archiveItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    let filtered = (messages || [])
      .filter((msg: any) => {
        if (activeTab === "media") return Boolean(msg.image)
        if (activeTab === "file") return Boolean(msg.file)
        if (activeTab === "link") return hasLink(msg.text) || Boolean(msg.file?.url)
        return false
      })
      .filter((msg: any) => {
        if (!query) return true
        const text = [
          msg.text,
          msg.file?.name,
          msg.file?.url,
          msg.senderId?.fullname,
        ].filter(Boolean).join(" ").toLowerCase()
        return text.includes(query)
      })

    if (selectedSender !== "all") {
      filtered = filtered.filter((msg: any) => {
        const id = typeof msg.senderId === "string" ? msg.senderId : msg.senderId?._id
        return id === selectedSender
      })
    }

    if (selectedType !== "all") {
      filtered = filtered.filter((msg: any) => {
        if (activeTab === "file") {
          const ext = msg.file?.name?.split('.').pop()?.toUpperCase()
          return ext === selectedType
        }
        if (activeTab === "link") {
          const text = msg.file?.url || msg.text || ""
          const match = text.match(/(https?:\/\/|www\.)([^\s/]+)/i)
          if (match) {
            const domain = match[2].replace(/^www\./, '')
            return domain === selectedType
          }
        }
        return true
      })
    }

    filtered.sort((a: any, b: any) => {
      const timeA = new Date(a.createdAt).getTime()
      const timeB = new Date(b.createdAt).getTime()
      return dateOrder === "newest" ? timeB - timeA : timeA - timeB
    })

    return filtered
  }, [activeTab, messages, searchQuery, selectedSender, dateOrder, selectedType])

  const renderItem = (msg: any) => {
    const sender = typeof msg.senderId === "string" ? msg.senderId : msg.senderId?.fullname || "Người dùng"
    const time = new Date(msg.createdAt).toLocaleString()

    if (activeTab === "media") {
      return (
        <button
          key={msg._id}
          type="button"
          onClick={() => onMediaClick?.(msg._id)}
          className="overflow-hidden rounded-2xl bg-chat-sidebar shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0052cc] aspect-[4/3]"
        >
          <img src={msg.image} alt="Ảnh tin nhắn" className="w-full h-full object-cover" />
        </button>
      )
    }

    if (activeTab === "file") {
      return (
        <button key={msg._id} onClick={() => onMessageClick?.(msg._id)} className="w-full text-left flex items-center gap-3 rounded-2xl border border-chat-border bg-chat-sidebar p-3 shadow-sm hover:border-[#0052cc] transition-colors focus:outline-none">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-chat-hover text-chat-muted">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-chat-text truncate">{msg.file?.name || "File đính kèm"}</p>
            <p className="text-[12px] text-chat-muted truncate">{msg.file?.type || "Loại file"}</p>
          </div>
          <div className="text-right text-[11px] text-chat-muted shrink-0">{time}</div>
        </button>
      )
    }

    return (
      <button key={msg._id} onClick={() => onMessageClick?.(msg._id)} className="w-full text-left rounded-2xl border border-chat-border bg-chat-sidebar p-3 shadow-sm hover:border-[#0052cc] transition-colors focus:outline-none">
        <div className="flex items-center gap-2 text-chat-text font-semibold mb-2">
          <LinkIcon className="h-4 w-4 shrink-0" />
          <span className="truncate">{msg.file?.url ? "Link đính kèm" : "Liên kết trong tin nhắn"}</span>
        </div>
        <p className="text-sm text-chat-text truncate">{msg.file?.url || msg.text}</p>
        <div className="mt-2 flex items-center justify-between text-[12px] text-chat-muted">
          <span className="truncate mr-2">{sender}</span>
          <span className="shrink-0">{time}</span>
        </div>
      </button>
    )
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

      </div>

      {/* Tabs Sub-Navigation */}
      <div className="flex border-b border-chat-border px-2 shrink-0" style={{ background: 'var(--chat-bg-sidebar)' }}>
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 text-[14px] font-medium transition-colors border-b-[2px] ${activeTab === tab.id
                  ? "border-[#0052cc] text-[#0052cc]"
                  : "border-transparent text-chat-muted hover:text-chat-text"
                }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Sticky Filters Area */}
      <div className="flex flex-col px-4 pt-3 pb-2 shrink-0 shadow-sm z-10 border-b border-chat-border" style={{ background: 'var(--chat-bg-sidebar)' }}>
        <div className="relative mb-2">
           <Search className="absolute left-2.5 top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-chat-muted" />
           <input
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             placeholder={getSearchPlaceholder()}
             className="w-full rounded-md py-[6px] pl-[30px] pr-3 text-[14px] text-chat-text outline-none placeholder:text-chat-muted focus:ring-1 focus:ring-[#0052cc] transition-all border border-chat-border"
             style={{ background: 'var(--chat-bg-main)' }}
           />
        </div>
        <div className="flex items-center gap-2 flex-wrap pb-1">
          {(() => {
            const renderDropdown = (
              id: "sender" | "date" | "type",
              buttonLabel: string,
              options: { id: string; label: string }[],
              currentValue: string,
              onChange: (val: string) => void,
              defaultValue: string = "all"
            ) => {
              const isActive = currentValue !== defaultValue;
              const isOpen = openDropdown === id;

              return (
                <div className="relative" key={id}>
                  <button
                    onClick={(e) => { e.stopPropagation(); setOpenDropdown(isOpen ? null : id); }}
                    className={`flex items-center gap-1 rounded-full border px-3 py-1 text-[13px] shrink-0 whitespace-nowrap transition-colors ${isActive ? "border-[#0052cc] text-[#0052cc] bg-[#0052cc]/10" : "border-chat-border text-chat-muted hover:bg-chat-hover"}`}
                    style={!isActive ? { background: 'var(--chat-bg-sidebar)' } : {}}
                  >
                    {buttonLabel}
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                  {isOpen && (
                    <div
                      className="absolute top-full left-0 mt-1 min-w-[140px] max-w-[220px] border rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto custom-scrollbar p-1"
                      style={{ background: 'var(--chat-dropdown-bg)', borderColor: 'var(--chat-border)' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {options.map(opt => (
                        <button key={opt.id} className="w-full flex items-center justify-between px-3 py-2 text-[13px] text-chat-text hover:bg-chat-hover rounded transition-colors" onClick={() => { onChange(opt.id); setOpenDropdown(null); }}>
                          <span className="truncate pr-2">{opt.label}</span>
                          {currentValue === opt.id && <Check className="w-3.5 h-3.5 text-[#0052cc] shrink-0" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            }

            const senderOptions = [{ id: "all", label: "Tất cả" }, ...senders.map(s => ({ id: s.id, label: s.name }))]
            const dateOptions = [{ id: "newest", label: "Mới nhất" }, { id: "oldest", label: "Cũ nhất" }]
            const typeOptions = [
              { id: "all", label: "Tất cả" },
              ...(activeTab === "link" ? filterData.domains : filterData.fileTypes)
            ]

            return (
              <>
                {activeTab !== "media" && renderDropdown("type", activeTab === "link" ? "Tên miền" : "Loại", typeOptions, selectedType, setSelectedType)}
                {isGroup && renderDropdown("sender", "Người gửi", senderOptions, selectedSender, setSelectedSender)}
                {renderDropdown("date", dateOrder === "newest" ? "Mới nhất" : "Cũ nhất", dateOptions, dateOrder, (val) => setDateOrder(val as "newest" | "oldest"), "newest")}
              </>
            )
          })()}
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className={`flex-1 overflow-y-auto min-h-0 custom-scrollbar ${activeTab === 'media' ? 'grid grid-cols-2 gap-2 px-2 py-3' : 'space-y-4 p-4'}`} style={{ background: 'var(--chat-bg-main)' }}>
        {archiveItems.length === 0 ? (
          <div className="text-center text-chat-muted mt-24">
            Không tìm thấy {activeTab === 'media' ? 'Ảnh/Video' : activeTab === 'file' ? 'File' : 'Link'}.
          </div>
        ) : (
          archiveItems.map(renderItem)
        )}
      </div>
    </div>
  )
}
