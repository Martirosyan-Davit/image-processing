import { Injectable } from '@nestjs/common';

import type { ImagePayloadDto } from '../../common/dto/image-payload.dto';
import { type IFile } from '../../interfaces';
import { StoreImageService } from '../../shared/services/store-image.service';

@Injectable()
export class FileService {
  constructor(private storeImageService: StoreImageService) {}

  uploadImage(file: IFile): Promise<ImagePayloadDto> {
    return this.storeImageService.processAndStore(file);
  }
}
