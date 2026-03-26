import { Route, Routes } from 'react-router';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ChatPage from './pages/ChatPage';
import { useAuthStore } from './store/useAuthStore';

function App() {
  const { authUser, isLoggedIn, login } = useAuthStore();
  console.log("auth", authUser);
  console.log("logged", isLoggedIn);
  return (
    <div className='min-h-screen bg-slate-900 relative flex items-center justify-center p-4 overflow-hidden'>
      {/*decoration*/}
      <div className='absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]' />
      <div className='absolute top-0 -left-4 w-96 h-96 bg-pink-500 opacity-20 blur-[100px]' />
      <div className='absolute bottom-0 -right-4 w-96 h-96 bg-cyan-500 opacity-20 blur-[100px]' />
      
      <button onClick={login} className='z-10'>Login</button>

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </div>
  );
}

export default App;