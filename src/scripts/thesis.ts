import { thesisBeats, thesisDuration } from "../data/portfolio";

async function setup(scene: HTMLElement) {
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const element = (selector: string) =>
    scene.querySelector<HTMLElement>(selector)!;
  const label = element(".stage-label");
  const count = element(".scene-count");
  const explanation = element(".scene-explanation");
  const play = element("[data-play]") as HTMLButtonElement;
  const replay = element("[data-replay]") as HTMLButtonElement;
  const progress = element(".scene-track span");
  const camera = element(".orchard-camera");
  const sweep = element(".acquisition-sweep");
  const target = element(".target-canopy");
  const registration = element(".registration-layer");
  const mask = element(".vegetation-overlay");
  const roi = element(".roi-square");
  const patches = element(".canopy-patches");
  const channels = element(".channel-overlay");
  const panels = [...scene.querySelectorAll<HTMLElement>("[data-panel]")];
  const tiles = [...scene.querySelectorAll<HTMLElement>(".canopy-patch")];
  const featurePlanes = [
    ...scene.querySelectorAll<HTMLElement>(".channel-stack span"),
  ];
  const bandBoxes = [
    ...scene.querySelectorAll<HTMLElement>(".registration-diagram i"),
  ];
  const chips = [
    ...scene.querySelectorAll<HTMLElement>(".spectral-chips span"),
  ];
  const signals = [...scene.querySelectorAll<HTMLElement>(".signal-rail i")];
  const groups = [
    ...scene.querySelectorAll<HTMLElement>(".evaluation-groups>*"),
  ];
  let timeline:
    ReturnType<(typeof import("gsap"))["gsap"]["timeline"]> | undefined;
  const clock = { time: 0 };
  let userPaused = false,
    started = false,
    visible = false,
    loading = false;
  let selected = 0;
  const clamp = (v: number) => Math.min(1, Math.max(0, v));
  // Critical damping: monotonic, time-based settling without UI bounce.
  const settle = (v: number) => {
    const x = Math.max(0, v) * 8;
    return 1 - (1 + x) * Math.exp(-x);
  };
  const setStage = (index: number) => {
    selected = index;
    scene.dataset.stage = String(index);
    label.textContent = thesisBeats[index].label;
    explanation.textContent = thesisBeats[index].description;
    count.textContent = `${String(index + 1).padStart(2, "0")} / ${String(thesisBeats.length).padStart(2, "0")}`;
    scene
      .querySelectorAll<HTMLButtonElement>("[data-seek]")
      .forEach((button, i) =>
        button.setAttribute("aria-pressed", String(i === index)),
      );
  };
  // Paint from absolute time, including hidden layers. Seeking never carries old transforms.
  const paint = (time: number, still = false) => {
    const index = Math.max(
      0,
      thesisBeats.findLastIndex((beat) => time >= beat.time),
    );
    if (selected !== index || !scene.dataset.painted) setStage(index);
    scene.dataset.painted = "true";
    const local = time - thesisBeats[index].time;
    const enter = still ? 1 : settle(local * 1.5);
    const zoom = still && index > 0 ? 1 : settle((time - 2.4) / 1.2);
    camera.style.transform = `scale(${1 + 3.4 * zoom})`;
    camera.style.filter = index === 1 ? "grayscale(1)" : "none";
    sweep.style.transform = `translateX(${clamp(time / 2.4) * element(".reel-view").clientWidth}px)`;
    sweep.style.opacity = index === 0 ? "1" : "0";
    target.style.opacity = index === 0 ? "1" : "0";
    registration.style.opacity =
      index === 1 ? String(0.42 * (1 - enter * 0.65)) : "0";
    registration.style.transform = `translate(${(1 - enter) * 12}px,${(1 - enter) * -9}px)`;
    mask.style.opacity = index === 2 ? ".52" : "0";
    mask.style.clipPath = `inset(0 ${100 * (1 - enter)}% 0 0)`;
    roi.style.opacity = index === 2 ? "1" : "0";
    roi.style.transform = `scale(${1.1 - 0.1 * enter})`;
    patches.style.opacity = index >= 3 ? "1" : "0";
    const spread = index >= 4 ? 1 : enter;
    tiles.forEach((tile, i) => {
      const col = (i % 3) - 1,
        row = Math.floor(i / 3) - 1;
      const pick = index === 6 ? (i === 4 ? 1 : 0.18) : 1;
      tile.style.transform = `translate(${col * 8 * spread}px,${row * 8 * spread}px) scale(${1 - 0.12 * spread})`;
      tile.style.opacity = String(pick);
      tile.style.filter = index === 4 ? "grayscale(1)" : "none";
    });
    channels.style.opacity = index === 4 ? ".45" : "0";
    panels.forEach(
      (panel, i) =>
        (panel.style.transform = `translateX(${i === index ? 18 * (1 - enter) : 0}px)`),
    );
    featurePlanes.forEach(
      (plane, i) =>
        (plane.style.transform = `translateX(${(still ? 1 : settle(local - i * 0.12)) * i * 4}px)`),
    );
    bandBoxes.forEach(
      (box, i) =>
        (box.style.transform = `translate(${(i - 1) * 16 * (1 - enter)}px,${(i - 1) * 10 * (1 - enter)}px)`),
    );
    chips.forEach(
      (chip, i) =>
        (chip.style.transform = `translateY(${still ? 0 : 8 * (1 - settle(local - i * 0.1))}px)`),
    );
    signals.forEach(
      (signal, i) =>
        (signal.style.transform = `translateY(${still ? 7 : clamp((local - i * 0.55) / 0.8) * 12}px)`),
    );
    groups.forEach(
      (group, i) =>
        (group.style.transform = `translateY(${still ? 0 : 14 * (1 - settle(local - i * 0.12))}px)`),
    );
    progress.style.width = `${clamp(time / thesisDuration) * 100}%`;
    scene.dataset.time = time.toFixed(3);
  };
  const updateButton = () => {
    const running =
      !motion.matches &&
      !!timeline &&
      !timeline.paused() &&
      timeline.progress() < 1;
    play.textContent = motion.matches
      ? "Next stage"
      : running
        ? "Pause"
        : "Play";
    play.setAttribute(
      "aria-label",
      motion.matches
        ? "Show next thesis stage"
        : running
          ? "Pause thesis animation"
          : "Play thesis animation",
    );
    scene.dataset.playing = String(running);
  };
  const select = (index: number) => {
    const time = thesisBeats[index].time + 1.8;
    timeline?.pause(time);
    clock.time = time;
    paint(time, true);
    updateButton();
  };
  async function load() {
    if (timeline || loading || motion.matches) return;
    loading = true;
    try {
      const { gsap } = await import("gsap");
      if (motion.matches) return;
      timeline = gsap.timeline({
        paused: true,
        onUpdate: () => paint(clock.time),
        onComplete: updateButton,
      });
      timeline.to(
        clock,
        { time: thesisDuration, duration: thesisDuration, ease: "none" },
        0,
      );
      if (selected) select(selected);
    } catch {
      scene.dataset.animationUnavailable = "true";
      element(".scene-controls").hidden = true;
    } finally {
      loading = false;
    }
  }
  const reconcile = async () => {
    if (motion.matches) {
      timeline?.pause();
      select(0);
      updateButton();
      return;
    }
    if (visible && !document.hidden && !userPaused) {
      await load();
      if (
        visible &&
        !document.hidden &&
        !userPaused &&
        !motion.matches &&
        timeline &&
        timeline.progress() < 1
      ) {
        if (!started) {
          started = true;
          timeline.play(0);
        } else timeline.resume();
      }
    } else timeline?.pause();
    updateButton();
  };
  element(".scene-controls").hidden = false;
  scene.querySelectorAll<HTMLButtonElement>("[data-seek]").forEach((button) => {
    button.hidden = false;
    button.addEventListener("click", async () => {
      userPaused = true;
      await load();
      select(Number(button.dataset.seek));
    });
  });
  scene.classList.add("enhanced");
  play.addEventListener("click", async () => {
    if (motion.matches) {
      select((selected + 1) % thesisBeats.length);
      return;
    }
    await load();
    if (!timeline) return;
    if (!timeline.paused() && timeline.progress() < 1) {
      userPaused = true;
      timeline.pause();
    } else {
      userPaused = false;
      started = true;
      if (timeline.progress() === 1) timeline.restart();
      else timeline.resume();
    }
    updateButton();
  });
  replay.addEventListener("click", async () => {
    if (motion.matches) {
      select(0);
      return;
    }
    userPaused = false;
    started = true;
    await load();
    timeline?.restart();
    updateButton();
  });
  const observer = new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
      void reconcile();
    },
    { threshold: 0.15 },
  );
  observer.observe(scene);
  const onMotionChange = () => void reconcile();
  document.addEventListener("visibilitychange", reconcile);
  motion.addEventListener("change", onMotionChange);
  // Local capture hook: the same absolute-time painter drives preview and verification.
  const onSeek = (event: Event) => {
    const time = Number((event as CustomEvent).detail?.time);
    if (!Number.isFinite(time)) return;
    userPaused = true;
    timeline?.pause();
    clock.time = Math.max(0, Math.min(thesisDuration, time));
    paint(clock.time);
    updateButton();
  };
  scene.addEventListener("thesis:seek", onSeek);
  paint(0, true);
  updateButton();
  window.addEventListener(
    "pagehide",
    () => {
      observer.disconnect();
      timeline?.kill();
      document.removeEventListener("visibilitychange", reconcile);
      motion.removeEventListener("change", onMotionChange);
      scene.removeEventListener("thesis:seek", onSeek);
    },
    { once: true },
  );
}

document
  .querySelectorAll<HTMLElement>("[data-thesis]")
  .forEach((scene) => void setup(scene));
