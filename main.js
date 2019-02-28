// Modules
const {app,BrowserWindow,ipcMain} = require('electron')
let discord = require('discord.js')

let window
let tempWhyCantIUseThisButtonModalWindow
app.on('ready',function() {
	// Window Setup
	window = new BrowserWindow({
		title: 'Kian\'s One-click-webhook',
		icon: 'Assets/Icon.png',
		width: 510,
		height: 625,
		minWidth: 316,
		minHeight: 300,
		//resizable: false,
		backgroundColor: '#2c2f33',
		show: false,
		webPreferences: {
			//devTools: false,
			nodeIntegration: true, // default val is changing so I cemented it
		},
	})
	window.once('ready-to-show',function() {
		window.show()
	})
	window.loadFile('Assets/main.html')
	window.webContents.openDevTools()
	window.setMenu(null)

	// Handle ipc calls
	ipcMain.on('sendButtonClicked',function(_,webhookId,webhookToken,webhookName,webhookProfilePic,message) { // that _ variable is some obj, idk why it arrives ¯\_(ツ)_/¯
		let webhook = new discord.WebhookClient(webhookId,webhookToken)
		webhook.name = webhookName
		webhook.avatar = webhookProfilePic
		webhook.send(message).then(function() {
			//ipcMain.send('sendingComplete',true) // doesnt work the same way in reverse, instead use the func below
			window.webContents.send('sendingComplete',true)
		}).catch(function(err) {
			//ipcMain.send('sendingComplete',false,err) // doesnt work the same way in reverse, instead use the func below
			window.webContents.send('sendingComplete',false,err)
		})
	})
	ipcMain.on('openTempWhyCantIUseThisButtonModal',function() {
		if (!tempWhyCantIUseThisButtonModalWindow) {
			tempWhyCantIUseThisButtonModalWindow = new BrowserWindow({
				parent: window,
				modal: true,
				title: 'Good Question',
				icon: 'Assets/Icon.png',
				width: 200,
				height: 200,
				backgroundColor: '#2c2f33',
				center: true,
				resizable: false,
				minimizable: false,
				maximizable: false,
				skipTaskbar: true,
				show: false,
				webPreferences: {
					//devTools: false,
					nodeIntegration: false,
					sandbox: true,
				}
			})
			tempWhyCantIUseThisButtonModalWindow.on('close',function(event) {
				event.preventDefault()
				tempWhyCantIUseThisButtonModalWindow.hide()
				window.webContents.send('tempWhyCantIUseThisWindowClosed')
			})
			tempWhyCantIUseThisButtonModalWindow.loadFile('Assets/tempWhyCantIUseThisPage.html')
			tempWhyCantIUseThisButtonModalWindow.setMenu(null)
		}
		tempWhyCantIUseThisButtonModalWindow.show()
	})

	ipcMain.on('crashApp',function() {
		app.exit(0)
	})
})
