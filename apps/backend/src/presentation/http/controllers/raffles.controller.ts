import {
  Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UseGuards,
} from '@nestjs/common';
import type { SessionUserDto } from '../../../application/auth/dto/auth.dto.js';
import type { OkDto } from '../../../application/common/dto/ok.dto.js';
import {
  type CreatedRaffleDto, type DrawResultDto, RaffleInputDto, type RaffleDetailsDto, type RaffleSummaryDto,
} from '../../../application/raffles/dto/raffle.dto.js';
import { CreateRaffleUseCase } from '../../../application/raffles/use-cases/create-raffle.use-case.js';
import { DeleteRaffleUseCase } from '../../../application/raffles/use-cases/delete-raffle.use-case.js';
import { DrawRaffleUseCase } from '../../../application/raffles/use-cases/draw-raffle.use-case.js';
import { GetRaffleDetailsUseCase } from '../../../application/raffles/use-cases/get-raffle-details.use-case.js';
import { ListMyRafflesUseCase } from '../../../application/raffles/use-cases/list-my-raffles.use-case.js';
import { UpdateRaffleUseCase } from '../../../application/raffles/use-cases/update-raffle.use-case.js';
import { AuthGuard, CurrentUser } from '../guards/auth.guard.js';

/** Rifas do administrador logado. */
@Controller('raffles')
@UseGuards(AuthGuard)
export class RafflesController {
  constructor(
    private readonly listMyRaffles: ListMyRafflesUseCase,
    private readonly createRaffle: CreateRaffleUseCase,
    private readonly getRaffleDetails: GetRaffleDetailsUseCase,
    private readonly updateRaffle: UpdateRaffleUseCase,
    private readonly deleteRaffle: DeleteRaffleUseCase,
    private readonly drawRaffle: DrawRaffleUseCase,
  ) {}

  @Get()
  list(@CurrentUser() user: SessionUserDto): Promise<RaffleSummaryDto[]> {
    return this.listMyRaffles.execute(user.id);
  }

  @Post()
  @HttpCode(200)
  create(@CurrentUser() user: SessionUserDto, @Body() data: RaffleInputDto): Promise<CreatedRaffleDto> {
    return this.createRaffle.execute({ userId: user.id, data });
  }

  @Get(':id')
  details(@CurrentUser() user: SessionUserDto, @Param('id') id: string): Promise<RaffleDetailsDto> {
    return this.getRaffleDetails.execute({ userId: user.id, raffleId: Number(id) });
  }

  @Put(':id')
  update(@CurrentUser() user: SessionUserDto, @Param('id') id: string, @Body() data: RaffleInputDto): Promise<OkDto> {
    return this.updateRaffle.execute({ userId: user.id, raffleId: Number(id), data });
  }

  @Delete(':id')
  remove(@CurrentUser() user: SessionUserDto, @Param('id') id: string): Promise<OkDto> {
    return this.deleteRaffle.execute({ userId: user.id, raffleId: Number(id) });
  }

  @Post(':id/draw')
  @HttpCode(200)
  draw(@CurrentUser() user: SessionUserDto, @Param('id') id: string): Promise<DrawResultDto> {
    return this.drawRaffle.execute({ userId: user.id, raffleId: Number(id) });
  }
}
