// not to be confused with main.js, which runs the electron side of things.
// webMain runs the js for the html loaded in the electron app

const ipcRenderer = require('electron').ipcRenderer

let webhookIdField = document.getElementById('webhookIdField')
let webhookTokenField = document.getElementById('webhookTokenField')
let messageField = document.getElementById('messageField')
let sendButton = document.getElementById('sendButton')
let outputBox = document.getElementById('outputBox')
let sending = false

ipcRenderer.on('sendingComplete',function(_,success,err) { // _ is a reference to the ipcRenderer afaik
	if (success) {
		outputBox.placeholder = 'Message sent!'
	} else {
		outputBox.placeholder = 'Sending failed: \n'+JSON.stringify(err)
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
			webhookIdField.value,
			webhookTokenField.value,
			messageField.value
		)
	}
}

/*messageField.onkeypress = function(data) {
	console.log(data)
	if (data.key == 'Enter' && !data.shiftKey) {send()}
}*/ // I was gonna have a thing where u could press the enter key but nah

sendButton.addEventListener('click',send)
