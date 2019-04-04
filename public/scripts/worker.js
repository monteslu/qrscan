importScripts('a.out.js');
importScripts('rawr.bundle.js');

console.log('Module', Module, rawr);

const rawrPeer = rawr({transport: rawr.transports.worker()});

self.rawrPeer = rawrPeer;

console.log('rawrPeer', rawrPeer);

let wasmApi;
let wasmResult;

Module.onRuntimeInitialized = async _ => {

  console.log('inittied', _);

  rawrPeer.notifiers.ready();

  // wrap all C functions using cwrap. Note that we have to provide crwap with the function signature.
	wasmApi = {
		scan_image: Module.cwrap('scan_image', '', ['number', 'number', 'number']),
		create_buffer: Module.cwrap('create_buffer', 'number', ['number', 'number']),
		destroy_buffer: Module.cwrap('destroy_buffer', '', ['number']),
  };
  
  // set the function that should be called whenever a barcode is detected
	Module['processResult'] = (symbol, data, polygon) => {
		console.log("Data liberated from WASM heap:")
		console.log(symbol)
		console.log(data)
		console.log(polygon)

		wasmResult = {
      rawValue: data,
      polygon
    };
	}

};



// Use the native API's
async function nativeDetector (width, height, imageData) {
  try {
    let barcodeDetector = new BarcodeDetector();
    let barcodes = await barcodeDetector.detect(imageData);
    // return the first barcode.
    if (barcodes.length > 0) {
      const code = barcodes[0];
      console.log('native barcode', code);
      return code;
    }
    return null;
  } catch(err) {
    console.log('err using native detector', err, err.message);
    detector = workerDetector;
    return null;
  }
};

// Use the polyfil
async function workerDetector (width, height, imageData) {
  try {

    wasmResult = null;

    const d = imageData.data;

    //console.log('trying', width, height, d);

    // convert the image data to grayscale 
		const grayData = []
		for (var i = 0, j = 0; i < d.length; i += 4, j++) {
			grayData[j] = (d[i] * 66 + d[i + 1] * 129 + d[i + 2] * 25 + 4096) >> 8;
		}

		// put the data into the allocated buffer
		const p = wasmApi.create_buffer(width, height);
    Module.HEAP8.set(grayData, p);
    //Module.HEAP8.set(d, p);

		// call the scanner function
		wasmApi.scan_image(p, width, height)

		// clean up (this is not really necessary in this example, but is used to demonstrate how you can manage Wasm heap memory from the js environment)
    wasmApi.destroy_buffer(p);
    //console.log('wasmresult', wasmResult);
    return wasmResult;
  } catch (err) {
    // the library throws an excpetion when there are no qrcodes.
    console.log('err in wasm', err);
    return null;
  }
}


let detector;
if('BarcodeDetector' in self) {
  console.log('using native BarcodeDetector');
  detector = nativeDetector;
} else {
  console.log('using JS polyifill detector');
  detector = workerDetector;
}

async function detectUrl (width, height, imageData) {
  return await detector(width, height, imageData);
};

rawrPeer.addHandler('detectUrl', detectUrl);
