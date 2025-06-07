import { Conversation } from "../models/conversationModel.js";
import { Message } from '../models/messageModel.js';

export const sendMessage = async (req, res) => {
    try {
        const senderId = req.id;
        const recieverId = req.params.id; // Match the exact spelling in your model (recieverId with 'ie')
        const { message } = req.body;

        let gotConversation = await Conversation.findOne({
            participants: { $all: [senderId, recieverId] }
        });

        if (!gotConversation) {
            gotConversation = await Conversation.create({ participants: [senderId, recieverId] });
        }

        const newMessage = await Message.create({
            senderId,
            recieverId,
            message
        });

        if (newMessage) {
            gotConversation.messages.push(newMessage._id);
        }

        await gotConversation.save();
        return res.status(201).json({
            message: "Message sent successfully",
            //_id: req.id,
            senderId:senderId,
            recieverId:recieverId
            
            
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Failed to send message" });
    }
}

export const recieveMessage = async (req, res) => {
    try {
        const senderId = req.id;
        const recieverId = req.params.id;
        const currentConversation = await Conversation.findOne({ participants: { $all: [senderId, recieverId] } }).populate("messages");
        //console.log("current convo: "+currentConversation)
        // console.log(currentConversation);
        return res.status(200).json({ messages: currentConversation })



    } catch (error) {
        console.log(error)
    }
}