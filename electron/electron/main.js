const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs')
const path = require('path');
const url = require('url');
const { channels } = require('../src/shared/constants');
const { spawn } = require('child_process');
const ffmpegPath = require('ffmpeg-static');


let mainWindow;

function createWindow () {
  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, '../index.html'),
    protocol: 'file:',
    slashes: true,
  });

  mainWindow = new BrowserWindow({ 
	width: 1200, 
	height: 800,
	webPreferences: {
	  preload: path.join(__dirname, 'preload.js'),
	},
  });
  mainWindow.loadURL(startUrl);
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on(channels.APP_INFO, (event) => {
  event.sender.send(channels.APP_INFO, { 
	appName: app.getName(),
	appVersion: app.getVersion(),
  });
});

ipcMain.on(channels.WRITE_VIDEO_FILE, (event, {path, file}) => {
  fs.writeFileSync(path, file);
  console.log("written to" + path);
});

ipcMain.on(channels.FFMPEG_TRIM, (event, {sliderval, duration, file}) => {
  let from = sliderval[0]/100 * duration;
  let to = sliderval[1]/100 * duration;
  let output = require('path').dirname(file) + '\\output.mov';
  let args = [
	'-nostdin',
	'-y',
	'-hide_banner',
	'-i',
	file,
	'-ss',
	from,
	'-to',
	to,
	'-c:v',
	'copy',
	'-c:a',
	'copy',
	output,
	]

  var proc = spawn(ffmpegPath, args)

  proc.stdout.on('data', function(data) {
    console.log(data);
	fs.writeFileSync(file, data);
  });

  proc.stderr.setEncoding("utf8");
  proc.stderr.on('data', function(data) {
	console.log(data)
	//fs.writeFileSync(file, data);
  });

  proc.on('close', () => {
    var output_video = fs.readFileSync(output);
	fs.renameSync(output, file);
	event.sender.send(channels.FFMPEG_TRIM, {
	  out: output_video,
	});
    console.log('finished');
  });
});
