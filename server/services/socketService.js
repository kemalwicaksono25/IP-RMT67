module.exports = function (io) {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("joinBrief", (briefId) => {
      socket.join(`brief_${briefId}`);
      console.log(`User ${socket.id} joined brief_${briefId}`);
    });

    socket.on("sendComment", (data) => {
      io.to(`brief_${data.briefId}`).emit("newComment", data);
      console.log(`Comment sent to brief_${data.briefId}:`, data);
    });

    socket.on("briefUpdated", (data) => {
      io.to(`brief_${data.briefId}`).emit("briefChanged", data);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};

