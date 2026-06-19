import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import { chatService } from "@/services/chatService";
import { toast } from "react-hot-toast";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ]
};

interface CallStore {
  isCalling: boolean;
  isReceivingCall: boolean;
  callerInfo: any | null;
  callType: "audio" | "video" | null;
  callStatus: "idle" | "ringing" | "connected" | "ended";
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  receiverId: string | null;
  peerConnection: RTCPeerConnection | null;
  pendingIceCandidates: RTCIceCandidateInit[];
  isGroupCall: boolean;
  callDuration: number; // in seconds
  callStartTime: number | null; // timestamp
  callTimerInterval: NodeJS.Timeout | null;
  ringingTimeout: NodeJS.Timeout | null;

  availableCameras: MediaDeviceInfo[];
  selectedCameraId: string | null;

  setCallStatus: (status: "idle" | "ringing" | "connected" | "ended") => void;
  initiateCall: (receiver: any, type: "audio" | "video") => Promise<void>;
  receiveCall: (callerInfo: any, type: "audio" | "video") => void;
  acceptCall: () => Promise<void>;
  rejectCall: () => void;
  endCall: () => void;
  clearCall: () => void;
  switchCamera: (deviceId: string) => Promise<void>;

  flushIceCandidates: () => void;

  subscribeToCalls: () => void;
  unsubscribeFromCalls: () => void;
}

