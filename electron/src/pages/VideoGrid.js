import React, { Component } from 'react';
import { Typography, Button, IconButton, Input, Grid} from '@material-ui/core';

class VideoGrid extends Component {
    constructor(props) {
    super(props); 

		this.state = {
			videos: [],
		}

		this.handleLoadVideo = this.handleLoadVideo.bind(this);
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
    }));
    console.log(this.state.videos)
		 
  }

	render() {
		return(
      <div>
        <Grid container alignItems="center" justify="center" spacing={1}>
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
					{this.renderVideoGrid()}
				</Grid>
			</div>
		);
	}
}

export default VideoGrid;
