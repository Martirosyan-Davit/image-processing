import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import path from 'path';

import { ImagePayloadDto } from '../../common/dto/image-payload.dto';
import { type IFile } from '../../interfaces';
import { ImageSizeReadException } from './exceptions/image-size-read.exception';
import { ImageProcessService } from './image-process-service';
@Injectable()
export class StoreImageService {
  private readonly imagesDir = path.join(process.cwd(), 'images');

  private readonly logger = new Logger(StoreImageService.name);

  constructor(private imageProcessService: ImageProcessService) {
    if (!fs.existsSync(this.imagesDir)) {
      fs.mkdirSync(this.imagesDir, { recursive: true });
    }
  }

  async processAndStore(file: IFile): Promise<ImagePayloadDto> {
    this.logger.log('🔄 Загрузка изображения');

    const { width, height } = await this.imageProcessService.getMetadata(
      file.buffer,
    );

    if (!width || !height) {
      throw new ImageSizeReadException();
    }

    this.logger.log(`📐 Размер изображения: ${width}x${height}`);

    const halfWidth = Math.floor(width / 2);
    const halfHeight = Math.floor(height / 2);

    const positions = [
      { left: 0, top: 0 },
      { left: halfWidth, top: 0 },
      { left: halfWidth, top: halfHeight },
      { left: 0, top: halfHeight },
    ];

    this.logger.log('✂️ Начинается разрезка изображения на 4 сегмента');

    const segmentPromises = positions.map(async (pos, i) => {
      const region = {
        left: pos.left,
        top: pos.top,
        width: halfWidth,
        height: halfHeight,
      };

      const rawSegment = await this.imageProcessService.extractSegment(
        file.buffer,
        region,
      );

      this.logger.log(`📦 Сегмент ${i + 1} извлечён`);

      const blurOptions = this.getSegmentBlurEdges(i);
      const blurredSegment = await this.imageProcessService.addBlurToSegment(
        rawSegment,
        blurOptions,
      );

      const segmentPath = path.join(this.imagesDir, `${i + 1}.png`);
      await fs.promises.writeFile(segmentPath, new Uint8Array(blurredSegment));

      this.logger.log(`💾 Сегмент ${i + 1} сохранён в файл: ${segmentPath}`);

      return blurredSegment;
    });

    const segments = await Promise.all(segmentPromises);

    this.logger.log('🧩 Объединение сегментов в финальное изображение');

    const canvas = this.imageProcessService.createCanvas(width, height);

    const compositeLayers = positions.map((pos, i) => ({
      input: segments[i],
      left: pos.left,
      top: pos.top,
    }));

    const finalImagePath = path.join(this.imagesDir, 'final.png');
    await this.imageProcessService.composite(
      canvas,
      compositeLayers,
      finalImagePath,
    );

    this.logger.log(`✅ Финальное изображение сохранено: ${finalImagePath}`);

    return ImagePayloadDto.create({ imagePath: finalImagePath });
  }

  private getSegmentBlurEdges(index: number): {
    left?: boolean;
    right?: boolean;
    top?: boolean;
    bottom?: boolean;
  } {
    switch (index) {
      case 0: {
        return { right: true, bottom: true };
      } // top-left

      case 1: {
        return { left: true, bottom: true };
      } // top-right

      case 2: {
        return { left: true, top: true };
      } // bottom-right

      case 3: {
        return { right: true, top: true };
      } // bottom-left

      default: {
        return {};
      }
    }
  }
}
