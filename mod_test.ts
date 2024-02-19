import OCRMac, { Orientation, RecognitionLevel } from "./mod.ts";

import {
  assertRejects,
  assertStrictEquals,
  assertGreater,
} from "https://deno.land/std@0.216.0/assert/mod.ts";

Deno.test("OCRMac Single Word Test", async () => {
  using ocr = new OCRMac();
  const result = await ocr.getTextFromImageByteArray(
    Deno.readFileSync("./images/test.png"),
  );
  console.log(result);
  assertStrictEquals(result[0].text, "VNRequestTextRecognitionLevel");
});

Deno.test("OCRMac Single Word Fast & Rotated Test", async () => {
  using ocr = new OCRMac();
  const result = await ocr.getTextFromImageByteArray(
    Deno.readFileSync("./images/test_2.png"),
    RecognitionLevel.Fast,
    true,
    Orientation.Left,
  );
  console.log(result);
  assertStrictEquals(result[0].text, "VNRequestTextRecognitionLevel");
});

Deno.test("OCRMac Bad File Test", async () => {
  await assertRejects(async () => {
    using ocr = new OCRMac();

    await ocr.getTextFromImageByteArray(
      new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8]),
    );
  });
});

Deno.test("OCRMac GitHub Landing Page Test", async () => {
  using ocr = new OCRMac();
  const result = await ocr.getTextFromImageByteArray(
    Deno.readFileSync("./images/test_github.png"),
  );
  console.log(result);
  
  assertGreater(result.length, 20);

  // TODO: Add more tests
});