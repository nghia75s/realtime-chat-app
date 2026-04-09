import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X, ChevronLeft } from "lucide-react"

export const EditProfileView = ({ onBack, onClose, days, months, years }: any) => {
  return (
    <div className="flex flex-col w-full h-[600px] bg-white relative animate-in slide-in-from-right-4 duration-200">
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 shrink-0">
            <div className="flex items-center gap-3">
                <button onClick={onBack} className="p-1 rounded-full hover:bg-zinc-100 transition-colors -ml-1"><ChevronLeft className="w-6 h-6 text-zinc-600" /></button>
                <h2 className="text-[16px] font-semibold text-zinc-900">Cập nhật thông tin cá nhân</h2>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-zinc-100 transition-colors"><X className="w-5 h-5 text-zinc-500" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 custom-scrollbar outline-none">
            <div className="flex flex-col gap-6">
                
                {/* Tên hiển thị */}
                <div className="flex flex-col gap-2">
                    <Label className="text-[14px] font-semibold text-zinc-800">Tên hiển thị</Label>
                    <Input defaultValue="Nguyễn Tiến Đạt" className="h-[42px] text-[15px] font-medium border-zinc-300 px-3 focus-visible:ring-[#005AE0] shadow-sm" />
                </div>

                {/* Thông tin cá nhân header */}
                <div className="border-t border-zinc-200 pt-5 mt-1">
                    <h4 className="text-[15px] font-bold text-zinc-800 mb-5">Thông tin cá nhân</h4>
                    
                    {/* Giới tính */}
                    <RadioGroup defaultValue="nam" className="flex items-center gap-12 mb-6 ml-1">
                         <div className="flex items-center space-x-2 cursor-pointer group">
                            <RadioGroupItem value="nam" id="g-nam" className="w-[18px] h-[18px] border-zinc-400 text-[#005AE0] group-hover:border-[#005AE0] transition-colors" />
                            <Label htmlFor="g-nam" className="cursor-pointer font-medium text-[15px]">Nam</Label>
                         </div>
                         <div className="flex items-center space-x-2 cursor-pointer group">
                            <RadioGroupItem value="nu" id="g-nu" className="w-[18px] h-[18px] border-zinc-400 text-[#005AE0] group-hover:border-[#005AE0] transition-colors" />
                            <Label htmlFor="g-nu" className="cursor-pointer font-medium text-[15px]">Nữ</Label>
                         </div>
                    </RadioGroup>

                    {/* Ngày sinh */}
                    <div className="flex flex-col gap-2 mb-6">
                        <Label className="text-[14px] font-semibold text-zinc-800">Ngày sinh</Label>
                        <div className="flex gap-3">
                            <Select defaultValue="23">
                                <SelectTrigger className="w-full text-[14px] h-[42px] border-zinc-300 font-medium">
                                    <SelectValue placeholder="Ngày" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[250px] shadow-lg rounded-xl pointer-events-auto z-[200]">
                                    {days.map((d: number) => <SelectItem key={d} value={d.toString()}>{d}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Select defaultValue="10">
                                <SelectTrigger className="w-full text-[14px] h-[42px] border-zinc-300 font-medium">
                                    <SelectValue placeholder="Tháng" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[250px] shadow-lg rounded-xl z-[200]">
                                    {months.map((m: number) => <SelectItem key={m} value={m.toString()}>{m}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Select defaultValue="2005">
                                <SelectTrigger className="w-full text-[14px] h-[42px] border-zinc-300 font-medium">
                                    <SelectValue placeholder="Năm" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[250px] shadow-lg rounded-xl z-[200]">
                                    {years.map((y: number) => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Phòng ban */}
                    <div className="flex flex-col gap-2 mb-6">
                        <Label className="text-[14px] font-semibold text-zinc-800">Phòng ban</Label>
                        <Select defaultValue="it">
                            <SelectTrigger className="w-full text-[14px] h-[42px] border-zinc-300 font-medium">
                                <SelectValue placeholder="Chọn phòng ban" />
                            </SelectTrigger>
                            <SelectContent className="z-[200]">
                                <SelectItem value="it">Phòng ban IT</SelectItem>
                                <SelectItem value="hr">Nhân sự (HR)</SelectItem>
                                <SelectItem value="mkt">Marketing & Design</SelectItem>
                                <SelectItem value="sales">Kinh doanh</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Chức vụ */}
                    <div className="flex flex-col gap-2 mb-2">
                        <Label className="text-[14px] font-semibold text-zinc-800">Chức vụ</Label>
                        <Select defaultValue="staff">
                            <SelectTrigger className="w-full text-[14px] h-[42px] border-zinc-300 font-medium">
                                <SelectValue placeholder="Chọn chức vụ" />
                            </SelectTrigger>
                            <SelectContent className="z-[200]">
                                <SelectItem value="manager">Trưởng phòng</SelectItem>
                                <SelectItem value="leader">Trưởng nhóm (Team Leader)</SelectItem>
                                <SelectItem value="staff">Nhân viên chính thức</SelectItem>
                                <SelectItem value="intern">Thực tập sinh</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                </div>
            </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-zinc-200 bg-white flex items-center justify-end gap-3 mt-auto shrink-0 z-10 box-shadow-[0_-5px_10px_-5px_rgba(0,0,0,0.05)]">
            <Button variant="outline" className="font-bold text-zinc-800 px-6 h-[40px] bg-zinc-100 hover:bg-zinc-200 border-transparent transition-colors" onClick={onBack}>Hủy</Button>
            <Button className="font-bold px-6 h-[40px] bg-[#005AE0] text-white hover:bg-[#005AE0]/90 transition-colors shadow-none" onClick={onBack}>Cập nhật</Button>
        </div>
    </div>
  )
}
