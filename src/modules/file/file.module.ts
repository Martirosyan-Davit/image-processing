import { Module } from '@nestjs/common';

import { FileController } from './file.controller';
import { FileService } from './file.service';
import { ImageProcessService } from './services/image-process-service';
import { StoreImageService } from './services/store-image.service';

@Module({
  imports: [],
  controllers: [FileController],
  exports: [FileService],
  providers: [FileService, StoreImageService, ImageProcessService],
})
export class FileModule {}
