import {
  getTextFromImageByteArray,
  loadLibrary,
  Orientation,
  RecognitionLevel,
} from "./api.ts";
import lib from "./lib.ts";

/**
 * Represents an Vision OCR instance that can recognize text from images.
 * Should be disposed using using 😝.
 * @class 
 */
export class OCRMac {
  private libPath: string;
  private lib: ReturnType<typeof loadLibrary>;

  /**
   * Creates a new OCR instance.
   * Unpacks and loads the shared library. This is an sync operation.
   * @throws {Error} If there was an error creating the OCR instance.
   * @constructor
   */
  constructor() {
    this.libPath = Deno.makeTempFileSync();

    Deno.writeFileSync(this.libPath, lib);

    // Load the shared library using Deno.dlopen
    this.lib = Deno.dlopen(this.libPath, {
      getTextFromImageByteArray: {
        parameters: ["buffer", "u64", "u8", "bool", "u8", "buffer", "buffer"],
        result: "u8",
        nonblocking: true,
      },
    });
  }

  /**
   * Recognizes text from a byte array of an image.
   * @param {Uint8Array} bytes - The byte array of the image.
   * @param {RecognitionLevel} [recognitionLevel=RecognitionLevel.Accurate] - The recognition level.
   * @param {boolean} [languageCorrection=false] - Whether to perform language correction.
   * @param {Orientation} [imageOrientation=Orientation.Up] - The image orientation.
   * @returns {Promise<string>} A promise that resolves to the recognized text.
   * @throws {Error} If there was an error recognizing the text.
   */
  public async getTextFromImageByteArray(
    bytes: Uint8Array,
    recognitionLevel = RecognitionLevel.Accurate,
    languageCorrection = false,
    imageOrientation = Orientation.Up,
  ): Promise<string> {
    return await getTextFromImageByteArray(
      this.lib,
      bytes,
      recognitionLevel,
      languageCorrection,
      imageOrientation,
    );
  }

  /**
   * Disposes of the OCR instance and removes the temporary shared library file.
   * @function
   */
  [Symbol.dispose]() {
    this.lib.close();
    Deno.removeSync(this.libPath);
  }
}
