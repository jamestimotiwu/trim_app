import React, { Component } from 'react';
import { Button, Grid} from '@material-ui/core';
import './Trim.css'
import VideoGridItem from './VideoGridItem';

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
  

  handleImageClick = (i) => {
    this.props.onImageClick(this.state.videos[i])
  }

  renderImageGrid() {
    return this.state.videos.map(video => {
      return (
        <Grid item xs={4}>
          <VideoGridItem
            video={video}
            onNewThumbnail={(id, thumbnail) => this.handleNewThumbnail(id, thumbnail)}
            canvasRef={this.canvasRef}
            onImageClick={(i) => this.props.onImageClick(this.state.videos[i])}
          />
        </Grid>
      )
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
        id: this.state.videos.length,
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

  handleNewThumbnail(id, thumbnail) {
    let videos = this.state.videos;
    videos[id].thumbnail = thumbnail;
    this.setState({
      videos,
    });
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
                multiple
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
