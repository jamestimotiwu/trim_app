import React, { Component } from 'react';
import { Button, Grid} from '@material-ui/core';
import './Trim.css'

class VideoGrid extends Component {
    constructor(props) {
    super(props); 

		this.state = {
			videos: [],
      thumbnails: [],
		}
		this.canvasRef = React.createRef();
		this.thVidRef = null

		this.handleLoadVideo = this.handleLoadVideo.bind(this);
		this.handleImageClick = this.handleImageClick.bind(this);
	}
  
	thumbVidRef = ref => {
		var ctx = this.canvasRef.current.getContext('2d');
		
		if (ref != null) {
			this.thVidRef = ref;
      console.log(this.thVidRef.id)
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
          const vidRefId = this.thVidRef.id;
				  console.log(blob);

          // Use thumbnail property in video
					let thumbnails = this.state.thumbnails;
          let videos = this.state.videos;
					const blob_link = URL.createObjectURL(blob);
					//thumbs.push(blob_link);
          videos[vidRefId].thumbnail = blob_link;
					thumbnails[vidRefId] = blob_link;

					this.setState({
						videos,
            thumbnails,
					});
				}, 'image/jpeg');
				
			});
		}
	}

	renderVideoThumb() {
		if (this.state.videos.length > 0) {
			return this.state.loadThumb && ( 
				<Grid item xs={4}>
					<video ref={this.thumbVidRef} preload="metadata" width="100%" height="auto" src={this.state.videos[this.state.videos.length - 1].blob}></video>
				</Grid>
			)
		}
	}

  handleImageClick = (i) => {
    this.props.onImageClick(this.state.videos[i])
  }


/*
	renderImageGrid() {
		return this.state.thumbs.map((thumb, i) => {
			return (
				<Grid item xs={4}>
					<img 
            className="no-select"
            onClick={(e) => this.handleImageClick(i)} 
            width="100%" 
            height="auto" 
            src={thumb}/>
				</Grid>
			);
		});
	}
*/

  renderImageGrid() {
    return this.state.videos.map((video, i) => {
      return video.thumbnail === null ? (
        <Grid item xs={4}>
          <video id={i} ref={this.thumbVidRef} preload="metadata" width="100%" height="auto" src={video.blob}></video>
        </Grid>
      ) :
      (
        <Grid item xs={4}>
					<img 
            className="no-select"
            onClick={(e) => this.handleImageClick(i)} 
            width="100%" 
            height="auto" 
            src={video.thumbnail}/>
        </Grid>
      );
    });
  }

	renderVideoGrid() {
		return this.state.videos.map(video => {
			return (
				<Grid item xs={4}>
					<video width="100%" height="auto" preload="metadata">
						<source src={video.blob}/>
					</video>
				</Grid>
			);
		});
	}

  handleLoadVideo(event) {
    const videos = this.state.videos;

    for (const file of event.target.files) {
      console.log(file)
      videos.push({
        blob: URL.createObjectURL(file), 
        file: file,
        thumbnail: null,
      });
    }
    let thumbnails = this.state.thumbnails;
    thumbnails.push(null);

    this.setState(state => ({
      ...state,
      videos,
      thumbnails,
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

				</Grid>
			</div>
		);
	}
}

export default VideoGrid;
