import rawr from 'rawr';
import transport from 'rawr/transports/worker';

const { methods } = rawr({transport: transport(new Worker('/scripts/wasm-worker.js'))});

console.log({methods})

export const decode = function (context) {
    let canvas = context.canvas;
    let width = canvas.width;
    let height = canvas.height;
    let imageData = context.getImageData(0, 0, width, height);
    return methods.detectUrl(width, height, imageData);
};
