// Contacts Page
import { useState } from "react"
import { PrimarySidebar } from "../cchat/sidebar/PrimarySidebar"
import { ContactMenu } from "../cchat/contact/ContactMenu"
import type { ActiveMenu } from "../cchat/contact/ContactMenu"
import { ContactListArea } from "../cchat/contact/ContactListArea"
import { ContactGroupsArea } from "../cchat/contact/ContactGroupsArea"
import { ContactInvitationsArea } from "../cchat/contact/ContactInvitationsArea"

export default function ContactsPage() {
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>("contacts")

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white text-zinc-900 font-sans">
      {/* Cột 1: Global Navigation */}
      <PrimarySidebar activeTab="contacts" />
      
      {/* Cột 2: Menu Danh bạ */}
      <ContactMenu activeMenu={activeMenu} onSelectMenu={setActiveMenu} />
      
      {/* Cột 3: Main Contact Area (Tương ứng với Menu được chọn) */}
      {activeMenu === "contacts" && <ContactListArea />}
      {activeMenu === "groups" && <ContactGroupsArea />}
      {activeMenu === "invitations" && <ContactInvitationsArea />}
    </div>
  )
}
