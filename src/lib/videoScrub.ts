// Seeks a scroll-scrubbed video without piling up requests. Setting
// `currentTime` while a previous seek is still decoding queues more decode
// work than the browser can finish in a frame, so only the latest target is
// kept and applied once the in-flight seek lands.
export function createVideoScrubber(video: HTMLVideoElement) {
  let pending: number | null = null;

  const apply = (t: number) => {
    if (Math.abs(video.currentTime - t) <= 0.02) return;
    try {
      video.currentTime = t;
    } catch {}
  };

  const onSeeked = () => {
    if (pending === null) return;
    const t = pending;
    pending = null;
    apply(t);
  };

  video.addEventListener("seeked", onSeeked);

  return {
    seek(t: number) {
      if (video.seeking) {
        pending = t;
        return;
      }
      pending = null;
      apply(t);
    },
    destroy() {
      video.removeEventListener("seeked", onSeeked);
    },
  };
}
