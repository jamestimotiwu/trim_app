import React, { Component } from 'react';
import {withStyles, Slider, Typography, Button, IconButton, Input, Grid} from '@material-ui/core';
import './Load.css';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import { createFFmpeg } from '@ffmpeg/ffmpeg';
import { channels } from '../shared/constants';

const { ipcRenderer } = window;
var IS_ELECTRON = false;

if (navigator.userAgent.toLowerCase().indexOf(' electron/') > - 1) {
  IS_ELECTRON = true;
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
	  currPath: '',
      sliderValue: [0,100],
      sliderSet: false,
      status: 'pending'
    };

    //this.loadFFmpeg()
    this.handleLoadVideo = this.handleLoadVideo.bind(this);
    this.handleUpdateVideo = this.handleUpdateVideo.bind(this);
    this.handleSliderValue = this.handleSliderValue.bind(this);
    this.handleCancelTrim = this.handleCancelTrim.bind(this);
    this.handleTrim = this.handleTrim.bind(this);
  }

  trimFFmpeg() {
	const duration = this.refs.vidRef.duration
	const sliderval = this.state.sliderValue
	const file = this.state.videos[0][1]

	let videos = [];
	
	ipcRenderer.send(channels.FFMPEG_TRIM, {
	  sliderval: sliderval,
	  duration: duration,
	  file: this.state.currPath,
	});
	
	ipcRenderer.on(channels.FFMPEG_TRIM, (event, arg) => {
      ipcRenderer.removeAllListeners(channels.FFMPEG_TRIM);
	  const { out } = arg;
	  console.log(out)
      const blob = URL.createObjectURL(new Blob([out],{ type: 'video/quicktime' }))
	  videos.push([blob, new File([blob], "filename.mov", {type: 'video/quicktime'})]);
	  console.log(videos)
	  this.setState(state => ({
		...state,
		videos,
		sliderValue: [0,100],
		sliderSet: (!this.state.sliderSet),
		status: 'loaded'
	  }));
	});
  }

  handleTrim(event) {
    console.log(this.state.videos)
    console.log(this.state.videos[0][1])
    this.trimFFmpeg(); 
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
	let path = '';

    for (const file of event.target.files) {
      console.log(file)
      videos.push([URL.createObjectURL(file), file]);
	  path = file.path;
    }

    this.setState(state => ({
      ...state,
      videos,
	  currPath: path,
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
        <video key={video[0]} ref="vidRef" width="100%" height="auto" controls>
          <source src={video[0]}/>
        </video>
      );
    })
  }

  renderPlayer() {
    return (
      <Grid container key={this.state.sliderSet} alignItems="center" justify="center" spacing={2}>
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
                onClick={this.handleTrim}
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
