import { useState } from "react"
import { ChevronLeft, MoreHorizontal, UserPlus, Crown, LogOut, UserMinus } from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"
import { useChatStore } from "@/store/useChatStore"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface MembersPanelProps {
  chat: any;
  onBack: () => void;
  onAddMember: () => void;
}

export function MembersPanel({ chat, onBack, onAddMember }: MembersPanelProps) {
  const { authUser } = useAuthStore()
  const { removeGroupMember, leaveGroup, setActiveTab } = useChatStore()
  
  if (!chat || !chat.isGroup) return null;

  const members = chat.members || []
  const creatorId = typeof chat.createdBy === "string" ? chat.createdBy : chat.createdBy?._id

  const handleRemoveMember = async (userId: string) => {
    try {
      await removeGroupMember(chat._id, userId);
    } catch (error) {
      console.error("Failed to remove member", error);
    }
  }

  const handleLeaveGroup = async () => {
    if (!authUser) return;
    try {
      await removeGroupMember(chat._id, authUser._id);
      leaveGroup(chat._id); // This will emit the socket event
      setActiveTab("personal"); // Switch away from the group
    } catch (error) {
      console.error("Failed to leave group", error);
    }
  }

  return (
    <div className="flex w-[340px] shrink-0 flex-col bg-[#1e1f22] border-l border-[#2b2d31] h-full overflow-hidden text-[#e1e1e1]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#2b2d31] px-4 py-[14px] shrink-0 font-medium text-[16px] text-white shadow-sm z-10 bg-[#1e1f22]">
        <button 
          onClick={onBack}
          className="p-1 -ml-1 hover:bg-[#2b2d31] rounded text-[#a1a1a1] transition-colors shrink-0"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="flex-1 text-center font-bold">Thành viên</span>
        <div className="w-7"></div> {/* Spacer to center the text */}
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar bg-[#1e1f22]">
        {/* Thêm thành viên button */}
        <div className="p-4">
          <button 
            onClick={onAddMember}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-[#2b2d31] hover:bg-[#3f4147] transition-colors py-2.5 text-[14px] font-semibold text-[#e1e1e1]"
          >
            <UserPlus className="h-4 w-4" />
            Thêm thành viên
          </button>
        </div>

        {/* Danh sách thành viên */}
        <div className="flex items-center justify-between px-4 pb-2">
          <span className="text-[14px] font-bold text-[#e1e1e1]">Danh sách thành viên ({members.length})</span>
          <button className="text-[#a1a1a1] hover:text-white transition-colors">
             <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col">
          {members.map((member: any) => {
            const memberId = typeof member === "string" ? member : member._id
            const isCreator = memberId?.toString() === creatorId?.toString()
            const isMe = memberId?.toString() === authUser?._id?.toString()
            const memberPic = member.profilePicture || "/avatar.png"
            
            let memberName = member.fullname || memberId
            if (isMe) {
               memberName = "Bạn"
            }

            return (
              <div key={memberId} className="flex items-center justify-between px-4 py-2 hover:bg-[#2b2d31] transition-colors group">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="relative">
                    <img src={memberPic} className="w-10 h-10 rounded-full object-cover border border-[#2b2d31]" alt="" />
                    {isCreator && (
                      <div className="absolute -bottom-1 -right-1 bg-[#ebaa16] text-[#1e1f22] p-0.5 rounded-full border-2 border-[#1e1f22]">
                        <Crown className="w-2.5 h-2.5" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <span className="text-[14px] font-medium truncate text-[#e1e1e1]">{memberName}</span>
                    {isCreator && <span className="text-[12px] text-[#a1a1a1]">Trưởng nhóm</span>}
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-[#3f4147] rounded-md text-[#a1a1a1] transition-all focus:opacity-100 data-[state=open]:opacity-100">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-[#2b2d31] border-[#3f4147] text-[#e1e1e1] shadow-md">
                    {isMe ? (
                      <DropdownMenuItem 
                        onClick={handleLeaveGroup}
                        className="cursor-pointer hover:bg-[#3f4147] focus:bg-[#3f4147] text-red-400 focus:text-red-400"
                      >
                        Rời nhóm
                      </DropdownMenuItem>
                    ) : (
                      <>
                        <DropdownMenuItem className="cursor-pointer hover:bg-[#3f4147] focus:bg-[#3f4147]">
                          Thêm phó nhóm
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleRemoveMember(memberId)}
                          className="cursor-pointer text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-400"
                        >
                          Xóa khỏi nhóm
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
