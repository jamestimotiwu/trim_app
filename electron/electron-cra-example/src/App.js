import React, { Component } from 'react';
import { HashRouter, Route } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import { channels } from './shared/constants';
import Load from './pages/Load.js';
const { ipcRenderer } = window;

class App extends Component {
  constructor(props) {
    super(props);
	this.state = {
	  appName: '',
	  appVersion: '',
	}

	ipcRenderer.send(channels.APP_INFO);
    ipcRenderer.on(channels.APP_INFO, (event, arg) => {
      ipcRenderer.removeAllListeners(channels.APP_INFO);
	  const { appName, appVersion } = arg;
	  this.setState({ appName, appVersion });
    });
  }

  render () {
    const { appName, appVersion } = this.state;
	return (
	  <div className="container">
		<HashRouter>
		  <Route path="/" component={Load} />
		</HashRouter>
	  </div>
    );
  }
}

export default App;
