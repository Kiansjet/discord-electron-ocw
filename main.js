// Modules
const {app,BrowserWindow,ipcMain} = require('electron')
let discord = require('discord.js')
const url = require('url')
const fileSystem = require('fs')

let window
let tempWhyCantIUseThisButtonModalWindow
app.on('ready',function() {
	// Window Setup
	window = new BrowserWindow({
		title: 'Kian\'s One-click-webhook',
		icon: 'Assets/Icon.png',
		width: 510,
		height: 550,
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
	window.loadFile('Assets/webMain.html')
	window.webContents.openDevTools()
	window.setMenu(null)
	window.on('close',function(event) {
		event.preventDefault()
		
		ipcMain.once('saveFormData',function() {
			window.destroy()
		})
		window.webContents.send('requestFormData')
	})

	// Handle ipc calls
	ipcMain.on('sendButtonClicked',function(event,/*webhookId,webhookToken,*/webhookUrl,webhookName,webhookProfilePic,message) {
		let parsedUrl = url.parse(webhookUrl)
		if (parsedUrl.hostname != 'discordapp.com') {
			event.sender.send('sendingComplete',false,'Webhook url hostname is not discordapp.com')
			return
		}
		parsedUrl = parsedUrl.pathname.split('/')
		if (parsedUrl[1] != 'api' || parsedUrl[2] != 'webhooks') {
			event.sender.send('sendingComplete',false,'Invalid webhook url pathname component')
			return
		}
		const webhookId = parsedUrl[3]
		const webhookToken = parsedUrl[4]
		let webhook = new discord.WebhookClient(webhookId,webhookToken)
		webhook.name = webhookName
		webhook.avatar = webhookProfilePic
		webhook.send(message).then(function() {
			//ipcMain.send('sendingComplete',true) // doesnt work the same way in reverse, instead use the func below
			event.sender.send('sendingComplete',true)
		}).catch(function(err) {
			//ipcMain.send('sendingComplete',false,err) // doesnt work the same way in reverse, instead use the func below
			event.sender.send('sendingComplete',false,err)
		})
	})
	ipcMain.on('openTempWhyCantIUseThisButtonModal',function(event) {
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
			tempWhyCantIUseThisButtonModalWindow.on('close',function(event2) {
				event2.preventDefault()
				tempWhyCantIUseThisButtonModalWindow.hide()
				event.sender.send('tempWhyCantIUseThisWindowClosed')
			})
			tempWhyCantIUseThisButtonModalWindow.loadFile('Assets/tempWhyCantIUseThisPage.html')
			tempWhyCantIUseThisButtonModalWindow.setMenu(null)
		}
		tempWhyCantIUseThisButtonModalWindow.show()
	})
	ipcMain.on('loadFormData',function(event) {
		fileSystem.access('Cache/formData',fileSystem.constants.F_OK | fileSystem.constants.R_OK,function(err) {
			if (!err) {
				fileSystem.readFile('Cache/formData','utf8',function(err,data) {
					if (!err) {
						event.sender.send('formDataLoaded',JSON.parse(data))
					}
				})
			}
		})
	})
	ipcMain.on('saveFormData',function(event,data) {
		data = JSON.stringify(data)

		fileSystem.access('Cache',fileSystem.constants.F_OK,function(err) {
			if (err) {
				fileSystem.mkdir('Cache',function() {})
			}
			fileSystem.writeFile('Cache/formData',data,'utf8',function () {})
		})
	})

	ipcMain.on('crashApp',function() {
		app.exit(0)
	})
})
