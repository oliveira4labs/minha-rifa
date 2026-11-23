import { Inject, Injectable } from '@nestjs/common';
import { BusinessRuleError } from '../../../domain/errors/domain.errors.js';
import type { UseCase } from '../../common/interfaces/use-case.interface.js';
import { OK, type OkDto } from '../../common/dto/ok.dto.js';
import type { OwnedOrderRefDto } from '../dto/order.dto.js';
import { requireManageableOrder } from '../order.helpers.js';
import { OrderRepository } from '../../../domain/repositories/order.repository.js';
import type { IOrderRepository } from '../../../domain/repositories/interfaces/order.repository.interface.js';
import { RaffleRepository } from '../../../domain/repositories/raffle.repository.js';
import type { IRaffleRepository } from '../../../domain/repositories/interfaces/raffle.repository.interface.js';

@Injectable()
export class CancelOrderUseCase implements UseCase<OwnedOrderRefDto, OkDto> {
  constructor(
    @Inject(OrderRepository) private readonly orders: IOrderRepository,
    @Inject(RaffleRepository) private readonly raffles: IRaffleRepository,
  ) {}

  async execute({ userId, orderId }: OwnedOrderRefDto): Promise<OkDto> {
    const order = await requireManageableOrder(this.orders, this.raffles, userId, orderId);
    if (order.status !== 'pending' && order.status !== 'paid') {
      throw new BusinessRuleError('Este pedido já não está ativo.');
    }
    await this.orders.release(order.id, 'cancelled');
    return OK;
  }
}
