// Contact List Area
import { Search, MoreHorizontal, ChevronDown, UserPlus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const mockContacts = [
  { id: 1, name: "Anh Quân", avatar: "/avatars/01.png", fallback: "AQ", letter: "A" },
  { id: 2, name: "Ánh Nguyệt", avatar: "https://i.pravatar.cc/150?u=an", fallback: "AN", letter: "A" },
  { id: 3, name: "Bảo Trần", avatar: "https://i.pravatar.cc/150?u=bt", fallback: "BT", letter: "B" },
  { id: 4, name: "Bình Nguyễn", avatar: "https://i.pravatar.cc/150?u=bn", fallback: "BN", letter: "B" },
  { id: 5, name: "Cường Phạm", avatar: "https://i.pravatar.cc/150?u=cp", fallback: "CP", letter: "C" },
  { id: 6, name: "Diễm My", avatar: "https://i.pravatar.cc/150?u=dm", fallback: "DM", letter: "D" },
  { id: 7, name: "Duy Kha", avatar: "https://i.pravatar.cc/150?u=dk", fallback: "DK", letter: "D" },
  { id: 8, name: "Gia Bảo", avatar: "https://i.pravatar.cc/150?u=gb", fallback: "GB", letter: "G" },
  { id: 9, name: "Hoàng Lê", avatar: "https://i.pravatar.cc/150?u=hl", fallback: "HL", letter: "H" },
  { id: 10, name: "Hương Nguyễn", avatar: "https://i.pravatar.cc/150?u=hn", fallback: "HN", letter: "H" },
]

export function ContactListArea() {
  const groupedContacts = mockContacts.reduce((acc, contact) => {
    if (!acc[contact.letter]) {
      acc[contact.letter] = []
    }
    acc[contact.letter].push(contact)
    return acc
  }, {} as Record<string, typeof mockContacts>)

  return (
    <div className="flex flex-1 flex-col bg-white">
      {/* Header */}
      <div className="flex h-[68px] items-center border-b border-zinc-200 px-6 shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-3 w-full">
          <UserPlus className="h-[24px] w-[24px] text-zinc-700" strokeWidth={1.5} />
          <h2 className="text-[16px] font-bold text-zinc-900">Danh sách bạn bè</h2>
        </div>
      </div>

      <div className="flex flex-col flex-1 overflow-hidden bg-white min-h-0">
        {/* Filter Bar */}
        <div className="flex items-center gap-4 px-6 py-4 shrink-0">
          <div className="relative w-[300px]">
             <Search className="absolute left-2.5 top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-zinc-500" />
             <input
               placeholder="Tìm bạn"
               className="w-full rounded-md border border-zinc-200 bg-white py-1.5 pl-8 pr-3 text-[14px] text-zinc-900 outline-none placeholder:text-zinc-500 focus:border-[#005AE0] transition-colors"
             />
          </div>
          <button className="flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-[14px] text-zinc-700 hover:bg-zinc-50 transition-colors">
            Tên (A-Z)
            <ChevronDown className="h-4 w-4 text-zinc-500" />
          </button>
          <button className="flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-[14px] text-zinc-700 hover:bg-zinc-50 transition-colors">
            Tất cả
            <ChevronDown className="h-4 w-4 text-zinc-500" />
          </button>
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto min-h-0 px-6 pb-6 w-full custom-scrollbar">
           <div className="font-medium text-[14px] text-zinc-900 mb-4 px-2 mt-2">Bạn bè (100)</div>
           
           <div className="flex flex-col w-full">
             {Object.entries(groupedContacts).map(([letter, contacts]) => (
               <div key={letter} className="flex flex-col mb-4">
                 {/* Letter Header */}
                 <div className="font-semibold text-[16px] text-zinc-800 px-4 py-1 mb-1">
                   {letter}
                 </div>
                 
                 {/* Contact Items */}
                 <div className="flex flex-col">
                   {contacts.map((contact) => (
                     <div
                       key={contact.id}
                       className="group flex items-center justify-between px-4 py-2.5 rounded-lg hover:bg-zinc-100/80 cursor-pointer transition-colors"
                     >
                       <div className="flex items-center gap-4">
                         <Avatar className="h-[48px] w-[48px] border border-zinc-200/50">
                            <AvatarImage src={contact.avatar} />
                            <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">{contact.fallback}</AvatarFallback>
                         </Avatar>
                         <span className="text-[15px] font-medium text-zinc-800">
                           {contact.name}
                         </span>
                       </div>
                       
                       {/* Context Menu Button */}
                       <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                         <button className="p-1.5 rounded-md hover:bg-zinc-200 text-zinc-600 transition-colors">
                           <MoreHorizontal className="h-5 w-5" />
                         </button>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  )
}
