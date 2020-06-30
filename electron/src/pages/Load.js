import React, { Component } from 'react';
import {withStyles, Slider, Typography, Button, IconButton, Input, Grid} from '@material-ui/core';
import './Load.css';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import { createFFmpeg } from '@ffmpeg/ffmpeg';
import { channels } from '../shared/constants';

import Image from "../static/output.png";

import ReactSlider from 'react-slider';
import styled from 'styled-components';

const { ipcRenderer } = window;
var IS_ELECTRON = false;

if (navigator.userAgent.toLowerCase().indexOf(' electron/') > - 1) {
  IS_ELECTRON = true;
}

const VideoSlider = withStyles({
  root: {
    backgroundImage: `url(${Image})`,
	backgroundRepeat: 'repeat',
    height: 45,
    padding: '0px 0',
  },
  thumb: {
    height: '45px',
    width: '12px',
    backgroundColor: '#fcc603',
    border: '1px solid #fcc603',
    borderRadius: "10%",
    marginTop: 0,
    '& .bar': {
      height: 20,
      width: 1,
      backgroundColor: '#000',
      marginLeft: 1,
      marginRight: 1,
	  '&:hover': {
	    backgroundColor: '#fff',
	  },
    },
	'&:hover': {
	  boxShadow: 'none',
	}
  },
  active: {
  },
  track: {
    backgroundColor: "rgba(0,0,0,0)",
    marginTop: 0,
    height: 41,
    border: "2px solid #fcc603",
  },
  rail: {
	backgroundColor: "rgba(255,255,255,0.7)",
    height: 45,
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
	  thumbnails: [],
	  currPath: '',
      sliderValue: [0,100],
	  playbackRate: 1,
      sliderSet: false,
      status: 'pending'
    };

	this.videoRef = null
	
	window.addEventListener('keydown', this.handleOnKeyDown);
    //this.loadFFmpeg()
    this.handleLoadVideo = this.handleLoadVideo.bind(this);
    this.handleUpdateVideo = this.handleUpdateVideo.bind(this);
    this.handleSliderValue = this.handleSliderValue.bind(this);
    this.handleCancelTrim = this.handleCancelTrim.bind(this);
    this.handleTrim = this.handleTrim.bind(this);
  }

  vidRef = ref => {
	this.videoRef = ref;

	if(this.videoRef != null) {
	  this.videoRef.addEventListener('durationchange', this.onVideoLoad);
	}
  }

  onVideoLoad = () => {
	this.setState({status: 'loaded'});
	console.log(this.videoRef.duration);

	let seek_skip = this.videoRef.duration/10;
	let thumbnails = [];
	let curr_seek = 0;
	for (let i = 0; i < 10; i++) {
	  console.log(curr_seek);
	  ipcRenderer.send(channels.GET_IMG, {
		time: curr_seek,
		file: this.state.currPath,
	  });
	  curr_seek = curr_seek + seek_skip;
	}
	ipcRenderer.on(channels.GET_IMG, (event, arg) => {
	  const { buffer } = arg;
	  var blob = new Blob([buffer], {type: "image/png"});
	  var img_url = URL.createObjectURL(blob);
	  thumbnails.push(img_url);
	  this.setState({
		thumbnails
	  });
	})

	// TODO: Must remove all listeners after done
    // ipcRenderer.removeAllListeners(channels.FFMPEG_TRIM);
/*
	ipcRenderer.send(channels.GET_IMG, {
	  time: 2.5,
	  file: this.state.currPath,
	});
	ipcRenderer.on(channels.GET_IMG, (event, arg) => {
      ipcRenderer.removeAllListeners(channels.GET_IMG);
	  const { buffer } = arg;
	  let thumbnails = this.state.thumbnails;
	  var blob = new Blob([buffer], {type: "image/png"});
	  var img_url = URL.createObjectURL(blob);
	  thumbnails.push(img_url);
	  this.setState({
		thumbnails
	  });
	})
*/
  }

  trimFFmpeg() {
	const duration = this.videoRef.duration
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
	  ipcRenderer.send(channels.SET_TEMP_VIDEO, {
		file: this.state.currPath,
	  });
	});
	
  }

  handleOnKeyDown = (e) => {
	if (e.key === 'k' && this.videoRef) {
		this.videoRef.playbackRate += 0.25;
		console.log(this.videoRef.playbackRate)
	}
//	console.log(e.key);
  }

  handleTrim(event) {
    console.log(this.state.videos)
    console.log(this.state.videos[0][1])
    this.trimFFmpeg(); 
  }

  handleUpdateVideo(event, value) {
	if (value[0] != this.state.sliderValue[0]) {
	  this.videoRef.currentTime = value[0];
	} else {
	  this.videoRef.currentTime = value[1];
	}
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
     // status: 'loaded'
    }));
    console.log(this.state.videos)
    
  }
  
  handleCancelTrim(event) {
    const videos = []
	const thumbnails = []

    this.setState(state => ({
      ...state,
	  thumbnails,
      videos,
      status: 'pending'
    }));
  }

  renderThumbnails() {
    return this.state.thumbnails.map(img => {
	  return (
		<img src={img}/>
	  );
	})
  }

  renderVideo() {
    return this.state.videos.map(video => {
      return (
        <video key={video[0]} ref={this.vidRef} width="100%" height="auto" preload="metadata" controls>
          <source src={video[0]}/>
        </video>
      );
    })
  }

  renderPlayer() {
	const StyledSlider = styled(ReactSlider)` 
	  width: 750px;
	  padding: '0px 0';
	  max-width: 800px;
	  background-image: url(${this.state.thumbnails.length > 0 ? this.state.thumbnails[0] : Image});
	  background-repeat: 'repeat';
	  height: 45px;
	  border: 1px solid grey;
	`;

    return (
      <Grid container key={this.state.sliderSet} alignItems="center" justify="center" spacing={2}>
          <Grid item xs>
            <IconButton onClick={() => {this.videoRef.play()}}>
              <PlayArrowIcon variant="contained" style={{fontSize:40}}/>
            </IconButton>
          </Grid>
          <Grid item key={this.state.thumbnails} xs={9}>
			<StyledSlider
			  className="horizontal-slider"
			  thumbClassName="example-thumb"
			  trackClassName="example-track"
			  defaultValue={[0, 100]}
			  ariaLabel={["Leftmost thumb", "Rightmost thumb"]}
			  pearling
			  minDistance={1}
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
		  {this.renderThumbnails()}
        </Grid>
      </div>
    )
  }
}
/*
            <VideoSlider 
                ThumbComponent={VideoThumbComponent}
                defaultValue={[0,this.videoRef.duration]}    
				max={this.videoRef.duration}
				step={parseFloat((this.videoRef.duration/100).toPrecision(2))}
                onChange={this.handleUpdateVideo}
                onChangeCommitted={this.handleSliderValue}
            />*/
          /*
		  <Grid item xs={12}>
            <div key={this.state.duration}>
			  <StyledSlider
			    className="horizontal-slider"
				thumbClassName="example-thumb"
				trackClassName="example-track"
				defaultValue={[0, 100]}
				ariaLabel={["Leftmost thumb", "Rightmost thumb"]}
				pearling
				minDistance={1}
			  />
            </div>
          </Grid>*/
export default Load;
