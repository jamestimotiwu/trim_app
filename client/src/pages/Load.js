import React, { Component, useRef} from 'react';
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

export function VidSlider(props) {
  const [value, setValue] = React.useState([0,100]);

  const handleUpdateVideo = (event, newValue) => {
    setValue(newValue);
    console.log(value)
    const videoRef = props.videoRef()
    console.log(props)
    console.log(value)
    let newDuration = videoRef.duration
    if (value[0] != newValue[0])
        newDuration = (newValue[0]/100) * newDuration
    else
        newDuration = (newValue[1]/100) * newDuration
    videoRef.currentTime = newDuration 
    console.log(newDuration)
  }

  return (
    <div>
      <Grid item xs>
        <IconButton onClick={() => {this.refs.vidRef.play()}}>
          <PlayArrowIcon variant="contained" style={{fontSize:40}}/>
        </IconButton>
      </Grid>
      <Grid item xs={9}>
        <VideoSlider 
            ThumbComponent={VideoThumbComponent}
            style={{width:"500px"}}
            value={value}     
            onChange={handleUpdateVideo}
        />
      </Grid>
      <Grid item xs spacing={5}>
        <Button variant="contained" 
            component="span"
            size="small"
            >
          Trim
        </Button>
      </Grid>
    </div>
  )
}

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
        <video ref="vidRef" width="100%" height="auto">
          <source src={video[1]}/>
        </video>
      );
    })
  }

  render() {
    return (
      <div>
        <Grid container spacing={1}>
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
          <VidSlider videoRef={() => {return this.refs.vidRef}}/>
        </Grid>
      </div>
    )
  }
}

export default Load;
