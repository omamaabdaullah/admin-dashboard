export const isVideoMedia = (media) => {
  if (!media) return false;
  const type = typeof media.type === 'object' ? media.type?.value : media.type;
  return type === 'video';
};

export const captureVideoFrame = (src, seekTo = 0.4) =>
  new Promise((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }

    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    if (!src.startsWith('blob:') && !src.startsWith('data:')) {
      video.crossOrigin = 'anonymous';
    }
    video.src = src;

    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      video.removeAttribute('src');
      video.load();
      resolve(value);
    };

    const timer = setTimeout(() => finish(null), 8000);

    video.addEventListener('loadeddata', () => {
      const duration = Number.isFinite(video.duration) ? video.duration : 1;
      video.currentTime = Math.min(seekTo, Math.max(0.1, duration * 0.08));
    }, { once: true });

    video.addEventListener('seeked', () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 320;
        canvas.height = video.videoHeight || 180;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        finish(canvas.toDataURL('image/jpeg', 0.82));
      } catch {
        finish(null);
      }
    }, { once: true });

    video.addEventListener('error', () => finish(null), { once: true });
  });
