export type Menu = {
  menuId: number;
  name: string;
  price: number;
  available: boolean;
};

export type OrderItemRequest = {
  menuId: number;
  quantity: number;
};

export type OrderRequest = {
  gameId: number;
  seatId: number;
  items: OrderItemRequest[];
};

export type Order = {
  orderId: number;
  status: 'ORDERED' | 'DELIVERING' | 'DELIVERED' | 'CANCELLED';
  totalPrice: number;
  createdAt?: string;
};

export type OrderItem = {
  menuId: number;
  name: string;
  quantity: number;
  price: number;
};

export type OrderDetail = Order & {
  gameId: number;
  seatId: number;
  items: OrderItem[];
};
