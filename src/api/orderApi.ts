import { mockApi } from '../mocks/mockApi';
import type { ApiResponse } from '../types/common';
import type { Menu, Order, OrderDetail, OrderRequest } from '../types/order';
import { apiClient, USE_MOCK } from './client';

export const orderApi = {
  getMenus: async (): Promise<ApiResponse<Menu[]>> => {
    if (USE_MOCK) return mockApi.orders.menus();
    const { data } = await apiClient.get<ApiResponse<Menu[]>>('/orders/menus');
    return data;
  },
  createOrder: async (request: OrderRequest): Promise<ApiResponse<Order>> => {
    if (USE_MOCK) return mockApi.orders.create(request);
    const { data } = await apiClient.post<ApiResponse<Order>>('/orders', request);
    return data;
  },
  getMyOrders: async (): Promise<ApiResponse<Order[]>> => {
    if (USE_MOCK) return { success: true, data: [], message: '요청이 성공했습니다.' };
    const { data } = await apiClient.get<ApiResponse<Order[]>>('/orders/my');
    return data;
  },
  getOrder: async (orderId: number): Promise<ApiResponse<OrderDetail>> => {
    const { data } = await apiClient.get<ApiResponse<OrderDetail>>(`/orders/${orderId}`);
    return data;
  },
};
