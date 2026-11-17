import {
  Controller, HttpCode, Param, Post, UseGuards,
} from '@nestjs/common';
import type { SessionUserDto } from '../../../application/auth/dto/auth.dto.js';
import type { OkDto } from '../../../application/common/dto/ok.dto.js';
import { ApproveOrderUseCase } from '../../../application/orders/use-cases/approve-order.use-case.js';
import { CancelOrderUseCase } from '../../../application/orders/use-cases/cancel-order.use-case.js';
import { AuthGuard, CurrentUser } from '../guards/auth.guard.js';

/** Ações do administrador sobre pedidos (reservas). */
@Controller('orders')
@UseGuards(AuthGuard)
export class OrdersController {
  constructor(
    private readonly approveOrder: ApproveOrderUseCase,
    private readonly cancelOrder: CancelOrderUseCase,
  ) {}

  @Post(':id/approve')
  @HttpCode(200)
  approve(@CurrentUser() user: SessionUserDto, @Param('id') id: string): Promise<OkDto> {
    return this.approveOrder.execute({ userId: user.id, orderId: Number(id) });
  }

  @Post(':id/cancel')
  @HttpCode(200)
  cancel(@CurrentUser() user: SessionUserDto, @Param('id') id: string): Promise<OkDto> {
    return this.cancelOrder.execute({ userId: user.id, orderId: Number(id) });
  }
}
