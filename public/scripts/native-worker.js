importScripts('rawr.bundle.js');

const rawrPeer = rawr({transport: rawr.transports.worker()});
self.rawrPeer = rawrPeer; // for devtools

let barcodeDetector = new BarcodeDetector();

// Use the native API's
async function detectUrl (width, height, imageData) {

    
    const d = imageData.data;

    // convert the image data to grayscale 
    const grayData = []
    for (var i = 0, j = 0; i < d.length; i += 4, j++) {
      grayData[j] = (d[i] * 66 + d[i + 1] * 129 + d[i + 2] * 25 + 4096) >> 8;
    }

    imageData.data = grayData;
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

