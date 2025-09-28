```typescript
import OCRMac, {
  Orientation,
  RecognitionLevel,
} from "jsr:@eetagent/deno-ocrmac";

using ocr = new OCRMac();

const result = await ocr.getTextFromImageByteArray(
  Deno.readFileSync("./image.png"),
  RecognitionLevel.Accurate,
  true,
  Orientation.Left,
);

console.log(result);
```

```typescript
/**
 * Constants that identify the performance and accuracy of the text recognition.
 * @enum {number}
 */
export enum RecognitionLevel {
  Accurate = 0,
  Fast = 1,
}

/**
 * The orientation of the image/buffer based on the EXIF specification.
 * For details see kCGImagePropertyOrientation.
 * The value has to be an integer from 1 to 8.
 * This supersedes every other orientation information.
 * @enum {number}
 */
export enum Orientation {
  Up = 1,
  UpperMirrored = 2,
  Down = 3,
  DownMirrored = 4,
  Left = 8,
  LeftMirrored = 5,
  Right = 6,
  RightMirrored = 7,
}

export type BoundingBox = {
  y: number;
  w: number;
  x: number;
  h: number;
};

export type Result = Array<{
  boundingBox: BoundingBox;
  text: string;
}>;
```
