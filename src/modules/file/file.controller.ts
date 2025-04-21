import {
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  UploadedFile,
} from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

import { ImagePayloadDto } from '../../common/dto/image-payload.dto';
import { ApiFile } from '../../decorators';
import { ApiController } from '../../decorators/api.decorators';
import { IFile } from '../../interfaces';
import { FileService } from './file.service';

@ApiController('files')
export class FileController {
  constructor(private fileService: FileService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiFile({ name: 'file' })
  @ApiOkResponse({
    type: ImagePayloadDto,
    description: 'Upload image.',
  })
  uploadImage(@UploadedFile('file') file?: IFile): Promise<ImagePayloadDto> {
    if (!file) {
      throw new NotFoundException();
    }

    return this.fileService.uploadImage(file);
  }
}
