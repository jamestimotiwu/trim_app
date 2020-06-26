import React, { Component } from 'react';
import {withStyles, Slider, Typography, Button, Input, Grid} from '@material-ui/core';
import './Load.css';

function VideoThumbComponent(props) {
  return (
    <span {...props}>
      <span className="bar" />
      <span className="bar" />
    </span>
  );
}

class Load extends Component {
  constructor(props) {
    super(props);   

    this.state = {
      videos: [],
      sliderValue: [0,100],
      status: 'pending'
    };

    this.handleLoadVideo = this.handleLoadVideo.bind(this);
    this.handleUpdateVideo = this.handleUpdateVideo.bind(this);
  }


  handleUpdateVideo(event, value) {
    console.log(value)
    let newDuration = this.refs.vidRef.duration
    if (this.state.sliderValue[0] != value[0])
        newDuration = (value[0]/100) * newDuration
    else
        newDuration = (value[1]/100) * newDuration
    this.refs.vidRef.currentTime = newDuration 
    console.log(newDuration)
    this.setState({
      sliderValue: value
    });
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
        <video ref="vidRef" width="100%" height="auto">
          <source src={video[1]}/>
        </video>
      );
    })
  }

  render() {
    const VideoSlider = withStyles({
      root: {
        color: '#fcc603',
        height: 6,
        padding: '13px 0',
      },
      thumb: {
        height: '27px',
        width: '27px',
        backgroundColor: '#fcc603',
        border: '1px solid currentColor',
        marginTop: -12,
        marginLeft: -13,
        '& .bar': {
          height: 9,
          width: 1,
          backgroundColor: '#000',
          marginLeft: 1,
          marginRight: 1,
        }
      },
      active: {
      },
      track: {
        height: 6,
      },
      rail: {
        color: '#d8d8d8',
        opacity: 1,
        height: 3,
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
            <VideoSlider 
                ThumbComponent={VideoThumbComponent}
                defaultValue={this.state.sliderValue}     
                onChangeCommitted={this.handleUpdateVideo}
            />
          </Grid>
        </Grid>
      </div>
    )
  }
}

export default Load;
