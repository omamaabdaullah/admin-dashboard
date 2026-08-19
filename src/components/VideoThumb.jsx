import { useEffect, useState } from 'react';
import { PlayCircle } from 'lucide-react';
import { captureVideoFrame } from '../utils/videoThumbnail';
import './VideoThumb.css';

const VideoThumb = ({ src, poster, alt = '', playSize = 22, className = '' }) => {
  const [frame, setFrame] = useState(poster || null);

  useEffect(() => {
    if (poster) {
      setFrame(poster);
      return;
    }
    if (!src) return;

    let cancelled = false;
    captureVideoFrame(src).then((url) => {
      if (!cancelled) setFrame(url);
    });

    return () => { cancelled = true; };
  }, [src, poster]);

  return (
    <div className={`video-thumb ${className}`.trim()}>
      {frame ? (
        <img src={frame} alt={alt} className="video-thumb-img" />
      ) : (
        <video
          src={src}
          className="video-thumb-img"
          muted
          playsInline
          preload="metadata"
        />
      )}
      <span className="video-thumb-play" aria-hidden="true">
        <PlayCircle size={playSize} />
      </span>
    </div>
  );
};

export default VideoThumb;
