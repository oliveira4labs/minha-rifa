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
export class ApproveOrderUseCase implements UseCase<OwnedOrderRefDto, OkDto> {
  constructor(
    @Inject(OrderRepository) private readonly orders: IOrderRepository,
    @Inject(RaffleRepository) private readonly raffles: IRaffleRepository,
  ) {}

  async execute({ userId, orderId }: OwnedOrderRefDto): Promise<OkDto> {
    const order = await requireManageableOrder(this.orders, this.raffles, userId, orderId);
    if (order.status !== 'pending') {
      throw new BusinessRuleError('Esta reserva expirou ou já foi tratada. Atualize a página.');
    }
    await this.orders.markPaid(order.id, Date.now());
    return OK;
  }
}
