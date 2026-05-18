import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/common/Layout';
import { AdminPage } from './pages/AdminPage';
import { ChatbotPage } from './pages/ChatbotPage';
import { GameDetailPage } from './pages/GameDetailPage';
import { GameListPage } from './pages/GameListPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { MyTicketsPage } from './pages/MyTicketsPage';
import { OrderPage } from './pages/OrderPage';
import { ReservationResultPage } from './pages/ReservationResultPage';
import { SeatSelectionPage } from './pages/SeatSelectionPage';
import { SignupPage } from './pages/SignupPage';
import { WaitingRoomPage } from './pages/WaitingRoomPage';

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/games" element={<GameListPage />} />
        <Route path="/games/:gameId" element={<GameDetailPage />} />
        <Route path="/games/:gameId/waiting-room" element={<WaitingRoomPage />} />
        <Route path="/games/:gameId/seats" element={<SeatSelectionPage />} />
        <Route path="/reservations/:reservationId" element={<ReservationResultPage />} />
        <Route path="/my-tickets" element={<MyTicketsPage />} />
        <Route path="/orders" element={<OrderPage />} />
        <Route path="/chatbot" element={<ChatbotPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
