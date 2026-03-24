import { useEffect, useState } from "react";
import { connectWebSocket, sendMessage } from "../services/websocket";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    connectWebSocket((msg) => {
      setMessages((prev) => [...prev, msg]);
    });
  }, []);

  const handleSend = () => {
    const msg = { content: text, sender: "user" };
    sendMessage(msg);
    setText("");
  };

  return (
    <div>
      <h2>Chat</h2>

      <div>
        {messages.map((m, i) => (
          <div key={i}>{m.content}</div>
        ))}
      </div>

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button onClick={handleSend}>Send</button>
    </div>
  );
}