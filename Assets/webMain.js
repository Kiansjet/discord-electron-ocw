// not to be confused with main.js, which runs the electron side of things.
// webMain runs the js for the html loaded in the electron app

const ipcRenderer = require('electron').ipcRenderer

const webhookIdField = document.getElementById('webhookIdField')
const webhookTokenField = document.getElementById('webhookTokenField')
const webhookNameField = document.getElementById('webhookNameField')

const webhookProfilePicField = document.getElementById('webhookProfilePicField')
const tempWhyCantIUseThisButton = document.getElementById('tempWhyCantIUseThisButton')

const messageField = document.getElementById('messageField')
const sendButton = document.getElementById('sendButton')
const outputBox = document.getElementById('outputBox')

let sending = false

let tempWhyCantIUseThisDebounce = false

function sendingComplete(_,success,err) { // _ is a reference to the ipcRenderer afaik
	if (success) {
		outputBox.placeholder = 'Message sent!'
	} else {
		outputBox.placeholder = 'Sending failed: \n'+JSON.stringify(err)
	}
	sendButton.disabled = false
	sendButton.innerHTML = 'Send'
	sending = false
}

function send() {
	if (!sending) {
		sending = true
		sendButton.disabled = true
		sendButton.innerHTML = 'Sending...'
		outputBox.placeholder = ''

		ipcRenderer.send(
			'sendButtonClicked',
			webhookIdField.value,
			webhookTokenField.value,
			webhookNameField.value,
			webhookProfilePicField.value,
			messageField.value
		)
	}
}

// Handle the tempWhyCantIUseThisButton
tempWhyCantIUseThisButton.addEventListener('click',function() {
	if (!tempWhyCantIUseThisDebounce) {
		tempWhyCantIUseThisDebounce = true
		ipcRenderer.send('openTempWhyCantIUseThisButtonModal')
	}
})
ipcRenderer.on('tempWhyCantIUseThisWindowClosed',function() {
	tempWhyCantIUseThisDebounce = false
})

function fuckgoback() {
	ipcRenderer.send('crashApp')
}

/*messageField.onkeypress = function(data) {
	console.log(data)
	if (data.key == 'Enter' && !data.shiftKey) {send()}
}*/ // I was gonna have a thing where u could press the enter key but nah

sendButton.addEventListener('click',send)
ipcRenderer.on('sendingComplete',sendingComplete)

console.log('Yo! looks like you found the dev console, you sneaky bastard. I didn\'t really feel like putting an easter egg here sry. You can run fuckgoback() to crash the app though.')
