import { useEffect, useState } from "react";
import { useChatStore } from "@/store/useChatStore";
import { Loader2, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function JoinGroupModal() {
  const { joinModalCode, setJoinModalCode, joinViaLink } = useChatStore();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "pending" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const isOpen = !!joinModalCode;

  useEffect(() => {
    if (!isOpen) {
      setStatus("idle");
      return;
    }

    if (!joinModalCode) {
      setStatus("error");
      setErrorMsg("Link không hợp lệ");
      return;
    }

    setStatus("loading");
    joinViaLink(joinModalCode)
      .then((res: any) => {
        if (res.status === "pending") {
          setStatus("pending");
        } else {
          setStatus("success");
          setTimeout(() => {
            setJoinModalCode(null);
          }, 1500);
        }
      })
      .catch((err: any) => {
        setStatus("error");
        setErrorMsg(err?.response?.data?.message || "Không thể tham gia nhóm");
      });
  }, [joinModalCode, joinViaLink, isOpen, setJoinModalCode]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && setJoinModalCode(null)}>
      <DialogContent className="max-w-md border text-chat-text" style={{ background: 'var(--chat-dropdown-bg)', borderColor: 'var(--chat-border)' }}>
        <DialogHeader>
          <DialogTitle className="text-lg text-center text-chat-text">Tham gia nhóm</DialogTitle>
          <DialogDescription className="text-center text-[#a1a1a1]">
            Đang xử lý yêu cầu tham gia thông qua link mời
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 flex flex-col items-center justify-center min-h-[160px]">
          {status === "loading" && (
            <div className="flex flex-col items-center">
              <Loader2 className="w-12 h-12 text-[#1877F2] animate-spin mb-4" />
              <h2 className="text-[15px] font-semibold">Đang xử lý yêu cầu...</h2>
            </div>
          )}
          
          {status === "success" && (
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-[#10b981]/20 text-[#10b981] rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h2 className="text-[15px] font-semibold mb-1">Tham gia thành công!</h2>
              <p className="text-sm text-[#a1a1a1]">Chào mừng bạn đến với nhóm</p>
            </div>
          )}

          {status === "pending" && (
            <div className="flex flex-col items-center text-center px-4">
              <div className="w-14 h-14 bg-[#ebaa16]/20 text-[#ebaa16] rounded-full flex items-center justify-center mb-4">
                <Clock className="w-7 h-7" />
              </div>
              <h2 className="text-[15px] font-semibold mb-2">Yêu cầu đã được gửi</h2>
              <p className="text-sm text-[#a1a1a1] mb-2">
                Nhóm này yêu cầu phê duyệt. Vui lòng chờ quản trị viên duyệt yêu cầu của bạn.
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center text-center px-4">
              <div className="w-14 h-14 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-4">
                <XCircle className="w-7 h-7" />
              </div>
              <h2 className="text-[15px] font-semibold mb-2">Lỗi</h2>
              <p className="text-sm text-[#a1a1a1] mb-2">{errorMsg}</p>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-center">
          <Button onClick={() => setJoinModalCode(null)} className="w-full sm:w-auto" variant={status === "loading" || status === "success" ? "outline" : "default"}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
