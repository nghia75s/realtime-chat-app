import { useState } from "react";
import { BarChart2, Check, Clock, Plus, Users } from "lucide-react";
import { useChatStore } from "@/store/useChatStore";
import { useAuthStore } from "@/store/useAuthStore";
import { formatShortDate } from "@/lib/formatTime";

export function PollMessageCard({ message }: { message: any }) {
  const { authUser } = useAuthStore();
  const { votePoll, addPollOption } = useChatStore();
  const [newOption, setNewOption] = useState("");
  const [isAddingOption, setIsAddingOption] = useState(false);

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
    <div className="flex flex-col gap-3 bg-[#1e1f22] p-4 rounded-xl border border-[#3f4147] shadow-sm w-full">
      <div className="flex items-center gap-2 mb-1">
        <BarChart2 className="w-4 h-4 text-[#20a354]" />
        <span className="text-xs font-semibold uppercase text-[#20a354]">Bình chọn</span>
      </div>
      
      <div className="flex flex-col gap-2">
        <h3 className="font-bold text-[15px] text-white mb-3">{payload.question}</h3>
        
        <div className="flex flex-col gap-2">
          {payload.options.map((opt: any) => {
            const votesCount = opt.voters.length;
            const percentage = totalVotes > 0 ? Math.round((votesCount / totalVotes) * 100) : 0;
            const hasVoted = opt.voters.some((v: any) => (v._id || v) === authUser?._id);

            return (
              <div 
                key={opt._id} 
                className={`relative flex items-center justify-between p-2.5 rounded-md cursor-pointer transition-colors border ${hasVoted ? 'border-[#1877F2]' : 'border-transparent bg-[#3f4147] hover:bg-[#474a52]'}`}
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
                  <div className={`w-4 h-4 shrink-0 rounded flex items-center justify-center border ${hasVoted ? 'bg-[#1877F2] border-[#1877F2]' : 'border-[#a1a1a1]'}`}>
                    {hasVoted && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[14px] text-white truncate block">{opt.text}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 pl-2">
                    <Users className="w-3.5 h-3.5 text-[#a1a1a1]" />
                    <span className="text-xs text-[#a1a1a1] font-medium">{votesCount}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {payload.allowAddOptions && !isExpired && (
          <div className="mt-3">
            {isAddingOption ? (
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={newOption}
                  onChange={e => setNewOption(e.target.value)}
                  placeholder="Nhập phương án mới..."
                  className="flex-1 bg-[#1e1f22] border border-[#3f4147] rounded p-2 text-sm text-white focus:ring-1 focus:ring-[#1877F2]"
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

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#3f4147] text-xs text-[#a1a1a1]">
          <span>{totalVotes} lượt bình chọn</span>
          {payload.deadline && (
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{isExpired ? "Đã kết thúc" : `Hết hạn: ${formatShortDate(payload.deadline)}`}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
