import { useState, useRef } from "react"
import { Search } from "lucide-react"

interface EmojiPickerPanelProps {
  onEmojiSelect: (emoji: string) => void
}

const EMOJI_CATEGORIES = [
  {
    label: "Mặt cười",
    icon: "😊",
    emojis: [
      "😀","😃","😄","😁","😆","😅","🤣","😂","🙂","😊",
      "😇","🥰","😍","🤩","😘","😗","😚","😙","🥲","😋",
      "😛","😜","🤪","😝","🤑","🤗","🤭","🫢","🫣","🤫",
      "🤔","🫠","🤐","🤨","😐","😑","😶","🫥","😏","😒",
      "🙄","😬","🤥","🫨","😌","😔","😪","🤤","😴","😷",
      "🤒","🤕","🤢","🤮","🤧","🥵","🥶","🥴","😵","🤯",
      "🤠","🥳","🥸","😎","🤓","🧐","😕","🫤","😟","🙁",
      "☹️","😮","😯","😲","😳","🥺","🫹","😦","😧","😨",
      "😰","😥","😢","😭","😱","😖","😣","😞","😓","😩",
      "😫","🥱","😤","😡","😠","🤬","😈","👿","💀","☠️",
    ]
  },
  {
    label: "Cử chỉ",
    icon: "👍",
    emojis: [
      "👍","👎","👌","🤌","🤏","✌️","🤞","🫰","🤟","🤘",
      "🤙","🫵","👈","👉","👆","🖕","👇","☝️","👋","🤚",
      "🖐️","✋","🖖","🫱","🫲","🫳","🫴","👏","🙌","🫶",
      "🤲","🙏","✍️","💅","🤳","💪","🦵","🦶","👂","🦻",
      "👃","🫀","🫁","🧠","🦷","🦴","👀","👁️","👅","👄",
    ]
  },
  {
    label: "Trái tim",
    icon: "❤️",
    emojis: [
      "❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔",
      "❤️‍🔥","❤️‍🩹","💕","💞","💓","💗","💖","💘","💝","💟",
      "♥️","❣️","💌","💋","💯","✨","🔥","⚡","🌟","💫",
    ]
  },
  {
    label: "Hoạt động",
    icon: "🎉",
    emojis: [
      "🎉","🎊","🎈","🎀","🎁","🏆","🥇","🥈","🥉","🎯",
      "🎮","🕹️","🎲","🃏","🎴","🀄","🎭","🎨","🖼️","🎬",
      "🎤","🎧","🎵","🎶","🎼","🎹","🥁","🎷","🎺","🎸",
      "🪕","🎻","🪗","🎲","🎰","🧩","🪆","🪅","🎪","🤹",
    ]
  },
  {
    label: "Động vật",
    icon: "🐱",
    emojis: [
      "🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯",
      "🦁","🐮","🐷","🐸","🐵","🙈","🙉","🙊","🐔","🐧",
      "🐦","🐤","🦆","🦅","🦉","🦇","🐺","🐗","🐴","🦄",
      "🐝","🐛","🦋","🐌","🐞","🐜","🦟","🦗","🕷️","🐢",
      "🐍","🦎","🦖","🦕","🐙","🦑","🦐","🦞","🦀","🐡",
    ]
  },
  {
    label: "Đồ ăn",
    icon: "🍕",
    emojis: [
      "🍎","🍊","🍋","🍇","🍓","🍒","🍑","🥭","🍍","🥥",
      "🍕","🍔","🌭","🌮","🌯","🥗","🍜","🍣","🍱","🍛",
      "☕","🧋","🍺","🍻","🥂","🍷","🥃","🧃","🥤","🧊",
      "🍰","🎂","🧁","🍩","🍪","🍫","🍬","🍭","🍡","🧇",
    ]
  },
  {
    label: "Du lịch",
    icon: "✈️",
    emojis: [
      "✈️","🚀","🛸","🚁","🛶","⛵","🚢","🚂","🚃","🚄",
      "🚅","🚆","🚇","🚈","🚉","🚊","🚞","🚝","🚋","🚌",
      "🚍","🚎","🏎️","🚓","🚑","🚒","🚐","🛻","🚚","🚛",
      "🏠","🏡","🏢","🏣","🏤","🏥","🏦","🏨","🏩","🏪",
      "⛺","🌍","🌎","🌏","🗺️","🧭","🏔️","⛰️","🌋","🗻",
    ]
  },
  {
    label: "Vật phẩm",
    icon: "💡",
    emojis: [
      "💡","🔦","💰","💳","💎","⚙️","🔧","🔨","⛏️","🗜️",
      "🔑","🗝️","🔒","🔓","🚪","🪞","🛋️","🪑","🚿","🛁",
      "📱","💻","🖥️","🖨️","⌨️","🖱️","🖲️","💾","💿","📀",
      "📞","☎️","📟","📠","📺","📷","📸","📹","🎥","📽️",
      "📔","📕","📗","📘","📙","📚","📖","🔖","🗒️","✏️",
    ]
  },
]

