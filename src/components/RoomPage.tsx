
import { useEffect, useState, useRef } from "react";
import { connectWebSocket, sendEvent } from "../service/websocket";
import { getUserId } from "../utils/user";
import type { RoomEvent } from "../types/event";
import YouTubePlayer from "../components/YouTubePlayer";

export default function RoomPage() {

  const roomId = window.location.pathname.split("/")[2];
  const userId = getUserId();

  
  const [participants, setParticipants] = useState<Record<string, string>>({});
  const [videoId, setVideoId] = useState("kBLdxcEPH00");
  const [initialState, setInitialState] = useState<any>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const playerRef = useRef<any>(null);

  const role = participants[userId];

const canControlVideo = role === "HOST" || role === "MODERATOR";

const isSyncingRef = useRef(false);

const handleEvent = (event: RoomEvent) => {

  if (event.userId === userId) return;

  const player = playerRef.current;
  if (!player) return;

  isSyncingRef.current = true;

  switch (event.type) {

    case "PLAY":
      if (event.videoId && videoId !== event.videoId) {
        setVideoId(event.videoId);
        player.loadVideoById(event.videoId);
      }
      if (event.timestamp !== undefined) {
        player.seekTo(event.timestamp, true);
      }
      player.playVideo();
      break;

    case "PAUSE":
      if (event.timestamp !== undefined) {
        player.seekTo(event.timestamp, true);
      }

      player.pauseVideo();
      break;

    case "SEEK":
      if (event.timestamp !== undefined) {
        player.seekTo(event.timestamp, true);
      }
      break;

    case "CHANGE_VIDEO":
      if (event.videoId) {
        setVideoId(event.videoId);
        player.loadVideoById(event.videoId);
      }
      break;
  }

  setTimeout(() => {
    isSyncingRef.current = false;
  }, 800);
};
  useEffect(() => {

  connectWebSocket(roomId, (event: any) => {

    console.log("WS EVENT:", event);

    if (event.type === "PARTICIPANTS") {
      setParticipants({ ...event.data });
      return;
    }

    handleEvent(event);
  });

   setTimeout(() => {

    // fetch(`http://localhost:8080/rooms/join?roomId=${roomId}&userId=${userId}`, {
    fetch(`https://youtube-room-project-8.onrender.com/rooms/join?roomId=${roomId}&userId=${userId}`, {

      method: "POST"
    })
      .then(res => res.json())
      .then(data => {
        console.log("JOIN RESPONSE:", data);

        setParticipants(data.participants);
        setInitialState(data.state); 
      });
    }, 500); 
    
  }, [roomId]);


useEffect(() => {

  if (!initialState || !playerReady) return;

  const player = playerRef.current;
  if (!player) return;

  console.log("🎯 APPLY INITIAL STATE:", initialState);

  isSyncingRef.current = true;

  if (!initialState.currentVideoId) {
    console.log("⚠️ No video yet → unlock controls");
    isSyncingRef.current = false;
    return;
  }

  setVideoId(initialState.currentVideoId);

  player.loadVideoById(initialState.currentVideoId);

  const interval = setInterval(() => {

    const state = player.getPlayerState();

    if (state === -1 || state === 3) return;

    clearInterval(interval);

    player.seekTo(initialState.currentTime || 0, true);

    if (initialState.playing) {
      player.playVideo();
    } else {
      player.pauseVideo();
    }

    console.log("INITIAL SYNC DONE");

    isSyncingRef.current = false;

  }, 300);

}, [initialState, playerReady]);


  const handlePlay = () => {

    if (isSyncingRef.current) return;

    const player = playerRef.current;
    if (!player) return;

    const currentTime = player.getCurrentTime();

    player.playVideo();

    sendEvent(roomId, {
      type: "PLAY",
      roomId,
      videoId,
      timestamp: currentTime,
      userId
    });
  };

  const handlePause = () => {

    if (isSyncingRef.current) return;

    const player = playerRef.current;
    if (!player) return;

    const currentTime = player.getCurrentTime();

    player.pauseVideo();

    sendEvent(roomId, {
      type: "PAUSE",
      roomId,
      videoId,
      timestamp: currentTime,
      userId
    });
  };

  const handleForward = () => {
    if (isSyncingRef.current) return;
    const player = playerRef.current;
    if (!player) return;

    const newTime = player.getCurrentTime() + 10;
    player.seekTo(newTime, true);

    sendEvent(roomId, {
      type: "SEEK",
      roomId,
      timestamp: newTime,
      userId
    });
  };

  const handleBackward = () => {
    if (isSyncingRef.current) return;
    const player = playerRef.current;
    if (!player) return;

    const newTime = Math.max(0, player.getCurrentTime() - 10);
    player.seekTo(newTime, true);

    sendEvent(roomId, {
      type: "SEEK",
      roomId,
      timestamp: newTime, 
      userId
    });
  };

  const changeVideo = () => {
    const newVideoId = prompt("Enter YouTube Video ID");
    if (!newVideoId) return;

    setVideoId(newVideoId);
    playerRef.current?.loadVideoById(newVideoId);

    sendEvent(roomId, {
      type: "CHANGE_VIDEO",
      roomId,
      videoId: newVideoId,
      userId
    });
  };

  const assignRole = (targetUserId: string, role: string) => {
    sendEvent(roomId, {
      type: "ASSIGN_ROLE",
      roomId,
      userId,
      hostId: userId,
      targetUserId,
      role
    });
  };

  const removeUser = (targetUserId: string) => {
    sendEvent(roomId, {
      type: "REMOVE_USER",
      roomId,
      userId,
      hostId: userId,
      targetUserId
    });
  };

  const leaveRoom =()=>{
    sendEvent(roomId,{
      type:"LEAVE",
      roomId,
      userId
    });
    window.location.href="/";
  }

return (
  <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">

    <div className="w-full max-w-4xl bg-white shadow-xl rounded-2xl p-4">
      <YouTubePlayer
        videoId={videoId}
        onReady={(p) => {
          playerRef.current = p;
          setPlayerReady(true);
        }}
      />
    </div>
      {canControlVideo && (
        <>
            <div className="flex flex-wrap justify-center gap-4 mt-6">
      
            <button
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow"
              onClick={handlePlay}
            >
              Play
            </button>

            <button
              className="px-5 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl shadow"
              onClick={handlePause}
            >
              Pause
            </button>

            <button
              className="px-5 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-xl shadow"
              onClick={handleBackward}
            >
              Backward 10s
            </button>

            <button
              className="px-5 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-xl shadow"
              onClick={handleForward}
            >
              Forward 10s
            </button>

            <button
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow"
              onClick={changeVideo}
            >
              Change Video
            </button>
          </div>
        </>
      )}


    <div className="w-full max-w-4xl bg-white shadow-xl rounded-2xl p-6 mt-8">
      <h3 className="text-2xl font-semibold mb-4 text-gray-800">
        Participants
      </h3>

      <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-gray-200 text-gray-700">
          <tr>
            <th className="p-3 text-left">User</th>
            <th className="p-3 text-left">Role</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>

        <tbody>
          {Object.entries(participants).map(([id, role]) => (
            <tr key={id} className="border-t hover:bg-gray-50">

              <td className="p-3 font-medium">
                {id}
                {id === userId && (
                  <span className="ml-2 text-sm text-blue-500">(You)</span>
                )}
              </td>

              <td className="p-3">
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    role === "HOST"
                      ? "bg-red-100 text-red-600"
                      : role === "MODERATOR"
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {role}
                </span>
              </td>

              <td className="p-3 flex flex-wrap gap-2">

                {participants[userId] === "HOST" && id !== userId && (
                  <>
                    <button
                      className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm"
                      onClick={() => assignRole(id, "MODERATOR")}
                    >
                      Moderator
                    </button>

                    <button
                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm"
                      onClick={() => assignRole(id, "PARTICIPANT")}
                    >
                      Participant
                    </button>

                    <button
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm"
                      onClick={() => removeUser(id)}
                    >
                      Remove
                    </button>
                  </>
                )}

                {id === userId && (
                  <button
                    className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm"
                    onClick={leaveRoom}
                  >
                    Leave
                  </button>
                )}

              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

  </div>
);
}