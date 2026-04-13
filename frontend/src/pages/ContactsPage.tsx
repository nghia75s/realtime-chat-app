import { useState } from "react"
import { PrimarySidebar } from "../cchat/sidebar/PrimarySidebar"
import { ContactMenu } from "../cchat/contact/ContactMenu"
import ContactList from "../cchat/contact/ContactListArea"
import { ContactGroupsArea } from "../cchat/contact/ContactGroupsArea"
import { ContactInvitationsArea } from "../cchat/contact/ContactInvitationsArea"

export default function ContactsPage() {
  const [activeMenu, setActiveMenu] = useState<string>("contacts")

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#1e1f22] text-[#e1e1e1] font-sans">
      {/* Cột 1: Global Navigation */}
      <PrimarySidebar activeTab="contacts" />

      {/* Cột 2: Menu Danh bạ */}
      <ContactMenu activeMenu={activeMenu} onSelectMenu={setActiveMenu} />

      {/* Cột 3: Main Contact Area (Tương ứng với Menu được chọn) */}
      {activeMenu === "contacts" && <ContactList />}
      {activeMenu === "groups" && <ContactGroupsArea />}
      {(activeMenu === "group_invites" || activeMenu === "invitations") && <ContactInvitationsArea />}
    </div>
  )
}
