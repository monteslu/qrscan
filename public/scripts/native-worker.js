importScripts('rawr.bundle.js');

const rawrPeer = rawr({transport: rawr.transports.worker()});
self.rawrPeer = rawrPeer; // for devtools

let barcodeDetector;

if('BarcodeDetector' in self) {
  barcodeDetector = new BarcodeDetector();
}


// Use the native API's
async function detectUrl (width, height, imageData) {

    if(!barcodeDetector) {
      throw new Error('native BarcodeDetector API not available. See https://www.chromestatus.com/feature/4757990523535360');
    }

    const d = imageData.data;

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

