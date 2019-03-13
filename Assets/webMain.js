// not to be confused with main.js, which runs the electron side of things.
// webMain runs the js for the html loaded in the electron app

const ipcRenderer = require('electron').ipcRenderer

const webhookUrlField = document.getElementById('webhookUrlField')
/*
const webhookIdField = document.getElementById('webhookIdField')
const webhookTokenField = document.getElementById('webhookTokenField')
*/
const webhookNameField = document.getElementById('webhookNameField')

const webhookProfilePicField = document.getElementById('webhookProfilePicField')

const messageField = document.getElementById('messageField')
const sendButton = document.getElementById('sendButton')
const outputBox = document.getElementById('outputBox')

const consoleErrorDiv = document.getElementById('consoleErrorDiv')
const openDevToolsButton = document.getElementById('openDevToolsButton')
const openGitHubRepoButton = document.getElementById('openGitHubRepoButton')

let sending = false

ipcRenderer.on('sendingComplete',function(event,success,data) { // _ is a reference to the ipcRenderer afaik
	if (success) {
		outputBox.placeholder = 'Message sent!'
	} else {
		outputBox.placeholder = 'Sending failed: \n'+JSON.stringify(data)
	}
	sendButton.disabled = false
	sendButton.innerHTML = 'Send'
	sending = false
})

function send() {
	if (!sending) {
		sending = true
		sendButton.disabled = true
		sendButton.innerHTML = 'Sending...'
		outputBox.placeholder = ''

		ipcRenderer.send(
			'sendButtonClicked',
			webhookUrlField.value,
			webhookNameField.value,
			webhookProfilePicField.value,
			messageField.value
		)
	}
}

// General events
sendButton.addEventListener('click',send)
openGitHubRepoButton.addEventListener('click',function() {
	ipcRenderer.send('openGitHubRepo')
})
openDevToolsButton.addEventListener('click',function() {
	ipcRenderer.send('openDevTools')
})

// Other ipc stuff
ipcRenderer.on('requestFormData',function() {
	ipcRenderer.send('saveFormData',{
		webhookUrl: webhookUrlField.value,
		webhookName: webhookNameField.value,
		webhookProfilePic: webhookProfilePicField.value
	})
})
ipcRenderer.on('formDataLoaded',function(event,data) {
	webhookUrlField.value = data.webhookUrl
	webhookNameField.value = data.webhookName
	webhookProfilePicField.value = data.webhookProfilePic
})
ipcRenderer.on('package.jsonLoaded',function(event,data) {
	console.info('== BEGIN PACKAGE INFO ==')
	try{console.info('Name: ' + data.name)} catch{console.info('package.json did not contain a name entry')}
	try{console.info('Version: ' + data.version)} catch{console.info('package.json did not contain a version entry')}
	try{console.info('Author: ' + data.author)} catch{console.info('package.json did not contain a author entry')}
	try{console.info('License: ' + data.license)} catch{console.info('package.json did not contain a license entry')}
	console.info('== END PACKAGE INFO ==')
})
ipcRenderer.on('logToConsole',function(event,data) {
	console.log(data)
})
ipcRenderer.on('errorToConsole',function(event,data) {
	console.error(data)
	if (consoleErrorDiv.classList.contains('invisible')) {
		consoleErrorDiv.classList.remove('invisible')
	}
})

// just a meme function users can call from the console
function frickgoback() {
	ipcRenderer.send('crashApp')
}

// Request old form data
ipcRenderer.send('loadFormData')
ipcRenderer.send('loadPackage.json')

console.info(`

 /$$   /$$           /$$ /$$           /$$
| $$  | $$          | $$| $$          | $$
| $$  | $$  /$$$$$$ | $$| $$  /$$$$$$ | $$
| $$$$$$$$ /$$__  $$| $$| $$ /$$__  $$| $$
| $$__  $$| $$$$$$$$| $$| $$| $$  \\ $$|__/
| $$  | $$| $$_____/| $$| $$| $$  | $$    
| $$  | $$|  $$$$$$$| $$| $$|  $$$$$$/ /$$
|__/  |__/ \\_______/|__/|__/ \\______/ |__/

Looks like you found the dev console, you sneaky bastard. I didn\'t really feel like putting an easter egg here sry. You can call frickgoback() to crash the app though.
`)
