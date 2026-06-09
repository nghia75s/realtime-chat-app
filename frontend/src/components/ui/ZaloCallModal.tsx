import { useEffect, useRef, useState } from "react";
import { 
  Phone, 
  PhoneOff, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Upload, 
  UserPlus, 
  LayoutGrid, 
  Maximize2, 
  Minimize2, 
  Settings,
  ChevronUp
} from "lucide-react";
import { useCallStore } from "@/store/useCallStore";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "react-hot-toast";

// Web Audio API Ringtone Synthesizer
class CallAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private intervalId: any = null;

  startOutgoing() {
    this.stop();
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      
      const playDialTone = () => {
        if (!this.ctx) return;
        if (this.ctx.state === "suspended") {
          this.ctx.resume();
        }
        
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        
        osc1.frequency.value = 350;
        osc2.frequency.value = 440;
        
        gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.08, this.ctx.currentTime + 1.2);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.4);
        
        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        
        osc1.start();
        osc2.start();
        
        osc1.stop(this.ctx.currentTime + 1.4);
        osc2.stop(this.ctx.currentTime + 1.4);
      };

      playDialTone();
      this.intervalId = setInterval(playDialTone, 3000);
    } catch (e) {
      console.warn("AudioContext init failed (waiting for user interaction):", e);
    }
  }

  startIncoming() {
    this.stop();
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();

      const playChime = () => {
        if (!this.ctx) return;
        if (this.ctx.state === "suspended") {
          this.ctx.resume();
        }
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        const now = this.ctx.currentTime;
        notes.forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.frequency.value = freq;
          osc.type = "sine";
          
          gain.gain.setValueAtTime(0, now + idx * 0.12);
          gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.12 + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.35);
          
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 0.35);
        });
      };

      playChime();
      this.intervalId = setInterval(playChime, 1800);
    } catch (e) {
      console.warn("AudioContext init failed:", e);
    }
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.ctx) {
      if (this.ctx.state !== "closed") {
        this.ctx.close();
      }
      this.ctx = null;
    }
  }
}

