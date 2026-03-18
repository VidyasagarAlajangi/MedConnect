import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  MeetingProvider,
  useMeeting,
  useParticipant,
} from "@videosdk.live/react-sdk";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  Mic, MicOff, Video, VideoOff, PhoneOff,
  Loader2, Users, AlertCircle,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { getSocket } from "../../utils/socket";

// ─── Participant Video/Audio Tile ────────────────────────────────────────────
const ParticipantTile = ({ participantId, isLocal }) => {
  const { webcamStream, micStream, webcamOn, micOn, displayName } =
    useParticipant(participantId);
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  // Attach webcam stream to <video> element
  useEffect(() => {
    if (!videoRef.current) return;
    if (webcamOn && webcamStream) {
      const ms = new MediaStream();
      ms.addTrack(webcamStream.track);
      videoRef.current.srcObject = ms;
      videoRef.current.play().catch(() => { });
    } else {
      videoRef.current.srcObject = null;
    }
  }, [webcamStream, webcamOn]);

  // Attach remote mic stream to <audio> element (never mute remote audio)
  useEffect(() => {
    if (!audioRef.current || isLocal) return;
    if (micStream) {
      const ms = new MediaStream();
      ms.addTrack(micStream.track);
      audioRef.current.srcObject = ms;
      audioRef.current.play().catch(() => { });
    } else {
      audioRef.current.srcObject = null;
    }
  }, [micStream, isLocal]);

  const initial = displayName?.charAt(0)?.toUpperCase() || "?";

  return (
    <div className="relative aspect-video bg-slate-800 rounded-2xl overflow-hidden shadow-xl border border-slate-700">
      {/* Video */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className={`w-full h-full object-cover ${!webcamOn ? "hidden" : "block"}`}
      />

      {/* Avatar when camera is off */}
      {!webcamOn && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900">
          <div className="text-center">
            <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl font-bold text-white shadow-lg">
              {initial}
            </div>
            <p className="text-slate-200 font-medium text-sm">{displayName || "User"}</p>
          </div>
        </div>
      )}

      {/* Remote audio */}
      {!isLocal && <audio ref={audioRef} autoPlay playsInline />}

      {/* Status icons bottom-left */}
      <div className="absolute bottom-2 left-2 flex gap-1">
        {!micOn && (
          <span className="bg-red-600 p-1 rounded-full shadow">
            <MicOff className="w-3 h-3 text-white" />
          </span>
        )}
        {!webcamOn && (
          <span className="bg-red-600 p-1 rounded-full shadow">
            <VideoOff className="w-3 h-3 text-white" />
          </span>
        )}
      </div>

      {/* Name label top-left */}
      <div className="absolute top-2 left-2 bg-black/60 px-2 py-0.5 rounded-full text-xs text-white font-medium">
        {isLocal ? `You (${displayName || "Me"})` : displayName || "Remote"}
      </div>
    </div>
  );
};

