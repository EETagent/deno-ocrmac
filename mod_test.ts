import OCRMac from "./mod.ts";

import { assertEquals } from "https://deno.land/std@0.202.0/assert/mod.ts";

Deno.test("OCRMac", async () => {
  using ocr = new OCRMac();
  const text = await ocr.getTextFromImageByteArray(
    Deno.readFileSync("./test.png"),
  );
  console.log(text);
  assertEquals(text, "VNRequestTextRecognitionLevel");
});
