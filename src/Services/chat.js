// src/Services/chat.js

import api from "./api";


export const sendMessage = async ({ chatRoomId, message }) => {
  const res = await api.post(
    "/api/v1/common/delivery-partner/send-message/",
    {
      chat_room_id: chatRoomId,
      message,
    }
  );

  return res.data;
};

export const getSupportChatList = () => api.get("/api/v1/common/merchant/support-chat-list/");