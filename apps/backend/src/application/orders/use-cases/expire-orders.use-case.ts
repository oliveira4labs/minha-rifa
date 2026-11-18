import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '../../common/interfaces/use-case.interface.js';
import { OrderRepository } from '../../../domain/repositories/order.repository.js';
import type { IOrderRepository } from '../../../domain/repositories/interfaces/order.repository.interface.js';
import { UnitOfWork } from '../../../domain/repositories/unit-of-work.js';
import type { IUnitOfWork } from '../../../domain/repositories/interfaces/unit-of-work.interface.js';

@Injectable()
export class ExpireOrdersUseCase implements UseCase<number, number> {
  constructor(
    @Inject(OrderRepository) private readonly orders: IOrderRepository,
    @Inject(UnitOfWork) private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(now: number = Date.now()): Promise<number> {
    const expired = await this.orders.listExpiredPendingIds(now);
    if (!expired.length) return 0;
    await this.unitOfWork.run(async () => {
      for (const id of expired) await this.orders.release(id, 'expired');
    });
    return expired.length;
  }
}
