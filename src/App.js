import React, { Component } from 'react';
import './App.css';

import { decode } from './qrclient';


class App extends Component {

  state = {}
  
  canvasRef = React.createRef();

  async componentDidMount() {

    console.log(this.canvasRef);
    const constraints = {
      video: true, //{width: {exact: 720}},```
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

        const onframe = async () => {
          decodeCtx.drawImage(videoElement, 0, 0, videoElement.videoWidth, videoElement.videoHeight);
          let bc;

          try {
            bc = await decode(decodeCtx);
            this.setState({currentQR: bc ? bc.rawValue: ''});
          }catch (err) {
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
    return (
      <div className="App">
        <header className="App-header">
          <div style={{width: '95%', margin: '10px'}}>
            <span style={{float: 'left'}}>Code:
              {' '}
              <span
                className='qr-code-output-no-link'
              >
                {this.state.currentQR || ''}
              </span>
            
            </span>
          </div>
          <canvas ref={this.canvasRef} style={{transform: 'rotateY(180deg)'}}/>
          <div style={{color: 'red', margin: '10px'}}>{this.state.decodeError}</div>
        </header>
      </div>
    );
  }
}

export default App;
