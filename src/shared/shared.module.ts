import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';

import { ApiConfigService } from './services/api-config.service';
import { ImageProcessService } from './services/image-process-service';
import { StoreImageService } from './services/store-image.service';

const providers = [StoreImageService, ApiConfigService, ImageProcessService];

@Global()
@Module({
  providers,
  imports: [HttpModule],
  exports: [...providers, HttpModule],
})
export class SharedModule {}
