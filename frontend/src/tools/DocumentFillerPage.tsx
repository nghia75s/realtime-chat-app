import { useState, useMemo } from "react";
import { PrimarySidebar } from "../cchat/sidebar/PrimarySidebar";
import { FileText, CheckCircle2, UserPlus, X, Search, Send } from "lucide-react";
import { mockTemplates, type DocumentTemplate, type TemplateField } from "./data";

const mockContacts = [
  { id: "Nguyễn Văn A", name: "Nguyễn Văn A", avatar: "/avatar.png" },
  { id: "Nguyễn Văn B", name: "Nguyễn Văn B", avatar: "/avatar.png" },
  { id: "Lê Thị C", name: "Lê Thị C", avatar: "/avatar.png" },
  { id: "Trần Văn D", name: "Trần Văn D", avatar: "/avatar.png" },
  { id: "Phạm Hùng E", name: "Phạm Hùng E", avatar: "/avatar.png" },
];

export default function DocumentFillerPage() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(mockTemplates[0].id);
  const [formData, setFormData] = useState<Record<string, string>>({});
  
  // Gửi cho ai state
  const [receivers, setReceivers] = useState<string[]>([]);
  const [isSelectingReceiver, setIsSelectingReceiver] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedTemplate = useMemo(() => {
    return mockTemplates.find(t => t.id === selectedTemplateId) || mockTemplates[0];
  }, [selectedTemplateId]);

  // Khi đổi template, clear data cũ
  const handleTemplateChange = (id: string) => {
    setSelectedTemplateId(id);
    setFormData({});
  };

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const toggleReceiver = (id: string) => {
    setReceivers(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const filteredContacts = mockContacts.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Tạo Preview HTML
  const generatePreviewHTML = (template: DocumentTemplate, data: Record<string, string>) => {
    let html = template.templateContent;

    template.fields.forEach(field => {
      // Dùng Regex thay thế tất cả placeholder {{field.id}}
      const regex = new RegExp(`{{${field.id}}}`, "g");
      const value = data[field.id];

      if (value && value.trim() !== "") {
        // Nổi bật giá trị được điền bằng màu text xanh đậm
        html = html.replace(regex, `<span style="color: #0052cc; font-weight: bold;">${value}</span>`);
      } else {
        // Highlight màu vàng nếu chưa điền
        html = html.replace(regex, `<span style="background-color: #fef08a; padding: 0 4px; border-radius: 2px; color: #854d0e; font-style: italic;">[${field.label}]</span>`);
      }
    });

    return html;
  };

  const previewContent = useMemo(() => {
    return generatePreviewHTML(selectedTemplate, formData);
  }, [selectedTemplate, formData]);

  const handleSendDocument = () => {
    if (receivers.length === 0) {
      alert("Vui lòng chọn người nhận trước khi gửi!");
      return;
    }
    console.log("Chuẩn bị gửi đơn:", selectedTemplate.name);
    console.log("Data:", formData);
    console.log("Gửi tới:", receivers);
    alert(`Đã gửi đơn "${selectedTemplate.name}" thành công cho ${receivers.length} người!`);
  };

  return (
    <>
      <div className="flex h-screen bg-[#1e1f22] overflow-hidden text-white font-sans">
        <PrimarySidebar activeTab="tools" />

        {/* Cột trái: Form cấu hình (40%) */}
        <div className="w-[40%] flex flex-col border-r border-[#2b2d31] bg-[#1e1f22] z-10 shadow-[4px_0_24px_rgba(0,0,0,0.2)]">
          <div className="flex items-center gap-3 px-6 py-5 border-b border-[#2b2d31]">
            <div className="w-10 h-10 bg-[#0052cc]/20 text-[#0052cc] rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-[18px] font-bold text-white tracking-tight">Điền đơn tự động</h1>
              <p className="text-[13px] text-[#a1a1a1]">Tạo văn bản nhanh từ Form mẫu</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-6">
            {/* Chọn Mẫu đơn */}
            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-medium text-[#e1e1e1]">Chọn mẫu đơn từ</label>
              <select
                value={selectedTemplateId}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="w-full bg-[#131416] border border-[#2b2d31] rounded-lg px-4 py-3 text-[14px] text-white outline-none focus:border-[#0052cc] transition-colors appearance-none cursor-pointer"
              >
                {mockTemplates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            
            {/* Gửi cho ai */}
            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-medium text-[#e1e1e1]">Gửi cho ai <span className="text-red-500">*</span></label>
              <div 
                onClick={() => setIsSelectingReceiver(true)}
                className="w-full min-h-[46px] bg-[#131416] border border-[#2b2d31] hover:border-[#0052cc] rounded-lg p-2 cursor-pointer flex flex-wrap gap-2 items-center transition-colors"
              >
                {receivers.map(id => {
                   const c = mockContacts.find(x => x.id === id);
                   if (!c) return null;
                   return (
                     <div key={id} className="flex items-center gap-1.5 bg-[#1e1f22] border border-[#2b2d31] rounded-full px-2 py-1" onClick={e => e.stopPropagation()}>
                       <img src={c.avatar} className="w-5 h-5 rounded-full" />
                       <span className="text-[12px] text-[#e1e1e1]">{c.name}</span>
                       <X className="w-3 h-3 text-[#a1a1a1] hover:text-white cursor-pointer ml-1" onClick={() => toggleReceiver(id)} />
                     </div>
                   )
                })}
                {receivers.length === 0 && (
                   <span className="text-[13px] text-[#a1a1a1] px-2">Chọn người nhận...</span>
                )}
                <div className="text-[13px] text-[#a1a1a1] flex items-center gap-2 px-2 hover:text-white transition-colors ml-auto">
                  <UserPlus className="w-4 h-4" /> Thêm
                </div>
              </div>
            </div>

            <div className="h-px bg-[#2b2d31] w-full" />

            {/* Dynamic Form */}
            <div className="flex flex-col gap-5">
              <h2 className="text-[15px] font-semibold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0052cc]" />
                Nội dung đơn
              </h2>

              {selectedTemplate.fields.map(field => (
                <div key={field.id} className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-[#a1a1a1] ml-1">{field.label}</label>

                  {field.type === 'textarea' ? (
                    <textarea
                      value={formData[field.id] || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      rows={3}
                      className="w-full bg-[#131416] border border-[#2b2d31] rounded-lg px-4 py-3 text-[14px] text-white outline-none focus:border-[#0052cc] transition-colors resize-none custom-scrollbar"
                      placeholder={`Nhập ${field.label.toLowerCase()}...`}
                    />
                  ) : (
                    <input
                      type={field.type}
                      value={formData[field.id] || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      className="w-full bg-[#131416] border border-[#2b2d31] rounded-lg px-4 py-3 text-[14px] text-white outline-none focus:border-[#0052cc] transition-colors [&::-webkit-calendar-picker-indicator]:filter-invert"
                      placeholder={`Nhập ${field.label.toLowerCase()}...`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Nút Action Bottom */}
          <div className="p-6 border-t border-[#2b2d31] bg-[#1e1f22] flex gap-3">
            <button
              onClick={handleSendDocument}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#0052cc] hover:bg-[#0052cc]/90 text-white text-[14px] font-medium rounded-lg transition-colors shadow-md shadow-[#0052cc]/20"
            >
              <Send className="w-4 h-4" />
              <span>Gửi đơn</span>
            </button>
          </div>
        </div>

        {/* Cột phải: Preview A4 (60%) */}
        <div className="w-[60%] bg-[#e1e1e1] flex flex-col justify-between overflow-hidden relative">
          <div className="w-full p-3 bg-[#cfcfcf] border-b border-[#c0c0c0] flex items-center justify-center shadow-inner z-10 shrink-0">
            <span className="text-[13px] font-medium text-[#555] uppercase tracking-wider">Chế độ xem trước (Real-time Preview)</span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-8 flex justify-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
            {/* Tờ giấy A4 mô phỏng (chuẩn aspect ratio: 1/1.414 ~ 794x1123 px at 96PPI) */}
            <div
              className="bg-white w-full max-w-[794px] min-h-[1123px] shadow-[0_10px_40px_rgba(0,0,0,0.15)] mx-auto p-[60px] text-black border border-[#d1d1d1]"
              dangerouslySetInnerHTML={{ __html: previewContent }}
            />
          </div>
        </div>
      </div>
      
      {/* Nested Modal: Bảng Chọn Người Nhận */}
      {isSelectingReceiver && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-[650px] bg-[#1e1f22] rounded-xl border border-[#2b2d31] shadow-2xl flex flex-col animate-in slide-in-from-bottom-4 duration-200">
            
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#2b2d31]">
              <h2 className="text-[16px] font-semibold text-white">Chọn người nhận đơn</h2>
              <button onClick={() => setIsSelectingReceiver(false)} className="text-[#a1a1a1] hover:text-white p-1 rounded-md hover:bg-[#2b2d31] transition-colors"><X className="w-5 h-5"/></button>
            </div>

            <div className="flex h-[300px] bg-[#131416]">
              {/* Bên trái: Danh sách chọn */}
              <div className="flex-1 flex flex-col border-r border-[#2b2d31]">
                <div className="p-3 border-b border-[#2b2d31] relative">
                  <Search className="w-4 h-4 text-[#a1a1a1] absolute left-5 top-1/2 -translate-y-1/2" />
                  <input 
                    placeholder="Tìm quản lý / nhân viên..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent outline-none text-[13px] text-[#e1e1e1] pl-8 pr-2 py-1"
                  />
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 flex flex-col gap-1">
                  {filteredContacts.map(c => {
                    const isSelected = receivers.includes(c.id);
                    return (
                      <div key={c.id} onClick={() => toggleReceiver(c.id)} className="flex items-center gap-3 p-2 hover:bg-[#1e1f22] rounded-md cursor-pointer transition-colors group">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${isSelected ? 'bg-[#0052cc] border-[#0052cc]' : 'border-[#a1a1a1] group-hover:border-white'}`}>
                            {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                        </div>
                        <img src={c.avatar} className="w-8 h-8 rounded-full bg-[#2b2d31]" />
                        <span className="text-[14px] text-[#e1e1e1] group-hover:text-white transition-colors">{c.name}</span>
                      </div>
                    )
                  })}
                  {filteredContacts.length === 0 && (
                    <div className="text-center text-[13px] text-[#a1a1a1] mt-6">Không tìm thấy người dùng</div>
                  )}
                </div>
              </div>

              {/* Bên phải: Danh sách đã chọn */}
              <div className="w-[45%] flex flex-col bg-[#1e1f22]/30">
                 <div className="p-4 text-[13px] font-medium text-[#e1e1e1] border-b border-[#2b2d31]">
                   Đã chọn: <span className="text-[#0052cc]">{receivers.length}</span>
                 </div>
                 <div className="flex-1 overflow-y-auto custom-scrollbar p-3 flex flex-wrap gap-2 content-start">
                   {receivers.map(id => {
                     const c = mockContacts.find(x => x.id === id);
                     if (!c) return null;
                     return (
                       <div key={id} className="flex items-center gap-1.5 bg-[#1e1f22] hover:bg-[#2b2d31] border border-[#2b2d31] rounded-full pl-2 pr-1.5 py-1.5 transition-colors">
                         <img src={c.avatar} className="w-5 h-5 rounded-full" />
                         <span className="text-[12px] text-[#e1e1e1] truncate max-w-[90px]">{c.name}</span>
                         <div onClick={() => toggleReceiver(id)} className="p-0.5 hover:bg-black/30 rounded-full cursor-pointer ml-1">
                           <X className="w-3 h-3 text-[#a1a1a1] hover:text-red-400" />
                         </div>
                       </div>
                     )
                   })}
                 </div>
              </div>
            </div>

            <div className="flex items-center justify-end px-5 py-3 border-t border-[#2b2d31] bg-[#1e1f22]">
              <button 
                onClick={() => setIsSelectingReceiver(false)} 
                className="px-5 py-2 text-[14px] font-medium bg-[#0052cc] hover:bg-[#0052cc]/90 text-white rounded-md transition-colors shadow-sm"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