export default function ZaloCallModal() {
  const {
    callStatus,
    callType,
    peerUser,
    localStream,
    remoteStream,
    localCameraEnabled,
    localMicEnabled,
    remoteCameraEnabled,
    remoteMicEnabled,
    acceptCall,
    rejectCall,
    endCall,
    toggleCamera,
    toggleMic,
    callDuration
  } = useCallStore();

  const authUser = useAuthStore((state) => state.authUser);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Initialize ringtones automatically based on callStatus
  useEffect(() => {
    const synth = new CallAudioSynthesizer();
    if (callStatus === "ringing_outgoing") {
      synth.startOutgoing();
    } else if (callStatus === "ringing_incoming") {
      synth.startIncoming();
    } else {
      synth.stop();
    }
    return () => {
      synth.stop();
    };
  }, [callStatus]);

  // Callback ref: gán stream vào video element ngay khi element được mount vào DOM
  // Điều này quan trọng vì khi chuyển từ "ringing" → "connected", video element mới được tạo
  // nhưng localStream đã được set từ trước → useEffect([localStream]) không chạy lại
  const setLocalVideoRef = (el: HTMLVideoElement | null) => {
    localVideoRef.current = el;
    if (el && localStream && el.srcObject !== localStream) {
      el.srcObject = localStream;
      el.play().catch(() => {});
    }
  };

  const setRemoteVideoRef = (el: HTMLVideoElement | null) => {
    remoteVideoRef.current = el;
    if (el && remoteStream && el.srcObject !== remoteStream) {
      el.srcObject = remoteStream;
      el.play().catch(() => {});
    }
  };

  // useEffect: xử lý khi stream thay đổi SAU KHI element đã mount (ví dụ: toggle camera tạo stream mới)
  useEffect(() => {
    const el = localVideoRef.current;
    if (!el || !localStream) return;
    if (el.srcObject !== localStream) {
      el.srcObject = localStream;
      el.play().catch(() => {});
    }
  }, [localStream]);

  useEffect(() => {
    const el = remoteVideoRef.current;
    if (!el || !remoteStream) return;
    if (el.srcObject !== remoteStream) {
      el.srcObject = remoteStream;
      el.play().catch(() => {});
    }
  }, [remoteStream]);

  // Điều kiện hiển thị video/avatar dựa trên state của Zustand
  const showLocalVideo = callType === "video" && localCameraEnabled && !!localStream;
  const showRemoteVideo = callType === "video" && remoteCameraEnabled && !!remoteStream;
  const showLocalAvatar = !showLocalVideo;
  const showRemoteAvatar = !showRemoteVideo;
  const toggleFullscreen = () => {
    if (!modalRef.current) return;
    if (!document.fullscreenElement) {
      modalRef.current.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(err => {
          console.error("Error enabling fullscreen", err);
        });
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  if (callStatus === "idle") return null;

  const formatTime = (totalSec: number) => {
    const min = Math.floor(totalSec / 60).toString().padStart(2, "0");
    const sec = (totalSec % 60).toString().padStart(2, "0");
    return `${min}:${sec}`;
  };

  // 1. Incoming Call UI
  if (callStatus === "ringing_incoming") {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-md transition-all">
        <div className="w-[380px] rounded-3xl bg-[#1e2022] border border-[#2f3031] p-8 shadow-2xl flex flex-col items-center text-center text-white relative overflow-hidden">
          {/* Decorative ambient blurred background */}
          <div 
            className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-15 scale-125 -z-10"
            style={{ backgroundImage: `url(${peerUser?.profilePicture || "/avatar.png"})` }}
          />

          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" />
            <img 
              src={peerUser?.profilePicture || "/avatar.png"} 
              alt={peerUser?.fullname} 
              className="w-24 h-24 rounded-full border-4 border-[#3a3b3c] object-cover relative z-10"
            />
          </div>

          <h3 className="text-xl font-bold mb-1">{peerUser?.fullname || "Người dùng"}</h3>
          <p className="text-sm text-[#9da0a4] mb-8">
            Cuộc gọi {callType === "video" ? "video" : "thoại"} đến...
          </p>

          <div className="flex gap-10 items-center justify-center w-full">
            {/* Decline Button */}
            <button 
              onClick={rejectCall}
              className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white transition-transform hover:scale-110 active:scale-95 shadow-lg shadow-red-900/40 cursor-pointer"
              title="Từ chối"
            >
              <PhoneOff className="w-7 h-7" />
            </button>

            {/* Accept Button */}
            <button 
              onClick={acceptCall}
              className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center text-white transition-transform hover:scale-110 active:scale-95 shadow-lg shadow-green-900/40 cursor-pointer"
              title="Trả lời"
            >
              <Phone className="w-7 h-7" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Outgoing Call UI
  if (callStatus === "ringing_outgoing") {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-lg">
        <div className="w-[380px] rounded-3xl bg-[#1e2022] border border-[#2f3031] p-8 shadow-2xl flex flex-col items-center text-center text-white relative overflow-hidden">
          
          <div 
            className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-15 scale-125 -z-10"
            style={{ backgroundImage: `url(${peerUser?.profilePicture || "/avatar.png"})` }}
          />

          <div className="relative mb-6 mt-4">
            {/* Pulsing rings around avatar */}
            <div className="absolute -inset-4 rounded-full border border-blue-500/10 animate-ping [animation-duration:2.5s]" />
            <div className="absolute -inset-8 rounded-full border border-blue-500/5 animate-ping [animation-duration:3s]" />
            <img 
              src={peerUser?.profilePicture || "/avatar.png"} 
              alt={peerUser?.fullname} 
              className="w-24 h-24 rounded-full border-4 border-[#3a3b3c] object-cover relative z-10"
            />
          </div>

          <h3 className="text-xl font-bold mb-1">{peerUser?.fullname || "Người dùng"}</h3>
          <p className="text-sm text-blue-400 font-medium animate-pulse mb-10">Đang đổ chuông...</p>

          <button 
            onClick={endCall}
            className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white transition-transform hover:scale-110 active:scale-95 shadow-lg shadow-red-900/30 cursor-pointer mb-2"
            title="Hủy cuộc gọi"
          >
            <PhoneOff className="w-7 h-7" />
          </button>
        </div>
      </div>
    );
  }



  // 3. Connected Call UI (Zalo Grid Style)
  return (
    <div 
      ref={modalRef}
      className="fixed inset-0 z-[9999] flex flex-col bg-[#141517] text-white overflow-hidden transition-all duration-300"
    >
      {/* Call Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#1e2022] border-b border-[#2d2f31] shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
          <h2 className="font-semibold text-base tracking-wide select-none">
            Zalo Call - {peerUser?.fullname || "Cuộc gọi"}
          </h2>
        </div>
        
        {/* Timer Badge */}
        <div className="bg-green-600 text-white font-mono text-[13px] font-bold px-3 py-1 rounded-md shadow-inner">
          {formatTime(callDuration)}
        </div>
      </div>

      {/* Grid Video Container */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-[#141517] relative z-10">
        
        {/* Container 1: Remote User (The other person) */}
        <div className="relative overflow-hidden rounded-2xl bg-[#1e2022] border border-[#2d2f31] flex items-center justify-center shadow-lg group">
          {/* Label name */}
          <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1.5 rounded-lg text-sm font-medium z-20 select-none border border-white/5">
            {peerUser?.fullname || "Người dùng"}
          </div>

          {/* Video stream (always rendered to keep audio stream active) */}
          <video 
            ref={setRemoteVideoRef} 
            autoPlay 
            playsInline 
            className={`w-full h-full object-cover ${showRemoteVideo ? "" : "hidden"}`} 
          />

          {/* Blur Avatar Background when Camera is OFF */}
          {showRemoteAvatar && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div 
                className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-30 scale-110"
                style={{ backgroundImage: `url(${peerUser?.profilePicture || "/avatar.png"})` }}
              />
              <img 
                src={peerUser?.profilePicture || "/avatar.png"} 
                alt="Remote Avatar" 
                className="w-32 h-32 rounded-full border-4 border-white/20 object-cover shadow-2xl relative z-10"
              />
              <span className="mt-4 bg-black/75 text-white/90 px-4 py-2 rounded-full text-xs font-semibold backdrop-blur-sm relative z-10 border border-white/5">
                {callType === "voice" ? "Đang đàm thoại..." : (remoteCameraEnabled ? "Đang kết nối..." : "Đã tắt camera")}
              </span>
            </div>
          )}

          {/* Muted microphone overlay */}
          {!remoteMicEnabled && (
            <div className="absolute top-4 right-4 bg-red-600/90 text-white p-2 rounded-full z-20 shadow-md border border-white/10" title="Đối phương đang tắt mic">
              <MicOff className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Container 2: Local User (You) */}
        <div className="relative overflow-hidden rounded-2xl bg-[#1e2022] border border-[#2d2f31] flex items-center justify-center shadow-lg group">
          {/* Label name */}
          <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1.5 rounded-lg text-sm font-medium z-20 select-none border border-white/5">
            {authUser?.fullname || "Bạn"}
          </div>

          {/* Video stream (always rendered to keep audio stream active) */}
          <video 
            ref={setLocalVideoRef} 
            autoPlay 
            playsInline 
            muted 
            className={`w-full h-full object-cover ${showLocalVideo ? "" : "hidden"}`} 
          />

          {/* Blur Avatar Background when Camera is OFF */}
          {showLocalAvatar && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div 
                className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-30 scale-110"
                style={{ backgroundImage: `url(${authUser?.profilePicture || "/avatar.png"})` }}
              />
              <img 
                src={authUser?.profilePicture || "/avatar.png"} 
                alt="Local Avatar" 
                className="w-32 h-32 rounded-full border-4 border-[#3a3b3c] object-cover shadow-2xl relative z-10"
              />
              <span className="mt-4 bg-black/75 text-white/90 px-4 py-2 rounded-full text-xs font-semibold backdrop-blur-sm relative z-10 border border-white/5">
                {callType === "voice" ? "Đang đàm thoại..." : "Đã tắt camera"}
              </span>
            </div>
          )}

          {/* Muted microphone overlay */}
          {!localMicEnabled && (
            <div className="absolute top-4 right-4 bg-red-600/90 text-white p-2 rounded-full z-20 shadow-md border border-white/10" title="Bạn đang tắt mic">
              <MicOff className="w-4 h-4" />
            </div>
          )}
        </div>

      </div>

      {/* Control Bar (Zalo Capsule style) */}
      <div className="bg-[#1e2022] border-t border-[#2d2f31] h-[80px] px-8 flex items-center justify-between shrink-0 z-20">
        
        {/* Left Side Actions */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => toast.success("Đang chia sẻ màn hình (giả lập)")}
            className="p-3 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
            title="Chia sẻ màn hình"
          >
            <Upload className="w-5 h-5" />
          </button>
          <button 
            onClick={() => toast.success("Mời thêm thành viên (giả lập)")}
            className="p-3 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
            title="Thêm người tham gia"
          >
            <UserPlus className="w-5 h-5" />
          </button>
        </div>

        {/* Center Actions (Core Controls) */}
        <div className="flex items-center gap-6">
          {/* Nút bật tắt Camera (dạng Capsule tích hợp tùy chọn thiết bị) - Toàn bộ vùng bên trái có thể bấm được */}
          <div className="flex items-center rounded-2xl border transition-all duration-250 select-none bg-[#202124]/90 hover:bg-[#2b2d30]/90 border-zinc-700/80 overflow-hidden h-[40px] p-0">
            <button 
              onClick={toggleCamera}
              className="flex items-center justify-center pl-4 pr-3 py-2 text-white focus:outline-none hover:bg-white/5 active:bg-white/10 transition-colors h-full cursor-pointer"
              title={localCameraEnabled ? "Tắt Camera" : "Bật Camera"}
            >
              {localCameraEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5 text-red-500" />}
            </button>
            <div className="w-[1px] h-4 bg-zinc-600/40 shrink-0" />
            <button
              onClick={() => toast.success("Mở cài đặt thiết bị camera...")}
              className="flex items-center justify-center px-3 py-2 text-zinc-400 hover:text-white hover:bg-white/5 active:bg-white/10 transition-colors h-full cursor-pointer"
              title="Chọn camera"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>

          {/* Nút gác máy (End call) - Hình tròn màu đỏ ở giữa */}
          <button 
            onClick={endCall}
            className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all hover:scale-105 active:scale-95 shadow-md flex items-center justify-center cursor-pointer border border-red-500/20"
            title="Gác máy"
          >
            <PhoneOff className="w-6.5 h-6.5" />
          </button>

          {/* Nút bật tắt Mic (dạng Capsule tích hợp tùy chọn thiết bị) - Toàn bộ vùng bên trái có thể bấm được */}
          <div className="flex items-center rounded-2xl border transition-all duration-250 select-none bg-[#202124]/90 hover:bg-[#2b2d30]/90 border-zinc-700/80 overflow-hidden h-[40px] p-0">
            <button 
              onClick={toggleMic}
              className="flex items-center justify-center pl-4 pr-3 py-2 text-white focus:outline-none hover:bg-white/5 active:bg-white/10 transition-colors h-full cursor-pointer"
              title={localMicEnabled ? "Tắt Mic" : "Bật Mic"}
            >
              {localMicEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5 text-red-500" />}
            </button>
            <div className="w-[1px] h-4 bg-zinc-600/40 shrink-0" />
            <button
              onClick={() => toast.success("Mở cài đặt thiết bị micro...")}
              className="flex items-center justify-center px-3 py-2 text-zinc-400 hover:text-white hover:bg-white/5 active:bg-white/10 transition-colors h-full cursor-pointer"
              title="Chọn micro"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => toast.success("Thay đổi bố cục (giả lập)")}
            className="p-3 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
            title="Thay đổi bố cục"
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button 
            onClick={toggleFullscreen}
            className="p-3 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
            title="Toàn màn hình"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
          <button 
            onClick={() => toast.success("Cài đặt thiết bị (giả lập)")}
            className="p-3 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
            title="Cài đặt thiết bị"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
}
