import React, { Component } from 'react';
import './App.css';

import { decode } from './qrclient';

class App extends Component {
  state = {
    selectedType: 'js'
  }

  canvasRef = React.createRef();

  componentDidMount() {

    console.log(this.canvasRef);
    const constraints = {
      video: true, //{width: {exact: 320}},
      audio: false
    };

    return navigator.mediaDevices.getUserMedia(constraints)
    .then((stream) => {
      
      //console.log('stream', stream);
      const track = stream.getVideoTracks()[0];
      
      const videoElement = document.createElement('video');
      const cameraCanvas = this.canvasRef.current; //document.createElement('canvas');
      //const cameraCanvas = document.getElementById('canvas');

      videoElement.addEventListener('loadeddata', (e) => {
        cameraCanvas.height = videoElement.videoHeight;
        cameraCanvas.width = videoElement.videoWidth;
        videoElement.height = videoElement.videoHeight;
        videoElement.width = videoElement.videoWidth;

        console.log({video: {height: videoElement.height, width: videoElement.width}});
        
        const ctx = cameraCanvas.getContext('2d');
        ctx.font = "15px Arial";
        ctx.fillStyle = "red";
        ctx.strokeStyle = "#FF0000";
        ctx.lineWidth = 2;

        let times = [];

        
        const onframe = async () => {
          
          ctx.drawImage(videoElement, 0, 0, videoElement.videoWidth, videoElement.videoHeight);
          let endTime;
          const startTime = Date.now();
          try {
            
            const bc = await decode(ctx, this.state.selectedType);
            endTime = Date.now();
            if(bc) {
              this.setState({latestQR: bc});
            }

            if(this.state.latestQR) {
              
              const cp = this.state.latestQR.cornerPoints;
              ctx.fillText(this.state.latestQR.rawValue, cp[0].x, cp[0].y);
              ctx.beginPath();
              ctx.moveTo(cp[0].x, cp[0].y);
              ctx.lineTo(cp[1].x, cp[1].y);
              ctx.lineTo(cp[2].x, cp[2].y);
              ctx.lineTo(cp[3].x, cp[3].y);
              ctx.lineTo(cp[0].x, cp[0].y);
              ctx.closePath();
              ctx.stroke();
              //console.log('a good bc', bc.cornerPoints);
            }
            this.setState({currentQR: bc ? bc.rawValue: ''});

            // console.log('elapsed', decodeTime, bc);
          } catch (err) {
            endTime = Date.now();
            console.log('err decoding', err);
          } 
          times.push(endTime - startTime);
          if(times.length > 10) {
            times.shift();
          }
          const totalTime = times.reduce((acc, t) => acc + t, 0);
          this.setState({avgTime: totalTime/times.length});
          requestAnimationFrame(onframe);
          
        };

        requestAnimationFrame(onframe);
      });

      const ms = new MediaStream();
      ms.addTrack(track);

      videoElement.srcObject = ms;
      videoElement.load();
      videoElement.play()
        .catch(error => {
          console.error("Auto Play Error", error);
        });

    })
    .catch((error) =>{
      console.log('Error adding stream' + error);
      //reject(error);
    });
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <div style={{width: '95%', margin: '10px'}}>
            <span style={{float: 'left'}}>QR Code found: {this.state.currentQR || ''}</span>
            <span style={{float: 'right'}}>Avg. time(ms): {(this.state.avgTime || 0).toFixed(1)}</span>
          </div>
          <canvas ref={this.canvasRef}/>
          <div className="custom02">
            <div>
              <input
                type="radio"
                name="decoder-type"
                value="js"
                id="radio1"
                checked={this.state.selectedType === "js"}
                onChange={() => this.setState({selectedType: 'js'})}
              />
              <label htmlFor="radio1">
                JavaScript (jsqrcode)
              </label>
            </div>
          
            <div>
              <input
                type="radio"
                name="decoder-type"
                value="js"
                id="radio2"
                checked={this.state.selectedType === "wasm"}
                onChange={() => this.setState({selectedType: 'wasm'})}
              />
              <label htmlFor="radio2">
                WASM (zbar C++)
              </label>
            </div>
          
            <div>
              <input
                type="radio"
                name="decoder-type"
                value="js"
                id="radio3"
                checked={this.state.selectedType === "native"}
                onChange={() => this.setState({selectedType: 'native'})}
              />
              <label htmlFor="radio3">
                Native (BarcodeDetector)
              </label>
            </div>
          </div>
         
        </header>
      </div>
    );
  }
}

export default App;
