import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { orderApi } from '../api/orderApi';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Loading } from '../components/common/Loading';
import { useReservationStore } from '../store/reservationStore';
import type { Order } from '../types/order';
import { formatCurrency } from '../utils/format';

export function OrderPage() {
  const selectedGame = useReservationStore((state) => state.selectedGame);
  const selectedSeat = useReservationStore((state) => state.selectedSeat);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [result, setResult] = useState<Order | null>(null);
  const [error, setError] = useState('');

  const menusQuery = useQuery({ queryKey: ['menus'], queryFn: orderApi.getMenus });

  const items = useMemo(
    () =>
      Object.entries(quantities)
        .map(([menuId, quantity]) => ({ menuId: Number(menuId), quantity }))
        .filter((item) => item.quantity > 0),
    [quantities],
  );

  const orderMutation = useMutation({
    mutationFn: () =>
      orderApi.createOrder({
        gameId: selectedGame?.gameId ?? 0,
        seatId: selectedSeat?.seatId ?? 0,
        items,
      }),
    onSuccess: (response) => {
      setResult(response.data);
      setError('');
    },
    onError: (err) => setError(err.message || '주문 생성에 실패했습니다.'),
  });

  if (menusQuery.isLoading) return <Loading label="메뉴를 불러오는 중입니다." />;

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div>
        <h1 className="text-3xl font-bold text-slate-950">주류 주문</h1>
        <p className="mt-2 text-slate-600">원하는 메뉴와 수량을 선택한 뒤 주문을 생성하세요.</p>
        <div className="mt-5">
          <ErrorMessage message={error || menusQuery.error?.message} />
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {menusQuery.data?.data.map((menu) => (
            <article key={menu.menuId} className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">{menu.name}</h2>
                  <p className="mt-1 text-sm font-semibold text-slate-600">{formatCurrency(menu.price)}</p>
                </div>
                <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-bold text-green-700">
                  {menu.available ? '판매중' : '품절'}
                </span>
              </div>
              <input
                type="number"
                min={0}
                value={quantities[menu.menuId] ?? 0}
                onChange={(event) =>
                  setQuantities((prev) => ({ ...prev, [menu.menuId]: Number(event.target.value) }))
                }
                className="mt-5 w-full rounded-md border border-slate-300 px-3 py-2"
              />
            </article>
          ))}
        </div>
      </div>
      <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="text-lg font-bold text-slate-950">주문 요약</h2>
        <p className="mt-3 text-sm text-slate-600">
          선택한 메뉴 {items.length}개
        </p>
        <p className="mt-1 text-2xl font-black text-slate-950">
          {formatCurrency(
            items.reduce((sum, item) => {
              const menu = menusQuery.data?.data.find((candidate) => candidate.menuId === item.menuId);
              return sum + (menu?.price ?? 0) * item.quantity;
            }, 0),
          )}
        </p>
        <button
          type="button"
          disabled={items.length === 0 || orderMutation.isPending}
          onClick={() => orderMutation.mutate()}
          className="mt-5 w-full rounded-md bg-blue-700 px-4 py-3 font-bold text-white hover:bg-blue-800 disabled:opacity-50"
        >
          주문 생성
        </button>
        {result ? (
          <div className="mt-5 rounded-lg bg-green-50 p-4 text-sm text-green-800">
            주문 #{result.orderId} · {result.status} · {formatCurrency(result.totalPrice)}
          </div>
        ) : null}
        <Link
          to="/orders/my"
          className="mt-3 block rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-center text-sm font-bold text-blue-800 hover:bg-blue-100"
        >
          주문 내역 확인
        </Link>
      </aside>
    </section>
  );
}
