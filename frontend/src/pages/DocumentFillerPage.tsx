import { useState, useMemo, useEffect } from "react"
import { PrimarySidebar } from "../cchat/sidebar/PrimarySidebar"
import {
  FileText, CheckCircle2, UserPlus, X, Send, Loader2, Plus, Trash2
} from "lucide-react"
import { Templates, type DocumentTemplate } from "@/tools/templates/data"
import { useAuthStore } from "@/store/useAuthStore"
import { useChatStore } from "@/store/useChatStore"
import { toast } from "react-hot-toast"

// ─── Tự động fill thông tin từ authUser ─────────────────────────────────────
function getAutoFillValues(
  template: DocumentTemplate,
  authUser: any
): Record<string, any> {
  const today = new Date().toISOString().split("T")[0]
  const defaults: Record<string, any> = {
    name: authUser?.fullname || "",
    department: authUser?.department || "",
    date: today,
    startDate: today,
  }
  const result: Record<string, any> = {}
  template.fields.forEach((f) => {
    if (f.type === "table") {
      result[f.id] = [{}] // Init with one empty row
    } else {
      result[f.id] = defaults[f.id] ?? ""
    }
  })
  return result
}

// ─── Tạo preview HTML ────────────────────────────────────────────────────────
function generatePreviewHTML(template: DocumentTemplate, data: Record<string, any>) {
  let html = template.templateContent
  template.fields.forEach((field) => {
    const regex = new RegExp(`{{${field.id}}}`, "g")
    
    if (field.type === "table") {
      const rows = data[field.id] || []
      let tableHtml = ""
      if (rows.length === 0) {
        tableHtml = `<tr><td colspan="${(field.columns?.length || 0) + 1}" style="border:1px solid #ccc;padding:8px;text-align:center;color:#999;">Không có dữ liệu</td></tr>`
      } else {
        rows.forEach((row: any, index: number) => {
          let rowHtml = `<tr><td style="border:1px solid #ccc;padding:8px;text-align:center;">${index + 1}</td>`
          field.columns?.forEach(col => {
            const val = row[col.id]
            if (val && String(val).trim() !== "") {
              const align = col.type === "number" ? "center" : "left"
              rowHtml += `<td style="border:1px solid #ccc;padding:8px;text-align:${align};"><span style="color:#0052cc;font-weight:bold;">${val}</span></td>`
            } else {
              rowHtml += `<td style="border:1px solid #ccc;padding:8px;">&nbsp;</td>`
            }
          })
          rowHtml += `</tr>`
          tableHtml += rowHtml
        })
      }
      html = html.replace(regex, tableHtml)
    } else {
      const value = data[field.id]
      if (value && String(value).trim() !== "") {
        html = html.replace(regex, `<span style="color:#0052cc;font-weight:bold;">${value}</span>`)
      } else {
        html = html.replace(regex, `<span style="background:#fef08a;padding:0 4px;border-radius:2px;color:#854d0e;font-style:italic;">[${field.label}]</span>`)
      }
    }
  })
  return html
}

import { DocumentPreviewPanel } from "@/tools/DocumentPreviewPanel"
import { ReceiverSelectionModal } from "@/tools/ReceiverSelectionModal"

// ─── Main Component ──────────────────────────────────────────────────────────

