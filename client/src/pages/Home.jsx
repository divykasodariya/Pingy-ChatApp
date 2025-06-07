import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { LogOut, Search, MessageSquare, Menu, X } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const Home = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);
  //const [isConnected, setIsConnected] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();

  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/api/v1/user/profile",
          {
            withCredentials: true,
          }
        );
        setCurrentUserId(response.data.id);
        // console.log("Current user ID:", response.data.id);
      } catch (error) {
        console.error("Failed to get current user:", error);
      }
    };

    fetchCurrentUser();
  }, []);
  useEffect(() => {
    if (!currentUserId) {
      return;
    }
    const newSocket = io("http://localhost:8080/", {
      withCredentials: true,
    });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Socket connected!");
      newSocket.emit("addUser", currentUserId);
    });
    newSocket.on("getUsers", (users) => {
      setActiveUsers(users);
      console.log("active users : ", users);
    });

    newSocket.on("receiveMessage", (messageData) => {
      console.log("Received message:", messageData);

      // Add received message to chat if it's from the selected chat
      console.log("selected chat id :", selectedChat._id);
      if (messageData.senderId === selectedChat._id) {
        const newMessage = {
          _id: `received-${Date.now()}`,
          senderId: messageData.senderId,
          recieverId: currentUserId,
          message: messageData.message,
          createdAt: messageData.createdAt,
        };
        setMessages((prev) => [...prev, newMessage]);
      }
    });

    return () => newSocket.disconnect();
  }, [currentUserId, selectedChat]);

  useEffect(() => {
    const fetchOtherUsers = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/v1/user/", {
          withCredentials: true,
        });
        setChats(response.data);
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || err.message || "Failed to fetch users";
        setError(errorMessage);
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOtherUsers();
  }, []);

  const getSelectedChatMessages = async (recid) => {
    try {
      console.log("rec id :" + recid);
      const response = await axios.get(
        `http://localhost:8080/api/v1/message/${recid}`,
        { withCredentials: true }
      );

      return response.data.messages.messages;
    } catch (err) {
      console.error("Failed to fetch messages:", err);
      return [];
    }
  };
  const handleLogOut = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/v1/user/logout`,
        { withCredentials: true }
      );
      navigate("/");
    } catch (err) {
      console.error("Failed to log out! ", err);
      return [];
    }
  };
  const handleChatSelect = async (chat) => {
    setSelectedChat(chat);
    const fetchedMessages = await getSelectedChatMessages(chat._id);

    setMessages(fetchedMessages);
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === "" || !selectedChat) return;

    try {
      const response = await axios.post(
        `http://localhost:8080/api/v1/message/send/${selectedChat._id}`,
        { message: newMessage },
        { withCredentials: true }
      );

      const messageDataForsocket = {
        senderId: currentUserId,
        recieverId: selectedChat._id,
        message: newMessage,
      };
      console.log("messagedata for socket :", messageDataForsocket);
      socket.emit("sendMessage", messageDataForsocket);
      const tempId = `temp-${Date.now()}`;
      const sentMessage = {
        _id: tempId,
        senderId: response.data.senderId,
        recieverId: response.data.senderId,
        message: newMessage,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        __v: 0,
      };
      setMessages((prevMessages) => [...prevMessages, sentMessage]);
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
      setError("Failed to send message. Please try again.");
    }
  };

  const filteredChats = chats.filter((chat) =>
    chat.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center">Loading chats...</div>;
  if (error)
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="fixed inset-0 h-screen w-screen overflow-hidden">
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-none text-base">
        {/* Sidebar */}
        <motion.div
          className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full ${
            sidebarOpen ? "w-80" : "w-0"
          } overflow-hidden`}
          initial={{ width: 320 }}
          animate={{ width: sidebarOpen ? 320 : 0 }}
        >
          {/* Sidebar Header */}
          <div className="p-6 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold">Pingy</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-5 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
              <Input
                type="text"
                placeholder="Search chats..."
                className="pl-12 bg-gray-100 dark:bg-gray-700 border-none text-lg h-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-2 px-3">
              {filteredChats.map((chat) => (
                <div
                  key={chat._id}
                  className={`flex items-center p-6 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 ${
                    selectedChat?._id === chat._id
                      ? "bg-gray-200 dark:bg-gray-700"
                      : ""
                  }`}
                  onClick={() => handleChatSelect(chat)}
                >
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={chat.avatar} />
                    <AvatarFallback>{chat.username.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="ml-5 flex flex-col justify-center">
                    <h3 className="font text-xl">{chat.username}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Logout Button */}
          <div className="p-5 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLogOut}
              className="w-full flex items-center p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-red-500 text-lg"
            >
              <LogOut className="h-6 w-6 mr-4" />
              <span>Log Out</span>
            </button>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Chat Header */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-5 flex items-center">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="mr-5 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <Menu className="h-6 w-6" />
              </button>
            )}

            {selectedChat ? (
              <div className="flex items-center">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={selectedChat.avatar} />
                  <AvatarFallback>
                    {selectedChat.username.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-4">
                  <h2 className="font-medium text-xl">
                    {selectedChat.username}
                  </h2>
                  {activeUsers.includes(selectedChat._id) ? (
                    <p className="text-sm text-gray-500">Online</p>
                  ) : (
                    <p className="text-sm text-gray-500">Offline</p>
                  )}
                </div>
              </div>
            ) : (
              <h2 className="font-medium text-xl">Select a chat</h2>
            )}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900">
            {selectedChat ? (
              <div className="h-full flex flex-col">
                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-5">
                  <div className="space-y-5">
                    {messages.map((message) => (
                      <motion.div
                        key={message._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${
                          message.senderId === currentUserId
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-md md:max-lg rounded-xl p-4 text-lg ${
                            message.senderId === currentUserId
                              ? "bg-blue-500 text-white"
                              : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                          }`}
                        >
                          <p>{message.message}</p>
                          <p
                            className={`text-sm mt-2 ${
                              message.senderId === currentUserId
                                ? "text-blue-100"
                                : "text-gray-500"
                            }`}
                          >
                            {new Date(message.createdAt).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Message Input */}
                <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-5">
                  <div className="flex space-x-3">
                    <Input
                      type="text"
                      placeholder="Type a message..."
                      className="flex-1 bg-gray-100 dark:bg-gray-700 border-none text-lg h-14"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleSendMessage()
                      }
                    />
                    <Button
                      className="h-14 px-6 text-lg"
                      onClick={handleSendMessage}
                    >
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 mx-auto text-gray-400" />
                  <h3 className="mt-4 text-xl font-medium">No chat selected</h3>
                  <p className="mt-2 text-gray-500 text-lg">
                    Select a chat from the sidebar to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
