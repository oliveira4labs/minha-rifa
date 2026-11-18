import {
  type CallHandler, type ExecutionContext, Injectable, type NestInterceptor,
} from '@nestjs/common';
import { from, type Observable, switchMap } from 'rxjs';
import { ExpireOrdersUseCase } from '../../../application/orders/use-cases/expire-orders.use-case.js';

@Injectable()
export class ExpireOrdersInterceptor implements NestInterceptor {
  constructor(private readonly expireOrders: ExpireOrdersUseCase) {}

  intercept(_: ExecutionContext, next: CallHandler): Observable<unknown> {
    return from(this.expireOrders.execute(Date.now())).pipe(switchMap(() => next.handle()));
  }
}
