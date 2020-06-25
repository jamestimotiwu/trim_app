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

  render() {
    return (
      <div>
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
    )
  }
}

export default Load;