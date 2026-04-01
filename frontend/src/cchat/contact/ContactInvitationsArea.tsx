import { UserCog, MessageCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function ContactInvitationsArea() {
  return (
    <div className="flex flex-1 flex-col bg-white">
      {/* Header */}
      <div className="flex h-[68px] items-center border-b border-zinc-200 px-6 shadow-sm z-10 shrink-0 bg-white sticky top-0">
        <div className="flex items-center gap-3 w-full">
          <UserCog className="h-[24px] w-[24px] text-zinc-700" strokeWidth={1.5} />
          <h2 className="text-[16px] font-bold text-zinc-900">Lời mời vào nhóm</h2>
        </div>
      </div>

      <div className="flex flex-col flex-1 overflow-y-auto bg-[#F3F4F6] min-h-0 custom-scrollbar pb-10">
        
        {/* Section 1: Lời mời đã nhận */}
        <div className="flex flex-col px-6 pt-6 pb-4">
          <h3 className="text-[15px] font-semibold text-zinc-800 mb-4 tracking-wide">Lời mời đã nhận (1)</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Card Nhận */}
            <div className="flex flex-col bg-white border border-zinc-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
               <div className="flex items-start justify-between mb-4">
                 <div className="flex items-center gap-3">
                   <Avatar className="h-[48px] w-[48px] border border-zinc-100">
                     <AvatarImage src="https://i.pravatar.cc/150?u=lhd" className="object-cover" />
                     <AvatarFallback>LĐ</AvatarFallback>
                   </Avatar>
                   <div className="flex flex-col">
                     <span className="text-[15px] font-bold text-zinc-900 mb-[2px]">Dự án Zalo Clone</span>
                     <span className="text-[13px] text-zinc-500">Người mời: Lê Hữu Đại - Team Dev</span>
                   </div>
                 </div>
                 <button className="text-zinc-500 p-1.5 hover:bg-zinc-100 rounded-full transition-colors">
                   <MessageCircle className="h-[18px] w-[18px]" strokeWidth={1.5} />
                 </button>
               </div>
               
               {/* Tin nhắn kèm theo */}
               <div className="bg-[#eaedf0] rounded-md p-3 mb-4 text-[14px] text-zinc-700 leading-relaxed border border-zinc-200/50">
                 Cho em add anh vào nhóm dự án Zalo Clone để bàn số liệu được không ạ.
               </div>
               
               {/* Buttons */}
               <div className="flex items-center gap-3 mt-auto">
                 <button className="flex-1 py-1.5 rounded-md bg-[#eaedf0] text-zinc-700 text-[14px] font-medium hover:bg-zinc-200 transition-colors border border-zinc-200/80">
                   Từ chối
                 </button>
                 <button className="flex-1 py-1.5 rounded-md bg-[#e5efff] text-[#005AE0] text-[14px] font-bold hover:bg-blue-100 transition-colors">
                   Đồng ý
                 </button>
               </div>
            </div>

          </div>
        </div>

        {/* Divider */}
        <div className="h-[1px] bg-zinc-200/80 mx-6 my-2"></div>

        {/* Section 2: Lời mời đã gửi */}
        <div className="flex flex-col px-6 pt-4">
          <h3 className="text-[15px] font-semibold text-zinc-800 mb-4 tracking-wide">Lời mời đã gửi (25)</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            
            {/* Card Gửi 1 */}
            <div className="flex flex-col bg-white border border-zinc-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow h-full justify-between">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-[46px] w-[46px] border border-zinc-100">
                      <AvatarImage src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=150" className="object-cover" />
                      <AvatarFallback>LA</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col line-clamp-1">
                      <span className="text-[15px] font-bold text-zinc-900 mb-[2px] truncate">Team Design Master</span>
                      <span className="text-[12px] text-zinc-500">Bạn đã mời Lã Anh</span>
                    </div>
                  </div>
                  <button className="text-zinc-500 p-1 hover:bg-zinc-100 rounded-full transition-colors shrink-0">
                    <MessageCircle className="h-[18px] w-[18px]" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
              <button className="w-full mt-3 py-1.5 rounded-md bg-[#eaedf0] text-zinc-700 text-[14px] font-medium hover:bg-zinc-200 transition-colors border border-zinc-200/80">
                Thu hồi lời mời
              </button>
            </div>

            {/* Card Gửi 2 */}
            <div className="flex flex-col bg-white border border-zinc-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow h-full justify-between">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-[46px] w-[46px] border border-zinc-100">
                       <AvatarFallback className="bg-orange-100 text-orange-600 font-bold">ĐVP</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col line-clamp-1">
                      <span className="text-[15px] font-bold text-zinc-900 mb-[2px] truncate">ĐVP Market</span>
                      <span className="text-[12px] text-zinc-500">Bạn đã mời Vân Anh</span>
                    </div>
                  </div>
                  <button className="text-zinc-500 p-1 hover:bg-zinc-100 rounded-full transition-colors shrink-0">
                    <MessageCircle className="h-[18px] w-[18px]" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
              <button className="w-full mt-3 py-1.5 rounded-md bg-[#eaedf0] text-zinc-700 text-[14px] font-medium hover:bg-zinc-200 transition-colors border border-zinc-200/80">
                Thu hồi lời mời
              </button>
            </div>

            {/* Card Gửi 3 */}
            <div className="flex flex-col bg-white border border-zinc-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow h-full justify-between">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-[46px] w-[46px] border border-zinc-100">
                      <AvatarImage src="https://i.pravatar.cc/150?u=nxq" className="object-cover" />
                      <AvatarFallback>NQ</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col line-clamp-1">
                      <span className="text-[15px] font-bold text-zinc-900 mb-[2px] truncate">Hội Dev Quê</span>
                      <span className="text-[12px] text-zinc-500">Bạn đã mời Xuan Quang</span>
                    </div>
                  </div>
                  <button className="text-zinc-500 p-1 hover:bg-zinc-100 rounded-full transition-colors shrink-0">
                    <MessageCircle className="h-[18px] w-[18px]" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
              <button className="w-full mt-3 py-1.5 rounded-md bg-[#eaedf0] text-zinc-700 text-[14px] font-medium hover:bg-zinc-200 transition-colors border border-zinc-200/80">
                Thu hồi lời mời
              </button>
            </div>

          </div>

          <div className="flex justify-center mt-6">
             <button className="px-6 py-2 rounded-md bg-white border border-zinc-300 text-[14px] font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors shadow-sm">
               Xem thêm
             </button>
          </div>
        </div>

      </div>
    </div>
  )
}
