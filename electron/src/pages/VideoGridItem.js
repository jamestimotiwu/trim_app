import React, { Component } from 'react';
import { Grid} from '@material-ui/core';
import './Trim.css'

class VideoGridItem extends Component {
  constructor(props) {
    super(props);
		
    this.state = {
      thumbnail: null,
    }
    this.thVidRef = null;
  }

  componentDidMount() {
    this.setState({
      thumbnail: this.props.video.thumbnail,
    });
  }

	thumbVidRef = ref => {
		var ctx = this.props.canvasRef.current.getContext('2d', { alpha: false});
		
		if (ref != null) {
			this.thVidRef = ref;
      console.log(this.thVidRef.id)
			this.thVidRef.addEventListener('loadedmetadata', () => {
			  console.log(this.thVidRef.videoHeight);
				this.props.canvasRef.current.height = this.thVidRef.videoHeight/2;
				this.props.canvasRef.current.width = this.thVidRef.videoWidth/2;
				this.thVidRef.currentTime = 0.5;
			});

			this.thVidRef.addEventListener('seeked', () => {
				ctx.drawImage(this.thVidRef, 0, 0,
											this.props.canvasRef.current.width,
											this.props.canvasRef.current.height);
				this.props.canvasRef.current.toBlob((blob) => {
          this.thVidRef.src = "";
				  console.log(blob);

          // Use thumbnail property in video
					const blob_link = URL.createObjectURL(blob);
          this.setState({
            thumbnail: blob_link,
          });
          console.log(this.props.video.id);
          this.handleNewThumbnail(this.props.video.id, blob_link);

				}, 'image/jpeg');
				
			});
		}
	}

  handleNewThumbnail = (id, thumbnail) => {
    this.props.onNewThumbnail(id, thumbnail);
  }

	renderVideoThumb() {
		return this.state.thumbnail === null && ( 
      <div>
        <video 
          ref={this.thumbVidRef} 
          preload="metadata" 
          width="100%" 
          height="auto"
        >
          <source src={this.props.video.blob}/>
        </video>
      </div>
    )
	}

  renderVideo() {
    return (
      <div>
        <video preload="metadata" width="100%" height="auto">
          <source src={this.props.video.blob}/>
        </video>
      </div>
    )
  }

	renderThumb() {
    return this.state.thumbnail !== null && (
      <div>
        <img 
          className="no-select"
          onClick={(e) => this.props.onImageClick(this.props.video.id)}
          width="100%" 
          height="auto" 
          src={this.state.thumbnail}
        />
      </div>
    );
	}

  render() {
    return (
      <div>
        {this.renderThumb()}
        {this.renderVideoThumb()}
      </div>
    )
  }
}

export default VideoGridItem;

