import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { orderApi } from '../api/orderApi';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Loading } from '../components/common/Loading';
import { formatDateTime } from '../utils/date';
import { formatCurrency } from '../utils/format';

const orderStatusLabels: Record<string, string> = {
  ORDERED: '주문 완료',
  DELIVERING: '전달 중',
  DELIVERED: '전달 완료',
  CANCELLED: '취소됨',
};

export function OrderHistoryPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['my-orders'],
    queryFn: orderApi.getMyOrders,
  });

  if (isLoading) return <Loading label="주문 내역을 불러오는 중입니다." />;

  const orders = data?.data ?? [];

  return (
    <section>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">주문 내역</h1>
          <p className="mt-2 text-slate-600">생성한 주류 주문을 확인합니다.</p>
        </div>
        <Link
          to="/orders"
          className="w-fit rounded-md bg-blue-700 px-4 py-3 text-sm font-bold text-white hover:bg-blue-800"
        >
          주문하기
        </Link>
      </div>

      <div className="mt-5">
        <ErrorMessage message={error?.message} />
      </div>

      <div className="mt-5 space-y-3">
        {orders.length ? orders.map((order) => (
          <article key={order.orderId} className="rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-soft">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-950">주문 #{order.orderId}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {order.createdAt ? formatDateTime(order.createdAt) : '주문 시간 확인 중'}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="font-black text-slate-950">{formatCurrency(order.totalPrice)}</p>
                <p className="mt-1 text-sm font-bold text-blue-700">
                  {orderStatusLabels[order.status] ?? order.status}
                </p>
              </div>
            </div>
          </article>
        )) : (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-6 py-12 text-center">
            <p className="text-sm text-slate-500">아직 주문 내역이 없습니다.</p>
            <Link to="/orders" className="mt-3 inline-block text-sm font-bold text-blue-700 hover:underline">
              메뉴 보러가기
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
