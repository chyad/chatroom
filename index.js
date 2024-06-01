const express = require('express')
const app = express()

const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server, { pingInterval: 2000, pingTimeout: 5000 })

const port = 3000

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

const chats = []

const users = {}

var typing = false
var timer = null

io.on('connection', socket => {
  console.log('a user connected')
  users[socket.id] = {
    test: 0
  }

  socket.emit('newUser', socket.id)
  socket.emit('allMessage', chats)

  socket.on('sendchat', chat => {
    console.log(chat)
    chats.push(chat)
    io.emit('newchats', chat)
  })

  socket.on('isTyping', function () {
    io.emit('someoneIsTyping', true)
    clearTimeout(timer)

    timer = setTimeout(() => {
      io.emit('someoneIsTyping', false)
    }, 1000)
  })

  socket.on('disconnect', reason => {
    console.log(`${reason} : ${socket.id}`)

    var temp = {
      name: socket.id.toString(),
      message: 'has left the chat.',
      time: new Date()
    }
    console.log(temp)
    
    chats.push(temp)
    io.emit('newchats', temp)

    delete users[socket.id]
  })

  console.log(users)
})

server.listen(port, () => {
  console.log(`test ${port}`)
})
