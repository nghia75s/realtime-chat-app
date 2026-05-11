import { useState, useMemo } from "react";
import { PrimarySidebar } from "../cchat/sidebar/PrimarySidebar";
import { useAuthStore } from "@/store/useAuthStore";
import { mockDepartments, mockUsers } from "../admin/data";
import { mockDocs, type DocCategory } from "./data";
import { Folder, Image as ImageIcon, Link as LinkIcon, FileText, File, Download, ExternalLink, ChevronLeft, Search } from "lucide-react";

export default function DocumentPage() {
  const { authUser } = useAuthStore();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<DocCategory | null>(null);

  // Giả lập logic kiểm tra Trưởng Phòng:
  // Nếu là tài khoản Nguyễn Văn A (mock ID: u2) đăng nhập, mà u2 ko phải trưởng phòng thì ko cho xem?
  // Ở đây ta mô phỏng: lấy bộ phận của authUser (giả sử authUser là u1 hoặc u3 - là trưởng phòng)
  // Tạm hardcode manager là người đang đăng nhập (hoặc dùng admin@gmail.com làm ví dụ xem hết được)
  const isGlobalAdmin = authUser?.email === "admin@gmail.com";

  // Xác định department mà manager này quản lý
  const managedDept = useMemo(() => {
    if (isGlobalAdmin) return mockDepartments[0]; // Admin xem tạm phòng Kỹ thuật
    return mockDepartments.find(d => mockUsers.find(u => u.email === authUser?.email)?.id === d.managerId);
  }, [authUser, isGlobalAdmin]);

  // Lấy nhân viên thuộc phòng ban đó
  const departmentEmployees = useMemo(() => {
    if (!managedDept) return [];
    return mockUsers.filter(u => u.departmentId === managedDept.id);
  }, [managedDept]);

  const selectedUser = departmentEmployees.find(u => u.id === selectedUserId);
  const userDocs = mockDocs.filter(d => d.userId === selectedUserId && (!activeCategory || d.category === activeCategory));

  if (!isGlobalAdmin && !managedDept) {
    return (
      <div className="flex h-screen w-screen overflow-hidden bg-[#131416] text-[#e1e1e1] font-sans">
        <PrimarySidebar activeTab="cloud" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8 max-w-md bg-[#1e1f22] rounded-xl border border-[#2b2d31]">
            <Folder className="w-16 h-16 text-[#a1a1a1] mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Không có quyền truy cập</h2>
            <p className="text-[#a1a1a1]">Chỉ Trưởng phòng mới có thể quản lý tài liệu và đơn từ của nhân sự trong bộ phận.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#131416] text-[#e1e1e1] font-sans">
      <PrimarySidebar activeTab="cloud" />

      {/* Sidebar nhân sự */}
      <div className="w-[300px] bg-[#1e1f22] border-r border-[#2b2d31] flex flex-col shrink-0 z-10">
        <div className="p-4 border-b border-[#2b2d31] shrink-0">
          <h2 className="text-lg font-bold text-white">Quản lý Tài liệu</h2>
          <p className="text-[13px] text-[#a1a1a1] mt-0.5">{managedDept?.name}</p>
        </div>

        <div className="p-3 border-b border-[#2b2d31]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a1a1a1]" />
            <input
              type="text"
              placeholder="Tìm nhân viên..."
              className="w-full bg-[#131416] border border-[#2b2d31] rounded-md pl-9 pr-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#0052cc]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {departmentEmployees.map((emp) => (
            <button
              key={emp.id}
              onClick={() => {
                setSelectedUserId(emp.id);
                setActiveCategory(null);
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-md transition-colors ${selectedUserId === emp.id ? "bg-[#0052cc]/10 text-white" : "hover:bg-[#2b2d31]/50 text-[#e1e1e1]"
                }`}
            >
              <img src={emp.avatar} alt={emp.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
              <div className="text-left flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{emp.name}</p>
                <p className="text-[12px] text-[#a1a1a1] truncate">{emp.email}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col relative bg-[#131416]">
        {!selectedUser ? (
          <div className="flex-1 flex items-center justify-center text-[#a1a1a1]">
            <div className="text-center">
              <Folder className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Chọn một nhân viên bên trái để xem tài liệu & đơn từ.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="h-[60px] border-b border-[#2b2d31] flex items-center px-6 shrink-0 bg-[#1e1f22]/50 backdrop-blur-md">
              {activeCategory ? (
                <button
                  onClick={() => setActiveCategory(null)}
                  className="flex items-center gap-2 text-[#a1a1a1] hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span className="font-medium">Quay lại danh mục</span>
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <img src={selectedUser.avatar} alt={selectedUser.name} className="w-8 h-8 rounded-full object-cover" />
                  <div>
                    <h2 className="font-bold text-white text-sm">{selectedUser.name}</h2>
                    <p className="text-xs text-[#a1a1a1]">Kho tài liệu cá nhân</p>
                  </div>
                </div>
              )}
            </div>

            {/* Content body */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {!activeCategory ? (
                // 4 Thư mục
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  <button onClick={() => setActiveCategory("files")} className="bg-[#1e1f22] border border-[#2b2d31] p-6 rounded-xl hover:border-[#0052cc] hover:bg-[#0052cc]/5 transition-all text-left group">
                    <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Folder className="w-7 h-7 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">Tệp tin (Files)</h3>
                    <p className="text-sm text-[#a1a1a1]">Văn bản, tài liệu Word, Excel, PDF</p>
                  </button>

                  <button onClick={() => setActiveCategory("images")} className="bg-[#1e1f22] border border-[#2b2d31] p-6 rounded-xl hover:border-purple-500 hover:bg-purple-500/5 transition-all text-left group">
                    <div className="w-14 h-14 rounded-full bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <ImageIcon className="w-7 h-7 text-purple-500" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">Hình ảnh (Images)</h3>
                    <p className="text-sm text-[#a1a1a1]">Ảnh mockup, banner, thiết kế</p>
                  </button>

                  <button onClick={() => setActiveCategory("links")} className="bg-[#1e1f22] border border-[#2b2d31] p-6 rounded-xl hover:border-green-500 hover:bg-green-500/5 transition-all text-left group">
                    <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <LinkIcon className="w-7 h-7 text-green-500" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">Liên kết (Links)</h3>
                    <p className="text-sm text-[#a1a1a1]">Figma, Google Drive, Github</p>
                  </button>

                  <button onClick={() => setActiveCategory("forms")} className="bg-[#1e1f22] border border-[#2b2d31] p-6 rounded-xl hover:border-orange-500 hover:bg-orange-500/5 transition-all text-left group">
                    <div className="w-14 h-14 rounded-full bg-orange-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <FileText className="w-7 h-7 text-orange-500" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">Đơn từ (Forms)</h3>
                    <p className="text-sm text-[#a1a1a1]">Đơn xin nghỉ phép, thanh toán, v.v.</p>
                  </button>
                </div>
              ) : (
                // Chi tiết danh sách bên trong thư mục
                <div className="max-w-4xl mx-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white capitalize flex items-center gap-3">
                      {activeCategory === "files" && <Folder className="w-6 h-6 text-blue-500" />}
                      {activeCategory === "images" && <ImageIcon className="w-6 h-6 text-purple-500" />}
                      {activeCategory === "links" && <LinkIcon className="w-6 h-6 text-green-500" />}
                      {activeCategory === "forms" && <FileText className="w-6 h-6 text-orange-500" />}
                      {activeCategory === "files" ? "Tệp tin" : activeCategory === "images" ? "Hình ảnh" : activeCategory === "links" ? "Liên kết" : "Đơn từ"}
                    </h2>
                  </div>

                  <div className="bg-[#1e1f22] border border-[#2b2d31] rounded-xl overflow-hidden shadow-sm">
                    {userDocs.length === 0 ? (
                      <div className="p-12 text-center text-[#a1a1a1]">
                        Thư mục này hiện đang trống.
                      </div>
                    ) : (
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#2b2d31]/30 border-b border-[#2b2d31]">
                            <th className="px-4 py-3 text-sm font-semibold text-[#a1a1a1]">Tên tài liệu</th>
                            <th className="px-4 py-3 text-sm font-semibold text-[#a1a1a1] w-[150px]">Ngày tạo</th>
                            <th className="px-4 py-3 text-sm font-semibold text-[#a1a1a1] w-[150px]">
                              {activeCategory === "forms" ? "Trạng thái" : "Kích thước"}
                            </th>
                            <th className="px-4 py-3 text-sm font-semibold text-[#a1a1a1] w-[80px]"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2b2d31]">
                          {userDocs.map(doc => (
                            <tr key={doc.id} className="hover:bg-[#2b2d31]/30 transition-colors group">
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-3">
                                  <File className="w-5 h-5 text-[#a1a1a1]" />
                                  <span className="font-medium text-[#e1e1e1]">{doc.name}</span>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-sm text-[#a1a1a1]">{doc.date}</td>
                              <td className="px-4 py-4 text-sm">
                                {activeCategory === "forms" ? (
                                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${doc.status === "approved" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                      doc.status === "rejected" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                        "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                    }`}>
                                    {doc.status === "approved" ? "Đã duyệt" : doc.status === "rejected" ? "Từ chối" : "Đang chờ"}
                                  </span>
                                ) : (
                                  <span className="text-[#a1a1a1]">{doc.size || "-"}</span>
                                )}
                              </td>
                              <td className="px-4 py-4 text-right">
                                {activeCategory === "links" ? (
                                  <a href={doc.url} target="_blank" rel="noreferrer" className="inline-flex p-2 text-[#a1a1a1] hover:text-[#0052cc] transition-colors rounded">
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                ) : (
                                  <button className="p-2 text-[#a1a1a1] hover:text-[#0052cc] transition-colors rounded">
                                    <Download className="w-4 h-4" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
