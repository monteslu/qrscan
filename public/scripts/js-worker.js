importScripts('rawr.bundle.js');
importScripts('jsqr.bundle.js');

const rawrPeer = rawr({transport: rawr.transports.worker()});
self.rawrPeer = rawrPeer; // for devtools

console.log('jsqrcode', qrcode);

async function detectUrl (width, height, imageData) {
  try {
    // return qrcode.decode(width, height, imageData);
    const d = imageData.data;

    // convert the image data to grayscale 
		const grayData = []
		for (var i = 0, j = 0; i < d.length; i += 4, j++) {
			grayData[j] = (d[i] * 66 + d[i + 1] * 129 + d[i + 2] * 25 + 4096) >> 8;
		}

    imageData.data = grayData;
    return qrcode.decodeWithPoints(width, height, imageData);
  } catch (err) {
    // console.log('err decoding', err);
    // the library throws an excpetion when there are no qrcodes.
    return null;
  }
}

rawrPeer.addHandler('detectUrl', detectUrl);

