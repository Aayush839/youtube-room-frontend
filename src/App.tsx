import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import RoomPage from "./components/RoomPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ✅ HOME PAGE */}
        <Route path="/" element={<HomePage />} />

        {/* ✅ ROOM PAGE */}
        <Route path="/room/:roomId" element={<RoomPage />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;