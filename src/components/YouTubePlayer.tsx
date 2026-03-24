import { useEffect, useRef } from "react";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}
type Props = {
  videoId: string;
  onReady: (player: any) => void;
};
export default function YouTubePlayer({ videoId, onReady }: Props) {

  const playerRef = useRef<any>(null);

  useEffect(() => {

    if (window.YT && window.YT.Player) {
      createPlayer();
    } else {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);

      window.onYouTubeIframeAPIReady = createPlayer;
    }

    function createPlayer() {
      playerRef.current = new window.YT.Player("player", {
        height: "390",
        width: "640",
        videoId: videoId,
        events: {
          onReady: (event: any) => {
            console.log("Player Ready");
            onReady(event.target); 
          }
        }
      });
    }
  }, []);

    useEffect(() => {
      if (playerRef.current && videoId) {
        playerRef.current.loadVideoById(videoId);
      }
    }, [videoId]);

  return <div id="player"></div>;
}