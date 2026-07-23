/**
 * Order lifecycle shared by the API server (validation, transitions) and
 * the web app (labels, status timeline).
 *
 * Print flow:   pending → confirmed → production → shipped → delivered
 * Digital flow: completed immediately (files are delivered at checkout)
 * Any non-terminal status can move to cancelled.
 */

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "production",
  "shipped",
  "delivered",
  "completed",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<
  OrderStatus,
  { en: string; ko: string }
> = {
  pending: { en: "Received", ko: "접수" },
  confirmed: { en: "Confirmed", ko: "주문 확인" },
  production: { en: "In production", ko: "제작 중" },
  shipped: { en: "Shipped", ko: "배송 중" },
  delivered: { en: "Delivered", ko: "배송 완료" },
  completed: { en: "Completed", ko: "완료" },
  cancelled: { en: "Cancelled", ko: "취소됨" },
};

/** Statuses shown as steps in the print-order timeline, in order. */
export const PRINT_STATUS_FLOW: OrderStatus[] = [
  "pending",
  "confirmed",
  "production",
  "shipped",
  "delivered",
];

const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["production", "cancelled"],
  production: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  completed: [],
  cancelled: [],
};

export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value);
}

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function nextStatuses(from: OrderStatus): OrderStatus[] {
  return TRANSITIONS[from];
}

export function isTerminalStatus(status: OrderStatus): boolean {
  return TRANSITIONS[status].length === 0;
}
