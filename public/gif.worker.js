importScripts("/wasm_exec.js");

const go = new self.Go();
const wasmInit = WebAssembly.instantiateStreaming(fetch("/gif-cropper.wasm"), go.importObject).then((result) => {
    go.run(result.instance);
});

addEventListener("message", async (e) => {
    await wasmInit;

    const tempBuf = new Uint8Array(1024 * 1024 * 8);
    const bytesLen = await self.encodeGif(e.data[0], e.data[1], e.data[2], e.data[3], e.data[4], tempBuf);
    const outBuf = tempBuf.subarray(0, bytesLen);

    postMessage({
        done: true,
        buf: outBuf,
    });
});
