// import { getUserId } from "../utils/user";

// export default function HomePage() {

//   const handleCreateRoom = async () => {
//     const userId = getUserId();

//     const response = await fetch(
//       `http://localhost:8080/rooms/create?hostId=${userId}`,
//       {
//         method: "POST",
//       }
//     );

//     const data = await response.json();

//     window.location.href = `/room/${data.roomId}`;
//   };

//   const handleJoinRoom = async () => {
//   const userId = getUserId();

//   const roomId = prompt("Enter Room ID");

//   const response = await fetch(
//     `http://localhost:8080/rooms/join?roomId=${roomId}&userId=${userId}`,
//     { method: "POST" }
//   );

//   const data = await response.json();

//   // 🔹 Save sync state in session
//   sessionStorage.setItem("syncState", JSON.stringify(data.state));

//   window.location.href = `/room/${roomId}`;
// };

//   return (
//     <div>
//       <h1>YouTube Watch Party</h1>

//       <button onClick={handleCreateRoom}>Create Room</button>

//       <button onClick={handleJoinRoom}>Join Room</button>
//     </div>
//   );
// }

import { useState } from "react";
import { getUserId } from "../utils/user";

export default function HomePage() {

  const [roomId, setRoomId] = useState("");

  // ✅ CREATE ROOM
  const createRoom = async () => {

    const userId = getUserId();

    const res = await fetch(
      `http://localhost:8080/rooms/create?hostId=${userId}`,
      {
        method: "POST"
      }
    );

    const data = await res.json();

    // 🔥 Redirect to room
    window.location.href = `/room/${data.roomId}`;
  };

  // ✅ JOIN ROOM
  const joinRoom = async () => {

    const userId = getUserId();

    if (!roomId) {
      alert("Enter Room ID");
      return;
    }

    const res = await fetch(
      `http://localhost:8080/rooms/join?roomId=${roomId}&userId=${userId}`,
      {
        method: "POST"
      }
    );

    const data = await res.json();

    // 🔹 Save SYNC state
    sessionStorage.setItem("syncState", JSON.stringify(data.state));

    // 🔥 Redirect
    window.location.href = `/room/${roomId}`;
  };

  return (
    <div>
      <h1>YouTube Watch Party</h1>

      {/* 🎯 Create Room */}
      <button onClick={createRoom}>
        Create Room
      </button>

      <hr />

      {/* 🎯 Join Room */}
      <input
        type="text"
        placeholder="Enter Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
      />

      <button onClick={joinRoom}>
        Join Room
      </button>
    </div>
  );
}