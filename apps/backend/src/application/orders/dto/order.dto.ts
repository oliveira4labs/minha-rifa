/** Identifica o pedido e o administrador que está agindo. */
export interface OwnedOrderRefDto {
  userId: number;
  orderId: number;
}
