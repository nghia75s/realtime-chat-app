// Contact List Area
import { useChatStore } from "@/store/useChatStore"
import { useEffect } from "react"
import { useNavigate } from 'react-router-dom'
import UsersLoadingSkeleton from "@/components/ui/UsersLoadingSkeleton"

function ContactList() {
  const { getAllcontacts, allContacts, setSelectedUser, isUsersLoading } = useChatStore()
  const navigate = useNavigate()
  useEffect(() => {
    getAllcontacts()
  }, [getAllcontacts])

  if (isUsersLoading) {
    return <UsersLoadingSkeleton />
  }

  return (
    <>
      {allContacts.map((contact) => (
        <div
          key={contact._id} 
          className="bg-purple-500/10 p-4 rounded-lg cursor-pointer hover:bg-purple-500/20 transition-colors" 
          onClick={() => { setSelectedUser(contact); navigate('/chat'); }}
        >
          <div className="flex items-center gap-3">
            <div className={`avatar online`}>
              <div className="size-12 rounded-full">
                <img src={contact.profilePicture} alt={contact.fullname} />
              </div>
            </div>
            <h4 className="font-medium text-[14px] text-zinc-900">{contact.fullname}</h4>
          </div>
        </div>
      ))}
    </>
  )
}

export default ContactList