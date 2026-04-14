import { MessageCircleIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

function NoChatsFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
      <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center">
        <MessageCircleIcon className="w-8 h-8 text-purple-400" />
      </div>
      <div>
        <h4 className="text-purple-400 font-medium mb-1">Không có cuộc trò chuyện nào</h4>
        <p className="text-purple-400 text-sm px-6">
          Bắt đầu một cuộc trò chuyện mới bằng cách chọn một liên hệ từ tab liên hệ
        </p>
      </div>
      <button
        onClick={() => navigate('/contacts')}
        className="px-4 py-2 text-sm text-purple-400 bg-purple-500/10 rounded-lg hover:bg-purple-500/20 transition-colors"
      >
        Tìm liên hệ
      </button>
    </div>
  );
}
export default NoChatsFound;