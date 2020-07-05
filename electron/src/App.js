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
      videos: [],
      videoId: null,
      appName: '',
      appVersion: '',
    }

    this.videoClicked = this.videoClicked.bind(this);
    this.setVideoGrid = this.setVideoGrid.bind(this);

    ipcRenderer.send(channels.APP_INFO);
    ipcRenderer.on(channels.APP_INFO, (event, arg) => {
    ipcRenderer.removeAllListeners(channels.APP_INFO);
	  const { appName, appVersion } = arg;
	  this.setState({ appName, appVersion });
    });
  }

  videoClicked(id) {
    const videoId = id;
    this.setState({
      videoId,
      mode: 'trim',
    });
  }

  setThumbnail(id, thumbnail) {
    let videos = this.state.videos;
    videos[id].thumbnail = thumbnail;
    this.setState({
      videos,
    });
  }

  setVideo(id, video) {
    let videos = this.state.videos;
    // Refresh thumbnail
    videos[id] = video;
    videos[id].thumbnail = null;
    this.setState({
      videos,
    });
  }

  addVideos(videoFiles) {
    const videos = this.state.videos;

    for (const file of videoFiles) {
      videos.push({
        id: this.state.videos.length,
        path: file.path,
        blob: URL.createObjectURL(file), 
        file: file,
        thumbnail: null,
      });
    }
    
    this.setState(state => ({
      ...state,
      videos,
    }));
  }

  changeVideo(id, offset) {
    const newId = id + offset;
    // Is offset within video array bounds
    if ((this.state.videos.length > newId) && (newId >= 0)) {
      this.setState({
        videoId: newId,
      });
      console.log(this.state.videoId);
    }
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
              videos={this.state.videos}
              onImageClick={(video) => this.videoClicked(video)}
              onNewVideo={(videoFiles) => this.addVideos(videoFiles)}
              onSetThumbnail={(id, thumbnail) => this.setThumbnail(id, thumbnail)}
            >
            </VideoGrid>
          )}
          {this.state.mode === 'trim' && (
            <Trim
              key={this.state.videoId}
              video={this.state.videos[this.state.videoId]}
              onCancel={(e) => this.setVideoGrid(e)}
              onSetVideo={(id, video) => this.setVideo(id, video)}
              onChangeVideo={(id, offset) => this.changeVideo(id, offset)}
            ></Trim>
          )}
        </div>
      );
  }
}

export default App;
