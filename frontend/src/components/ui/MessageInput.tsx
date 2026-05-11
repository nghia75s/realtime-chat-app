import { useRef, useState } from 'react'
import { useChatStore } from "@/store/useChatStore"
import { toast } from 'react-hot-toast'
import { ImageIcon, SendIcon, XIcon } from 'lucide-react'

function MessageInput() {
  const [text, setText] = useState("")
  const [imagePreview, setImagePreview] = useState<string | ArrayBuffer | null>(null)

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const { sendMessage } = useChatStore()

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!text.trim() && !imagePreview) return
    sendMessage({ text: text.trim(), image: imagePreview })
    setText("")
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file.");
      return;
    }
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="p-4 border-t border-purple-500/50">
      {imagePreview && (
        <div className="max-w-3xl mx-auto mb-3 flex items-center">
          <div className="relative">
            <img
              src={imagePreview as string}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-purple-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-purple-800 flex items-center justify-center text-purple-200 hover:bg-purple-700"
              type="button"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto flex space-x-4">
        <input
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
          }}
          className="flex-1 bg-purple-200 text-purple-700 border border-purple-300 rounded-lg py-2 px-4 placeholder:text-purple-700"
          placeholder="Type your message..."
        />

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`bg-purple-300 text-white hover:text-purple-200 rounded-lg px-4 transition-colors ${imagePreview ? "text-purple-500" : ""
            }`}
        >
          <ImageIcon className="w-5 h-5" />
        </button>
        <button
          type="submit"
          disabled={!text.trim() && !imagePreview}
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg px-4 py-2 font-medium hover:from-purple-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </form>
    </div>
  )
}

export default MessageInput