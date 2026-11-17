import {
  Body, Controller, Get, HttpCode, Param, Post,
} from '@nestjs/common';
import {
  type BuyerOrderDto, type PublicRaffleDto, type ReservationDto, ReserveNumbersDto,
} from '../../../application/public-raffle/dto/public-raffle.dto.js';
import { GetBuyerOrderUseCase } from '../../../application/public-raffle/use-cases/get-buyer-order.use-case.js';
import { GetPublicRaffleUseCase } from '../../../application/public-raffle/use-cases/get-public-raffle.use-case.js';
import { ReserveNumbersUseCase } from '../../../application/public-raffle/use-cases/reserve-numbers.use-case.js';

/** Rotas abertas: página da rifa, reserva e consulta do pedido pelo comprador. */
@Controller()
export class PublicRaffleController {
  constructor(
    private readonly getPublicRaffle: GetPublicRaffleUseCase,
    private readonly reserveNumbers: ReserveNumbersUseCase,
    private readonly getBuyerOrder: GetBuyerOrderUseCase,
  ) {}

  @Get('r/:slug')
  raffle(@Param('slug') slug: string): Promise<PublicRaffleDto> {
    return this.getPublicRaffle.execute(slug);
  }

  @Post('r/:slug/reserve')
  @HttpCode(200)
  reserve(@Param('slug') slug: string, @Body() data: ReserveNumbersDto): Promise<ReservationDto> {
    return this.reserveNumbers.execute({ slug, data });
  }

  @Get('pedido/:token')
  order(@Param('token') token: string): Promise<BuyerOrderDto> {
    return this.getBuyerOrder.execute(token);
  }
}
