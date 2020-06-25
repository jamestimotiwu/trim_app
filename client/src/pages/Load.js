import React, { Component } from 'react';
import { Typography, Button, Input} from '@material-ui/core';
import './Load.css';

class Load extends Component {
  constructor(props) {
    super(props);   

    this.state = {
      videos: [],
      status: 'pending'
    };

    this.handleLoadVideo = this.handleLoadVideo.bind(this);
  }

  handleLoadVideo(event) {
    const videos = []

    for (const file of event.target.files) {
      videos.push([file, URL.createObjectURL(file)]);
    }

    this.setState(state => ({
      ...state,
      videos
    }));
    console.log(this.state.videos)
    
  }

  renderVideo() {
    return this.state.videos.map(video => {
      return (
        <video height="200" width="300" controls>
          <source src={video[1]}/>
        </video>
      );
    })
  }

  render() {
    return (
      <div>
        <div id="file-load">
          <label className="uploader-wrapper" htmlFor="upload-video">
            <Button variant="contained" 
                component="span"
                color="secondary"
                disabled={this.state.status === 'loaded'}
                >
              Load video
            </Button>
          </label>
          <input
            accept="video/*"
            style={{display: "None"}}
            id="upload-video"
            type="file"
            onChange={this.handleLoadVideo}
          />
        </div>
        <div id="video-render">
          {this.renderVideo()}
        </div>
      </div>
    )
  }
}

export default Load;
