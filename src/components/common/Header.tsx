import { LogOut, Ticket } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { isAdminUser } from '../../utils/auth';

const navItems = [
  { to: '/', label: '홈' },
  { to: '/games', label: '경기' },
  { to: '/my-tickets', label: '내 예매', auth: true },
  { to: '/orders', label: '주문', auth: true, end: true },
  { to: '/orders/my', label: '주문내역', auth: true },
  { to: '/chatbot', label: '챗봇' },
  { to: '/admin', label: '관리자', admin: true },
];

export function Header() {
  const navigate = useNavigate();
  const { accessToken, user, logout } = useAuthStore();
  const visibleNavItems = navItems.filter((item) => {
    if ('admin' in item && item.admin) return isAdminUser(user);
    if ('auth' in item && item.auth) return Boolean(accessToken);
    return true;
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-left text-lg font-bold text-slate-950"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-700 text-white">
            <Ticket size={19} />
          </span>
          BaseLink
        </button>
        <nav className="flex flex-wrap items-center gap-2">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={'end' in item ? item.end : item.to === '/'}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-semibold transition ${
                  isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-3 text-sm">
          {accessToken ? (
            <>
              <span className="text-slate-600">
                {user?.name ?? '로그인됨'}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 py-2 font-semibold text-slate-700 hover:bg-slate-100"
              >
                <LogOut size={16} />
                로그아웃
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="rounded-md border border-slate-300 px-3 py-2 font-semibold text-slate-700 hover:bg-slate-100"
              >
                회원가입
              </button>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="rounded-md bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800"
              >
                로그인
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
