import { useState, useEffect } from "react"
import { ChevronLeft, MoreHorizontal, UserPlus, Crown, ShieldAlert, Check, X } from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"
import { useChatStore } from "@/store/useChatStore"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { toast } from "react-hot-toast"

interface MembersPanelProps {
  chat: any;
  onBack: () => void;
  onAddMember: () => void;
}

export function MembersPanel({ chat, onBack, onAddMember }: MembersPanelProps) {
  const { authUser } = useAuthStore()
  const { removeGroupMember, leaveGroup, setActiveTab, addGroupAdmin, removeGroupAdmin, transferGroupOwner, getPendingMembers, approveMember, rejectMember } = useChatStore()
  const [panelTab, setPanelTab] = useState<"members" | "pending">("members")
  const [pendingMembersList, setPendingMembersList] = useState<any[]>([])

  if (!chat || !chat.isGroup) return null;

  const members = chat.members || []
  const creatorId = typeof chat.createdBy === "string" ? chat.createdBy : chat.createdBy?._id
  const adminIds = (chat.admins || []).map((admin: any) => typeof admin === "string" ? admin : admin._id)

  const currentUserIsCreator = authUser?._id === creatorId
  const currentUserIsAdmin = adminIds.includes(authUser?._id)
  const currentUserIsManager = currentUserIsCreator || currentUserIsAdmin

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

  const handleAddAdmin = async (userId: string) => {
    try {
      await addGroupAdmin(chat._id, userId);
    } catch (error) {
      console.error("Failed to add admin", error);
    }
  }

  const handleRemoveAdmin = async (userId: string) => {
    try {
      await removeGroupAdmin(chat._id, userId);
    } catch (error) {
      console.error("Failed to remove admin", error);
    }
  }

  const handleTransferOwner = async (userId: string) => {
    try {
      await transferGroupOwner(chat._id, userId);
    } catch (error) {
      console.error("Failed to transfer owner", error);
    }
  }

  useEffect(() => {
    if (panelTab === "pending" && currentUserIsManager) {
      getPendingMembers(chat._id).then(setPendingMembersList).catch(console.error);
    }
  }, [panelTab, chat._id, currentUserIsManager]);

  const handleApprove = async (userId: string) => {
    try {
      await approveMember(chat._id, userId);
      setPendingMembersList(prev => prev.filter(m => m._id !== userId));
      toast.success("Đã duyệt thành viên");
    } catch (e) { }
  }

  const handleReject = async (userId: string) => {
    try {
      await rejectMember(chat._id, userId);
      setPendingMembersList(prev => prev.filter(m => m._id !== userId));
      toast.success("Đã từ chối thành viên");
    } catch (e) { }
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
        <span className="flex-1 text-center font-bold">Thành viên</span>
        <div className="w-7"></div> {/* Spacer to center the text */}
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar" style={{ background: 'var(--chat-bg-sidebar)' }}>
        {/* Thêm thành viên button */}
        {currentUserIsManager && (
          <div className="p-4">
            <button
              onClick={onAddMember}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-chat-hover hover:bg-chat-active/30 transition-colors py-2.5 text-[14px] font-semibold text-chat-text"
            >
              <UserPlus className="h-4 w-4" />
              Thêm thành viên
            </button>
          </div>
        )}

        {currentUserIsManager && chat.settings?.joinApprovalMode && (
          <div className="flex border-b border-chat-border">
            <button
              className={`flex-1 py-3 text-[13px] font-semibold transition-colors ${panelTab === "members" ? "text-chat-text border-b-2 border-[#1877F2]" : "text-chat-muted hover:text-chat-text"}`}
              onClick={() => setPanelTab("members")}
            >
              Thành viên
            </button>
            <button
              className={`flex-1 py-3 text-[13px] font-semibold transition-colors ${panelTab === "pending" ? "text-chat-text border-b-2 border-[#1877F2]" : "text-chat-muted hover:text-chat-text"}`}
              onClick={() => setPanelTab("pending")}
            >
              Chờ duyệt {pendingMembersList.length > 0 && <span className="ml-1 bg-red-500 text-white px-1.5 rounded-full text-[10px]">{pendingMembersList.length}</span>}
            </button>
          </div>
        )}

        {/* Danh sách thành viên */}
        {panelTab === "members" ? (
          <>
            <div className={`flex items-center justify-between px-4 pb-2 pt-4`}>
              <span className="text-[14px] font-bold text-chat-text">Danh sách ({members.length})</span>
              <button className="text-chat-muted hover:text-chat-text transition-colors">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col">
              {members.map((member: any) => {
                const memberId = typeof member === "string" ? member : member._id
                const isTargetCreator = memberId?.toString() === creatorId?.toString()
                const isTargetAdmin = adminIds.includes(memberId?.toString())
                const isMe = memberId?.toString() === authUser?._id?.toString()
                const memberPic = member.profilePicture || "/avatar.png"

                let memberName = member.fullname || memberId
                if (isMe) {
                  memberName = "Bạn"
                }

                // Determine if current user can interact with target user
                let canShowDropdown = false;
                if (isMe && !isTargetCreator) {
                  canShowDropdown = true; // Can leave group, but creator cannot leave unless they transfer
                } else if (!isMe) {
                  if (currentUserIsCreator) {
                    canShowDropdown = true; // Creator can do anything to others
                  } else if (currentUserIsAdmin && !isTargetCreator && !isTargetAdmin) {
                    canShowDropdown = true; // Admin can remove normal members
                  }
                }

                return (
                  <div key={memberId} className="flex items-center justify-between px-4 py-2 hover:bg-chat-hover transition-colors group">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="relative">
                        <img src={memberPic} className="w-10 h-10 rounded-full object-cover border border-chat-border" alt="" />
                        {isTargetCreator && (
                          <div className="absolute -bottom-1 -right-1 bg-[#ebaa16] text-[#1e1f22] p-0.5 rounded-full border-2 border-chat-sidebar" title="Trưởng nhóm">
                            <Crown className="w-2.5 h-2.5" strokeWidth={3} />
                          </div>
                        )}
                        {isTargetAdmin && !isTargetCreator && (
                          <div className="absolute -bottom-1 -right-1 bg-[#1877F2] text-white p-0.5 rounded-full border-2 border-chat-sidebar" title="Phó nhóm">
                            <ShieldAlert className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col">
                        <span className="text-[14px] font-medium truncate text-chat-text">{memberName}</span>
                        {isTargetCreator && <span className="text-[12px] text-chat-muted">Trưởng nhóm</span>}
                        {isTargetAdmin && !isTargetCreator && <span className="text-[12px] text-chat-muted">Phó nhóm</span>}
                      </div>
                    </div>

                    {canShowDropdown && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-chat-hover rounded-md text-chat-muted transition-all focus:opacity-100 data-[state=open]:opacity-100">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 border shadow-md" style={{ background: 'var(--chat-dropdown-bg)', borderColor: 'var(--chat-border)', color: 'var(--chat-text-main)' }}>
                          {isMe ? (
                            <DropdownMenuItem
                              onClick={handleLeaveGroup}
                              className="cursor-pointer hover:bg-chat-hover focus:bg-chat-hover text-red-400 focus:text-red-400"
                            >
                              Rời nhóm
                            </DropdownMenuItem>
                          ) : (
                            <>
                              {currentUserIsCreator && (
                                <>
                                  {!isTargetAdmin ? (
                                    <DropdownMenuItem onClick={() => handleAddAdmin(memberId)} className="cursor-pointer hover:bg-chat-hover focus:bg-chat-hover">
                                      Chỉ định phó nhóm
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem onClick={() => handleRemoveAdmin(memberId)} className="cursor-pointer hover:bg-chat-hover focus:bg-chat-hover text-[#ebaa16] focus:text-[#ebaa16]">
                                      Thu hồi phó nhóm
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem onClick={() => handleTransferOwner(memberId)} className="cursor-pointer hover:bg-chat-hover focus:bg-chat-hover">
                                    Chuyển quyền trưởng nhóm
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-chat-border" />
                                </>
                              )}

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
                    )}
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <div className="flex flex-col pt-2">
            {pendingMembersList.length === 0 ? (
              <div className="p-4 text-center text-[#a1a1a1] text-[13px]">Không có yêu cầu tham gia nào</div>
            ) : (
              pendingMembersList.map((member: any) => (
                <div key={member._id} className="flex items-center justify-between px-4 py-3 hover:bg-[#2b2d31] transition-colors border-b border-[#2b2d31]/50">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <img src={member.profilePicture || "/avatar.png"} className="w-10 h-10 rounded-full object-cover" alt="" />
                    <div className="flex-1 min-w-0 flex flex-col">
                      <span className="text-[14px] font-medium truncate text-[#e1e1e1]">{member.fullname}</span>
                      <span className="text-[12px] text-[#a1a1a1] truncate">{member.email}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleApprove(member._id)} className="p-1.5 bg-[#1877F2]/20 hover:bg-[#1877F2]/30 text-[#1877F2] rounded-md transition-colors" title="Phê duyệt">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleReject(member._id)} className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-md transition-colors" title="Từ chối">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
