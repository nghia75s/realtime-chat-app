import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import LoginPage from "./pages/LoginPage"
import SignupPage from "./pages/SignupPage"
import ChatPage from "./pages/ChatPage"
import { useAuthStore } from "./store/useAuthStore"
import { useEffect } from "react"
import PageLoader from "./components/ui/PageLoader"
import ContactsPage from "./pages/ContactsPage"
import TasksPage from "./task/TasksPage"
import DocumentFillerPage from "./tools/DocumentFillerPage"
import AdminPage from "./admin/AdminPage"
import DocumentPage from "./cloud/DocumentPage"

function App() {
  const { checkAuth, isCheckingAuth, authUser } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  console.log("Auth User:", authUser, "Is Checking Auth:", isCheckingAuth);

  if (isCheckingAuth) {
    return <PageLoader />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={authUser ? <Navigate to="/chat" /> : <LoginPage />} />
        <Route path="/signup" element={authUser ? <Navigate to="/chat" /> : <SignupPage />} />
        <Route path="/chat" element={authUser ? <ChatPage /> : <Navigate to="/login" />} />
        <Route path="/contacts" element={authUser ? <ContactsPage /> : <Navigate to="/login" />} />
        <Route path="/todo" element={authUser ? <TasksPage /> : <Navigate to="/login" />} />
        <Route path="/tools" element={authUser ? <DocumentFillerPage /> : <Navigate to="/login" />} />
        <Route path="/cloud" element={authUser ? <DocumentPage /> : <Navigate to="/login" />} />
        <Route path="/admin" element={authUser && authUser.email === "admin@gmail.com" ? <AdminPage /> : <Navigate to="/chat" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
