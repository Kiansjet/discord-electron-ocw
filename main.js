// Modules
const {app,BrowserWindow,ipcMain} = require('electron')
const discord = require('discord.js')
const url = require('url')
const fileSystem = require('fs')
const https = require('https')

try {
	require('./Assets/testingActivation.js')
} catch {
	process.exit(5)
}

const useDiscordJs = false // true to use discord.js module, otherwise standard http posts to discord api
// NOTE I never got the pfp changer to work with discord.js, which is why I switched to vanilla web calls.
const baseDiscordApiUrl = 'http://discordapp.com/api/v6'

let window
let cachedWebhookDisplayName

app.on('ready',function() {
	// Window Setup
	window = new BrowserWindow({
		title: 'Kian\'s One-click-webhook',
		icon: 'Assets/Icon.png',
		width: 450,
		height: 610,
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
	ipcMain.on('sendButtonClicked',async function(event,/*webhookId,webhookToken,*/webhookUrl,webhookName,webhookProfilePic,message) {
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
		if (message.replace(/\s/g,'') == '') {
			event.sender.send('sendingComplete',false,'Empty message field')
			return
		}
		const webhookId = parsedUrl[3]
		const webhookToken = parsedUrl[4]
		if (useDiscordJs) {
			let webhook = new discord.WebhookClient(webhookId,webhookToken)
			webhook.name = webhookName
			webhook.avatar = webhookProfilePic
			
			if (cachedWebhookDisplayName != webhookName) {
				await webhook.edit(webhookName,webhookProfilePic).then(function() {
					cachedWebhookDisplayName = webhookName
				}).catch(function(err) {
					event.sender.send('logToConsole','Webhook edit failed. Error:')
					event.sender.send('logToConsole',err)
				})
			}

			webhook.send(message).then(function() {
				//ipcMain.send('sendingComplete',true) // doesnt work the same way in reverse, instead use the func below
				event.sender.send('sendingComplete',true)
			}).catch(function(err) {
				//ipcMain.send('sendingComplete',false,err) // doesnt work the same way in reverse, instead use the func below
				event.sender.send('sendingComplete',false,err)
			})
		} else {
			const requestBody = {
				content: message,
				username: webhookName,
				avatar_url: webhookProfilePic
			}
			const request = https.request(`${baseDiscordApiUrl}/webhooks/${webhookId}/${webhookToken}`,{
				method: 'POST',
				protocol: 'https:',
				headers: {
					'Content-Type': 'application/json'
				}
			})

			request.on('response',function(response) {
				if (response.statusCode >= 200 && response.statusCode <= 299) {
					event.sender.send('sendingComplete',true)
				} else {
					event.sender.send('sendingComplete',false,`${response.statusCode} ${response.statusMessage}`)
				}
				
			})

			request.write(JSON.stringify(requestBody))
			request.end()
		}
		
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