export default function DocumentFillerPage() {
  const { authUser } = useAuthStore()
  const { allContacts, getAllcontacts, managers, fetchManagers, sendDocumentMessage } = useChatStore()

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(Templates[0].id)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [isSending, setIsSending] = useState(false)

  // Receiver state
  const [receivers, setReceivers] = useState<string[]>([])
  const [isSelectingReceiver, setIsSelectingReceiver] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const selectedTemplate = useMemo(
    () => Templates.find((t) => t.id === selectedTemplateId) || Templates[0],
    [selectedTemplateId]
  )

  // Fetch contacts/managers on mount
  useEffect(() => {
    getAllcontacts()
    fetchManagers()
  }, [getAllcontacts, fetchManagers])

  // Auto-fill khi template hoặc authUser thay đổi
  useEffect(() => {
    setFormData(getAutoFillValues(selectedTemplate, authUser))
    setReceivers([])
  }, [selectedTemplateId, authUser])

  const handleTemplateChange = (id: string) => {
    setSelectedTemplateId(id)
  }

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }))
  }

  // Danh sách hiển thị chỉ bao gồm các quản lý
  const contactList = managers
  const filteredList = contactList.filter((c: any) =>
    (c.fullname || c.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleReceiver = (id: string) => {
    setReceivers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const previewContent = useMemo(
    () => generatePreviewHTML(selectedTemplate, formData),
    [selectedTemplate, formData]
  )

  // Gửi đơn
  const handleSendDocument = async () => {
    if (receivers.length === 0) {
      toast.error("Vui lòng chọn người nhận!")
      return
    }
    const hasEmpty = selectedTemplate.fields.some(
      (f) => {
        if (f.type === "table") {
          const rows = formData[f.id] || []
          if (rows.length === 0) return true
          return rows.some((row: any) => 
            f.columns?.some(col => !row[col.id] || String(row[col.id]).trim() === "")
          )
        }
        return !formData[f.id] || String(formData[f.id]).trim() === ""
      }
    )
    if (hasEmpty) {
      toast.error("Vui lòng điền đầy đủ thông tin trước khi gửi")
      return
    }

    const documentPayload = {
      templateId: selectedTemplate.id,
      templateName: selectedTemplate.name,
      fields: formData,
      htmlContent: previewContent,
    }

    setIsSending(true)
    try {
      // Gửi đến từng người
      await Promise.all(
        receivers.map((receiverId) =>
          sendDocumentMessage(receiverId, documentPayload)
        )
      )
      toast.success(
        `Đã gửi "${selectedTemplate.name}" cho ${receivers.length} người thành công!`
      )
      setReceivers([])
    } catch {
      // error handled in store
    } finally {
      setIsSending(false)
    }
  }

  return (
    <>
      <div className="flex h-screen bg-chat-main overflow-hidden text-chat-text font-sans">
        <PrimarySidebar activeTab="tools" />

        {/* ─── Left: Form ─── */}
        <div className="w-[40%] flex flex-col border-r border-chat-border bg-chat-sidebar z-10 shadow-[4px_0_24px_rgba(0,0,0,0.2)]">
          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-chat-border">
            <div className="w-10 h-10 bg-[#0052cc]/20 text-[#0052cc] rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-[18px] font-bold text-chat-text tracking-tight">Điền đơn tự động</h1>
              <p className="text-[13px] text-chat-muted">Tạo văn bản nhanh từ Form mẫu</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-5">
            {/* Chọn mẫu đơn */}
            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-medium text-chat-text/90">Chọn mẫu đơn</label>
              <select
                value={selectedTemplateId}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="w-full bg-chat-main border border-chat-border rounded-lg px-4 py-3 text-[14px] text-chat-text outline-none focus:border-[#0052cc] transition-colors appearance-none cursor-pointer"
              >
                {Templates.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* ─── Gửi cho ai — 2 Tab ─── */}
            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-medium text-chat-text/90">
                Gửi cho ai <span className="text-red-500">*</span>
              </label>


              {/* Người đã chọn + nút mở */}
              <div
                onClick={() => setIsSelectingReceiver(true)}
                className="w-full min-h-[46px] bg-chat-main border border-chat-border hover:border-[#0052cc] rounded-lg p-2 cursor-pointer flex flex-wrap gap-2 items-center transition-colors"
              >
                {receivers.map((id) => {
                  const c = contactList.find((x: any) => x._id === id) as any
                  if (!c) return null
                  return (
                    <div
                      key={id}
                      className="flex items-center gap-1.5 bg-chat-sidebar border border-chat-border rounded-full px-2 py-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <img src={c.profilePicture || "/avatar.png"} className="w-5 h-5 rounded-full" />
                      <span className="text-[12px] text-chat-text/90">{c.fullname}</span>
                      <X
                        className="w-3 h-3 text-chat-muted hover:text-chat-text cursor-pointer ml-1"
                        onClick={() => toggleReceiver(id)}
                      />
                    </div>
                  )
                })}
                {receivers.length === 0 && (
                  <span className="text-[13px] text-chat-muted px-2">Chọn người nhận...</span>
                )}
                <div className="text-[13px] text-chat-muted flex items-center gap-2 px-2 hover:text-chat-text transition-colors ml-auto">
                  <UserPlus className="w-4 h-4" /> Thêm
                </div>
              </div>
            </div>

            <div className="h-px bg-chat-border w-full" />

            {/* Dynamic form fields */}
            <div className="flex flex-col gap-5">
              <h2 className="text-[15px] font-semibold text-chat-text flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0052cc]" />
                Nội dung đơn
              </h2>

              {selectedTemplate.fields.map((field) => (
                <div key={field.id} className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-chat-muted ml-1">{field.label}</label>
                  
                  {field.type === "table" ? (
                    <div className="flex flex-col gap-3 border border-chat-border rounded-lg p-3 bg-chat-main/50">
                      {(formData[field.id] || []).map((row: any, rowIndex: number) => (
                        <div key={rowIndex} className="flex flex-col gap-2 p-3 bg-chat-main border border-chat-border rounded-md relative">
                          <div className="absolute top-2 right-2 flex gap-2">
                            <button
                              onClick={() => {
                                const newRows = [...(formData[field.id] || [])];
                                newRows.splice(rowIndex, 1);
                                setFormData({ ...formData, [field.id]: newRows });
                              }}
                              className="text-red-500 hover:text-red-600 transition-colors bg-red-500/10 p-1.5 rounded-md"
                              title="Xóa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          
                          <div className="text-[12px] font-semibold text-chat-muted mb-1">Mục {rowIndex + 1}</div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            {field.columns?.map(col => (
                              <div key={col.id} className="flex flex-col gap-1">
                                <label className="text-[12px] text-chat-muted">{col.label}</label>
                                <input
                                  type={col.type || "text"}
                                  value={row[col.id] || ""}
                                  onChange={(e) => {
                                    const newRows = [...(formData[field.id] || [])];
                                    newRows[rowIndex] = { ...newRows[rowIndex], [col.id]: e.target.value };
                                    setFormData({ ...formData, [field.id]: newRows });
                                  }}
                                  className="w-full bg-chat-sidebar border border-chat-border rounded-md px-3 py-2 text-[13px] text-chat-text outline-none focus:border-[#0052cc] transition-colors"
                                  placeholder={`Nhập ${col.label.toLowerCase()}...`}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      
                      <button
                        onClick={() => {
                          const newRows = [...(formData[field.id] || []), {}];
                          setFormData({ ...formData, [field.id]: newRows });
                        }}
                        className="flex items-center justify-center gap-1.5 py-2 mt-1 bg-chat-sidebar border border-dashed border-chat-border hover:border-[#0052cc] hover:text-[#0052cc] text-chat-muted rounded-md text-[13px] transition-colors"
                      >
                        <Plus className="w-4 h-4" /> Thêm
                      </button>
                    </div>
                  ) : field.type === "textarea" ? (
                    <textarea
                      value={formData[field.id] || ""}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      rows={3}
                      className="w-full bg-chat-main border border-chat-border rounded-lg px-4 py-3 text-[14px] text-chat-text outline-none focus:border-[#0052cc] transition-colors resize-none custom-scrollbar"
                      placeholder={`Nhập ${field.label.toLowerCase()}...`}
                    />
                  ) : (
                    <input
                      type={field.type}
                      value={formData[field.id] || ""}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      className="w-full bg-chat-main border border-chat-border rounded-lg px-4 py-3 text-[14px] text-chat-text outline-none focus:border-[#0052cc] transition-colors [&::-webkit-calendar-picker-indicator]:filter-invert"
                      placeholder={`Nhập ${field.label.toLowerCase()}...`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom actions */}
          <div className="p-6 border-t border-chat-border bg-chat-sidebar flex gap-3">
            <button
              onClick={handleSendDocument}
              disabled={isSending || receivers.length === 0}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#0052cc] hover:bg-[#0052cc]/90 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[14px] font-medium rounded-lg transition-colors shadow-md shadow-[#0052cc]/20"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>{isSending ? "Đang gửi..." : `Gửi đơn${receivers.length > 0 ? ` (${receivers.length})` : ""}`}</span>
            </button>
          </div>
        </div>

        {/* ─── Right: A4 Preview ─── */}
        <DocumentPreviewPanel previewContent={previewContent} />
      </div>

      {/* ─── Modal chọn người nhận ─── */}
      {isSelectingReceiver && (
        <ReceiverSelectionModal
          onClose={() => setIsSelectingReceiver(false)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filteredList={filteredList}
          receivers={receivers}
          toggleReceiver={toggleReceiver}
          contactList={contactList}
        />
      )}
    </>
  )
}
