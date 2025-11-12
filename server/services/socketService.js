module.exports = function (io) {
  io.on("connection", (socket) => {
    socket.on("joinBrief", (briefId) => {
      socket.join(`brief_${briefId}`);
    });

    socket.on("sendComment", (data) => {
      io.to(`brief_${data.briefId}`).emit("newComment", data);
    });

    socket.on("briefUpdated", (data) => {
      io.to(`brief_${data.briefId}`).emit("briefChanged", data);
    });
  });
};

