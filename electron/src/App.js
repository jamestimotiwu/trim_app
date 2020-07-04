import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { channels } from './shared/constants';
import Trim from './pages/Trim.js';
import VideoGrid from './pages/VideoGrid.js';
const { webFrame, ipcRenderer } = window;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mode: 'videogrid',
      video: null,
      appName: '',
      appVersion: '',
    }

    this.videoClicked = this.videoClicked.bind(this);
    this.setVideoGrid = this.setVideoGrid.bind(this);

    console.log(webFrame);
    ipcRenderer.send(channels.APP_INFO);
    ipcRenderer.on(channels.APP_INFO, (event, arg) => {
    ipcRenderer.removeAllListeners(channels.APP_INFO);
	  const { appName, appVersion } = arg;
	  this.setState({ appName, appVersion });
    });
  }

  toMB(bytes) {
    return (bytes / (1000.0*1000)).toFixed(2)
  }


  videoClicked(video) {
    console.log(video);

    console.log(webFrame.getResourceUsage())

    console.log("wehframe cache cleared");
    this.setState({
      video,
      mode: 'trim',
    });
  }

  setVideoGrid(event) {
    this.setState({
      mode: 'videogrid',
    });
  }

  render () {
    const { appName, appVersion } = this.state;
    return (
        <div className="container">
          {this.state.mode === 'videogrid' && (
            <VideoGrid
              onImageClick={(video) => this.videoClicked(video)}>
            </VideoGrid>
          )}
          {this.state.mode === 'trim' && (
            <Trim
              video={this.state.video}
              onCancel={(e) => this.setVideoGrid(e)}
            ></Trim>
          )}
        </div>
      );
  }
}

export default App;
