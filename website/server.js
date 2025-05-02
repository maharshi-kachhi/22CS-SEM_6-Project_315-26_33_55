import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoute.js";
import userChatsRoutes from "./routes/userChats.js";
import Chat from "./models/chat.js"; // Import Chat model
import UserChats from "./models/userChats.js"; // Import UserChats model
import cors from "cors";

dotenv.config();
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/user-chats", userChatsRoutes);

app.get("/", (req, res) => {
  res.send("<h1>hiii this is jal </h1>");
});

// Save chat messages to MongoDB
app.post("/api/chats", async (req, res) => {
  try {
    const { userId, text, role, chatId } = req.body;

    if (!userId || !text) {
      return res.status(400).json({ error: "userId and text are required" });
    }

    // Find existing chat or create a new one
    let chat;
    if (chatId) {
      chat = await Chat.findOne({ _id: chatId, userId });
      if (!chat) {
        return res.status(404).json({ error: "Chat not found" });
      }
    } else {
      chat = new Chat({ userId, history: [] });
      await chat.save();

      // Create or update userChats document
      let userChats = await UserChats.findOne({ userId });
      
      // Get the count of existing chats to determine the next number
      const chatCount = userChats ? userChats.chats.length : 0;
      const nextChatNumber = chatCount + 1;
      const chatTitle = `Chat ${nextChatNumber}`;
      
      if (!userChats) {
        userChats = new UserChats({
          userId,
          chats: [{
            _id: chat._id.toString(),
            title: chatTitle,
            createdAt: new Date()
          }]
        });
      } else {
        userChats.chats.push({
          _id: chat._id.toString(),
          title: chatTitle,
          createdAt: new Date()
        });
      }
      
      await userChats.save();
    }

    // Add message to chat history
    chat.history.push({
      role: role || "user", // Use the role from request body, default to "user" if not provided
      parts: [{ text }],
    });

    await chat.save();

    res.status(200).json({ message: "Message saved", chat });
  } catch (error) {
    console.error("Error saving chat:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Fetch chat history for a user
app.get("/api/chats/:userId/:chatId", async (req, res) => {
  try {
    const { userId, chatId } = req.params;
    const chat = await Chat.findOne({ _id: chatId, userId });

    if (!chat) {
      return res.status(404).json({ message: "No chat history found" });
    }

    res.status(200).json({ chat });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Fetch user's chat list
app.get("/api/user-chats/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const userChats = await UserChats.findOne({ userId });

    if (!userChats) {
      return res.status(404).json({ message: "No chats found for user" });
    }

    res.status(200).json({ userChats });
  } catch (error) {
    console.error("Error fetching user chats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
