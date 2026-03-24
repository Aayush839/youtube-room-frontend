import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

let stompClient = null;

export const connectWebSocket = (roomId, onEventReceived) => {
  const socket = new SockJS("http://localhost:8080/ws");

  stompClient = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000,
  });

  stompClient.onConnect = () => {
    console.log("Connected");

    // Subscribe to room topic
    stompClient.subscribe(`/topic/room/${roomId}`, (message) => {
      const event = JSON.parse(message.body);
      onEventReceived(event);
    });
  };

  stompClient.activate();
};

export const sendEvent = (roomId, event) => {
  if (stompClient && stompClient.connected) {
    stompClient.publish({
      destination: `/app/room/${roomId}/event`,
      body: JSON.stringify(event),
    });
  }
};