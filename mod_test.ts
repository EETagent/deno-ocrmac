import OCRMac, { Orientation, RecognitionLevel } from "./mod.ts";

import {
  assertRejects,
  assertStrictEquals,
} from "https://deno.land/std@0.202.0/assert/mod.ts";

Deno.test("OCRMac", async () => {
  using ocr = new OCRMac();
  const text = await ocr.getTextFromImageByteArray(
    Deno.readFileSync("./images/test.png"),
  );
  console.log(text);
  assertStrictEquals(text, "VNRequestTextRecognitionLevel");
});

Deno.test("OCRMac", async () => {
  using ocr = new OCRMac();
  const text = await ocr.getTextFromImageByteArray(
    Deno.readFileSync("./images/test_2.png"),
    RecognitionLevel.Fast,
    true,
    Orientation.Left,
  );
  console.log(text);
  assertStrictEquals(text, "VNRequestTextRecognitionLevel");
});

Deno.test("OCRMac", () => {
  assertRejects(() => {
    using ocr = new OCRMac();

    return ocr.getTextFromImageByteArray(
      new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8]),
    );
  });
});
