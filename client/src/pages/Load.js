import React, { Component } from 'react';
import {withStyles, Slider, Typography, Button, Input, Grid} from '@material-ui/core';
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
        <video width="100%" height="auto">
          <source src={video[1]}/>
        </video>
      );
    })
  }

  render() {
    const VideoSlider = withStyles({
      root: {
        color: '#3a8589',
        height: 3,
        padding: '13px 0',
      },
      thumb: {
        height: 27,
        width: 27,
        backgroundColor: '#fff',
        border: '1px solid currentColor',
        marginTop: -12,
        marginLeft: -13,
      },
      active: {
      },
      track: {
        height: 3,
      },
      rail: {
        color: 'd8d8d8',
        opacity: 1,
        height: 1,
      },
    })(Slider);

    return (
      <div>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <div style={{margin:"0 auto"}} id="file-load">
              <label htmlFor="upload-video">
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
          </Grid>
          <Grid item xs={12}>
            <div id="video-render">
              {this.renderVideo()}
            </div>
          </Grid>
          <Grid item xs={12}>
            <VideoSlider defaultValue={[0, 100]} />
          </Grid>
        </Grid>
      </div>
    )
  }
}

export default Load;
