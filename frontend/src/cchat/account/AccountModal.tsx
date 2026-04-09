import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ProfileView } from "./ProfileView"
import { EditProfileView } from "./EditProfileView"
import { EditAvatarView } from "./EditAvatarView"

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ModalView = "view" | "edit-profile" | "edit-avatar"

export function AccountModal({ isOpen, onClose }: AccountModalProps) {
  const [view, setView] = useState<ModalView>("view")

  const handleClose = () => {
    setView("view")
    onClose()
  }

  const days = Array.from({ length: 31 }, (_, i) => i + 1)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent 
        className="max-w-[400px] p-0 overflow-hidden bg-white rounded-xl flex flex-col gap-0 shadow-xl border-0 !outline-none" 
        aria-describedby={undefined}
        showCloseButton={false}
      >

        {view === "view" && <ProfileView onViewChange={setView} onClose={handleClose} />}
        {view === "edit-profile" && <EditProfileView onBack={() => setView("view")} onClose={handleClose} days={days} months={months} years={years} />}
        {view === "edit-avatar" && <EditAvatarView onBack={() => setView("view")} onClose={handleClose} />}

      </DialogContent>
    </Dialog>
  )
}
