import express from "express";
import http from "http";
import { Server } from "socket.io";
const app = express();
const server = http.createServer(app);
const io = new Server(server);
import IMAGE_SEQUENCE from "./public/scripts/image-sequence.mjs";

app.use(express.static("public"));

let imageIndex = 0;
let totalIterations = 0;
let secondsElapsed = 0;
let secondInterval;

const incrementImageIndex = () => {
  imageIndex += 1;
  totalIterations += 1;
};

const startSecondTimer = (secondsPerImage) => {
  stopSecondTimer();
  totalIterations = 1;
  io.emit("score.change", { imageIndex, totalIterations, secondsPerImage });

  // incrementImageIndex();
  secondInterval = setInterval(() => {
    secondsElapsed++;
    io.emit("score.tick", { secondsElapsed });
    console.log("secondsElapsed", secondsElapsed);

    if (secondsElapsed % secondsPerImage === 0) {
      incrementImageIndex();

      if (imageIndex === IMAGE_SEQUENCE.length) {
        console.log("reached the last image, stopping timer");
        stopSecondTimer();
        io.emit("score.stop");
      } else {
        secondsElapsed = 0;
        console.log(
          `${secondsPerImage}s passed, sending score.change for image ${imageIndex} to all clients, totalIterations ${totalIterations}`
        );
        io.emit("score.change", {
          imageIndex,
          totalIterations,
          secondsPerImage,
        });
      }
    }
  }, 1000);
};

const stopSecondTimer = () => {
  secondsElapsed = 0;
  totalIterations = 0;
  imageIndex = 0;
  clearInterval(secondInterval);
};

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("score.start", ({ secondsPerImage }) => {
    console.log(
      `received score.start for ${secondsPerImage}s, starting timer and sending initial score.change for image ${imageIndex}`
    );
    startSecondTimer(secondsPerImage);
  });

  socket.on("score.stop", () => {
    console.log("received score.stop, stopping timer");
    stopSecondTimer();
    io.emit("score.stop");
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
