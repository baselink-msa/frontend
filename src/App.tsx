import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/common/Layout';
import { PublicOnly, RequireAdmin, RequireAuth } from './components/common/RouteGuards';
import { AdminPage } from './pages/AdminPage';
import { ChatbotPage } from './pages/ChatbotPage';
import { GameDetailPage } from './pages/GameDetailPage';
import { GameListPage } from './pages/GameListPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { MyTicketsPage } from './pages/MyTicketsPage';
import { OrderPage } from './pages/OrderPage';
import { OrderHistoryPage } from './pages/OrderHistoryPage';
import { ReservationResultPage } from './pages/ReservationResultPage';
import { SeatSelectionPage } from './pages/SeatSelectionPage';
import { SignupPage } from './pages/SignupPage';
import { WaitingRoomPage } from './pages/WaitingRoomPage';

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/login"
          element={
            <PublicOnly>
              <LoginPage />
            </PublicOnly>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicOnly>
              <SignupPage />
            </PublicOnly>
          }
        />
        <Route path="/games" element={<GameListPage />} />
        <Route path="/games/:gameId" element={<GameDetailPage />} />
        <Route
          path="/games/:gameId/waiting-room"
          element={
            <RequireAuth>
              <WaitingRoomPage />
            </RequireAuth>
          }
        />
        <Route
          path="/games/:gameId/seats"
          element={
            <RequireAuth>
              <SeatSelectionPage />
            </RequireAuth>
          }
        />
        <Route
          path="/reservations/:reservationId"
          element={
            <RequireAuth>
              <ReservationResultPage />
            </RequireAuth>
          }
        />
        <Route
          path="/my-tickets"
          element={
            <RequireAuth>
              <MyTicketsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/orders"
          element={
            <RequireAuth>
              <OrderPage />
            </RequireAuth>
          }
        />
        <Route
          path="/orders/my"
          element={
            <RequireAuth>
              <OrderHistoryPage />
            </RequireAuth>
          }
        />
        <Route path="/chatbot" element={<ChatbotPage />} />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminPage />
            </RequireAdmin>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
