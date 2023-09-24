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

const libExport = `export default new Uint8Array([${lib.toString()}]);`;

await Deno.writeTextFile("lib.ts", libExport);
