import asyncio
import base64
import subprocess
from playwright.async_api import async_playwright

URL = "file:///home/francelico/persist.github.io/animation.html"
OUT_MP4 = "hero.mp4"

FPS = 24
DURATION_S = 5.9
WIDTH, HEIGHT = 1920, 1080
JPEG_QUALITY = 95

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(args=[
            "--disable-background-timer-throttling",
            "--disable-backgrounding-occluded-windows",
            "--disable-renderer-backgrounding",
        ])
        context = await browser.new_context(viewport={"width": WIDTH, "height": HEIGHT})
        page = await context.new_page()
        await page.goto(URL, wait_until="load")

        # Ensure fonts/videos are ready (prevents jank + missing initial frames)
        await page.evaluate("() => document.fonts.ready")
        await page.evaluate("""
        () => Promise.all([...document.querySelectorAll('video')].map(v => {
          v.muted = true; v.playsInline = true;
          const canPlay = v.readyState >= 2 ? Promise.resolve() : new Promise(r => v.addEventListener('canplay', r, {once:true}));
          const playing = (!v.paused && v.currentTime > 0) ? Promise.resolve() : new Promise(r => v.addEventListener('playing', r, {once:true}));
          return canPlay.then(() => v.play().catch(()=>{})).then(() => playing);
        }))
        """)

        ffmpeg = subprocess.Popen(
            [
                "ffmpeg", "-y",
                "-f", "image2pipe",
                "-framerate", str(FPS),
                "-vcodec", "mjpeg",
                "-i", "pipe:0",
                "-c:v", "libx264",
                "-pix_fmt", "yuv420p",
                "-preset", "slow",
                "-crf", "16",
                OUT_MP4,
            ],
            stdin=subprocess.PIPE,
        )

        cdp = await context.new_cdp_session(page)

        target_frames = int(round(FPS * DURATION_S))
        frames = 0
        done = asyncio.Event()

        async def on_frame(params):
            nonlocal frames
            # Always ACK, or Chromium will stall
            await cdp.send("Page.screencastFrameAck", {"sessionId": params["sessionId"]})

            if frames >= target_frames:
                return

            ffmpeg.stdin.write(base64.b64decode(params["data"]))
            frames += 1

            if frames >= target_frames:
                done.set()

        cdp.on("Page.screencastFrame", on_frame)

        await cdp.send("Page.startScreencast", {
            "format": "jpeg",
            "quality": JPEG_QUALITY,
            "maxWidth": WIDTH,
            "maxHeight": HEIGHT,
            "everyNthFrame": 1,
        })

        # Wait until we actually captured enough frames (with a safety timeout)
        await asyncio.wait_for(done.wait(), timeout=DURATION_S * 3)

        await cdp.send("Page.stopScreencast")

        await context.close()
        await browser.close()

        ffmpeg.stdin.close()
        ffmpeg.wait()

        print(f"Wrote {OUT_MP4}: {frames} frames at {FPS} fps => {frames/FPS:.2f}s")

asyncio.run(main())