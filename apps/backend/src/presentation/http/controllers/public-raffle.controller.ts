import {
  Body, Controller, Get, HttpCode, Param, Post,
} from '@nestjs/common';
import type { OkDto } from '../../../application/common/dto/ok.dto.js';
import {
  type BuyerOrderDto, type CartDto, HoldNumberDto, type PublicRaffleDto, ReleaseNumberDto, type ReservationDto,
  ReserveNumbersDto,
} from '../../../application/public-raffle/dto/public-raffle.dto.js';
import { GetSessionUserUseCase } from '../../../application/auth/use-cases/get-session-user.use-case.js';
import { GetBuyerOrderUseCase } from '../../../application/public-raffle/use-cases/get-buyer-order.use-case.js';
import { GetPublicRaffleUseCase } from '../../../application/public-raffle/use-cases/get-public-raffle.use-case.js';
import { HoldNumberUseCase } from '../../../application/public-raffle/use-cases/hold-number.use-case.js';
import { MarkProofSentUseCase } from '../../../application/public-raffle/use-cases/mark-proof-sent.use-case.js';
import { ReleaseNumberUseCase } from '../../../application/public-raffle/use-cases/release-number.use-case.js';
import { ReserveNumbersUseCase } from '../../../application/public-raffle/use-cases/reserve-numbers.use-case.js';
import { appConfig } from '../../../config/app.config.js';
import { SessionToken } from '../guards/auth.guard.js';
import { RateLimit } from '../guards/rate-limit.guard.js';
import type { RateLimitRule } from '../interfaces/rate-limit.interface.js';

const ONE_MINUTE = 60_000;
// Clicar e soltar número dividem o mesmo contador: é o que um script usaria para ocupar a rifa inteira.
const CART_LIMIT: RateLimitRule = { bucket: 'carrinho', limit: appConfig.cartActionsPerMinute, windowMs: ONE_MINUTE };
const SUBMIT_LIMIT: RateLimitRule = { bucket: 'envio', limit: appConfig.buyerSubmitsPerMinute, windowMs: ONE_MINUTE };

@Controller()
export class PublicRaffleController {
  constructor(
    private readonly getPublicRaffle: GetPublicRaffleUseCase,
    private readonly holdNumber: HoldNumberUseCase,
    private readonly releaseNumber: ReleaseNumberUseCase,
    private readonly reserveNumbers: ReserveNumbersUseCase,
    private readonly getBuyerOrder: GetBuyerOrderUseCase,
    private readonly markProofSent: MarkProofSentUseCase,
    private readonly getSessionUser: GetSessionUserUseCase,
  ) {}

  @Get('r/:slug')
  async raffle(@Param('slug') slug: string, @SessionToken() token: string | null): Promise<PublicRaffleDto> {
    const viewer = await this.getSessionUser.execute(token);
    return this.getPublicRaffle.execute({ slug, viewerId: viewer?.id ?? null });
  }

  @Post('r/:slug/hold')
  @HttpCode(200)
  @RateLimit(CART_LIMIT)
  hold(@Param('slug') slug: string, @Body() data: HoldNumberDto): Promise<CartDto> {
    return this.holdNumber.execute({ slug, data });
  }

  @Post('r/:slug/release')
  @HttpCode(200)
  @RateLimit(CART_LIMIT)
  release(@Param('slug') slug: string, @Body() data: ReleaseNumberDto): Promise<CartDto> {
    return this.releaseNumber.execute({ slug, data });
  }

  @Post('r/:slug/reserve')
  @HttpCode(200)
  @RateLimit(SUBMIT_LIMIT)
  reserve(@Param('slug') slug: string, @Body() data: ReserveNumbersDto): Promise<ReservationDto> {
    return this.reserveNumbers.execute({ slug, data });
  }

  @Get('pedido/:token')
  order(@Param('token') token: string): Promise<BuyerOrderDto> {
    return this.getBuyerOrder.execute(token);
  }

  @Post('pedido/:token/comprovante')
  @HttpCode(200)
  @RateLimit(SUBMIT_LIMIT)
  proofSent(@Param('token') token: string): Promise<OkDto> {
    return this.markProofSent.execute(token);
  }
}
