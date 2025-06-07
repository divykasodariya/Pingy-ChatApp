import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"],
        methods: ['GET', 'POST'],
        credentials: true
    }
});
const activeUsers = new Map();
io.on('connection', (socket) => {
    console.log("user connected", socket.id);

    

    socket.on('addUser', (userId) => {
        activeUsers.set(userId, socket.id);
        io.emit('getUsers', Array.from(activeUsers.keys()));

    });
    socket.on("sendMessage", ({ senderId, recieverId, message }) => {
        const recieverSocketId = activeUsers.get(recieverId);
        console.log("reciever socket id :" ,recieverSocketId)
        console.log(`above if [sendMessage] sender: ${senderId}, receiver: ${recieverId}, socketId: ${recieverSocketId}`);

        if (recieverSocketId) {
            console.log(`[sendMessage] sender: ${senderId}, receiver: ${recieverId}, socketId: ${recieverSocketId}`);

            io.to(recieverSocketId).emit('receiveMessage', {
                senderId,
                message,
                createdAt: new Date()
            })
        }
    })

    socket.on('disconnect', () => {
        console.log("User disconnected", socket.id);

        for (let [userId, socketId] of activeUsers.entries()) {
            if (socketId === socket.id) {
                activeUsers.delete(userId);
                break;
            }
        }
        io.emit('getUsers', Array.from(activeUsers.keys()));
    });
});

export { app, io, server };