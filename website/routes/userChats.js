import express from "express";
import UserChats from "../models/userChats.js";
import Chat from "../models/chat.js";

const router = express.Router();

// Remove a chat from userchats collection
router.post("/:userId/remove-chat", async (req, res) => {
  try {
    const { userId } = req.params;
    const { chatId } = req.body;

    // First delete the chat from the chat collection
    const chatDeleteResult = await Chat.deleteOne({ userId, _id: chatId });

    if (!chatDeleteResult.deletedCount) {
      return res.status(404).json({ message: "Chat not found in chat collection" });
    }

    // Then remove the chat from userchats collection
    const userChatsResult = await UserChats.updateOne(
      { userId },
      { $pull: { chats: { _id: chatId } } }
    );

    if (userChatsResult.modifiedCount === 0) {
      return res.status(404).json({ message: "Chat not found in userchats" });
    }

    res.json({ message: "Chat removed successfully" });
  } catch (error) {
    console.error("Error removing chat:", error);
    res.status(500).json({ message: "Error removing chat" });
  }
});

// **Update chat title**
router.put("/:userId/update-chat-title", async (req, res) => {
  try {
    const { userId } = req.params;
    const { chatId, newTitle } = req.body;

    if (!chatId || !newTitle) {
      return res.status(400).json({ error: "Chat ID and new title are required" });
    }

    const userChats = await UserChats.findOne({ userId });

    if (!userChats) {
      return res.status(404).json({ message: "User chats not found" });
    }

    const chat = userChats.chats.find(c => c._id.toString() === chatId);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    chat.title = newTitle;
    await userChats.save();

    res.status(200).json({ message: "Chat title updated", chat });
  } catch (error) {
    console.error("Error updating chat title:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
