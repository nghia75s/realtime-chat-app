import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { X, ChevronLeft, ImagePlus, Loader2 } from "lucide-react"
import { useRef, useState } from "react"
import { useAuthStore } from "@/store/useAuthStore"
import toast from "react-hot-toast"

export const EditAvatarView = ({ onBack, onClose }: any) => {
    const { authUser, updateProfile } = useAuthStore()
    const [isUpdating, setIsUpdating] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            return toast.error("Kích thước ảnh tối đa là 5MB.");
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const base64Image = reader.result as string;
            setIsUpdating(true);
            try {
                await updateProfile({ profilePicture: base64Image });
            } catch (error) {
                console.error("Error updating profile picture", error);
            } finally {
                setIsUpdating(false);
            }
        };
    };

   return (
    <div className="flex flex-col w-full h-[550px] bg-chat-sidebar relative animate-in slide-in-from-right-4 duration-200">
        <div className="flex items-center justify-between px-4 py-3 border-b border-chat-border shrink-0">
            <div className="flex items-center gap-3">
                <button onClick={onBack} className="p-1 rounded-full hover:bg-chat-hover transition-colors -ml-1"><ChevronLeft className="w-6 h-6 text-chat-text" /></button>
                <h2 className="text-[16px] font-semibold text-chat-text">Cập nhật ảnh đại diện</h2>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-chat-hover transition-colors"><X className="w-5 h-5 text-chat-muted" /></button>
        </div>

        <div className="px-5 py-6 flex flex-col gap-6 items-center flex-1 outline-none">
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/png, image/jpeg, image/jpg, image/webp" 
                onChange={handleImageUpload} 
            />

            <Button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUpdating}
                variant="outline" 
                className="w-[85%] h-[44px] flex items-center justify-center gap-2 border-[1.5px] border-[#7c3aed] text-[#7c3aed] font-bold bg-[#ede9fe]/70 hover:bg-[#ede9fe] dark:bg-[#7c3aed]/20 dark:hover:bg-[#7c3aed]/30 dark:text-[#a78bfa] dark:border-[#a78bfa] text-[15px] transition-colors rounded-lg shadow-sm"
            >
                {isUpdating ? <Loader2 className="w-[18px] h-[18px] animate-spin" /> : <ImagePlus className="w-[18px] h-[18px]" strokeWidth={2.5}/>} 
                {isUpdating ? "Đang tải lên..." : "Tải lên từ máy tính"}
            </Button>
            
            <div className="flex flex-col gap-4 mt-2 w-[85%]">
                <h3 className="text-[16px] font-semibold text-chat-text">Ảnh đại diện của tôi</h3>
                <Avatar className="w-[80px] h-[80px] border border-chat-border ring-[3px] ring-offset-[3px] ring-[#ede9fe] dark:ring-[#7c3aed]/30 ml-1 shadow-sm">
                    <AvatarImage src={authUser?.profilePicture || "/avatar.png"} />
                    <AvatarFallback>{authUser?.fullname?.charAt(0)?.toUpperCase() || "?"}</AvatarFallback>
                </Avatar>
            </div>
        </div>
    </div>
   )
}

