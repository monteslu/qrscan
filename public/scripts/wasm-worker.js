importScripts('a.out.js');
importScripts('rawr.bundle.js');

const rawrPeer = rawr({transport: rawr.transports.worker()});
self.rawrPeer = rawrPeer; // for devtools

let wasmApi;
let wasmResult;

Module.onRuntimeInitialized = async _ => {

  console.log('wasm initted', _);

  rawrPeer.notifiers.ready();

  // wrap all C functions using cwrap. Note that we have to provide crwap with the function signature.
	wasmApi = {
		scan_image: Module.cwrap('scan_image', '', ['number', 'number', 'number']),
		create_buffer: Module.cwrap('create_buffer', 'number', ['number', 'number']),
		destroy_buffer: Module.cwrap('destroy_buffer', '', ['number']),
  };
  
  // set the function that should be called whenever a barcode is detected
	Module['processResult'] = (symbol, data, poly) => {
		//console.log("Data liberated from WASM heap:", symbol, data, poly);
		wasmResult = {
      rawValue: data,
      cornerPoints: [
        {x: poly[0], y: poly[1]},
        {x: poly[2], y: poly[3]},
        {x: poly[4], y: poly[5]},
        {x: poly[6], y: poly[7]}
      ],
      wasm: true
    };
  };

};

async function detectUrl (width, height, imageData) {
  try {

    wasmResult = null;

    const d = imageData.data;

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

rawrPeer.addHandler('detectUrl', detectUrl);

