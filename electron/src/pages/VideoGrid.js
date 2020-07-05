import React, { Component } from 'react';
import { Button, Grid } from '@material-ui/core';
import './Trim.css'
import VideoGridItem from './VideoGridItem';

class VideoGrid extends Component {
	constructor(props) {
		super(props);

		this.canvasRef = React.createRef();
		this.thVidRef = null

		this.handleLoadVideo = this.handleLoadVideo.bind(this);
		this.handleImageClick = this.handleImageClick.bind(this);
	}


	handleImageClick = (i) => {
		this.props.onImageClick(i)
	}

	renderImageGrid() {
		return this.props.videos.map(video => {
			return (
				<Grid item xs={4}>
					<VideoGridItem
						video={video}
						onNewThumbnail={(id, thumbnail) => this.props.onSetThumbnail(id, thumbnail)}
						canvasRef={this.canvasRef}
						onImageClick={(i) => this.props.onImageClick(i)}
					/>
				</Grid>
			)
		});
	}

	renderVideoGrid() {
		return this.props.videos.map(video => {
			return (
				<Grid item xs={4}>
					<video width="100%" height="auto" preload="metadata">
						<source src={video.blob} />
					</video>
				</Grid>
			);
		});
	}

	handleLoadVideo = (event) => {
		this.props.onNewVideo(event.target.files);
	}

	render() {
		return (
			<div>
				<Grid container alignItems="center" justify="center" spacing={1}>
					<canvas style={{ display: "none" }} ref={this.canvasRef} />
					<Grid item xs={12}>
						<div style={{ margin: "0 auto" }} id="file-load">
							<label htmlFor="upload-video">
								<Button variant="contained"
									component="span"
									color="default"
									style={{ textTransform: "None" }}
								>
									Load
								</Button>
							</label>
							<input
								multiple
								accept="video/*"
								style={{ display: "None" }}
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