// Helper function to format duration
const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const useCallStore = create<CallStore>((set, get) => ({
  isCalling: false,
  isReceivingCall: false,
  callerInfo: null,
  callType: null,
  callStatus: "idle",
  localStream: null,
  remoteStream: null,
  receiverId: null,
  peerConnection: null,
  pendingIceCandidates: [],
  isGroupCall: false,
  callDuration: 0,
  callStartTime: null,
  callTimerInterval: null,
  ringingTimeout: null,

  availableCameras: [],
  selectedCameraId: null,

  setCallStatus: (status) => set({ callStatus: status }),

  initiateCall: async (receiver: any, type: "audio" | "video") => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === "video",
        audio: true,
      });

      set({
        isCalling: true,
        isReceivingCall: false,
        callerInfo: receiver,
        callType: type,
        callStatus: "ringing",
        localStream: stream,
        receiverId: receiver._id,
        isGroupCall: false,
        callStartTime: null,
        callDuration: 0,
      });

      // Lấy danh sách camera sau khi đã được cấp quyền
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === "videoinput");
      set({ availableCameras: videoDevices });
      if (videoDevices.length > 0) {
        set({ selectedCameraId: videoDevices[0].deviceId });
      }
      
      // Auto hangup after 40s of ringing
      const timeoutId = setTimeout(() => {
        if (get().callStatus === "ringing") {
          toast.error("Không có người trả lời");
          get().endCall();
        }
      }, 40000);

      set({ ringingTimeout: timeoutId });

      const socket = useAuthStore.getState().socket;
      if (socket) {
        socket.emit("call-request", {
          receiverId: receiver._id,
          type: type,
          isGroup: false,
        });
      }
    } catch (error) {
      console.error("Lỗi truy cập thiết bị:", error);
      toast.error("Không thể truy cập Camera/Microphone");
    }
  },

  receiveCall: (callerInfo, type) => {
    const timeoutId = setTimeout(() => {
      if (get().callStatus === "ringing") {
        get().clearCall();
      }
    }, 40000);

    set({
      isReceivingCall: true,
      callerInfo,
      callType: type,
      callStatus: "ringing",
      ringingTimeout: timeoutId
    });
  },

  acceptCall: async () => {
    const { callType, callerInfo, ringingTimeout } = get();
    if (ringingTimeout) clearTimeout(ringingTimeout);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: callType === "video",
        audio: true,
      });
      set({
        isReceivingCall: false,
        isCalling: true,
        callStatus: "connected",
        localStream: stream,
        callStartTime: Date.now(),
        callDuration: 0,
        ringingTimeout: null,
      });

      // Lấy danh sách camera sau khi đã được cấp quyền
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === "videoinput");
      set({ availableCameras: videoDevices });
      if (videoDevices.length > 0) {
        set({ selectedCameraId: videoDevices[0].deviceId });
      }

      // Start call timer
      const interval = setInterval(() => {
        set(state => ({
          callDuration: Math.floor((Date.now() - (state.callStartTime || Date.now())) / 1000)
        }));
      }, 1000);
      set({ callTimerInterval: interval });

      const socket = useAuthStore.getState().socket;
      if (socket) {
        socket.emit("call-accepted", {
          callerId: callerInfo._id,
          isGroup: false
        });
      }
    } catch (error) {
      console.error("Lỗi truy cập thiết bị:", error);
      toast.error("Không thể truy cập Camera/Microphone");
      get().rejectCall();
    }
  },

  rejectCall: () => {
    const socket = useAuthStore.getState().socket;
    const { callerInfo } = get();
    if (socket && callerInfo) {
      socket.emit("call-rejected", {
        callerId: callerInfo._id,
        isGroup: false
      });
    }
    get().clearCall();
  },

  endCall: () => {
    const socket = useAuthStore.getState().socket;
    const { receiverId, callerInfo, callDuration, callTimerInterval } = get();
    const authUser = useAuthStore.getState().authUser;

    const targetId = receiverId || (callerInfo ? callerInfo._id : null);

    // Stop timer
    if (callTimerInterval) {
      clearInterval(callTimerInterval);
    }

    // Send call ended event
    if (socket && targetId) {
      socket.emit("call-ended", {
        receiverId: targetId,
        isGroup: false
      });
    }

    // Save call log to chat
    if (targetId && authUser) {
      let callLogMessage = "";
      if (callDuration > 0) {
        const durationStr = formatDuration(callDuration);
        callLogMessage = `📞 Cuộc gọi đã kết thúc (${durationStr})`;
      } else {
        callLogMessage = `📞 Cuộc gọi nhỡ`;
      }
      
      chatService.sendMessage(targetId, {
        text: callLogMessage,
        type: "text",
      }).catch(error => {
        console.error("Error saving call log:", error);
      });
    }

    get().clearCall();
  },

  clearCall: () => {
    const { localStream, remoteStream, peerConnection, callTimerInterval, ringingTimeout } = get();
    
    // Stop the timer
    if (callTimerInterval) {
      clearInterval(callTimerInterval);
    }
    if (ringingTimeout) {
      clearTimeout(ringingTimeout);
    }
    
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
    }
    if (peerConnection) {
      peerConnection.close();
    }
    set({
      isCalling: false,
      isReceivingCall: false,
      callerInfo: null,
      callType: null,
      callStatus: "idle",
      localStream: null,
      remoteStream: null,
      receiverId: null,
      peerConnection: null,
      pendingIceCandidates: [],
      availableCameras: [],
      selectedCameraId: null,
      callDuration: 0,
      callStartTime: null,
      callTimerInterval: null,
      ringingTimeout: null,
    });
  },

  switchCamera: async (deviceId: string) => {
    const { localStream, peerConnection } = get();
    if (!localStream) return;

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } }
      });

      const newVideoTrack = newStream.getVideoTracks()[0];
      const oldVideoTrack = localStream.getVideoTracks()[0];

      if (oldVideoTrack) {
        localStream.removeTrack(oldVideoTrack);
        oldVideoTrack.stop();
      }
      localStream.addTrack(newVideoTrack);

      if (peerConnection) {
        const sender = peerConnection.getSenders().find(s => s.track && s.track.kind === "video");
        if (sender) {
          sender.replaceTrack(newVideoTrack);
        }
      }

      set({ selectedCameraId: deviceId, localStream });
    } catch (error) {
      console.error("Lỗi khi chuyển đổi camera:", error);
      toast.error("Không thể chuyển đổi camera");
    }
  },

  flushIceCandidates: () => {
    const { peerConnection, pendingIceCandidates } = get();
    if (peerConnection && pendingIceCandidates.length > 0) {
      pendingIceCandidates.forEach(c => {
        peerConnection.addIceCandidate(new RTCIceCandidate(c)).catch(e => console.error("Lỗi flush ICE:", e));
      });
      set({ pendingIceCandidates: [] });
    }
  },

  subscribeToCalls: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) {
      console.warn("Socket not available in subscribeToCalls, retrying in 500ms...");
      setTimeout(() => {
        get().subscribeToCalls();
      }, 500);
      return;
    }

    console.log("Setting up call listeners on socket:", socket.id);
    socket.off("incoming-call");
    socket.on("incoming-call", (data: any) => {
      console.log("📞 Incoming call received:", data);
      if (data.isGroup) return; // Không xử lý gọi nhóm ở store này

      // Block multiple calls
      if (get().isCalling || get().isReceivingCall) {
        console.log("⚠️ Already in a call, rejecting incoming call");
        socket.emit("call-rejected", {
          callerId: data.callerInfo._id,
          isGroup: false
        });
        return;
      }
      console.log("✅ Accepting incoming call from:", data.callerInfo.fullname);
      get().receiveCall(data.callerInfo, data.type);
    });

    socket.off("call-accepted");
    socket.on("call-accepted", async (data: any) => {
      if (data.isGroup) return;

      // Caller receives this when Callee accepts
      const { callStatus, ringingTimeout } = get();
      if (callStatus === "idle") return;
      if (ringingTimeout) clearTimeout(ringingTimeout);
      
      const interval = setInterval(() => {
        set(state => ({
          callDuration: Math.floor((Date.now() - (state.callStartTime || Date.now())) / 1000)
        }));
      }, 1000);

      set({ 
        callStatus: "connected", 
        ringingTimeout: null, 
        callStartTime: Date.now(),
        callTimerInterval: interval 
      });

      const { localStream } = get();

      const pc = new RTCPeerConnection(ICE_SERVERS);
      set({ peerConnection: pc });

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("webrtc-ice-candidate", {
            targetId: data.accepterId,
            candidate: event.candidate,
            isGroup: false
          });
        }
      };

      pc.ontrack = (event) => {
        const currentStream = get().remoteStream;
        let newStream = new MediaStream();
        
        if (currentStream) {
          currentStream.getTracks().forEach(track => newStream.addTrack(track));
        }

        if (event.streams && event.streams[0]) {
          event.streams[0].getTracks().forEach(track => {
            if (!newStream.getTracks().find(t => t.id === track.id)) {
              newStream.addTrack(track);
            }
          });
        } else {
          if (!newStream.getTracks().find(t => t.id === event.track.id)) {
            newStream.addTrack(event.track);
          }
        }
        
        set({ remoteStream: newStream });
      };

      if (localStream) {
        localStream.getTracks().forEach(track => {
          pc.addTrack(track, localStream);
        });
      }

      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("webrtc-offer", {
          targetId: data.accepterId,
          offer,
          isGroup: false
        });
      } catch (error) {
        console.error("Lỗi khi tạo WebRTC Offer:", error);
      }
    });

    socket.off("call-rejected");
    socket.on("call-rejected", () => {
      toast.error("Người dùng đang bận hoặc đã từ chối");
      
      const { receiverId } = get();
      if (receiverId) {
        chatService.sendMessage(receiverId, {
          text: `📞 Cuộc gọi từ chối`,
          type: "text"
        }).catch(e => console.error(e));
      }

      get().clearCall();
    });

    socket.off("call-ended");
    socket.on("call-ended", () => {
      toast("Cuộc gọi đã kết thúc", { icon: "📞" });
      get().clearCall();
    });

    socket.off("webrtc-offer");
    socket.on("webrtc-offer", async (data: any) => {
      if (data.isGroup) return;

      // Callee receives offer
      const { callStatus, isCalling, isReceivingCall } = get();
      if (callStatus === "idle" || (isReceivingCall && !isCalling)) return;

      const { localStream } = get();
      const pc = new RTCPeerConnection(ICE_SERVERS);
      set({ peerConnection: pc });

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("webrtc-ice-candidate", {
            targetId: data.senderId,
            candidate: event.candidate,
            isGroup: false
          });
        }
      };

      pc.ontrack = (event) => {
        const currentStream = get().remoteStream;
        let newStream = new MediaStream();
        
        if (currentStream) {
          currentStream.getTracks().forEach(track => newStream.addTrack(track));
        }

        if (event.streams && event.streams[0]) {
          event.streams[0].getTracks().forEach(track => {
            if (!newStream.getTracks().find(t => t.id === track.id)) {
              newStream.addTrack(track);
            }
          });
        } else {
          if (!newStream.getTracks().find(t => t.id === event.track.id)) {
            newStream.addTrack(event.track);
          }
        }
        
        set({ remoteStream: newStream });
      };

      if (localStream) {
        localStream.getTracks().forEach(track => {
          pc.addTrack(track, localStream);
        });
      }

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        get().flushIceCandidates();

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit("webrtc-answer", {
          targetId: data.senderId,
          answer,
          isGroup: false
        });
      } catch (error) {
        console.error("Lỗi xử lý Offer:", error);
      }
    });

    socket.off("webrtc-answer");
    socket.on("webrtc-answer", async (data: any) => {
      if (data.isGroup) return;

      // Caller receives answer
      const { peerConnection } = get();
      if (peerConnection) {
        try {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
          get().flushIceCandidates();
        } catch (error) {
          console.error("Lỗi xử lý Answer:", error);
        }
      }
    });

    socket.off("webrtc-ice-candidate");
    socket.on("webrtc-ice-candidate", async (data: any) => {
      if (data.isGroup) return;

      const { peerConnection, pendingIceCandidates } = get();
      if (peerConnection && peerConnection.remoteDescription) {
        try {
          await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (error) {
          console.error("Lỗi thêm ICE Candidate:", error);
        }
      } else {
        set({
          pendingIceCandidates: [...pendingIceCandidates, data.candidate]
        });
      }
    });
  },

  unsubscribeFromCalls: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("incoming-call");
    socket.off("call-accepted");
    socket.off("call-rejected");
    socket.off("call-ended");
    socket.off("webrtc-offer");
    socket.off("webrtc-answer");
    socket.off("webrtc-ice-candidate");
  }
}));
