import { GetSessionUserUseCase } from './auth/use-cases/get-session-user.use-case.js';
import { LoginUseCase } from './auth/use-cases/login.use-case.js';
import { LogoutUseCase } from './auth/use-cases/logout.use-case.js';
import { RegisterUseCase } from './auth/use-cases/register.use-case.js';
import { AuthorizePrivatePhotoUseCase } from './photos/use-cases/authorize-private-photo.use-case.js';
import { ApproveOrderUseCase } from './orders/use-cases/approve-order.use-case.js';
import { CancelOrderUseCase } from './orders/use-cases/cancel-order.use-case.js';
import { ExpireOrdersUseCase } from './orders/use-cases/expire-orders.use-case.js';
import { GetBuyerOrderUseCase } from './public-raffle/use-cases/get-buyer-order.use-case.js';
import { GetPublicRaffleUseCase } from './public-raffle/use-cases/get-public-raffle.use-case.js';
import { ReserveNumbersUseCase } from './public-raffle/use-cases/reserve-numbers.use-case.js';
import { CreateRaffleUseCase } from './raffles/use-cases/create-raffle.use-case.js';
import { DeleteRaffleUseCase } from './raffles/use-cases/delete-raffle.use-case.js';
import { DrawRaffleUseCase } from './raffles/use-cases/draw-raffle.use-case.js';
import { GetRaffleDetailsUseCase } from './raffles/use-cases/get-raffle-details.use-case.js';
import { ListMyRafflesUseCase } from './raffles/use-cases/list-my-raffles.use-case.js';
import { UpdateRaffleUseCase } from './raffles/use-cases/update-raffle.use-case.js';

export const USE_CASES = [
  RegisterUseCase,
  LoginUseCase,
  LogoutUseCase,
  GetSessionUserUseCase,
  ListMyRafflesUseCase,
  CreateRaffleUseCase,
  GetRaffleDetailsUseCase,
  UpdateRaffleUseCase,
  DeleteRaffleUseCase,
  DrawRaffleUseCase,
  ApproveOrderUseCase,
  CancelOrderUseCase,
  ExpireOrdersUseCase,
  GetPublicRaffleUseCase,
  ReserveNumbersUseCase,
  GetBuyerOrderUseCase,
  AuthorizePrivatePhotoUseCase,
];
