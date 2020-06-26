import React, { Component } from 'react';
import {withStyles, Slider, Typography, Button, IconButton, Input, Grid} from '@material-ui/core';
import './Load.css';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';

function VideoThumbComponent(props) {
  return (
    <span {...props}>
      <span className="bar" />
      <span className="bar" />
    </span>
  );
}

const VideoSlider = withStyles({
  root: {
    color: '#fcc603',
    height: 6,
    padding: '13px 0',
  },
  thumb: {
    height: '45px',
    width: '12px',
    backgroundColor: '#fcc603',
    border: '1px solid currentColor',
    borderRadius: "10%",
    marginTop: -20,
    '& .bar': {
      height: 20,
      width: 1,
      backgroundColor: '#000',
      marginLeft: 1,
      marginRight: 1,
    }
  },
  active: {
  },
  track: {
    marginTop: -20,
    color: '#fff',
    height: 41,
    border: "2px solid #fcc603",
  },
  rail: {
    color: '#d8d8d8',
    opacity: 1,
    height: 3,
  },
})(Slider);

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
    this.handleSliderValue = this.handleSliderValue.bind(this);
    this.handleCancelTrim = this.handleCancelTrim.bind(this);
  }

  handleUpdateVideo(event, value) {
    let newDuration = this.refs.vidRef.duration
    if (this.state.sliderValue[0] != value[0])
        newDuration = (value[0]/100) * newDuration
    else
        newDuration = (value[1]/100) * newDuration
    this.refs.vidRef.currentTime = newDuration 
    console.log(newDuration)
  }

  handleSliderValue(event, value) {
    this.setState(state => ({
      ...state,
      sliderValue: value,
    }));
  }

  handleLoadVideo(event) {
    const videos = []

    for (const file of event.target.files) {
      videos.push([file, URL.createObjectURL(file)]);
    }

    this.setState(state => ({
      ...state,
      videos,
      status: 'loaded'
    }));
    console.log(this.state.videos)
    
  }
  
  handleCancelTrim(event) {
    const videos = []
    this.setState(state => ({
      ...state,
      videos,
      status: 'pending'
    }));
  }

  renderVideo() {
    return this.state.videos.map(video => {
      return (
        <video ref="vidRef" width="100%" height="auto" controls>
          <source src={video[1]}/>
        </video>
      );
    })
  }

  renderPlayer() {
    return (
      <Grid container alignItems="center" justify="center" spacing={2}>
          <Grid item xs>
            <IconButton onClick={() => {this.refs.vidRef.play()}}>
              <PlayArrowIcon variant="contained" style={{fontSize:40}}/>
            </IconButton>
          </Grid>
          <Grid item xs={9}>
            <VideoSlider 
                ThumbComponent={VideoThumbComponent}
                defaultValue={[0,100]}    
                onChange={this.handleUpdateVideo}
                onChangeCommitted={this.handleSliderValue}
            />
          </Grid>
          <Grid item xs spacing={5}>
            <Button variant="outlined" 
                component="span"
                size="small"
                style={{textTransform:"None"}}
                >
              Trim
            </Button>
            <Button variant="outlined" 
                component="span"
                size="small"
                style={{textTransform:"None"}}
                onClick={this.handleCancelTrim}
                >
              Cancel
            </Button>
          </Grid>
      </Grid>
    )
  }

  render() {

    return (
      <div>
        <Grid container alignItems="center" justify="center" spacing={1}>
          <Grid item xs={12}>
          {(this.state.status === 'pending') && 
            (<div style={{margin:"0 auto",paddingTop: "10em"}} id="file-load">
              <label htmlFor="upload-video">
                <Button variant="outlined" 
                    component="span"
                    color="default"
                    disabled={this.state.status === 'loaded'}
                    style={{textTransform:"None"}}
                    >
                  Load
                </Button>
              </label>
              <input
                accept="video/*"
                style={{display: "None"}}
                id="upload-video"
                type="file"
                onChange={this.handleLoadVideo}
              />
            </div>)}
          </Grid>
          <Grid item xs={12}>
            <div id="video-render">
              {this.renderVideo()}
            </div>
          </Grid>
          {(this.state.status === 'loaded') && this.renderPlayer()}
        </Grid>
      </div>
    )
  }
}

export default Load;
