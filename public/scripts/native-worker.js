importScripts('rawr.bundle.js');

const rawrPeer = rawr({transport: rawr.transports.worker()});
self.rawrPeer = rawrPeer; // for devtools

// Use the native API's
async function detectUrl (width, height, imageData) {

    let barcodeDetector = new BarcodeDetector();
    let barcodes = await barcodeDetector.detect(imageData);
    // return the first barcode.
    if (barcodes && barcodes.length > 0) {
      const code = barcodes[0];
      console.log('native barcode', code);
      return code;
    }
    return null;

};

rawrPeer.addHandler('detectUrl', detectUrl);

