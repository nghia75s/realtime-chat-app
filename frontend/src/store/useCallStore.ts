import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import { toast } from "react-hot-toast";
import { axiosInstance } from "@/lib/axios";

// khai báo trạng thái cuộc gọi
export type CallStatus = "idle" | "ringing_outgoing" | "ringing_incoming" | "connected";
// khai báo loại cuộc gọi
export type CallType = "voice" | "video";

interface CallState {
  callStatus: CallStatus;
  callType: CallType | null;
  peerUser: any | null; // thông tin người dùng ở đầu dây bên kia
  localStream: MediaStream | null; // luồng dữ liệu của tôi
  remoteStream: MediaStream | null; // luồng dữ liệu đối phương
  localCameraEnabled: boolean;
  localMicEnabled: boolean;
  remoteCameraEnabled: boolean;
  remoteMicEnabled: boolean;
  isCaller: boolean;                // tôi có phải người gọi không
  callDuration: number;             // thời gian cuộc gọi (giây)
  callEndReason: "completed" | "rejected" | "missed" | "cancelled" | null; // lý do kết thúc cuộc gọi

  // các đối tượng quản lý kết nối WebRTC
  peerConnection: RTCPeerConnection | null; // kết nối mạng trực tiếp peer-to-peer
  pendingIceCandidates: RTCIceCandidateInit[]; // danh sách các ICE candidate chờ xử lý
  offer: any | null; // Received offer for incoming call

  // các hàm chức năng
  initiateCall: (receiver: any, type: CallType) => Promise<void>; // người gọi khởi tạo cuộc gọi
  receiveCall: (caller: any, offer: any, type: CallType) => void; // người nhận nhận cuộc gọi
  acceptCall: () => Promise<void>; // người nhận chấp nhận cuộc gọi
  rejectCall: () => void; // người nhận từ chối cuộc gọi
  endCall: () => void; // người gọi kết thúc cuộc gọi

  // hàm bật tắt thiết bị
  toggleCamera: () => void;
  toggleMic: () => void;

  // Remote Peer state changes (called by socket listeners)
  setRemoteCameraEnabled: (enabled: boolean) => void;
  setRemoteMicEnabled: (enabled: boolean) => void;
  handleIncomingAnswer: (answer: any) => Promise<void>;
  handleIncomingIceCandidate: (candidate: any) => Promise<void>;
  handleCallEnded: () => void;
  handleCallRejected: () => void;
}

// cấu hình máy chủ STUN của GG để tìm kiếm địa chỉ IP công khai cho kết nối P2P
const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

let callTimeoutId: any = null; // quản lý đồng hồ đếm ngược cuộc gọi
let durationIntervalId: any = null; // quản lý đồng hồ đo thời gian kết nối cuộc gọi

