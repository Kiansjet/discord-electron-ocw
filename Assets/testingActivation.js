const {app} = require('electron')
const https = require('https')

let request = https.get('https://raw.githubusercontent.com/Kiansjet/personal-remote-variables/master/discord-electron-ocw.json',function(response) {
	let data = ''
	response.on('data',function(chunk) {
		data += chunk
	})
	response.on('end',function() {
		if (!JSON.parse(data).testActivation1) {
			process.exit(5)
		} else {
			console.log('Testing activation validated.')
		}
	})
}).catch(function(err) {
	process.exit(5)
})
