// Mock actions for testing Chat and Contact page interactivity
import type { NavigateFunction } from "react-router-dom";

export const chatActions = {
  switchTab: (navigate: NavigateFunction, tabId: string) => {
    if (tabId === "chat") {
      navigate("/chat");
    } else if (tabId === "contacts") {
      navigate("/contacts");
    } else if (tabId === "todo") {
      navigate("/todo");
    } else if (tabId === "tools") {
      navigate("/tools");
    } else if (tabId === "cloud") {
      navigate("/cloud");
    } else {
      console.log("Tính năng này đang được phát triển:", tabId);
    }
  },

  // Chat Area Actions
  sendMessage: (message: string, setMessage: (v: string) => void) => {
    if (!message.trim()) return;
    console.log("Đã gửi tin nhắn:", message);
    setMessage("");
  },

  startVideoCall: () => {
    console.log("Calling video...");
  },
  
  startAudioCall: () => {
    console.log("Calling audio...");
  },

  // Contact Area Actions
  selectContact: (contactId: number | string) => {
    console.log("Selected contact ID:", contactId);
  }
};
