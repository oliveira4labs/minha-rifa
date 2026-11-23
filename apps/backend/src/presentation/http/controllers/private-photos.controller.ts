import path from 'node:path';
import {
  Controller, Get, Param, Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { GetSessionUserUseCase } from '../../../application/auth/use-cases/get-session-user.use-case.js';
import { AuthorizePrivatePhotoUseCase } from '../../../application/photos/use-cases/authorize-private-photo.use-case.js';
import { appConfig, privateUploadDir } from '../../../config/app.config.js';
import { SessionToken } from '../guards/auth.guard.js';

export const PRIVATE_PHOTOS_ROUTE = 'uploads/private';

@Controller(PRIVATE_PHOTOS_ROUTE)
export class PrivatePhotosController {
  constructor(
    private readonly getSessionUser: GetSessionUserUseCase,
    private readonly authorizePrivatePhoto: AuthorizePrivatePhotoUseCase,
  ) {}

  @Get(':filename')
  async photo(@SessionToken() token: string | null, @Param('filename') filename: string, @Res() res: Response): Promise<void> {
    const user = await this.getSessionUser.execute(token);
    const photo = await this.authorizePrivatePhoto.execute({ userId: user?.id ?? null, filename });

    res.setHeader('Cache-Control', 'private, no-store');
    res.type(path.extname(photo.filename));

    const accelPath = appConfig.privateUploadsAccelPath;
    if (accelPath) {
      res.setHeader('X-Accel-Redirect', `${accelPath}/${photo.filename}`);
      res.end();
      return;
    }
    res.sendFile(path.join(privateUploadDir, photo.filename));
  }
}
