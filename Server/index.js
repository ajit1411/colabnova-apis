const http = require('http')
const App = require('../App')
const serverPort = 3001
const nodeServer = http.createServer(App)
nodeServer.listen(serverPort)