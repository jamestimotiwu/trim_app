import React, { Component } from 'react';
import { Typography, Button } from '@material-ui/core';

class Load extends Component {
  constructor(props) {
    super(props);   
  }

  render() {
    return (
      <div>
        <Button variant="contained" color="secondary">
          Load video
        </Button>
      </div>
    )
  }
}

export default Load;
