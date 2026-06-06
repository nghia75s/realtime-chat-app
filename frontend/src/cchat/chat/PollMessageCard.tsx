import { useState } from "react";
import { BarChart2, Check, Clock, Plus, Users, ChevronDown, ChevronRight, Eye } from "lucide-react";
import { useChatStore } from "@/store/useChatStore";
import { useAuthStore } from "@/store/useAuthStore";
import { formatShortDate } from "@/lib/formatTime";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProfileModal } from "./modals/ProfileModal";

export function PollMessageCard({ message }: { message: any }) {
  const { authUser } = useAuthStore();
  const { votePoll, addPollOption } = useChatStore();
  const [newOption, setNewOption] = useState("");
  const [isAddingOption, setIsAddingOption] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [expandedOptionId, setExpandedOptionId] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);

  const payload = message.pollPayload;
  if (!payload) return null;

  const totalVotes = payload.options.reduce((acc: number, opt: any) => acc + opt.voters.length, 0);
  const isExpired = payload.deadline && new Date() > new Date(payload.deadline);

  const handleVote = (optionId: string) => {
    if (isExpired) return;

    const myCurrentVotes = payload.options.filter((opt: any) =>
      opt.voters.some((v: any) => (v._id || v) === authUser?._id)
    ).map((opt: any) => opt._id);

    let newVotes = [...myCurrentVotes];

    if (newVotes.includes(optionId)) {
      newVotes = newVotes.filter(id => id !== optionId);
    } else {
      if (payload.allowMultiple) {
        newVotes.push(optionId);
      } else {
        newVotes = [optionId];
      }
    }

    votePoll(message._id, newVotes);
  };

  const handleAddOption = () => {
    if (!newOption.trim()) return;
    addPollOption(message._id, newOption);
    setNewOption("");
    setIsAddingOption(false);
  };

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl border shadow-sm w-full" style={{ background: 'var(--chat-bg-sidebar)', borderColor: 'var(--chat-border)' }}>
      <div className="flex items-center gap-2 mb-1">
        <BarChart2 className="w-4 h-4 text-[#20a354]" />
        <span className="text-xs font-semibold uppercase text-[#20a354]">Bình chọn</span>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="font-bold text-[15px] text-chat-text mb-3">{payload.question}</h3>

        <div className="flex flex-col gap-2">
          {payload.options.map((opt: any) => {
            const votesCount = opt.voters.length;
            const percentage = totalVotes > 0 ? Math.round((votesCount / totalVotes) * 100) : 0;
            const hasVoted = opt.voters.some((v: any) => (v._id || v) === authUser?._id);

            return (
              <div
                key={opt._id}
                className={`relative flex items-center justify-between p-2.5 rounded-md cursor-pointer transition-colors border ${hasVoted ? 'border-[#1877F2]' : 'border-transparent bg-chat-hover hover:bg-chat-active/30'}`}
                onClick={() => handleVote(opt._id)}
              >
                {/* Progress bar background */}
                {votesCount > 0 && (
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-[#20a354]/20 rounded-md transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                )}

                <div className="flex items-center gap-3 relative z-10 w-full">
                  <div className={`w-4 h-4 shrink-0 rounded flex items-center justify-center border ${hasVoted ? 'bg-[#1877F2] border-[#1877F2]' : 'border-chat-border'}`}>
                    {hasVoted && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[14px] text-chat-text truncate block">{opt.text}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 pl-2">
                    <Users className="w-3.5 h-3.5 text-chat-muted" />
                    <span className="text-xs text-chat-muted font-medium">{votesCount}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions Section */}
        <div className="mt-3 flex flex-col items-start gap-3">
          <button
            onClick={() => setShowDetails(true)}
            className="flex items-center text-sm text-[#1877F2] hover:underline w-max"
          >
            Xem chi tiết
          </button>

          {payload.allowAddOptions && !isExpired && (
            <div>
              {isAddingOption ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newOption}
                    onChange={e => setNewOption(e.target.value)}
                    placeholder="Nhập phương án mới..."
                    className="flex-1 border rounded p-2 text-sm text-chat-text focus:ring-1 focus:ring-[#1877F2]"
                    style={{ background: 'var(--chat-bg-input)', borderColor: 'var(--chat-border)' }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddOption();
                    }}
                  />
                  <button
                    onClick={handleAddOption}
                    disabled={!newOption.trim()}
                    className="bg-[#1877F2] text-white p-2 rounded hover:bg-[#166fe5] disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingOption(true)}
                  className="flex items-center gap-1.5 text-sm text-[#1877F2] hover:underline"
                >
                  <Plus className="w-4 h-4" /> Thêm phương án
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t text-xs text-chat-muted" style={{ borderColor: 'var(--chat-border)' }}>
          <span>{totalVotes} lượt bình chọn</span>
          {payload.deadline && (
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{isExpired ? "Đã kết thúc" : `Hết hạn: ${formatShortDate(payload.deadline)}`}</span>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-[420px] p-0 overflow-hidden border shadow-2xl rounded-xl" style={{ background: 'var(--chat-bg-sidebar)', borderColor: 'var(--chat-border)', color: 'var(--chat-text)' }}>
          <DialogHeader className="px-5 py-4 border-b" style={{ borderColor: 'var(--chat-border)', background: 'var(--chat-bg-header)' }}>
            <DialogTitle className="text-[16px] font-semibold">Chi tiết bình chọn</DialogTitle>
          </DialogHeader>
          <div className="p-4 flex flex-col gap-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
            {payload.options.map((opt: any) => {
              const isExpanded = expandedOptionId === opt._id;
              const votesCount = opt.voters.length;

              return (
                <div key={`detail-${opt._id}`} className="border rounded-md overflow-hidden" style={{ borderColor: 'var(--chat-border)', background: 'var(--chat-bg-main)' }}>
                  <button
                    onClick={() => setExpandedOptionId(isExpanded ? null : opt._id)}
                    className="w-full flex items-center justify-between p-2.5 hover:bg-chat-hover transition-colors text-left"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-chat-muted shrink-0" /> : <ChevronRight className="w-4 h-4 text-chat-muted shrink-0" />}
                      <span className="text-[13px] font-medium text-chat-text truncate">{opt.text}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[12px] text-chat-muted shrink-0 pl-2">
                      <Users className="w-3.5 h-3.5" />
                      <span>{votesCount}</span>
                    </div>
                  </button>

                  {isExpanded && votesCount > 0 && (
                    <div className="flex flex-col gap-1.5 p-2 bg-chat-sidebar border-t" style={{ borderColor: 'var(--chat-border)' }}>
                      {opt.voters.map((v: any, i: number) => (
                        <div key={`voter-${i}`} className="flex items-center justify-between p-1.5 hover:bg-chat-hover rounded-md group">
                          <div className="flex items-center gap-2 min-w-0">
                            <img src={v.profilePicture || "/avatar.png"} alt={v.fullname} className="w-6 h-6 rounded-full object-cover shrink-0" />
                            <span className="text-[13px] text-chat-text truncate">{v.fullname || "Người dùng"}</span>
                          </div>
                          <button
                            onClick={() => setSelectedProfile(v)}
                            className="p-1.5 text-chat-muted hover:text-[#1877F2] opacity-0 group-hover:opacity-100 transition-opacity rounded-md hover:bg-chat-active"
                            title="Xem profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile Modal */}
      <ProfileModal 
        selectedProfile={selectedProfile} 
        onClose={() => setSelectedProfile(null)} 
      />
    </div>
  );
}
