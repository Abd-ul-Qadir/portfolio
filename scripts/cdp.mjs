/**
 * Minimal Chrome DevTools Protocol driver for verifying this site's scroll-driven behaviour.
 *
 * Why this exists: `chrome --headless --dump-dom --virtual-time-budget` never runs the
 * browser's rendering steps, so in that mode `requestAnimationFrame` never ticks, `scroll`
 * events never fire, and IntersectionObserver callbacks never run. Anything scroll-driven —
 * which, from Phase 4 onward, is most of this site — reads as "broken" there when it is
 * fine. Driving a normal (non-virtual-time) headless browser over CDP runs the real
 * rendering loop, so scroll, GSAP scrubs, springs and observers all behave normally.
 *
 * No dependencies: Node 22's global `fetch` and global `WebSocket` are all this needs.
 *
 * Usage:
 *   node scripts/cdp.mjs <url> <path-to-script.js> [--reduced-motion] [--viewport 390x844]
 *
 * The script file is evaluated in the page as the body of an async function; whatever it
 * returns is JSON-serialised and printed. `sleep(ms)` and `scrollTo(y)` are provided.
 *
 * Example script body:
 *   await scrollTo(1200);
 *   return document.querySelector("header").className;
 */

import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { setTimeout as delay } from "node:timers/promises";

const CHROME_CANDIDATES = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
];

const [, , url, scriptPath, ...flags] = process.argv;

if (!url || !scriptPath) {
  console.error("usage: node scripts/cdp.mjs <url> <script.js> [--reduced-motion]");
  process.exit(1);
}

// Headless Chrome reports `prefers-reduced-motion: reduce` by default, which silently tests
// the wrong code path. Default to the motion path here; opt into the other one explicitly.
const reducedMotion = flags.includes("--reduced-motion");

// `--viewport 390x844` emulates a real mobile viewport. Necessary because plain headless
// Chrome clamps its window to a 500px minimum width, which silently makes every "mobile"
// check a 500px check.
const viewportFlag = flags[flags.indexOf("--viewport") + 1];
const viewport =
  flags.includes("--viewport") && /^\d+x\d+$/.test(viewportFlag ?? "")
    ? {
        width: Number(viewportFlag.split("x")[0]),
        height: Number(viewportFlag.split("x")[1]),
      }
    : null;

const chromePath = CHROME_CANDIDATES.find((candidate) => {
  try {
    readFileSync(candidate, { flag: "r" });
    return true;
  } catch {
    return false;
  }
});

if (!chromePath) {
  console.error("Could not find a Chrome binary. Add its path to CHROME_CANDIDATES.");
  process.exit(1);
}

const port = 9222 + Math.floor(Math.random() * 500);
const args = [
  "--headless=new",
  "--disable-gpu",
  `--remote-debugging-port=${port}`,
  "--no-first-run",
  "--no-default-browser-check",
  `--user-data-dir=${process.env.TEMP ?? "/tmp"}/cdp-profile-${port}`,
  "--window-size=1440,900",
  "about:blank",
];
if (!reducedMotion) args.unshift("--force-prefers-no-reduced-motion");

const chrome = spawn(chromePath, args, { stdio: "ignore" });

async function getTargetSocket() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/list`);
      const targets = await response.json();
      const page = targets.find((target) => target.type === "page");
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {
      // Chrome not up yet.
    }
    await delay(250);
  }
  throw new Error("Chrome did not expose a debugging target in time.");
}

function connect(socketUrl) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(socketUrl);
    socket.addEventListener("open", () => resolve(socket));
    socket.addEventListener("error", reject);
  });
}

let nextId = 1;
function send(socket, method, params = {}) {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    const onMessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.id !== id) return;
      socket.removeEventListener("message", onMessage);
      if (message.error) reject(new Error(JSON.stringify(message.error)));
      else resolve(message.result);
    };
    socket.addEventListener("message", onMessage);
    socket.send(JSON.stringify({ id, method, params }));
  });
}

const body = readFileSync(scriptPath, "utf8");

// Helpers available to every script: a real `sleep`, and a `scrollTo` that waits for the
// scroll to actually be applied and painted rather than returning immediately.
const wrapped = `(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const frame = () => new Promise((r) => requestAnimationFrame(() => r()));
  // Scrolling is verified rather than assumed: the page can still be settling (fonts,
  // hydration, Lenis starting up) when the first scroll is issued, which silently lands
  // somewhere else and makes every later reading look scrambled.
  const scrollTo = async (y) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const target = Math.max(0, Math.min(y, max));
    for (let attempt = 0; attempt < 5; attempt += 1) {
      if (window.__lenis) window.__lenis.scrollTo(target, { immediate: true, force: true });
      else window.scrollTo(0, target);
      await frame();
      await frame();
      await sleep(150);
      if (Math.abs(window.scrollY - target) <= 2) return;
    }
  };
  try {
    ${body}
  } catch (error) {
    return "ERROR: " + (error && error.stack ? error.stack : String(error));
  }
})()`;

try {
  const socketUrl = await getTargetSocket();
  const socket = await connect(socketUrl);

  await send(socket, "Page.enable");
  await send(socket, "Runtime.enable");

  if (viewport) {
    await send(socket, "Emulation.setDeviceMetricsOverride", {
      width: viewport.width,
      height: viewport.height,
      deviceScaleFactor: 2,
      mobile: true,
    });
    // Device metrics alone do not change `(hover: none)` / `(pointer: coarse)`; touch
    // emulation is what flips those, and therefore what exercises the touch branch of
    // `useIsTouchDevice`.
    await send(socket, "Emulation.setTouchEmulationEnabled", {
      enabled: true,
      maxTouchPoints: 5,
    });
    await send(socket, "Emulation.setEmitTouchEventsForMouse", {
      enabled: true,
      configuration: "mobile",
    });
  }

  await send(socket, "Page.navigate", { url });

  // Wait for the page to settle: hydration, then the boot-sequence loader finishing.
  // The loader calls `lenis.stop()` while it plays, so any scrolling done before it clears
  // is silently ignored — which looks exactly like a broken scroll-spy if you don't wait.
  await delay(1500);
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const check = await send(socket, "Runtime.evaluate", {
      expression: `document.querySelector('[role="status"]') === null`,
      returnByValue: true,
    });
    if (check.result.value === true) break;
    await delay(250);
  }
  await delay(1200);

  const result = await send(socket, "Runtime.evaluate", {
    expression: wrapped,
    awaitPromise: true,
    returnByValue: true,
  });

  if (result.exceptionDetails) {
    console.error(JSON.stringify(result.exceptionDetails, null, 2));
    process.exitCode = 1;
  } else {
    const value = result.result.value;
    console.log(typeof value === "string" ? value : JSON.stringify(value, null, 2));
  }

  socket.close();
} finally {
  chrome.kill();
}
