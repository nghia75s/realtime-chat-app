import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import toast from "react-hot-toast";

const ICE_SERVERS = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
    ],
};

interface GroupCallState {
    isCalling: boolean;
    isReceivingCall: boolean;
    callerInfo: any | null;
    callType: "audio" | "video" | null;
    callStatus: "idle" | "ringing" | "connected" | "ended";
    
    localStream: MediaStream | null;
    remoteStreams: Record<string, MediaStream>; // [userId]: MediaStream
    groupId: string | null;
    
    peers: Record<string, RTCPeerConnection>;
    pendingIceCandidates: Record<string, RTCIceCandidateInit[]>;
    
    availableCameras: MediaDeviceInfo[];
    selectedCameraId: string | null;

    isSubscribed: boolean;

    setCallStatus: (status: "idle" | "ringing" | "connected" | "ended") => void;
    initiateGroupCall: (group: any, type: "audio" | "video") => Promise<void>;
    receiveGroupCall: (callerInfo: any, type: "audio" | "video", groupId: string) => void;
    acceptCall: () => void;
    rejectCall: () => void;
    endCall: () => void;
    clearCall: () => void;
    createPeerConnection: (targetId: string, isInitiator: boolean) => RTCPeerConnection;
    removePeer: (targetId: string) => void;
    switchCamera: (deviceId: string) => Promise<void>;
    subscribeToGroupCalls: () => void;
    unsubscribeFromGroupCalls: () => void;
}

