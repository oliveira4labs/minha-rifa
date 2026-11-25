import { Inject, Injectable } from '@nestjs/common';
import { BusinessRuleError, NotFoundError } from '../../../domain/errors/domain.errors.js';
import { isAwaitingBuyer } from '../../../domain/rules/order.rules.js';
import { assertOpen } from '../../../domain/rules/raffle.rules.js';
import type { UseCase } from '../../common/interfaces/use-case.interface.js';
import { OK, type OkDto } from '../../common/dto/ok.dto.js';
import { OrderRepository } from '../../../domain/repositories/order.repository.js';
import type { IOrderRepository } from '../../../domain/repositories/interfaces/order.repository.interface.js';
import { RaffleRepository } from '../../../domain/repositories/raffle.repository.js';
import type { IRaffleRepository } from '../../../domain/repositories/interfaces/raffle.repository.interface.js';

@Injectable()
export class MarkProofSentUseCase implements UseCase<string, OkDto> {
  constructor(
    @Inject(OrderRepository) private readonly orders: IOrderRepository,
    @Inject(RaffleRepository) private readonly raffles: IRaffleRepository,
  ) {}

  async execute(token: string): Promise<OkDto> {
    const order = await this.orders.findByToken(token);
    const raffle = order && await this.raffles.findById(order.raffleId);
    if (!order || !raffle) throw new NotFoundError('Pedido não encontrado.');
    if (order.status === 'proof_sent' || order.status === 'paid') return OK;
    assertOpen(raffle, 'Esta rifa já foi encerrada.');
    if (order.status === 'held') throw new BusinessRuleError('Confirme seu nome e WhatsApp antes de avisar o organizador.');
    if (order.status !== 'pending' || !isAwaitingBuyer(order) || !await this.orders.markProofSent(order.id, Date.now())) {
      throw new BusinessRuleError('O prazo desta reserva acabou e os números foram liberados.');
    }
    return OK;
  }
}
