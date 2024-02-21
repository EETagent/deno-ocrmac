import * as base64 from "https://deno.land/std@0.216.0/encoding/base64.ts";

// Creates a universal library for both Intel and Apple Silicon
const compileProcess = new Deno.Command("clang", {
  args: [
    "lib.m",
    "-arch",
    "x86_64",
    "-arch",
    "arm64",
    "-framework",
    "Foundation",
    "-framework",
    "Vision",
    "-framework",
    "CoreGraphics",
    "-framework",
    "AppKit",
    "-shared",
    "-fobjc-arc",
    "-o",
    "lib.dylib",
  ],
});

const compile = compileProcess.spawn();

const compileStatus = await compile.status;

if (!compileStatus.success) {
  throw new Error("Failed to compile");
}

// Pack the library into a Uint8Array ts file
const lib = await Deno.readFile("lib.dylib");

const libBase64 = base64.encodeBase64(lib);

const libExport =
  `import * as base64 from "https://deno.land/std@0.216.0/encoding/base64.ts";
export default base64.decodeBase64("${libBase64}");`;

await Deno.writeTextFile("lib.ts", libExport);
