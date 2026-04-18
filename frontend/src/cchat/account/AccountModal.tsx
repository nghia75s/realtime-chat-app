import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ProfileView } from "./ProfileView"
import { EditAvatarView } from "./EditAvatarView"

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ModalView = "view" | "edit-avatar"

export function AccountModal({ isOpen, onClose }: AccountModalProps) {
  const [view, setView] = useState<ModalView>("view")

  const handleClose = () => {
    setView("view")
    onClose()
  }
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        className="max-w-[400px] p-0 overflow-hidden bg-white rounded-xl flex flex-col gap-0 shadow-xl border-0 !outline-none"
        aria-describedby={undefined}
        showCloseButton={false}
      >
        {view === "view" && <ProfileView onViewChange={setView} onClose={handleClose} />}
        {view === "edit-avatar" && <EditAvatarView onBack={() => setView("view")} onClose={handleClose} />}

      </DialogContent>
    </Dialog>
  )
}