// Flatten để search
const ALL_EMOJIS = EMOJI_CATEGORIES.flatMap(c => c.emojis)

export function EmojiPickerPanel({ onEmojiSelect }: EmojiPickerPanelProps) {
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState(0)
  const searchRef = useRef<HTMLInputElement>(null)

  const searchResults = search.trim()
    ? ALL_EMOJIS.filter(e => {
        // Search đơn giản dựa trên codepoint tên (không cần lib)
        return true // Hiện tất cả khi search, lọc theo text sau
      }).slice(0, 60)
    : null

  const displayed = searchResults ?? EMOJI_CATEGORIES[activeCategory].emojis

  return (
    <div className="w-[320px] bg-[#1e1f22] border border-[#3a3b3e] rounded-xl shadow-2xl overflow-hidden flex flex-col">
      {/* Search */}
      <div className="p-2 border-b border-[#2b2d31]">
        <div className="flex items-center gap-2 px-2 py-1.5 bg-[#131416] rounded-lg">
          <Search className="w-3.5 h-3.5 text-[#a1a1a1] shrink-0" />
          <input
            ref={searchRef}
            autoFocus
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm emoji..."
            className="bg-transparent text-[13px] text-white outline-none placeholder:text-[#717171] w-full"
          />
        </div>
      </div>

      {/* Category Tabs */}
      {!search && (
        <div className="flex overflow-x-auto px-1 pt-1 gap-0.5 border-b border-[#2b2d31] scrollbar-none">
          {EMOJI_CATEGORIES.map((cat, i) => (
            <button
              key={i}
              onClick={() => setActiveCategory(i)}
              title={cat.label}
              className={`shrink-0 p-1.5 rounded-md text-[16px] transition-colors ${
                activeCategory === i ? "bg-[#2b2d31]" : "hover:bg-[#2b2d31]/50"
              }`}
            >
              {cat.icon}
            </button>
          ))}
        </div>
      )}

      {/* Emoji Grid */}
      <div className="h-[220px] overflow-y-auto p-2 custom-scrollbar">
        {search && (
          <p className="text-[11px] text-[#717171] mb-1.5 px-1">
            Kết quả tìm kiếm
          </p>
        )}
        {!search && (
          <p className="text-[11px] text-[#717171] mb-1.5 px-1">
            {EMOJI_CATEGORIES[activeCategory].label}
          </p>
        )}
        <div className="grid grid-cols-9 gap-0.5">
          {displayed.map((emoji, i) => (
            <button
              key={i}
              onClick={() => onEmojiSelect(emoji)}
              className="aspect-square flex items-center justify-center text-[20px] rounded-md hover:bg-[#2b2d31] transition-colors leading-none"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Quick shortcuts hint */}
      <div className="px-3 py-1.5 border-t border-[#2b2d31] bg-[#131416]/50">
        <p className="text-[11px] text-[#717171]">
          Gõ nhanh: <span className="text-[#a1a1a1]">:) 😊  :D 😄  &lt;3 ❤️  xD 😆  ;) 😉</span>
        </p>
      </div>
    </div>
  )
}