// ─── Inner meeting view — rendered INSIDE MeetingProvider ────────────────────
const MeetingView = ({ appointmentId, userRole, onCallEnd }) => {
  const [joined, setJoined] = useState(false); // true once meeting:joined fires
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [meetingError, setMeetingError] = useState(null);

  const {
    join,
    leave,
    toggleMic,
    toggleWebcam,
    participants,       // Map of remote participants
    localParticipant,  // the local participant object
  } = useMeeting({
    onMeetingJoined: () => {
      console.log("[VideoSDK] Meeting joined");
      setJoined(true);
    },
    onMeetingLeft: () => {
      console.log("[VideoSDK] Meeting left");
      onCallEnd();
    },
    onParticipantJoined: (participant) => {
      console.log("[VideoSDK] Participant joined:", participant.displayName);
      toast.success(`${participant.displayName} joined the call`, { icon: "👋", duration: 3000 });
    },
    onParticipantLeft: (participant) => {
      console.log("[VideoSDK] Participant left:", participant.displayName);
      toast(`${participant.displayName} left the call`, { icon: "👋", duration: 3000 });
    },
    onError: (err) => {
      console.error("[VideoSDK] Error:", err);
      setMeetingError(err?.message || "Meeting error occurred");
    },
  });

  // ✅ CRITICAL: Must explicitly call join() after mounting inside MeetingProvider
  useEffect(() => {
    console.log("[VideoSDK] Joining meeting with participant ID:", localParticipant?.id);
    join();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const socket = getSocket();

  // All remote participant IDs (explicitly excluding local if present in map)
  const remoteParticipantIds = [...participants.keys()].filter(
    (id) => id !== localParticipant?.id
  );

  useEffect(() => {
    if (remoteParticipantIds.length > 0) {
      console.log("[VideoSDK] Remote participants:", remoteParticipantIds);
    }
  }, [remoteParticipantIds]);

  const handleToggleMic = () => {
    toggleMic();
    setMicOn((prev) => !prev);
  };

  const handleToggleCam = () => {
    toggleWebcam();
    setCamOn((prev) => !prev);
  };

  const handleEndCall = () => {
    // Notify remote party via socket
    if (socket && appointmentId) {
      socket.emit("video:call:end", { appointmentId });
    }
    leave(); // triggers onMeetingLeft → onCallEnd
  };

  // Show error state
  if (meetingError) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-8 max-w-sm text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-white text-lg font-bold mb-2">Meeting Error</h2>
          <p className="text-slate-400 text-sm mb-4">{meetingError}</p>
          <button
            onClick={handleEndCall}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 text-sm"
          >
            Leave
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col select-none">

      {/* ── Top bar ────────────────────────────────────────────────────────── */}
      <div className="bg-slate-900 border-b border-slate-800 px-5 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-white font-semibold text-sm">
          <div className={`w-2 h-2 rounded-full ${joined ? "bg-emerald-400 animate-pulse" : "bg-yellow-400 animate-ping"}`} />
          {joined ? "MedConnect · Live" : "Connecting…"}
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <Users className="w-4 h-4" />
          {remoteParticipantIds.length + 1} participant{remoteParticipantIds.length !== 0 ? "s" : ""}
        </div>
      </div>

      {/* ── Video Grid ─────────────────────────────────────────────────────── */}
      <div className="flex-1 p-4 flex flex-col items-center justify-center overflow-auto gap-4">

        {/* Joining spinner */}
        {!joined && (
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
            <p className="text-sm">Joining meeting room…</p>
          </div>
        )}

        {joined && (
          <div
            className={`w-full max-w-5xl grid gap-4 ${remoteParticipantIds.length === 0
                ? "grid-cols-1 max-w-md"
                : "grid-cols-1 md:grid-cols-2"
              }`}
          >
            {/* Local participant tile */}
            {localParticipant && (
              <ParticipantTile participantId={localParticipant.id} isLocal />
            )}

            {/* Remote participant tiles */}
            {remoteParticipantIds.map((id) => (
              <ParticipantTile key={id} participantId={id} isLocal={false} />
            ))}

            {/* Waiting placeholder when alone */}
            {remoteParticipantIds.length === 0 && (
              <div className="aspect-video bg-slate-800 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-600">
                <div className="text-center text-slate-400 p-8">
                  <div className="w-14 h-14 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-7 h-7 opacity-40" />
                  </div>
                  <p className="font-medium text-base">
                    {userRole === "doctor"
                      ? "Waiting for patient to accept the call…"
                      : "Doctor will appear here shortly…"}
                  </p>
                  <p className="text-xs mt-2 text-slate-500">
                    {userRole === "doctor"
                      ? "Patient has been notified"
                      : "You are connected — waiting for the doctor"}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Controls Bar ───────────────────────────────────────────────────── */}
      <div className="bg-slate-900 border-t border-slate-800 px-6 py-5 shrink-0">
        <div className="flex items-end justify-center gap-6">

          {/* Mic toggle */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={handleToggleMic}
              disabled={!joined}
              className={`p-4 rounded-full transition-all duration-200 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed ${micOn
                  ? "bg-slate-700 hover:bg-slate-600 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
                }`}
              title={micOn ? "Mute microphone" : "Unmute microphone"}
            >
              {micOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            </button>
            <span className="text-slate-500 text-xs">{micOn ? "Mute" : "Unmuted"}</span>
          </div>

          {/* End call */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={handleEndCall}
              className="p-5 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 text-white shadow-xl transition-all duration-200"
              title="End call"
            >
              <PhoneOff className="w-7 h-7" />
            </button>
            <span className="text-slate-500 text-xs">End Call</span>
          </div>

          {/* Camera toggle */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={handleToggleCam}
              disabled={!joined}
              className={`p-4 rounded-full transition-all duration-200 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed ${camOn
                  ? "bg-slate-700 hover:bg-slate-600 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
                }`}
              title={camOn ? "Turn off camera" : "Turn on camera"}
            >
              {camOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            </button>
            <span className="text-slate-500 text-xs">{camOn ? "Camera" : "Cam off"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main VideoCall Page ─────────────────────────────────────────────────────
const VideoCallPage = () => {
  const { appointmentId } = useParams();
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const userRole = user?.role;

  const [sdkToken, setSdkToken] = useState(null);
  const [meetingId, setMeetingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [callDone, setCallDone] = useState(false);

  // Request media permissions before joining
  const requestPermissions = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      stream.getTracks().forEach((t) => t.stop()); // just checking permissions
      return true;
    } catch (err) {
      const msgs = {
        NotAllowedError: "Please allow camera & microphone access to join the call.",
        NotFoundError: "No camera or microphone found on this device.",
      };
      setError(msgs[err.name] || `Media error: ${err.message}`);
      setLoading(false);
      return false;
    }
  }, []);

  const initCall = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 1) Ask for permissions
      const ok = await requestPermissions();
      if (!ok) return;

      // 2) Join the socket room for real-time events
      const socket = getSocket();
      if (socket && appointmentId) {
        socket.emit("appointment:join", appointmentId);
      }

      if (userRole === "doctor") {
        // Doctor: Start (or re-join) the meeting
        const meetingRes = await axiosInstance.post(
          `/api/video/appointment/${appointmentId}/start`
        );
        const mId = meetingRes.data?.meetingId;
        if (!mId) throw new Error("Could not get meeting ID from server.");

        // Emit via socket so patient gets notified through both paths
        if (socket && appointmentId) {
          socket.emit("video:call:start", { appointmentId, meetingId: mId });
        }

        // Get token
        const tokenRes = await axiosInstance.get("/api/video/token");
        const vToken = tokenRes.data?.token;
        if (!vToken) throw new Error("Could not get VideoSDK token.");

        setSdkToken(vToken);
        setMeetingId(mId);

      } else {
        // Patient: Join the existing meeting (poll up to ~60s for doctor to start)
        const maxAttempts = 12;
        const pollDelay = 5000;
        let toastId = null;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          try {
            const joinRes = await axiosInstance.get(
              `/api/video/appointment/${appointmentId}/join`
            );
            const { meetingId: mId, token: vToken } = joinRes.data;
            if (mId && vToken) {
              if (toastId) toast.dismiss(toastId);
              setSdkToken(vToken);
              setMeetingId(mId);
              return; // success — exits the for loop and the function
            }
          } catch (joinErr) {
            const isNotStarted =
              joinErr.response?.status === 400 &&
              joinErr.response?.data?.message?.includes("not been started");

            if (!isNotStarted) throw joinErr; // unexpected error — rethrow

            // Doctor hasn't started yet — wait and retry
            if (attempt === 0) {
              toastId = toast.loading("Waiting for doctor to start the call…");
            }
            if (attempt < maxAttempts - 1) {
              await new Promise((r) => setTimeout(r, pollDelay));
            }
          }
        }
        // Exhausted retries
        if (toastId) toast.dismiss(toastId);
        throw new Error("Doctor has not started the call yet. Please try again.");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || "Failed to join video call.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [appointmentId, requestPermissions, userRole]);

  useEffect(() => {
    if (!appointmentId) {
      setError("Invalid appointment ID.");
      setLoading(false);
      return;
    }
    initCall();
  }, [appointmentId, initCall]);

  // Listen for remote call-end event
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const onRemoteEnd = ({ appointmentId: aId }) => {
      if (aId === appointmentId) {
        toast("The other party ended the call.", { icon: "📴" });
      }
    };
    socket.on("video:call:ended", onRemoteEnd);
    return () => socket.off("video:call:ended", onRemoteEnd);
  }, [appointmentId]);

  // Called when meeting leaves (from MeetingView)
  const handleCallEnd = useCallback(async () => {
    try {
      await axiosInstance.post(`/api/video/appointment/${appointmentId}/end`);
    } catch (_) { }

    setCallDone(true);

    if (userRole === "doctor") {
      navigate(`/complete-appointment/${appointmentId}`, { replace: true });
    } else {
      navigate("/appointments", { replace: true });
    }
  }, [appointmentId, userRole, navigate]);

  // ── Render states ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
        <p className="text-slate-400 text-sm">
          {userRole === "doctor" ? "Starting your call…" : "Connecting to call…"}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 p-4">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md text-center">
          <PhoneOff className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-white text-xl font-bold mb-2">Cannot Join Call</h2>
          <p className="text-slate-400 mb-6 text-sm">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={initCall}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 text-sm font-medium"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!sdkToken || !meetingId || callDone) return null;

  return (
    <MeetingProvider
      config={{
        meetingId,
        name: user?.name || "User",
        micEnabled: true,
        webcamEnabled: true,
        participantId: (user?._id || user?.id)?.toString(),
        mode: "CONFERENCE",
        // multiStream: true is removed for better compatibility in 1-on-1 calls
      }}
      token={sdkToken}
    >
      <MeetingView
        appointmentId={appointmentId}
        userRole={userRole}
        onCallEnd={handleCallEnd}
      />
    </MeetingProvider>
  );
};

export default VideoCallPage;