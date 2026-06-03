import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useChatStore } from "@/store/useChatStore";
import { Plus, X, Settings, Calendar } from "lucide-react";
import { formatShortDate } from "@/lib/formatTime";

interface CreatePollModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
}

export function CreatePollModal({ isOpen, onClose, groupId }: CreatePollModalProps) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [deadline, setDeadline] = useState("");
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [allowAddOptions, setAllowAddOptions] = useState(false);
  const [hideVoters, setHideVoters] = useState(false);
  const [pinToTop, setPinToTop] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createPoll } = useChatStore();

  const handleAddOption = () => {
    setOptions([...options, ""]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) return;
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async () => {
    const validOptions = options.map(opt => opt.trim()).filter(opt => opt.length > 0);
    if (!question.trim() || validOptions.length < 2) return;

    setIsSubmitting(true);
    try {
      await createPoll(groupId, {
        question: question.trim(),
        options: validOptions,
        deadline: deadline ? new Date(deadline).toISOString() : null,
        allowMultiple,
        allowAddOptions,
        hideVoters
      });
      // Optionally handle pinToTop if your backend supports it for polls

      // Reset
      setQuestion("");
      setOptions(["", ""]);
      setDeadline("");
      setAllowMultiple(false);
      setAllowAddOptions(false);
      setHideVoters(false);
      setPinToTop(false);
      setShowSettings(false);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = question.trim() && options.filter(opt => opt.trim().length > 0).length >= 2;

  // Custom Toggle Switch Component
  const ToggleSwitch = ({ checked, onChange }: { checked: boolean, onChange: (c: boolean) => void }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-[#1877F2]' : 'bg-[#4e4f52]'}`}
    >
      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-2' : '-translate-x-2'}`} />
    </button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`bg-[#2b2d31] border-[#1e1f22] text-[#e1e1e1] transition-all duration-300 ${showSettings ? 'sm:max-w-[700px]' : 'sm:max-w-[500px]'} !max-h-[92vh] overflow-hidden flex flex-col p-4 gap-0`}>
        <DialogHeader className="p-4 border-b border-[#3f4147] shrink-0">
          <DialogTitle className="text-white text-lg font-bold">Tạo bình chọn</DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 overflow-y-auto custom-scrollbar">
          {/* Main Content (Left Side if expanded) */}
          <div className={`flex flex-col gap-5 p-4 ${showSettings ? 'w-[60%] border-r border-[#3f4147]' : 'w-full'}`}>
            {/* Question */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-white">Chủ đề bình chọn</label>
              <textarea
                className="min-h-[80px] bg-[#1e1f22] border border-[#3f4147] rounded-md p-3 text-white placeholder-[#a1a1a1] resize-none focus:outline-none focus:ring-1 focus:ring-[#1877F2]"
                placeholder="Đặt câu hỏi bình chọn..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </div>

            {/* Options */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-white">Các lựa chọn</label>
              {options.map((opt, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    className="flex-1 bg-[#1e1f22] border border-[#3f4147] rounded-md p-2.5 text-sm text-white placeholder-[#a1a1a1] focus:outline-none focus:ring-1 focus:ring-[#1877F2]"
                    placeholder={`Lựa chọn ${index + 1}`}
                    value={opt}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                  />
                  {options.length > 2 && (
                    <button
                      onClick={() => handleRemoveOption(index)}
                      className="p-2 text-[#a1a1a1] hover:text-[#f23f43] transition-colors rounded-md hover:bg-[#1e1f22]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={handleAddOption}
                className="flex items-center gap-2 text-[#1877F2] font-medium text-sm mt-1 hover:bg-[#1877f2]/10 w-fit px-2 py-1.5 rounded transition-colors"
              >
                <Plus className="w-4 h-4" /> Thêm lựa chọn
              </button>
            </div>
          </div>

          {/* Settings Content (Right Side) */}
          {showSettings && (
            <div className="w-[40%] flex flex-col gap-5 p-4 bg-[#2b2d31]">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-white">Thời hạn bình chọn</label>
                <div className="relative">
                  <div className="flex items-center justify-between bg-[#1e1f22] border border-[#3f4147] rounded-md p-2.5 cursor-pointer hover:border-[#1877F2] transition-colors">
                    <span className={`text-[14px] ${deadline ? "text-white" : "text-[#a1a1a1]"}`}>
                      {deadline ? formatShortDate(deadline) : "Không thời hạn"}
                    </span>
                    <Calendar className="w-4 h-4 text-[#a1a1a1]" />
                  </div>
                  <input
                    type="datetime-local"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    onClick={(e) => {
                      if (e.currentTarget.showPicker) {
                        e.currentTarget.showPicker();
                      }
                    }}
                    onKeyDown={(e) => e.preventDefault()}
                  />
                </div>
                {deadline && (
                  <button
                    type="button"
                    onClick={() => setDeadline("")}
                    className="text-xs text-[#f23f43] hover:underline self-start mt-[-4px]"
                  >
                    Xóa thời hạn
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-4">
                <label className="text-sm font-semibold text-white">Thiết lập nâng cao</label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#e1e1e1]">Ghim lên đầu trò chuyện</span>
                  <ToggleSwitch checked={pinToTop} onChange={setPinToTop} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#e1e1e1]">Chọn nhiều phương án</span>
                  <ToggleSwitch checked={allowMultiple} onChange={setAllowMultiple} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#e1e1e1]">Có thể thêm phương án</span>
                  <ToggleSwitch checked={allowAddOptions} onChange={setAllowAddOptions} />
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <label className="text-sm font-semibold text-white">Bình chọn ẩn danh</label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#e1e1e1]">Ẩn người bình chọn</span>
                  <ToggleSwitch checked={hideVoters} onChange={setHideVoters} />
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between bg-[#2b2d31] border-t border-[#3f4147] p-4 shrink-0 sm:justify-between w-full">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-md transition-colors ${showSettings ? 'bg-[#1877f2]/10 text-[#1877F2]' : 'text-[#a1a1a1] hover:bg-[#3f4147]'}`}
            title="Thiết lập"
          >
            <Settings className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-7 py-3 rounded-md bg-[#3f4147] hover:bg-[#474a52] transition-colors text-sm font-medium text-white"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isValid || isSubmitting}
              className="px-9 py-3 rounded-md bg-[#1877F2] hover:bg-[#166fe5] text-white transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Đang tạo..." : "Tạo bình chọn"}
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
