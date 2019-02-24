// Modules
const {app,BrowserWindow,ipcMain} = require('electron')
let discord = require('discord.js')

let window // so it doesn't get gc'd
app.on('ready',function() {
	// Window Setup
	window = new BrowserWindow({
		title: 'Kian\'s One-click-webhook',
		icon: 'Assets/Icon.png',
		width: 700,
		height: 600,
		resizable: false,
		titleBarStyle: 'hidden',
		backgroundColor: '#2c2f33',
		webPreferences: {
			//devTools: false,
			nodeIntegration: true, // default val is changing so I cemented it
		},
	})
	window.loadFile('Assets/main.html')
	window.setMenu(null)

	// Handle ipc calls
	ipcMain.on('sendButtonClicked',function(_,webhookId,webhookToken,message) { // that _ variable is some obj, idk why it arrives ¯\_(ツ)_/¯
		let webhook = new discord.WebhookClient(webhookId,webhookToken)
		webhook.send(message).then(function() {
			//ipcMain.send('sendingComplete',true) // doesnt work the same way in reverse, instead use the func below
			window.webContents.send('sendingComplete',true)
		}).catch(function(err) {
			//ipcMain.send('sendingComplete',false,err) // doesnt work the same way in reverse, instead use the func below
			window.webContents.send('sendingComplete',false,err)
		})
	})
})
