import { Injectable } from '@nestjs/common';
import sharp from 'sharp';

import { UnsupportedImageFormatException } from '../exceptions/unsupported-image-format.exception';

@Injectable()
export class ImageProcessService {
  private readonly supportedFormats = new Set(['png']);

  async getMetadata(fileBuffer: Buffer) {
    const metadata = await sharp(fileBuffer).metadata();

    if (!this.supportedFormats.has(metadata.format!)) {
      throw new UnsupportedImageFormatException(metadata.format);
    }

    return metadata;
  }

  extractSegment(fileBuffer: Buffer, options: sharp.Region) {
    return sharp(fileBuffer).extract(options).toBuffer();
  }

  blurRegion(fileBuffer: Buffer, options: sharp.Region) {
    return sharp(fileBuffer).extract(options).blur().toBuffer();
  }

  createCanvas(width: number, height: number) {
    return sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    });
  }

  composite(
    canvas: sharp.Sharp,
    layers: sharp.OverlayOptions[],
    outputPath: string,
  ) {
    return canvas.composite(layers).png().toFile(outputPath);
  }

  async addBlurToSegment(
    segment: Buffer,
    sides: { left?: boolean; right?: boolean; top?: boolean; bottom?: boolean },
  ): Promise<Buffer> {
    const sigma = 10;
    const metadata = await sharp(segment).metadata();
    const { width, height } = metadata;

    if (!width || !height) {
      return segment;
    }

    const overlays: sharp.OverlayOptions[] = [];
    const blurSize = 20;

    if (sides.right && width > blurSize) {
      const strip = await sharp(segment)
        .extract({ left: width - blurSize, top: 0, width: blurSize, height })
        .blur(sigma)
        .toBuffer();
      overlays.push({ input: strip, left: width - blurSize, top: 0 });
    }

    if (sides.left && width > blurSize) {
      const strip = await sharp(segment)
        .extract({ left: 0, top: 0, width: blurSize, height })
        .blur(sigma)
        .toBuffer();
      overlays.push({ input: strip, left: 0, top: 0 });
    }

    if (sides.top && height > blurSize) {
      const strip = await sharp(segment)
        .extract({ left: 0, top: 0, width, height: blurSize })
        .blur(sigma)
        .toBuffer();
      overlays.push({ input: strip, left: 0, top: 0 });
    }

    if (sides.bottom && height > blurSize) {
      const top = height - blurSize;
      const strip = await sharp(segment)
        .extract({ left: 0, top, width, height: blurSize })
        .blur(sigma)
        .toBuffer();
      overlays.push({ input: strip, left: 0, top });
    }

    return sharp(segment).composite(overlays).png().toBuffer();
  }
}