export const useCallStore = create<CallState>((set, get) => {
  // hàm dọn dẹp kết nối peer connection và luồng dữ liệu
  const cleanupCall = () => {
    const { peerConnection, localStream, isCaller, callStatus, peerUser, callType, callDuration, callEndReason } = get();

    if (durationIntervalId) {
      clearInterval(durationIntervalId);
      durationIntervalId = null;
    }

    if (callTimeoutId) {
      clearTimeout(callTimeoutId);
      callTimeoutId = null;
    }

    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }

    if (peerConnection) {
      peerConnection.ontrack = null;
      peerConnection.onicecandidate = null;
      peerConnection.close();
    }

    // Gửi tin nhắn Call Log lên server nếu mình là người gọi
    if (isCaller && peerUser && (callStatus === "connected" || callStatus === "ringing_outgoing")) {
      // Xác định trạng thái kết thúc cuộc gọi dựa trên callStatus và callEndReason
      const finalStatus = callStatus === "connected" ? "completed" : (callEndReason || "missed");
      axiosInstance.post(`/messages/send-call-log/${peerUser._id}`, {
        callType,
        duration: callStatus === "connected" ? callDuration : 0, // 0 giây đại diện cho cuộc gọi nhỡ/bị từ chối
        status: finalStatus
      }).catch(err => console.error("Lỗi gửi nhật ký cuộc gọi:", err));
    }

    set({
      callStatus: "idle",
      callType: null,
      peerUser: null,
      localStream: null,
      remoteStream: null,
      localCameraEnabled: true,
      localMicEnabled: true,
      remoteCameraEnabled: true,
      remoteMicEnabled: true,
      isCaller: false,
      callDuration: 0,
      peerConnection: null,
      pendingIceCandidates: [],
      offer: null,
      callEndReason: null, // đặt lại lý do kết thúc cuộc gọi về null
    });
  };

  /**
    * Hàm thiết lập kết nối WebRTC Peer Connection
    * Tạo kênh kết nối, đưa camera/mic cục bộ vào kết nối, đồng thời lắng nghe luồng từ đối phương gửi sang
    */
  const setupPeerConnection = (localStream: MediaStream, peerId: string) => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return null;

    const pc = new RTCPeerConnection(ICE_SERVERS);

    // Add local tracks to peer connection
    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream);
    });

    // Handle remote track
    pc.ontrack = (event) => {
      console.log("WebRTC: Received remote track", event.streams[0]);
      if (event.streams && event.streams[0]) {
        // Tạo một MediaStream mới chứa các track từ stream nhận được để đổi reference, giúp Zustand/React nhận diện thay đổi và cập nhật UI
        const newStream = new MediaStream(event.streams[0].getTracks());
        set({ remoteStream: newStream });
      }
    };

    // Lắng nghe và gửi các ứng viên mạng (ICE candidates) của bạn sang cho đối phương qua socket
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("WebRTC: Sending ICE candidate to", peerId);
        socket.emit("ice-candidate", {
          targetId: peerId,
          candidate: event.candidate,
        });
      }
    };

    return pc;
  };

  return {
    callStatus: "idle",
    callType: null,
    peerUser: null,
    localStream: null,
    remoteStream: null,
    localCameraEnabled: true,
    localMicEnabled: true,
    remoteCameraEnabled: true,
    remoteMicEnabled: true,
    isCaller: false,
    callDuration: 0,
    peerConnection: null,
    pendingIceCandidates: [],
    offer: null,
    callEndReason: null, // khởi tạo lý do kết thúc cuộc gọi bằng null
    // khởi tạo cuộc gọi đi
    initiateCall: async (receiver: any, type: CallType) => {
      cleanupCall();
      console.log("📞 Initiating call to:", receiver?.fullname, "type:", type);

      const socket = useAuthStore.getState().socket;
      const authUser = useAuthStore.getState().authUser;
      if (!socket || !authUser) {
        toast.error("Vui lòng kết nối mạng để thực hiện cuộc gọi.");
        return;
      }

      set({
        callStatus: "ringing_outgoing",
        callType: type,
        peerUser: receiver,
        localCameraEnabled: type === "video", // bật cam nếu cuộc gọi là vd
        localMicEnabled: true,
        isCaller: true,
        callDuration: 0,
        callEndReason: null, // mặc định ban đầu là null
      });

      try {
        // xin quyền truy cập phần cứng - sử dụng video: true để tương thích tối đa trên mọi camera và thiết bị
        const constraints = {
          audio: true,
          video: type === "video" ? true : false,
        };
        console.log("📷 getUserMedia constraints:", constraints);
        
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints);
          console.log("✅ getUserMedia thành công! Tracks:", stream.getTracks().map(t => `${t.kind}:${t.label}:enabled=${t.enabled}:readyState=${t.readyState}`));
        } catch (mediaErr: any) {
          console.error("❌ getUserMedia lỗi:", mediaErr.name, mediaErr.message);
          // Nếu lỗi do không có camera hoặc camera đang bận (khi test 2 tab trên cùng 1 webcam), vẫn giữ cuộc gọi là video nhưng tắt camera cục bộ
          if (type === "video") {
            console.warn("⚠️ Không thể truy cập camera, tiếp tục cuộc gọi video nhưng chỉ gửi âm thanh:", mediaErr);
            toast.error(`Không thể mở camera: thiết bị đang bận hoặc chưa cấp quyền. Cuộc gọi tiếp tục với chỉ âm thanh.`);
            stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            // Giữ nguyên callType là "video", chỉ tắt camera cục bộ của mình
            set({ localCameraEnabled: false });
          } else {
            throw mediaErr;
          }
        }
        
        set({ localStream: stream });
        console.log("📡 localStream set. Video tracks:", stream.getVideoTracks().length, "Audio tracks:", stream.getAudioTracks().length);

        // khởi tạo peer connection
        const pc = setupPeerConnection(stream, receiver._id);
        if (!pc) throw new Error("Could not initialize RTCPeerConnection");
        console.log("🔗 PeerConnection created, state:", pc.connectionState);

        // tạo offer
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        console.log("📤 Offer created and set as local description");

        set({ peerConnection: pc });

        // gửi tín hiệu mời gọi điện cho đối phương qua socket.io
        socket.emit("call-user", {
          receiverId: receiver._id,
          offer,
          callType: get().callType || type, // Sử dụng callType thực tế sau khi có thể đã fallback
        });
        console.log("📨 call-user emitted to", receiver._id);

        // hẹn giờ tự tắt cuộc gọi sau 45s
        callTimeoutId = setTimeout(() => {
          toast.error("Không có phản hồi từ người nhận.");
          get().endCall();
        }, 45000);

      } catch (err: any) {
        console.error("💥 Failed to access camera/mic or create offer:", err);
        toast.error(`Không thể truy cập camera hoặc micro: ${err.message || err.name || err}`);
        get().endCall();
      }
    },
    /**
     * NHẬN CUỘC GỌI ĐẾN (Người nhận)
     */
    receiveCall: (caller: any, offer: any, type: CallType) => {
      cleanupCall();
      console.log("Receiving call from:", caller, type);
      set({
        callStatus: "ringing_incoming",
        callType: type,
        peerUser: caller,
        offer,
        localCameraEnabled: type === "video",
        localMicEnabled: true,
        isCaller: false,
        callDuration: 0,
      });
      // đặt giao diện vào trạng thái đang đổ chuông đến
    },
    /**
     * trả lời cuộc gọi
     */
    acceptCall: async () => {
      const { peerUser, offer, callType } = get();
      const socket = useAuthStore.getState().socket;
      if (!peerUser || !offer || !callType || !socket) {
        toast.error("Không thể kết nối cuộc gọi.");
        get().endCall();
        return;
      }

      console.log("Accepting call from:", peerUser);
      set({ callStatus: "connected", callDuration: 0, callEndReason: "completed" }); // chấp nhận cuộc gọi -> đã kết nối thành công

      // Khởi động đồng hồ thời gian gọi
      if (durationIntervalId) {
        clearInterval(durationIntervalId);
        durationIntervalId = null;
      }
      durationIntervalId = setInterval(() => {
        set((state) => ({ callDuration: state.callDuration + 1 }));
      }, 1000);

      try {
        // Xin quyền truy cập thiết bị phần cứng của người nhận - sử dụng video: true để tương thích tối đa
        const constraints = {
          audio: true,
          video: callType === "video" ? true : false,
        };
        
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch (mediaErr: any) {
          // Nếu lỗi camera phía người nhận (ví dụ thiết bị bận khi test 2 tab), giữ nguyên cuộc gọi video nhưng tắt camera của người nhận
          if (callType === "video") {
            console.warn("Không thể truy cập camera phía người nhận, nhận cuộc gọi video nhưng chỉ gửi âm thanh:", mediaErr);
            toast.error(`Không thể mở camera: thiết bị đang bận hoặc chưa cấp quyền. Đang nhận cuộc gọi bằng âm thanh.`);
            stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            // Giữ nguyên callType là "video", chỉ tắt camera cục bộ của mình
            set({ localCameraEnabled: false });
          } else {
            throw mediaErr;
          }
        }
        
        set({ localStream: stream });

        const pc = setupPeerConnection(stream, peerUser._id);
        if (!pc) throw new Error("Could not initialize RTCPeerConnection");

        set({ peerConnection: pc });

        await pc.setRemoteDescription(new RTCSessionDescription(offer));

        // tạo SDP answer
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        // Gửi phản hồi Answer ngược lại cho người gọi qua Socket.io
        socket.emit("answer-call", {
          callerId: peerUser._id,
          answer,
        });

        // Add any pending ICE candidates
        const candidates = get().pendingIceCandidates;
        for (const candidate of candidates) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
        set({ pendingIceCandidates: [] });

      } catch (err: any) {
        console.error("Error accepting call:", err);
        toast.error(`Có lỗi xảy ra khi kết nối thiết bị: ${err.message || err.name || err}`);
        get().endCall();
      }
    },
    // từ chối cuộc gọi
    rejectCall: () => {
      const { peerUser } = get();
      const socket = useAuthStore.getState().socket;
      if (peerUser && socket) {
        socket.emit("reject-call", { callerId: peerUser._id });
      }
      cleanupCall();
    },
    // gác máy kết thúc cuộc gọi
    endCall: () => {
      const { peerUser, callStatus } = get();
      const socket = useAuthStore.getState().socket;
      
      // Nếu đang ở trạng thái đổ chuông đi mà gác máy -> nghĩa là tự hủy cuộc gọi
      if (callStatus === "ringing_outgoing") {
        set({ callEndReason: "cancelled" });
      }

      if (peerUser && socket) {
        socket.emit("end-call", { targetId: peerUser._id });
      }
      cleanupCall();
    },
    // bật tắt camera
    toggleCamera: async () => {
      const { localStream, localCameraEnabled, peerUser, peerConnection } = get();
      const socket = useAuthStore.getState().socket;

      // Nếu muốn TẮT camera
      if (localCameraEnabled) {
        if (localStream) {
          const videoTrack = localStream.getVideoTracks()[0];
          if (videoTrack) {
            // Chỉ tắt trạng thái enabled của track thay vì stop và remove, để WebRTC không bị đứt kết nối stream
            videoTrack.enabled = false;
          }
        }
        set({ localCameraEnabled: false });
        if (peerUser && socket) {
          socket.emit("toggle-camera", {
            targetId: peerUser._id,
            enabled: false,
          });
        }
        return;
      }

      // Nếu muốn BẬT camera
      // Bước 1: Nếu trong localStream đã có sẵn track video còn sống, chỉ cần bật lại
      if (localStream) {
        const videoTrack = localStream.getVideoTracks()[0];
        if (videoTrack && videoTrack.readyState === "live") {
          videoTrack.enabled = true;
          set({ 
            localCameraEnabled: true,
            callType: "video"
          });
          if (peerUser && socket) {
            socket.emit("toggle-camera", {
              targetId: peerUser._id,
              enabled: true,
            });
          }
          return;
        }
        // Nếu track đã "ended", xóa nó khỏi stream để tạo mới bên dưới
        if (videoTrack && videoTrack.readyState === "ended") {
          localStream.removeTrack(videoTrack);
        }
      }

      // Bước 2: Tạo track video mới (cuộc gọi thoại chuyển sang video, hoặc camera bị lỗi trước đó)
      try {
        console.log("📷 toggleCamera: Đang xin quyền mở camera mới...");
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: true
        });
        const newVideoTrack = videoStream.getVideoTracks()[0];
        console.log("✅ toggleCamera: Camera mới OK -", newVideoTrack.label);

        if (newVideoTrack) {
          let streamToUse = localStream;
          if (!streamToUse) {
            streamToUse = new MediaStream();
          }
          
          // Thêm track camera vào stream cục bộ
          streamToUse.addTrack(newVideoTrack);
          newVideoTrack.enabled = true;

          // Tạo một MediaStream mới chứa tất cả các track để đổi reference của localStream
          const newStream = new MediaStream(streamToUse.getTracks());
          set({ localStream: newStream });

          // Nếu đã kết nối WebRTC, đưa track vào peerConnection
          if (peerConnection) {
            // Tìm transceiver dành cho video dựa vào loại track của đầu nhận (luôn tồn tại loại track kể cả khi rỗng)
            const videoTransceiver = peerConnection.getTransceivers().find(t => t.receiver.track.kind === "video");
            if (videoTransceiver && videoTransceiver.sender) {
              await videoTransceiver.sender.replaceTrack(newVideoTrack);
            } else {
              // Fallback nếu không tìm thấy transceiver, thêm mới track
              peerConnection.addTrack(newVideoTrack, newStream);
            }
          }

          // Cập nhật trạng thái
          set({ 
            localCameraEnabled: true,
            callType: "video" // Tự động đổi loại cuộc gọi thành video
          });

          // Đồng bộ trạng thái sang đối phương qua socket
          if (peerUser && socket) {
            socket.emit("toggle-camera", {
              targetId: peerUser._id,
              enabled: true,
            });
          }
        }
      } catch (err: any) {
        console.error("❌ toggleCamera lỗi:", err.name, err.message);
        // Đảm bảo state nhất quán khi lỗi
        set({ localCameraEnabled: false });
        if (err.name === "NotReadableError") {
          toast.error("Camera đang được sử dụng bởi ứng dụng/tab khác. Hãy đóng các ứng dụng camera khác rồi thử lại.");
        } else if (err.name === "NotAllowedError") {
          toast.error("Trình duyệt chưa cấp quyền camera. Vui lòng kiểm tra cài đặt quyền truy cập.");
        } else {
          toast.error(`Không thể mở camera: ${err.message || err.name || err}`);
        }
      }
    },
    /**
     * BẬT / TẮT MICRO CÁ NHÂN
     */
    toggleMic: () => {
      const { localStream, localMicEnabled, peerUser } = get();
      const socket = useAuthStore.getState().socket;
      if (!localStream) return;

      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        const nextState = !localMicEnabled;
        audioTrack.enabled = nextState;
        set({ localMicEnabled: nextState });
        // Đồng bộ hóa trạng thái tắt tiếng cho đối phương thấy qua socket
        if (peerUser && socket) {
          socket.emit("toggle-mic", {
            targetId: peerUser._id,
            enabled: nextState,
          });
        }
      }
    },

    setRemoteCameraEnabled: (enabled: boolean) => {
      set({ remoteCameraEnabled: enabled });
      // Cập nhật loại cuộc gọi thành video khi đối phương bật camera
      if (enabled) {
        set({ callType: "video" });
      }
    },

    setRemoteMicEnabled: (enabled: boolean) => {
      set({ remoteMicEnabled: enabled });
    },

    handleIncomingAnswer: async (answer: any) => {
      const { peerConnection } = get();
      if (!peerConnection) return;
      // hủy đếm ngược khi được kết nối
      if (callTimeoutId) {
        clearTimeout(callTimeoutId);
        callTimeoutId = null;
      }

      console.log("WebRTC: Setting remote answer description");
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      set({ callStatus: "connected", callDuration: 0, callEndReason: "completed" }); // Kích hoạt trạng thái đang đàm thoại (hoàn thành)

      // Khởi động đồng hồ thời gian gọi ở phía người gọi
      if (durationIntervalId) {
        clearInterval(durationIntervalId);
        durationIntervalId = null;
      }
      durationIntervalId = setInterval(() => {
        set((state) => ({ callDuration: state.callDuration + 1 }));
      }, 1000);
    },

    handleIncomingIceCandidate: async (candidate: any) => {
      const { peerConnection } = get();
      if (peerConnection && peerConnection.remoteDescription) {
        console.log("WebRTC: Adding remote ICE candidate");
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } else {
        console.log("WebRTC: Queuing ICE candidate (remoteDescription not set yet)");
        set((state) => ({
          pendingIceCandidates: [...state.pendingIceCandidates, candidate],
        }));
      }
    },

    handleCallEnded: () => {
      cleanupCall();
      toast("Cuộc gọi đã kết thúc.");
    },

    handleCallRejected: () => {
      set({ callEndReason: "rejected" }); // Người nhận từ chối cuộc gọi
      cleanupCall();
      toast.error("Người nhận đã từ chối cuộc gọi.");
    },
  };
});
