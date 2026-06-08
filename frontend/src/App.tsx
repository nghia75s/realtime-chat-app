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
import { useThemeStore } from "./store/useThemeStore"
import ZaloCallModal from "./components/ui/ZaloCallModal"
import { useCallStore } from "./store/useCallStore"

function App() {
  const { checkAuth, isCheckingAuth, authUser } = useAuthStore();
  const socket = useAuthStore((state) => state.socket);
  const { fetchUnreadSummary } = useChatStore();
  // Khởi tạo theme từ localStorage ngay khi App mount
  useThemeStore();

  const { 
    receiveCall, 
    handleIncomingAnswer, 
    handleIncomingIceCandidate, 
    handleCallEnded, 
    handleCallRejected,
    setRemoteCameraEnabled,
    setRemoteMicEnabled
  } = useCallStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Sync unread badge từ server mỗi khi user login hoặc reload trang
  useEffect(() => {
    if (authUser) {
      fetchUnreadSummary();
    }
  }, [authUser]);

  // Socket call signaling listeners
  useEffect(() => {
    if (!socket) return;

    socket.on("incoming-call", ({ caller, offer, callType }) => {
      receiveCall(caller, offer, callType);
    });

    socket.on("call-accepted", ({ answer }) => {
      handleIncomingAnswer(answer);
    });

    socket.on("ice-candidate", ({ candidate }) => {
      handleIncomingIceCandidate(candidate);
    });

    socket.on("call-ended", () => {
      handleCallEnded();
    });

    socket.on("call-rejected", () => {
      handleCallRejected();
    });

    socket.on("peer-camera-toggled", ({ enabled }) => {
      setRemoteCameraEnabled(enabled);
    });

    socket.on("peer-mic-toggled", ({ enabled }) => {
      setRemoteMicEnabled(enabled);
    });

    return () => {
      socket.off("incoming-call");
      socket.off("call-accepted");
      socket.off("ice-candidate");
      socket.off("call-ended");
      socket.off("call-rejected");
      socket.off("peer-camera-toggled");
      socket.off("peer-mic-toggled");
    };
  }, [socket, receiveCall, handleIncomingAnswer, handleIncomingIceCandidate, handleCallEnded, handleCallRejected, setRemoteCameraEnabled, setRemoteMicEnabled]);

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
      <ZaloCallModal />
    </BrowserRouter>
  )
}

export default App
