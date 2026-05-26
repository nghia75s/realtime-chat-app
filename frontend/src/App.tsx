import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import LoginPage from "./pages/LoginPage"
import SignupPage from "./pages/SignupPage"
import ChatPage from "./pages/ChatPage"
import { useAuthStore } from "./store/useAuthStore"
import { useChatStore } from "./store/useChatStore"
import { useEffect } from "react"
import PageLoader from "./components/ui/PageLoader"
import ContactsPage from "./pages/ContactsPage"
import TasksPage from "./task/TasksPage"
import DocumentFillerPage from "./tools/DocumentFillerPage"
import AdminPage from "./admin/AdminPage"
import DocumentPage from "./cloud/DocumentPage"
import GlobalAlerts from "./components/ui/GlobalAlerts"

function App() {
  const { checkAuth, isCheckingAuth, authUser } = useAuthStore();
  const { fetchUnreadSummary } = useChatStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Sync unread badge từ server mỗi khi user login hoặc reload trang
  useEffect(() => {
    if (authUser) {
      fetchUnreadSummary();
    }
  }, [authUser]);

  if (isCheckingAuth) {
    return <PageLoader />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={authUser ? <Navigate to="/chat" /> : <LoginPage />} />
        <Route path="/signup" element={authUser ? <Navigate to="/chat" /> : <SignupPage />} />
        <Route path="/chat" element={authUser ? (authUser.permissions?.viewChat !== false ? <ChatPage /> : <Navigate to="/login" />) : <Navigate to="/login" />} />
        <Route path="/contacts" element={authUser ? (authUser.permissions?.viewContacts ? <ContactsPage /> : <Navigate to="/chat" />) : <Navigate to="/login" />} />
        <Route path="/todo" element={authUser ? (authUser.permissions?.viewTasks ? <TasksPage /> : <Navigate to="/chat" />) : <Navigate to="/login" />} />
        <Route path="/tools" element={authUser ? (authUser.permissions?.viewTools ? <DocumentFillerPage /> : <Navigate to="/chat" />) : <Navigate to="/login" />} />
        <Route path="/cloud" element={authUser ? (authUser.permissions?.viewCloud ? <DocumentPage /> : <Navigate to="/chat" />) : <Navigate to="/login" />} />
        <Route path="/admin" element={authUser && authUser.permissions?.viewAdmin ? <AdminPage /> : <Navigate to="/chat" />} />
      </Routes>
      {authUser && <GlobalAlerts />}
    </BrowserRouter>
  )
}

export default App
