import React, { Component } from 'react';
import { Typography, Button, IconButton, Input, Grid} from '@material-ui/core';

class VideoGrid extends Component {
    constructor(props) {
    super(props); 

		this.state = {
			videos: [],
			thumbs: [],
			loadThumb: false,
		}
		this.canvasRef = React.createRef();
		this.thVidRef = null

		this.handleLoadVideo = this.handleLoadVideo.bind(this);
	}
  
	thumbVidRef = ref => {
		var ctx = this.canvasRef.current.getContext('2d');
		
		if (ref != null) {
			this.thVidRef = ref;
			this.thVidRef.addEventListener('loadedmetadata', () => {
			  console.log(this.thVidRef.videoHeight);
				this.canvasRef.current.height = this.thVidRef.videoHeight/2;
				this.canvasRef.current.width = this.thVidRef.videoWidth/2;
				this.thVidRef.currentTime = 0.5;
			});

			this.thVidRef.addEventListener('seeked', () => {
				ctx.drawImage(this.thVidRef, 0, 0,
											this.canvasRef.current.width,
											this.canvasRef.current.height);
				this.canvasRef.current.toBlob((blob) => {
				  console.log(blob);
					let thumbs = this.state.thumbs;
					const blob_link = URL.createObjectURL(blob);
					thumbs.push(blob_link);
					
					this.setState({
						thumbs,
						loadThumb: false,
					});
				}, 'image/jpeg');
				
			});
		}
	}

	renderVideoThumb() {
		if (this.state.videos.length > 0) {
			return this.state.loadThumb && ( 
				<Grid item xs={4}>
					<video ref={this.thumbVidRef} preload="metadata" width="100%" height="auto" src={this.state.videos[this.state.videos.length - 1][0]}></video>
				</Grid>
			)
		}
	}

	renderImageGrid() {
		return this.state.thumbs.map(thumb => {
			return (
				<Grid item xs={4}>
					<img width="100%" height="auto" src={thumb}/>
				</Grid>
			);
		});
	}

	renderVideoGrid() {
		return this.state.videos.map(video => {
			return (
				<Grid item xs={4}>
					<video width="100%" height="auto" preload="metadata">
						<source src={video[0]}/>
					</video>
				</Grid>
			);
		});
	}

  handleLoadVideo(event) {
    const videos = this.state.videos;

    for (const file of event.target.files) {
      console.log(file)
      videos.push([URL.createObjectURL(file), file]);
    }

    this.setState(state => ({
      ...state,
      videos,
			loadThumb: true,
    }));
    console.log(this.state.videos)
		 
  }

	render() {
		return(
      <div>
        <Grid container alignItems="center" justify="center" spacing={1}>
					<canvas style={{display: "none"}} ref={this.canvasRef}/>
					<Grid item xs={12}>
						<div style={{margin:"0 auto",paddingTop: "10em"}} id="file-load">
							<label htmlFor="upload-video">
								<Button variant="contained" 
										component="span"
										color="default"
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
						</div>
					</Grid>
					{this.renderImageGrid()}
					{this.renderVideoThumb()}

				</Grid>
			</div>
		);
	}
}

export default VideoGrid;
