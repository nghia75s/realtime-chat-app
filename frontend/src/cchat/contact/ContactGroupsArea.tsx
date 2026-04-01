import { Search, MoreHorizontal, ChevronDown, Users, ArrowDownUp, Filter } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const mockGroups = [
  { id: 1, name: "19h30 31/3 KIẾM TIỀN AFFILIATE SHOPEE - FACEBOOK", avatar: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=150", members: 657, type: "community" },
  { id: 2, name: "Đi leo núi", avatar: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=150", members: 3, type: "group" },
  { id: 3, name: "Thực Tập", avatar: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=150", members: 4, type: "group" },
  { id: 4, name: "Thực tập tốt nghiệp 2026_Đợt 1", fallback: "PV", members: 23, type: "community" },
  { id: 5, name: "KPM63ĐH", fallback: "ĐD", members: 71, type: "group" },
  { id: 6, name: "10. Khoá Học Sinh Viên [ Giá tốt - Chất lượng ]", avatar: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=150", members: 374, type: "community" },
  { id: 7, name: "Nguyễn Tiến Đạt, Đức, Đoàn Pt", avatar: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=150", members: 3, type: "group" },
  { id: 8, name: "LSD-TL", fallback: "NM", members: 5, type: "group" },
]

export function ContactGroupsArea() {
  return (
    <div className="flex flex-1 flex-col bg-white">
      {/* Header */}
      <div className="flex h-[68px] items-center border-b border-zinc-200 px-6 shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-3 w-full">
          <Users className="h-[24px] w-[24px] text-zinc-700" strokeWidth={1.5} />
          <h2 className="text-[16px] font-bold text-zinc-900">Nhóm và cộng đồng (39)</h2>
        </div>
      </div>

      <div className="flex flex-col flex-1 overflow-hidden bg-white min-h-0">
        {/* Filter Bar */}
        <div className="flex items-center gap-4 px-6 py-4 shrink-0">
          <div className="relative w-1/2 min-w-[300px]">
             <Search className="absolute left-2.5 top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-zinc-500" />
             <input
               placeholder="Tìm kiếm..."
               className="w-full rounded-md border border-zinc-200 bg-white py-1.5 pl-8 pr-3 text-[14px] text-zinc-900 outline-none placeholder:text-zinc-500 focus:border-[#005AE0] transition-colors"
             />
          </div>
          <button className="flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-[14px] text-zinc-700 hover:bg-zinc-50 transition-colors ml-auto">
            <ArrowDownUp className="h-[14px] w-[14px] text-zinc-500" />
            Hoạt động (mới → cũ)
            <ChevronDown className="h-4 w-4 text-zinc-500" />
          </button>
          <button className="flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-[14px] text-zinc-700 hover:bg-zinc-50 transition-colors">
            <Filter className="h-[14px] w-[14px] text-zinc-500" />
            Tất cả
            <ChevronDown className="h-4 w-4 text-zinc-500" />
          </button>
        </div>

        {/* Groups List */}
        <div className="flex-1 overflow-y-auto min-h-0 px-6 pb-6 w-full custom-scrollbar">
           <div className="flex flex-col w-full gap-[2px]">
               {mockGroups.map((group) => (
                 <div
                   key={group.id}
                   className="group flex items-center justify-between px-4 py-3 rounded-lg hover:bg-zinc-100/80 cursor-pointer transition-colors"
                 >
                   <div className="flex items-center gap-4 min-w-0 pr-4">
                     <Avatar className="h-[48px] w-[48px] border border-zinc-200/50 shrink-0">
                        {group.avatar && <AvatarImage src={group.avatar} className="object-cover" />}
                        <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">{group.fallback || "GR"}</AvatarFallback>
                     </Avatar>
                     <div className="flex flex-col truncate min-w-0 flex-1">
                        <span className="text-[15px] font-semibold text-zinc-900 truncate mb-[2px]">
                          {group.type === "community" && <span className="inline-block mr-1 text-[#005AE0]">👥</span>}
                          {group.type === "group" && <span className="inline-block mr-1 text-zinc-500">🧑‍🤝‍🧑</span>}
                          {group.name}
                        </span>
                        <span className="text-[13px] text-zinc-500">{group.members} thành viên</span>
                     </div>
                   </div>
                   
                   {/* Context Menu Button */}
                   <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                     <button className="p-1.5 rounded-md hover:bg-zinc-200 text-zinc-600 transition-colors">
                       <MoreHorizontal className="h-5 w-5" />
                     </button>
                   </div>
                 </div>
               ))}
           </div>
        </div>
      </div>
    </div>
  )
}
