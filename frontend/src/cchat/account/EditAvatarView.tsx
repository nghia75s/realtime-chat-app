import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { X, ChevronLeft, ImagePlus } from "lucide-react"

export const EditAvatarView = ({ onBack, onClose }: any) => {
   return (
    <div className="flex flex-col w-full h-[550px] bg-white relative animate-in slide-in-from-right-4 duration-200">
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 shrink-0">
            <div className="flex items-center gap-3">
                <button onClick={onBack} className="p-1 rounded-full hover:bg-zinc-100 transition-colors -ml-1"><ChevronLeft className="w-6 h-6 text-zinc-600" /></button>
                <h2 className="text-[16px] font-semibold text-zinc-900">Cập nhật ảnh đại diện</h2>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-zinc-100 transition-colors"><X className="w-5 h-5 text-zinc-500" /></button>
        </div>

        <div className="px-5 py-6 flex flex-col gap-6 items-center flex-1 outline-none">
            <Button variant="outline" className="w-[85%] h-[44px] flex items-center justify-center gap-2 border-[1.5px] border-[#7c3aed] text-[#7c3aed] font-bold bg-[#ede9fe]/70 hover:bg-[#ede9fe] text-[15px] transition-colors rounded-lg shadow-sm">
                <ImagePlus className="w-[18px] h-[18px]" strokeWidth={2.5}/> Tải lên từ máy tính
            </Button>
            
            <div className="flex flex-col gap-4 mt-2 w-[85%]">
                <h3 className="text-[16px] font-semibold text-zinc-800">Ảnh đại diện của tôi</h3>
                <Avatar className="w-[80px] h-[80px] border border-zinc-200 ring-[3px] ring-offset-[3px] ring-[#ede9fe] ml-1 shadow-sm">
                    <AvatarImage src="/avatars/me.png" />
                    <AvatarFallback>Dat</AvatarFallback>
                </Avatar>
            </div>
        </div>
    </div>
   )
}

