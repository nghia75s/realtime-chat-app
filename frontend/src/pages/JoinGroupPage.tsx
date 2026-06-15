import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useChatStore } from "@/store/useChatStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader2, CheckCircle2, Clock, XCircle } from "lucide-react";

export default function JoinGroupPage() {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const navigate = useNavigate();
  const { joinViaLink } = useChatStore();
  const { authUser } = useAuthStore();
  const [status, setStatus] = useState<"loading" | "success" | "pending" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!authUser) {
      // Bắt buộc login trước khi tham gia
      navigate(`/login?redirect=/join/${inviteCode}`);
      return;
    }

    if (!inviteCode) {
      setStatus("error");
      setErrorMsg("Link không hợp lệ");
      return;
    }

    joinViaLink(inviteCode)
      .then((res: any) => {
        if (res.status === "pending") {
          setStatus("pending");
        } else {
          setStatus("success");
          // Chờ 1 chút để đọc tin nhắn, chuyển hướng
          setTimeout(() => {
            navigate("/chat");
          }, 1500);
        }
      })
      .catch((err: any) => {
        setStatus("error");
        setErrorMsg(err?.response?.data?.message || "Không thể tham gia nhóm");
      });
  }, [inviteCode, authUser, joinViaLink, navigate]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 bg-[#070913] text-white">
      <div className="p-8 rounded-2xl bg-[#1e293b]/50 border border-[#2e1a47] shadow-xl max-w-md w-full text-center backdrop-blur-md">
        {status === "loading" && (
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-[#1877F2] animate-spin mb-4" />
            <h2 className="text-xl font-semibold">Đang xử lý yêu cầu...</h2>
          </div>
        )}
        
        {status === "success" && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-[#10b981]/20 text-[#10b981] rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Tham gia thành công!</h2>
            <p className="text-gray-400">Đang chuyển hướng đến cuộc trò chuyện...</p>
          </div>
        )}

        {status === "pending" && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-[#ebaa16]/20 text-[#ebaa16] rounded-full flex items-center justify-center mb-4">
              <Clock className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Yêu cầu đã được gửi</h2>
            <p className="text-gray-400 mb-6">Nhóm này yêu cầu phê duyệt. Vui lòng chờ quản trị viên duyệt yêu cầu của bạn.</p>
            <button onClick={() => navigate("/chat")} className="w-full py-2.5 bg-[#1877F2] hover:bg-[#1877F2]/80 text-white rounded-lg transition-colors font-medium">
              Về trang chủ
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Lỗi</h2>
            <p className="text-gray-400 mb-6">{errorMsg}</p>
            <button onClick={() => navigate("/chat")} className="w-full py-2.5 bg-[#1877F2] hover:bg-[#1877F2]/80 text-white rounded-lg transition-colors font-medium">
              Về trang chủ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
