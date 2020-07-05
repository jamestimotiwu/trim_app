import React, { Component } from 'react';
import { Button, IconButton, Grid } from '@material-ui/core';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import ReactSlider from 'react-slider';
import { channels } from '../shared/constants';
import './Trim.css';
const { ipcRenderer } = window;

class TrimControl extends Component {
  constructor(props) {
    super(props);
  
    let thumbnails = []
    console.log(this.props.strip.length);
    if (this.props.strip.length >= 9) {
      thumbnails = this.props.strip;
    }

    this.state = {
      thumbnails,
      sliderValue: [0, 100],
      sliderSet: false,
    }

    this.thVidRef = null;
    this.canvasRef = React.createRef();
    
    this.handleUpdateVideo = this.handleUpdateVideo.bind(this);
    this.handleCancelTrim = this.handleCancelTrim.bind(this);
    this.handleTrim = this.handleTrim.bind(this);
  }


  trimFFmpeg() {
    ipcRenderer.send(channels.FFMPEG_TRIM, {
      sliderval: this.state.sliderValue,
      duration: this.props.duration,
      file: this.props.path,
    });

    ipcRenderer.on(channels.FFMPEG_TRIM, (event, arg) => {
      ipcRenderer.removeAllListeners(channels.FFMPEG_TRIM);
      const { out } = arg;
      const blob = URL.createObjectURL(new Blob([out], { type: 'video/quicktime' }))
      this.props.onSetVideo(this.props.path, blob); 

      this.setState(state => ({
        ...state,
        sliderValue: [0, 100],
        sliderSet: (!this.state.sliderSet),
        thumbnails: [],
      }));

      ipcRenderer.send(channels.SET_TEMP_VIDEO, {
        file: this.props.path,
      });
    });

  }
  
  thumbVidRef = ref => {
    console.log("thumb callback");
    if (this.canvasRef.current === null) {    
      return;
    }
    var ctx = this.canvasRef.current.getContext('2d');
    this.canvasRef.current.height = 45;
    this.canvasRef.current.width = 80;
    let seek_skip = this.props.duration / 9;
    let curr_time = 0;
    let thumbnails = [];

    if (ref != null) {
      this.thVidRef = ref;
      this.thVidRef.currentTime = 0.1;
      this.thVidRef.addEventListener('seeked', () => {
        ctx.drawImage(this.thVidRef, 0, 0, 80, 45);

        if (isNaN(seek_skip)) {
          seek_skip = this.props.duration / 9;
        }

        // Null check canvasref again
        if (this.canvasRef.current === null) {
          return;
        }
        this.canvasRef.current.toBlob((blob) => {
          const blob_link = URL.createObjectURL(blob);
          thumbnails.push(blob_link);

          this.setState({
            thumbnails,
          });
        }, 'image/jpeg');

        curr_time = curr_time + seek_skip;
        if (curr_time <= this.thVidRef.duration) {
          this.thVidRef.currentTime = curr_time;
        }

        if (thumbnails.length >= 9) {
          this.props.onSetStrip(thumbnails);
        }
      });
    }
  }
  
  handleUpdateVideo(val) {
    if (val[0] !== this.state.sliderValue[0]) {
      this.props.onChange(val[0]);
    } else {
      this.props.onChange(val[1]);
    }
  }
  
  handleTrim(event) {
    this.trimFFmpeg();
  }
  
  handleCancelTrim(event) {
    if (this.thVidRef !== null)
      this.thVidRef.src = '';
    this.setState(state => ({
      ...state,
      thumbnails: [],
      sliderValue: [0, 100],
    }));

    this.props.onCancel();
  }

  renderNewThumbnails() {
    return (
      <video style={{ display: "none" }} ref={this.thumbVidRef} preload="metadata" width="80" height="45" src={this.props.blob}></video>
    );
  }
  
  renderThumbnails() {
    return this.state.thumbnails.map(img => {
      return (
        <img className="no-select" draggable="false" src={img} />
      );
    })
  }
  
  render() {
    return (
      <Grid container key={this.state.sliderSet} alignItems="center" justify="center" spacing={2}>
        <canvas style={{ display: "none" }} ref={this.canvasRef} />
        <Grid item xs>
          <IconButton onClick={() => { this.props.videoRef.play() }}>
            <PlayArrowIcon variant="contained" style={{ color: "#f0f0f0", fontSize: 40 }} />
          </IconButton>
        </Grid>
        <Grid item style={{ position: "relative" }} xs={9}>
          <div style={{ overflow: "hidden", height: "100%", width: 1000, position: "absolute", top: 9, left: 10 }}>
            {(this.props.strip.length <= 9) && this.renderNewThumbnails()}
            {this.renderThumbnails()}
          </div>
          <ReactSlider
            className="horizontal-slider"
            thumbClassName="example-thumb"
            trackClassName="example-track"
            onChange={val => this.handleUpdateVideo(val)}
            onAfterChange={val => { this.setState({ sliderValue: val }) }}
            value={this.state.sliderValue}
            min={0}
            max={this.props.duration}
            step={parseFloat((this.props.duration / 100).toPrecision(2))}
            ariaLabel={["Leftmost thumb", "Rightmost thumb"]}
            pearling
            minDistance={0}
          />
        </Grid>
        <Grid item xs spacing={5}>
          <Button variant="contained"
            color="secondary"
            component="span"
            size="small"
            style={{ margin: "0px 40px 0", textTransform: "None" }}
            onClick={this.handleTrim}
          >
            Trim
            </Button>
          <Button variant="contained"
            component="span"
            size="small"
            style={{ margin: "0px 40px 0", textTransform: "None" }}
            onClick={this.handleCancelTrim}
          >
            Cancel
            </Button>
        </Grid>
      </Grid>
    )
  }
}

export default TrimControl;
