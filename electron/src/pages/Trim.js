import React, { Component } from 'react';
import { Typography, Button, Grid } from '@material-ui/core';
import { channels } from '../shared/constants';
import TrimControl from './TrimControl';
import './Trim.css';
const { ipcRenderer } = window;

class Trim extends Component {
  constructor(props) {
    super(props);
    const { video } = this.props;
    const path = video.path;

    this.state = {
      video,
      path,
      playbackRate: 1,
      playing: false,
      status: 'pending'
    };

    this.videoRef = null

    window.addEventListener('keydown', this.handleOnKeyDown);
    this.handleCancel = this.handleCancel.bind(this);
  }

  vidRef = ref => {
    this.videoRef = ref;

    if (this.videoRef != null) {
      this.videoRef.addEventListener('durationchange', this.onVideoLoad);
    }
  }

  onVideoLoad = () => {
    this.setState({ status: 'loaded' });
  }

  handleOnKeyDown = (e) => {
    if (this.videoRef) {
      switch (e.code) {
        case 'KeyL':
          this.videoRef.playbackRate += 0.25;
          break;
        case 'KeyJ':
          if (this.videoRef.playbackRate >= 0.25)
            this.videoRef.playbackRate -= 0.25;
          break;
        case 'KeyA':
          this.props.onChangeVideo(this.state.video.id, -1)
          break;
        case 'KeyD':
          this.props.onChangeVideo(this.state.video.id, 1)
          break;
        case ('Space' || 'KeyK'):
          if (!this.state.playing) {
            this.videoRef.play();
          }
          else {
            this.videoRef.pause();
          }
          this.setState({playing: !this.state.playing})
          break;
      }
    }
    console.log(e)
  }


  handleCancel(event) {
    this.videoRef.src = '';
    this.setState(state => ({
      ...state,
      status: 'pending'
    }));

    this.props.onCancel();
  }

  setVideo(path, blob) {
    const video = {
      id: this.state.video.id,
      path: path,
      blob: blob,
      file: new File([blob], "filename.mov", { type: 'video/quicktime' }),
      thumbnail: this.state.video.thumbnail,
      strip: [],
    };

    this.props.onSetVideo(this.state.video.id, video);
    this.setState({
      video,
      status: 'pending',
    });
    this.videoRef.src = blob;
    this.videoRef.load();
  }

  changeVideo(video) {
    this.setState({
      video,
      status: 'pending',
    });
    this.videoRef.src = video.blob;
    this.videoRef.load();
  }

  renderVideo() {
    return (
      <video poster={this.state.video.thumbnail} ref={this.vidRef} width="100%" height="auto" preload="metadata" controls>
        <source src={this.state.video.blob} />
      </video>
    );
  }

  render() {
    return (
      <div>
        <Grid container style={{position: "relative", top: "-40px"}} alignItems="center" justify="center" spacing={1}>
          <Grid item xs={12}>
            <Typography style={{position: "relative", top: "-20px"}} variant="h6">
            {this.state.video.path}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <div key={this.state.sliderSet} id="video-render">
              {this.renderVideo()}
            </div>
          </Grid>
          <TrimControl
            path={this.state.video.path}
            blob={this.state.video.blob}
            strip={this.state.video.strip}
            duration={(this.state.status === 'loaded') && this.videoRef.duration}
            onCancel={() => this.handleCancel()}
            onChange={(val) => {this.videoRef.currentTime = val}}
            onSetVideo={(path, blob) => this.setVideo(path, blob)}
            onSetStrip={(strip) => this.props.onSetStrip(this.state.video.id, strip)}
            videoRef={this.videoRef}
          ></TrimControl>
        </Grid>
      </div>
    )
  }
}

export default Trim;
