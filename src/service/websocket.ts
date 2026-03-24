import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { getUserId } from "../utils/user";
let stompClient: Client | null = null;

export function connectWebSocket(
  roomId: string,
  onMessage: (msg: any) => void
) {

  // const socket = new SockJS("http://localhost:8080/ws");
  const socket = new SockJS("https://youtube-room-project-8.onrender.com/ws");

  stompClient = new Client({
    webSocketFactory: () => socket,
    onConnect: () => {
      console.log("Connected");

      stompClient?.subscribe(`/topic/room/${roomId}`, (message) => {
        const body = JSON.parse(message.body);
            console.log("Recived: ",body);
        onMessage(body);
      });

      stompClient?.subscribe(`/user/${getUserId()}/queue/kick`, (message) => {
      const event = JSON.parse(message.body);

      console.log("KICK EVENT:", event); 

      if (event.type === "KICKED") {
        alert("You were removed from room");

        stompClient?.deactivate();
        window.location.href = "/";
      }
    });
    stompClient?.subscribe(`/topic/kick/${getUserId()}`, (message) => {
    const event = JSON.parse(message.body);

    if (event.type === "KICKED") {
      alert("You were removed");

      stompClient?.deactivate();
      window.location.href = "/";
    }
  });
    },

    onStompError: (frame) => {
      console.error("STOMP error:", frame);
    }
  });

  stompClient.activate();
}

export function sendEvent(roomId: string, event: any) {

  if (!stompClient || !stompClient.connected) {
    console.log("Not connected yet");
    return;
  }

  stompClient.publish({
    destination: `/app/room/${roomId}`,
    body: JSON.stringify(event)
  });
}