import { useState } from "react";

import "./App.css";
import VideoPlayer from "./VideoPlayer";
import { useRef } from "react";

function App() {
  const playerRef = useRef(null);
  const videoLink =
    "http://localhost:8000/uploads/bihe/8bac594b-c14a-4275-87cf-447f5fb0c511/index.m3u8";

  const videoPlayerOptions = {
    controls: true,
    responsive: true,
    fluid: true,
    sources: [
      {
        src: videoLink,
        type: "application/x-mpegURL", // m3u8 and most runs on mpegURL
      },
    ],
  };

  const handlePlayerReady = (player) => {
    playerRef.current = player;

    // we can handle player events here, for example:
    player.on("waiting", () => {
      videojs.log("player is waiting");
    });

    player.on("dispose", () => {
      videojs.log("player will dispose");
    });
  };

  return (
    <>
      <div>
        <h1>Video player</h1>
      </div>

      <VideoPlayer options={videoPlayerOptions} onReady={handlePlayerReady} />
    </>
  );
}

export default App;
