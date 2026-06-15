import React, { useEffect, useRef, useState } from "react";
import { Phone, PhoneOff, Video, Mic, MicOff, VideoOff, GripHorizontal, SwitchCamera } from "lucide-react";
import { useGroupCallStore } from "@/store/useGroupCallStore";

export function GroupCallOverlay() {
    const {
        isCalling, isReceivingCall, callerInfo, callType, callStatus,
        localStream, remoteStreams, acceptCall, rejectCall, endCall,
        availableCameras, selectedCameraId, switchCamera
    } = useGroupCallStore();

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [showCameraMenu, setShowCameraMenu] = useState(false);
    const [position, setPosition] = useState({ x: window.innerWidth - 700 - 24, y: 24 });
    const [isDragging, setIsDragging] = useState(false);
    const dragRef = useRef<{ startX: number, startY: number, initialX: number, initialY: number } | null>(null);

    // Xử lý kéo thả
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            initialX: position.x,
            initialY: position.y
        };
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging || !dragRef.current) return;
            const dx = e.clientX - dragRef.current.startX;
            const dy = e.clientY - dragRef.current.startY;
            setPosition({
                x: dragRef.current.initialX + dx,
                y: dragRef.current.initialY + dy
            });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            dragRef.current = null;
        };

        if (isDragging) {
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
        }
        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isDragging]);

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream, isCalling, isReceivingCall]);

    const toggleMute = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
            setIsMuted(!isMuted);
        }
    };

    const toggleVideo = () => {
        if (localStream) {
            localStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
            setIsVideoOff(!isVideoOff);
        }
    };

    if (!isCalling && !isReceivingCall) return null;

    // Incoming Group Call Modal
    if (isReceivingCall && callStatus === "ringing") {
        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <div className="bg-[#111111] p-8 rounded-3xl flex flex-col items-center max-w-sm w-full mx-4 shadow-2xl border border-gray-700/50 animate-in fade-in zoom-in duration-300">
                    <div className="relative mb-6">
                        <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20"></div>
                        <img
                            src={callerInfo?.groupPicture || "/group.png"}
                            alt="Avatar"
                            className="w-28 h-28 rounded-full object-cover ring-4 ring-gray-700 relative z-10"
                        />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2 text-center">
                        {callerInfo?.name}
                    </h2>
                    <p className="text-gray-400 mb-8 font-medium">
                        Cuộc gọi {callType === 'video' ? 'Video' : 'Thoại'} Nhóm đến...
                    </p>

                    <div className="flex gap-8 w-full justify-center">
                        <button
                            onClick={rejectCall}
                            className="bg-red-500 hover:bg-red-600 text-white p-5 rounded-full transition-all hover:scale-110 shadow-lg shadow-red-500/30"
                        >
                            <PhoneOff className="w-8 h-8" />
                        </button>
                        <button
                            onClick={acceptCall}
                            className="bg-green-500 hover:bg-green-600 text-white p-5 rounded-full transition-all hover:scale-110 shadow-lg shadow-green-500/30 animate-bounce"
                        >
                            {callType === 'video' ? <Video className="w-8 h-8" /> : <Phone className="w-8 h-8" />}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Lấy danh sách các luồng video remote
    const remoteStreamList = Object.values(remoteStreams);
    const totalParticipants = remoteStreamList.length + 1; // +1 for local

    // Tính toán số cột lưới (Grid) dựa trên số người tham gia
    let gridCols = "grid-cols-1";
    let gridRows = "grid-rows-1";
    if (totalParticipants === 2) {
        gridCols = "grid-cols-2";
    } else if (totalParticipants === 3 || totalParticipants === 4) {
        gridCols = "grid-cols-2";
        gridRows = "grid-rows-2";
    } else if (totalParticipants > 4) {
        gridCols = "grid-cols-3";
        gridRows = "grid-rows-2";
    }

    // Active/Outgoing Call Window
    return (
        <div
            className="fixed z-[60] bg-[#111111] w-[700px] rounded-2xl shadow-2xl border border-gray-700/50 flex flex-col overflow-hidden resize"
            style={{
                top: position.y,
                left: position.x,
                minHeight: callType === 'video' ? '450px' : '300px',
                width: callType === 'video' && totalParticipants > 1 ? '700px' : '350px',
                minWidth: '350px'
            }}
        >
            {/* Header (Drag Handle) */}
            <div
                className="w-full bg-black/40 backdrop-blur-md p-2 flex justify-between items-center cursor-move absolute top-0 z-20"
                onMouseDown={handleMouseDown}
            >
                <div className="flex items-center gap-2 pl-2">
                    <img src={callerInfo?.groupPicture || "/group.png"} alt="Avatar" className="w-6 h-6 rounded-full object-cover" />
                    <span className="text-white text-sm font-semibold truncate max-w-[200px]">
                        {callerInfo?.name}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full ml-2">Nhóm ({totalParticipants})</span>
                </div>
                <GripHorizontal className="w-5 h-5 text-gray-400 mr-2" />
            </div>

            {/* Content Area */}
            <div className="flex-1 relative w-full h-full flex flex-col items-center justify-center pt-10 pb-20 bg-black">
                {callType === "video" && (
                    <div className={`w-full h-full p-2 grid gap-2 ${gridCols} ${gridRows}`}>

                        {/* Remote Videos */}
                        {remoteStreamList.map((stream, idx) => (
                            <div key={stream.id || idx} className="relative w-full h-full bg-gray-900 rounded-xl overflow-hidden shadow-inner border border-gray-800">
                                <video
                                    autoPlay
                                    playsInline
                                    className="w-full h-full object-cover"
                                    ref={(el) => {
                                        if (el && el.srcObject !== stream) {
                                            el.srcObject = stream;
                                        }
                                    }}
                                />
                            </div>
                        ))}

                        {/* Local Video */}
                        <div className={`relative w-full h-full bg-gray-900 rounded-xl overflow-hidden shadow-inner border border-gray-800 ${remoteStreamList.length === 0 ? "col-span-full row-span-full border-none rounded-none" : ""}`}>
                            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                        </div>
                    </div>
                )}

                {callType === "audio" && (
                    <div className="flex flex-col items-center justify-center flex-1 w-full relative">
                        <img src={callerInfo?.groupPicture || "/group.png"} alt="Avatar" className="w-24 h-24 rounded-full mb-6 shadow-2xl object-cover ring-4 ring-gray-700/50" />
                        <div className="flex gap-1.5 items-end h-8 mb-4">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className={`w-1.5 bg-green-500 rounded-full ${callStatus === 'connected' ? 'animate-pulse' : ''}`} style={{ height: callStatus === 'connected' ? Math.random() * 24 + 8 + 'px' : '4px', animationDelay: `${i * 0.1}s` }}></div>
                            ))}
                        </div>
                        <span className="text-gray-400 text-sm">
                            {callStatus === "ringing" ? "Đang đổ chuông..." : "00:00"}
                        </span>

                        {/* Audio elements for remote streams (hidden) */}
                        {remoteStreamList.map((stream, idx) => (
                            <audio key={stream.id || idx} autoPlay ref={(el) => { if (el) el.srcObject = stream; }} className="hidden" />
                        ))}
                    </div>
                )}
            </div>

            {/* Controls Bar */}
            <div className="absolute bottom-0 w-full bg-black/60 backdrop-blur-md p-4 flex items-center justify-center gap-4 z-20">
                <button onClick={toggleMute} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isMuted ? "bg-red-500/20 text-red-500" : "bg-gray-700 hover:bg-gray-600 text-white"}`}>
                    {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
                {callType === "video" && (
                    <button onClick={toggleVideo} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isVideoOff ? "bg-red-500/20 text-red-500" : "bg-gray-700 hover:bg-gray-600 text-white"}`}>
                        {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                    </button>
                )}

                {callType === "video" && availableCameras.length > 1 && (
                    <div className="relative">
                        <button
                            onClick={() => setShowCameraMenu(!showCameraMenu)}
                            className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                        >
                            <SwitchCamera className="w-4 h-4" />
                        </button>
                        {showCameraMenu && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-gray-800 rounded-lg shadow-xl overflow-hidden transition-opacity">
                                {availableCameras.map(cam => (
                                    <button
                                        key={cam.deviceId}
                                        onClick={() => {
                                            switchCamera(cam.deviceId);
                                            setShowCameraMenu(false);
                                        }}
                                        className={`w-full text-left px-4 py-2 text-sm ${cam.deviceId === selectedCameraId ? "bg-[#0052cc] text-white" : "text-gray-300 hover:bg-gray-700"}`}
                                    >
                                        {cam.label || `Camera ${availableCameras.indexOf(cam) + 1}`}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <button onClick={endCall} className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white transition-transform hover:scale-110 shadow-lg ml-2">
                    <PhoneOff className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
