# Browser QR Scanning

live demo: [https://qr-scan.netlify.com](https://qr-scan.netlify.com)

## install
`npm i`

## run
`npm run start`

open browser to [http://localhost:3005](http://localhost:3005)

You can generate a QR code with: [https://qrcode.surge.sh](https://qrcode.surge.sh)

## About

The actual scanning is done in a [WebWorker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers) using the [zbar](http://zbar.sourceforge.net/) library which is written in C++

Zbar is compiled to [WebAssembly](https://webassembly.org/) using Emscripten. More details on how that's done [here](https://barkeywolf.consulting/posts/barcode-scanner-webassembly/)

The app communicates with the WebWorker(wasm-worker.js file) using a library called [rawr](https://github.com/iceddev/rawr)

