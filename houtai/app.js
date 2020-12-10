const express = require('express');
const path = require("path")
const app = express()
const http = require('http');
const server = http.Server(app);
const io = require('socket.io')(server,{
  cors: {
    origin: "http://localhost:8080",
    methods: ["GET", "POST"],  
  }
});
// app.use(express.static(path.join(__dirname,'/public')))
const userList = []
io.on('connection', socket =>{
  console.log('连接中')
  // console.log(socket.id)
  // socket.emit('a',{name:'aaa'})
  socket.on('Login',data => {
    data.id = socket.id
    userList.push(data)
    // console.log(userList)
    socket.emit('userinfo',{
      userinfo: data
    })
    io.emit('addUser',data)
    io.emit('userList',userList)
  })
  // 断开连接
  socket.on("disconnect",()=>{
    let item = userList.filter(item => item.id === socket.id)
    let idx = userList.findIndex(item => item.id === socket.id)
    userList.splice(idx,1)
    io.emit("leaveroom",item)
    io.emit("userList",userList)
  })
  // 传送群消息
  socket.on("send",(data) =>{
    // console.log(data)
    io.emit('receive',data)
  })
  socket.on('sendImg',(data)=>{
    io.emit('receiveImg',data)
  })
  // 私聊
  socket.on('private',data=>{
    socket.emit('broad',data)
    console.log(data)
    socket.to(data.other.id).emit('s',data)
  })
});

server.listen(3000, function () {
  console.log('服务端启动成功！端口3000');
});