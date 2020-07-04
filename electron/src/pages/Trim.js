import React, { Component } from 'react';
import { Button, IconButton, Grid} from '@material-ui/core';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import { channels } from '../shared/constants';

import './Trim.css';

import ReactSlider from 'react-slider';

const { ipcRenderer } = window;

class Trim extends Component {
  constructor(props) {
    super(props);   

    this.state = {
      video: null,
			thumbnails: [],
			currPath: '',
      sliderValue: [0,100],
			playbackRate: 1,
      sliderSet: false,
      status: 'pending'
    };

		this.videoRef = null
		this.thVidRef = null
		this.canvasRef = React.createRef();
	
		window.addEventListener('keydown', this.handleOnKeyDown);
		this.handleUpdateVideo = this.handleUpdateVideo.bind(this);
		this.handleCancelTrim = this.handleCancelTrim.bind(this);
		this.handleTrim = this.handleTrim.bind(this);
  }

  vidRef = ref => {
		this.videoRef = ref;

		if(this.videoRef != null) {
			this.videoRef.addEventListener('durationchange', this.onVideoLoad);
		}
  }

  thumbVidRef = ref => {
    if (this.canvasRef.current === null) {
      return;
    }
		var ctx = this.canvasRef.current.getContext('2d');
		this.canvasRef.current.height = 45;
		this.canvasRef.current.width = 80;
		let seek_skip = this.videoRef.duration/9;
		let curr_time = 0;
		let thumbnails = [];

		if(ref != null) {
			this.thVidRef = ref;
			this.thVidRef.currentTime = 0.1;
			this.thVidRef.addEventListener('seeked', () => {
				ctx.drawImage(this.thVidRef, 0, 0, 80, 45);

				if(isNaN(seek_skip)) {
					seek_skip = this.thVidRef.duration/9;
				}

        // Null check canvasref again
        if(this.canvasRef.current === null) {
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
			});
		}
  }

  onVideoLoad = () => {
		this.setState({status: 'loaded'});
  }

  trimFFmpeg() {
		ipcRenderer.send(channels.FFMPEG_TRIM, {
			sliderval: this.state.sliderValue,
			duration: this.videoRef.duration,
			file: this.state.currPath,
		});
	
		ipcRenderer.on(channels.FFMPEG_TRIM, (event, arg) => {
				ipcRenderer.removeAllListeners(channels.FFMPEG_TRIM);
			  const { out } = arg;
				const blob = URL.createObjectURL(new Blob([out],{ type: 'video/quicktime' }))
				const video = {
          id: this.state.video.id,
          blob: blob,
          file: new File([blob], "filename.mov", {type: 'video/quicktime'}),
          thumbnail: this.state.video.thumbnail,
        };

				this.setState(state => ({
					...state,
          video,
					sliderValue: [0,100],
					sliderSet: (!this.state.sliderSet),
					thumbnails: [],
					status: 'loaded'
				}));

        this.props.onSetVideo(this.state.video.id, video);

				ipcRenderer.send(channels.SET_TEMP_VIDEO, {
					file: this.state.currPath,
			});
		});
		
  }

  handleOnKeyDown = (e) => {
		if (this.videoRef) {
			if (e.key === 'l') {
			this.videoRef.playbackRate += 0.25;
			}
			if (e.key === 'j') {
			this.videoRef.playbackRate -= 0.25;
			}
		}
	//	console.log(e.key);
  }

  handleTrim(event) {
    this.trimFFmpeg(); 
  }

  handleUpdateVideo(val) {
		if (val[0] !== this.state.sliderValue[0]) {
			this.videoRef.currentTime = val[0];
		} else {
			this.videoRef.currentTime = val[1];
		}
  }

  componentWillMount() {
    if (this.state.video === null) {
      const { video } = this.props;
      const path = video.file.path

      this.setState(state => ({
        ...state,
        video,
        currPath: path,
      }))
    }
  }
  
  handleCancelTrim(event) {
    this.videoRef.src='';
    this.thVidRef.src='';
    this.setState(state => ({
			...state,
			thumbnails: [],
			sliderValue: [0, 100],
			status: 'pending'
    }));

    this.props.onCancel();
  }

  renderNewThumbnails() {
		return (
			<video style={{display: "none"}} ref={this.thumbVidRef} preload="metadata" width="80" height="45" src={this.state.video.blob}></video>
		);
  }
  

  renderThumbnails() {
		return this.state.thumbnails.map(img => {
			return (
			<img className="no-select" draggable="false" src={img}/>
			);
		})
  }

  renderVideo() {
    return (
      <video poster={this.state.video.thumbnail} ref={this.vidRef} width="100%" height="auto" preload="metadata" controls>
        <source src={this.state.video.blob}/>
      </video>
    );
  }

  renderPlayer() {
    return (
      <Grid container key={this.state.sliderSet} alignItems="center" justify="center" spacing={2}>
          <Grid item xs>
            <IconButton onClick={() => {this.videoRef.play()}}>
              <PlayArrowIcon variant="contained" style={{color: "#f0f0f0", fontSize:40}}/>
            </IconButton>
          </Grid>
          <Grid item style={{position: "relative"}} xs={9}>
			<div style={{overflow: "hidden", height: "100%", width: 1000, position: "absolute", top: 9, left: 10}}>
		      {this.renderNewThumbnails()}
			  {this.renderThumbnails()}
			</div>
			<ReactSlider
			  className="horizontal-slider"
			  thumbClassName="example-thumb"
			  trackClassName="example-track"
              onChange={val => this.handleUpdateVideo(val)}
			  onAfterChange={val => {this.setState({sliderValue: val})} }
			  value={this.state.sliderValue}
			  min={0}
			  max={this.videoRef.duration}
			  step={parseFloat((this.videoRef.duration/100).toPrecision(2))}
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
                style={{margin: "0px 40px 0",textTransform:"None"}}
                onClick={this.handleTrim}
                >
              Trim
            </Button>
            <Button variant="contained" 
                component="span"
                size="small"
                style={{margin: "0px 40px 0",textTransform:"None"}}
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
			  <canvas style={{display: "none"}} ref={this.canvasRef}/>
          <Grid item xs={12}>
          {(this.state.status === 'pending') && 
            (<div style={{margin:"0 auto",paddingTop: "10em"}} id="file-load">
              <label htmlFor="upload-video">
                <Button variant="contained" 
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
            <div key={this.state.sliderSet} id="video-render">
              {this.renderVideo()}
            </div>
          </Grid>
          {(this.state.status === 'loaded') && this.renderPlayer()}
        </Grid>
      </div>
    )
  }
}

export default Trim;
