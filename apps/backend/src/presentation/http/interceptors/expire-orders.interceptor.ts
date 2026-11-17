import {
  type CallHandler, type ExecutionContext, Injectable, type NestInterceptor,
} from '@nestjs/common';
import { from, type Observable, switchMap } from 'rxjs';
import { ExpireOrdersUseCase } from '../../../application/orders/use-cases/expire-orders.use-case.js';

/**
 * Antes de cada requisição da API, libera reservas vencidas.
 * Assim nenhum caso de uso enxerga uma reserva que já deveria ter expirado
 * (sem que um caso de uso precise chamar outro).
 */
@Injectable()
export class ExpireOrdersInterceptor implements NestInterceptor {
  constructor(private readonly expireOrders: ExpireOrdersUseCase) {}

  intercept(_: ExecutionContext, next: CallHandler): Observable<unknown> {
    return from(this.expireOrders.execute(Date.now())).pipe(switchMap(() => next.handle()));
  }
}
