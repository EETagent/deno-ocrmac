export const loadLibrary = (path: string) =>
  Deno.dlopen(path, {
    getTextFromImageByteArray: {
      parameters: ["buffer", "u64", "u8", "bool", "u8", "buffer", "buffer"],
      result: "u8",
      nonblocking: true,
    },
  });

type Dylib = ReturnType<typeof loadLibrary>;

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

export const getTextFromImageByteArray = async (
  dylib: Dylib,
  bytes: Uint8Array,
  recognitionLevel = RecognitionLevel.Accurate,
  languageCorrection = false,
  imageOrientation = Orientation.Up,
): Promise<string> => {
  const textPtr = new BigUint64Array(1);
  const errorPtr = new BigUint64Array(1);

  const code = await dylib.symbols.getTextFromImageByteArray(
    bytes,
    bytes.length,
    recognitionLevel,
    languageCorrection,
    imageOrientation,
    textPtr,
    errorPtr,
  );

  if (code !== 0) {
    const ptr = Deno.UnsafePointer.create(errorPtr[0]);
    if (ptr === null) {
      throw new Error("Error pointer is null");
    }
    const error = new Deno.UnsafePointerView(ptr).getCString();
    throw new Error(error);
  }

  const ptr = Deno.UnsafePointer.create(textPtr[0]);
  if (ptr === null) {
    throw new Error("Text pointer is null");
  }
  const text = new Deno.UnsafePointerView(ptr).getCString();

  return text;
};
