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
};
