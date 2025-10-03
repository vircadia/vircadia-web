//
//  copyWorkers.js
//
//  Copy web-worker scripts from the Web SDK to the application.
//  This is for static scripts that cannot be included by `import` or `require`.
//
//  Created by Giga on 18 September 2023.
//  Copyright 2023 Vircadia contributors.
//  Copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { copyFileSync, existsSync, mkdirSync } from "fs";

// The workers to copy.
const workers = [
    "vircadia-audio-input.js",
    "vircadia-audio-input.js.map",
    "vircadia-audio-output.js",
    "vircadia-audio-output.js.map"
];
// The destination for the worker files.
const destination = "public/js/";
// The destination for physics WASM files.
const wasmDestination = "public/wasm/";

// Ensure the destinations exist.
if (!existsSync(destination)) {
    mkdirSync(destination, { recursive: true });
}
if (!existsSync(wasmDestination)) {
    mkdirSync(wasmDestination, { recursive: true });
}

// Copy the worker files to the destination.
console.log("Copying workers...");
for (const worker of workers) {
    copyFileSync(`node_modules/@vircadia/web-sdk/dist/${worker}`, `${destination}${worker}`);
    console.log("  »\x1b[32m", worker, "\x1b[0m");
}
// Copy Havok WASM file
try {
    const havokWasm = "HavokPhysics.wasm";
    copyFileSync(`node_modules/@babylonjs/havok/lib/esm/${havokWasm}`, `${wasmDestination}${havokWasm}`);
    console.log("Copying wasm...");
    console.log("  »\x1b[32m", havokWasm, "\x1b[0m");
} catch (e) {
    console.warn("Havok wasm not found. Ensure @babylonjs/havok is installed.");
}
console.log("Done.\n");