export const useGroupCallStore = create<GroupCallState>((set, get) => ({
    isCalling: false,
    isReceivingCall: false,
    callerInfo: null,
    callType: null,
    callStatus: "idle",

    localStream: null,
    remoteStreams: {},
    groupId: null,

    peers: {},
    pendingIceCandidates: {},
    availableCameras: [],
    selectedCameraId: null,

    isSubscribed: false,

    setCallStatus: (status) => set({ callStatus: status }),

    initiateGroupCall: async (group, type) => {
        if (get().isCalling || get().isReceivingCall) return; // Ngăn bấm đúp

        try {
            // Reset state cũ trước khi bắt đầu cuộc gọi mới
            get().clearCall();

            const stream = await navigator.mediaDevices.getUserMedia({
                video: type === "video",
                audio: true,
            });
            set({
                isCalling: true,
                callType: type,
                callStatus: "ringing",
                localStream: stream,
                groupId: group._id,
                callerInfo: group,
                remoteStreams: {}, // Đảm bảo rỗng
                peers: {} // Đảm bảo rỗng
            });

            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(d => d.kind === "videoinput");
            set({ availableCameras: videoDevices });
            if (videoDevices.length > 0) {
                set({ selectedCameraId: videoDevices[0].deviceId });
            }

            const socket = useAuthStore.getState().socket;
            if (socket) {
                socket.emit("call-request", {
                    receiverId: null,
                    groupId: group._id,
                    type,
                    isGroup: true
                });
            }
        } catch (error) {
            console.error("Lỗi truy cập thiết bị:", error);
            toast.error("Không thể truy cập Camera/Microphone");
            get().clearCall();
        }
    },

    receiveGroupCall: (callerInfo, type, groupId) => {
        set({
            isReceivingCall: true,
            callerInfo,
            callType: type,
            callStatus: "ringing",
            groupId,
            remoteStreams: {}, // Reset chống lưu cache stream cũ
            peers: {} // Reset chống lưu cache peer cũ
        });
    },

    acceptCall: async () => {
        const { callerInfo, groupId, callType, callStatus } = get();
        // Ngăn chặn bấm nút Accept nhiều lần trong lúc getUserMedia đang chờ
        if (callStatus === "connected") return; 

        try {
            // Thay đổi state NGAY LẬP TỨC để đóng modal và ẩn nút Accept
            set({
                isReceivingCall: false,
                isCalling: true,
                callStatus: "connected",
            });

            const stream = await navigator.mediaDevices.getUserMedia({
                video: callType === "video",
                audio: true,
            });
            
            set({ localStream: stream });

            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(d => d.kind === "videoinput");
            set({ availableCameras: videoDevices });
            if (videoDevices.length > 0) {
                set({ selectedCameraId: videoDevices[0].deviceId });
            }

            const socket = useAuthStore.getState().socket;
            if (socket) {
                socket.emit("call-accepted", {
                    callerId: callerInfo._id,
                    groupId: groupId,
                    isGroup: true
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
        const { callerInfo, groupId } = get();
        if (socket && callerInfo) {
            socket.emit("call-rejected", {
                callerId: callerInfo._id,
                groupId: groupId,
                isGroup: true
            });
        }
        get().clearCall();
    },

    endCall: () => {
        const socket = useAuthStore.getState().socket;
        const { groupId } = get();
        if (socket) {
            socket.emit("call-ended", {
                receiverId: null,
                groupId,
                isGroup: true
            });
        }
        get().clearCall();
    },

    clearCall: () => {
        const { localStream, remoteStreams, peers } = get();
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        Object.values(remoteStreams).forEach(stream => {
            stream.getTracks().forEach(track => track.stop());
        });
        Object.values(peers).forEach(pc => {
            pc.close();
        });
        set({
            isCalling: false,
            isReceivingCall: false,
            callerInfo: null,
            callType: null,
            callStatus: "idle",
            localStream: null,
            remoteStreams: {},
            groupId: null,
            peers: {},
            pendingIceCandidates: {},
            availableCameras: [],
            selectedCameraId: null
        });
    },

    createPeerConnection: (targetId: string, isInitiator: boolean) => {
        const { localStream, groupId, peers, remoteStreams } = get();
        const socket = useAuthStore.getState().socket;
        const pc = new RTCPeerConnection(ICE_SERVERS);

        pc.onicecandidate = (event) => {
            if (event.candidate && socket) {
                socket.emit("webrtc-ice-candidate", {
                    targetId,
                    candidate: event.candidate,
                    isGroup: true,
                    groupId
                });
            }
        };

        pc.ontrack = (event) => {
            const currentStreams = get().remoteStreams;
            
            // LUÔN LUÔN tạo mới MediaStream để thay đổi reference, ép React render lại thẻ video
            let newStream = new MediaStream();
            
            // Lấy các track cũ (nếu có)
            if (currentStreams[targetId]) {
                currentStreams[targetId].getTracks().forEach(track => newStream.addTrack(track));
            }

            // Lấy các track từ event
            if (event.streams && event.streams[0]) {
                event.streams[0].getTracks().forEach(track => {
                    if (!newStream.getTracks().find(t => t.id === track.id)) {
                        newStream.addTrack(track);
                    }
                });
            } else {
                newStream.addTrack(event.track);
            }

            set({
                remoteStreams: {
                    ...currentStreams,
                    [targetId]: newStream
                }
            });
        };

        if (localStream) {
            localStream.getTracks().forEach(track => {
                pc.addTrack(track, localStream);
            });
        }

        set({
            peers: {
                ...peers,
                [targetId]: pc
            }
        });

        if (isInitiator) {
            pc.createOffer().then(offer => {
                return pc.setLocalDescription(offer).then(() => {
                    if (socket) {
                        socket.emit("webrtc-offer", {
                            targetId,
                            offer,
                            isGroup: true,
                            groupId
                        });
                    }
                });
            }).catch(error => {
                console.error("Lỗi tạo Offer nhóm:", error);
            });
        }

        return pc;
    },

    removePeer: (targetId: string) => {
        const { peers, remoteStreams } = get();
        const pc = peers[targetId];
        if (pc) {
            pc.close();
        }
        const stream = remoteStreams[targetId];
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }

        const newPeers = { ...peers };
        delete newPeers[targetId];

        const newStreams = { ...remoteStreams };
        delete newStreams[targetId];

        set({
            peers: newPeers,
            remoteStreams: newStreams
        });
    },

    switchCamera: async (deviceId: string) => {
        const { localStream, peers } = get();
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

            Object.values(peers).forEach(pc => {
                const sender = pc.getSenders().find(s => s.track && s.track.kind === "video");
                if (sender) {
                    sender.replaceTrack(newVideoTrack);
                }
            });

            set({ selectedCameraId: deviceId, localStream });
        } catch (error) {
            console.error("Lỗi khi chuyển đổi camera nhóm:", error);
            toast.error("Không thể chuyển đổi camera");
        }
    },

    flushIceCandidates: (targetId: string) => {
        const { peers, pendingIceCandidates } = get();
        const pc = peers[targetId];
        const pending = pendingIceCandidates[targetId];
        if (pc && pending && pending.length > 0) {
            pending.forEach(c => pc.addIceCandidate(new RTCIceCandidate(c)).catch(e => console.error("Lỗi flush ICE:", e)));
            set({
                pendingIceCandidates: {
                    ...pendingIceCandidates,
                    [targetId]: []
                }
            });
        }
    },

    subscribeToGroupCalls: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        // Tránh bị đăng ký nhiều lần do React Strict Mode
        if (get().isSubscribed) return;
        set({ isSubscribed: true });

        socket.on("incoming-call", (data: any) => {
            if (!data.isGroup) return; 

            // Nếu đang trong chính cuộc gọi nhóm này, tự động gửi lại call-accepted cho người mới
            if (get().isCalling && get().groupId === data.groupId) {
                socket.emit("call-accepted", {
                    callerId: data.callerInfo._id,
                    isGroup: true,
                    groupId: data.groupId
                });
                return;
            }

            // Nếu đang gọi cuộc gọi KHÁC, thì từ chối
            if (get().isCalling || get().isReceivingCall) {
                socket.emit("call-rejected", {
                    callerId: data.callerInfo._id,
                    isGroup: true,
                    groupId: data.groupId
                });
                return;
            }
            get().receiveGroupCall(data.callerInfo, data.type, data.groupId);
        });

        socket.on("call-accepted", async (data: any) => {
            if (!data.isGroup) return;

            const { callStatus, isReceivingCall, isCalling } = get();
            
            // Nếu mình đang nhận nhưng chưa bắt máy
            if (isReceivingCall && !isCalling) return;

            if (callStatus === "idle") return; 
            
            if (callStatus === "ringing") {
                set({ callStatus: "connected" });
            }

            get().createPeerConnection(data.accepterId, true);
        });

        socket.on("call-rejected", (data: any) => {
            if (!data.isGroup) return;
            toast.error("Một người đã từ chối tham gia");
        });

        socket.on("call-ended", (data: any) => {
            if (!data.isGroup) return;
            const { peers } = get();
            if (Object.keys(peers).length <= 1) {
                toast("Cuộc gọi nhóm đã kết thúc", { icon: "📞" });
                get().clearCall();
            } else {
                get().removePeer(data.enderId);
            }
        });

        socket.on("webrtc-offer", async (data: any) => {
            if (!data.isGroup) return;

            const { callStatus, isCalling, isReceivingCall } = get();
            if (callStatus === "idle" || (isReceivingCall && !isCalling)) return;

            const pc = get().createPeerConnection(data.senderId, false);
            try {
                await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
                (get() as any).flushIceCandidates(data.senderId);

                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                
                socket.emit("webrtc-answer", {
                    targetId: data.senderId,
                    answer,
                    isGroup: true,
                    groupId: get().groupId
                });
            } catch (error) {
                console.error("Lỗi xử lý Offer nhóm:", error);
            }
        });

        socket.on("webrtc-answer", async (data: any) => {
            if (!data.isGroup) return;

            const { peers } = get();
            const pc = peers[data.senderId];
            if (pc) {
                try {
                    await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
                    (get() as any).flushIceCandidates(data.senderId);
                } catch (error) {
                    console.error("Lỗi xử lý Answer nhóm:", error);
                }
            }
        });

        socket.on("webrtc-ice-candidate", async (data: any) => {
            if (!data.isGroup) return;

            const { peers, pendingIceCandidates } = get();
            const pc = peers[data.senderId];
            if (pc && pc.remoteDescription) {
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
                } catch (error) {
                    console.error("Lỗi thêm ICE Candidate nhóm:", error);
                }
            } else {
                const pending = pendingIceCandidates[data.senderId] || [];
                set({
                    pendingIceCandidates: {
                        ...pendingIceCandidates,
                        [data.senderId]: [...pending, data.candidate]
                    }
                });
            }
        });

        // Định nghĩa handler riêng để có thể remove chính xác
        const handleOnlineUsers = (onlineUsers: string[]) => {
            const { peers, isCalling } = get();
            Object.keys(peers).forEach(peerId => {
                if (!onlineUsers.includes(peerId)) {
                    get().removePeer(peerId);
                }
            });
            // Tự động kết thúc nếu chỉ còn 1 mình
            if (isCalling && Object.keys(get().peers).length === 0) {
                toast("Mọi người đã rời nhóm. Kết thúc cuộc gọi.", { icon: "📞", id: "group-call-ended" });
                get().clearCall();
            }
        };

        // Xử lý khi có ai đó rớt mạng / đóng trình duyệt đột ngột
        socket.on("getOnlineUsers", handleOnlineUsers);
        
        // Lưu reference để khi unsubscribe có thể remove đúng hàm này
        (get() as any)._onlineUsersHandler = handleOnlineUsers;
    },

    unsubscribeFromGroupCalls: () => {
        set({ isSubscribed: false });
        const socket = useAuthStore.getState().socket;
        if (socket) {
            const handler = (useGroupCallStore.getState() as any)._onlineUsersHandler;
            if (handler) {
                socket.off("getOnlineUsers", handler);
            }
        }
    }
}));
