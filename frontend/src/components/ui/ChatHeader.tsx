import { XIcon } from "lucide-react";
import { useChatStore } from "@/store/useChatStore";
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

function ChatHeader() {
  const { selectedUser, setSelectedUser } = useChatStore();

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedUser(null);
    };

    window.addEventListener("keydown", handleEscKey);

    return () => window.removeEventListener("keydown", handleEscKey);
  }, [setSelectedUser]);

  return (
    <div className="flex justify-between items-center w-full bg-purple-800/50 border-b border-purple-700/50 max-h-[84px] px-6">
      <div className="flex items-center space-x-3">
        <div className={`avatar online`}>
          <div className="w-12 rounded-full">
            <img src={selectedUser.profilePicture || "/avatar.png"} alt={selectedUser.fullname} />
          </div>
        </div>

        <div>
          <h3 className="text-purple-200 font-medium">{selectedUser.fullname}</h3>
          <p className="text-purple-900 text-sm">Online</p>
        </div>
      </div>

      <button onClick={() => setSelectedUser(null)}>
        <XIcon className="w-5 h-5 text-purple-900 hover:text-purple-200 transition-colors cursor-pointer" />
      </button>
    </div>
  );
}
export default ChatHeader;