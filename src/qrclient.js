import rawr from 'rawr';
import transport from 'rawr/transports/worker';

const clients = {
  js: rawr({transport: transport(new Worker('/scripts/js-worker.js'))}),
  wasm: rawr({transport: transport(new Worker('/scripts/wasm-worker.js'))}),
  native: rawr({transport: transport(new Worker('/scripts/native-worker.js'))})
};

export const decode = function (context, client) {
    let canvas = context.canvas;
    let width = canvas.width;
    let height = canvas.height;
    let imageData = context.getImageData(0, 0, width, height);
    return clients[client].methods.detectUrl(width, height, imageData);
};
