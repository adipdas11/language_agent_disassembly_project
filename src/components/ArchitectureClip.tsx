import { useEffect, useRef, useState } from "react";
import { sitePath } from "../lib/site-path";

export function ArchitectureClip({
  src,
  poster,
  label,
  playing,
  loop = true,
  restartKey = 0,
  onEnded,
}: {
  src: string;
  poster: string;
  label: string;
  playing: boolean;
  loop?: boolean;
  restartKey?: number;
  onEnded?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const element = videoRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.2 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (videoRef.current) videoRef.current.currentTime = 0;
  }, [restartKey, src]);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (playing && visible) void video.play().catch(() => {});
    else video.pause();
    return () => video.pause();
  }, [playing, visible, src]);
  return (
    <div className="flow-clip">
      {failed ? (
        <img
          src={sitePath(poster)}
          alt={`${label} preview; video unavailable`}
        />
      ) : (
        <video
          ref={videoRef}
          src={sitePath(src)}
          poster={sitePath(poster)}
          muted
          playsInline
          loop={loop}
          preload="metadata"
          aria-label={label}
          onError={() => setFailed(true)}
          onEnded={onEnded}
        />
      )}
    </div>
  );
}
