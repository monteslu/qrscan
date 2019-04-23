import React, { Component } from 'react';
import './App.css';

import { decode } from './qrclient';
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

class App extends Component {
  state = {
    selectedType: 'js'
  }

  canvasRef = React.createRef();

  checkForUrl(qrOutput) {
    const expression = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
    const regexCheckForUrl = new RegExp(expression);

    return (qrOutput.match(regexCheckForUrl)) ? true : false 
  }

  async componentDidMount() {

    console.log(this.canvasRef);
    const constraints = {
      video: true, //{width: {exact: 720}},
      audio: false
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      
      const track = stream.getVideoTracks()[0];
      
      const videoElement = document.createElement('video');
      const drawCanvas = this.canvasRef.current; //document.createElement('canvas');
      const decodeCanvas = document.createElement('canvas');

      videoElement.addEventListener('loadeddata', (e) => {
        decodeCanvas.height = videoElement.videoHeight;
        decodeCanvas.width = videoElement.videoWidth;
        drawCanvas.height = videoElement.videoHeight;
        drawCanvas.width = videoElement.videoWidth;
        videoElement.height = videoElement.videoHeight;
        videoElement.width = videoElement.videoWidth;

        console.log({video: {height: videoElement.height, width: videoElement.width}});
        
        const decodeCtx = decodeCanvas.getContext('2d');
        const ctx = drawCanvas.getContext('2d');
        ctx.strokeStyle = "#FF0000";
        ctx.lineWidth = 5;

        let times = [];
        
        const onframe = async () => {
          decodeCtx.drawImage(videoElement, 0, 0, videoElement.videoWidth, videoElement.videoHeight);
          const startTime = Date.now();
          let endTime;
          let bc;

          try {
            bc = await decode(decodeCtx, this.state.selectedType);
            endTime = Date.now();
            this.setState({currentQR: bc ? bc.rawValue: ''});
          }catch (err) {
            endTime = Date.now();
            console.log('err decoding', err);
            this.setState({decodeError: err.message});
          }
          
          ctx.drawImage(decodeCanvas, 0, 0, videoElement.videoWidth, videoElement.videoHeight);
          if(bc) {
            const cp = bc.cornerPoints;
            ctx.beginPath();
            ctx.moveTo(cp[0].x, cp[0].y);
            ctx.lineTo(cp[1].x, cp[1].y);
            ctx.lineTo(cp[2].x, cp[2].y);
            ctx.lineTo(cp[3].x, cp[3].y);
            ctx.lineTo(cp[0].x, cp[0].y);
            ctx.closePath();
            ctx.stroke();
            
          }
          
          times.push({val: endTime - startTime, bc: bc ? 1 : 0});
          if(times.length > 10) {
            times.shift();
          }

          const totalTime = times.reduce((acc, t) => acc + t.val, 0);
          const totalHits = times.reduce((acc, t) => acc + t.bc, 0);
          this.setState({avgTime: totalTime/times.length, hitPct: totalHits/times.length});
          requestAnimationFrame(onframe);
        };

        requestAnimationFrame(onframe);
      });

      const ms = new MediaStream();
      ms.addTrack(track);

      videoElement.srcObject = ms;
      videoElement.load();
      videoElement.play();

    } catch(error) {
      console.log('Error adding stream' + error);
    }
  }

  render() {
    const hitPct = this.state.hitPct || 0;
    const hitColor = hitPct > 0.6 ? 'green' : hitPct < 0.4 ? 'red' : 'lightblue';
    return (
      <div className="App">
        <header className="App-header">
          <div style={{width: '95%', margin: '10px'}}>
            <span style={{float: 'left'}}>Code:
              {' '}
              {this.state.currentQR && this.checkForUrl(this.state.currentQR) ?
                (
                  <a
                    href={this.state.currentQR}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    {this.state.currentQR}
                  </a>
                ) : (
                  <span
                    className='qr-code-output-no-link'
                  >
                    {this.state.currentQR}
                  </span>
                )
              }              
            </span>
            <span style={{}}>Hit: <span style={{color: hitColor}}>{Math.round(hitPct * 100)}%</span></span>
            <span style={{float: 'right'}}>Avg. time(ms): <span style={{color: 'lightblue'}}>{(this.state.avgTime || 0).toFixed(1)}</span></span>
          </div>
          <canvas ref={this.canvasRef} style={{transform: 'rotateY(180deg)'}}/>
          <div style={{color: 'red', margin: '10px'}}>{this.state.decodeError}</div>
          <div className="custom02">
            <div>
              <input
                type="radio"
                name="decoder-type"
                value="js"
                id="radio1"
                checked={this.state.selectedType === "js"}
                onChange={() => this.setState({selectedType: 'js', decodeError: null})}
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
                onChange={() => this.setState({selectedType: 'wasm', decodeError: null})}
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
                onChange={() => this.setState({selectedType: 'native', decodeError: null})}
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
