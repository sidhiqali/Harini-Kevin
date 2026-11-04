import {
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  type SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// Harini invitation. Times are IST; the same slots live in public/calendar/*.ics for Apple and Outlook.
const EVENTS = [
  {
    name: "Pre Wedding Bash",
    date: "Friday, 4 December 2026",
    time: "7:00 PM onwards · followed by dinner",
    venue: "Mogra Hall",
    area: "Rajiv Gandhi College",
    theme: "Dress code: Suits & Shimmer",
    note: "Join us for an unforgettable celebration—an evening of rhythm, glamour and a dance floor full of memories.",
    hostedBy: "Alpa & Hasit Mehta · Maitri & Pratik Shah",
    schedule: [["Celebration begins", "7:00 PM"], ["Dinner", "to follow"]],
    look: "night",
    couple: "/assets/bash-twirl.mp4",
    slug: "bash",
    start: "2026-12-04T19:00",
    end: "2026-12-04T23:30",
  },
  {
    name: "The Wedding",
    date: "Saturday, 5 December 2026",
    time: "Baraat welcome 4:00 PM · Hast Melap 5:30 PM",
    venue: "Hiravati Hall",
    area: "Santacruz, Mumbai",
    theme: "Dress code: Indian Traditional",
    note: "With so much love, joy and gratitude in our hearts, we invite you to celebrate our marriage as we hold hands in a lifetime of friendship.",
    schedule: [["Baraat welcome", "4:00 PM"], ["Hast Melap", "5:30 PM"]],
    look: "ivory",
    couple: "/assets/wedding-couple.webp",
    slug: "wedding",
    start: "2026-12-05T16:00",
    end: "2026-12-05T19:30",
  },
  {
    name: "The Reception",
    date: "Saturday, 5 December 2026",
    time: "7:30 PM onwards · followed by dinner",
    venue: "Hiravati Hall",
    area: "Santacruz, Mumbai",
    theme: "",
    note: "Bless us with your presence at our wedding reception.",
    schedule: [["Reception", "7:30 PM"], ["Dinner", "to follow"]],
    look: "champagne",
    couple: "/assets/reception-couple.webp",
    slug: "reception",
    start: "2026-12-05T19:30",
    end: "2026-12-05T23:30",
  },
];

// ponytail: ?k= only hides events client-side; anyone editing the URL can switch tier
const INVITES: Record<string, string[]> = {
  soiree: ["bash", "wedding", "reception"],
  vows: ["wedding", "reception"],
  evening: ["reception"],
};
const INCLUDED = INVITES[new URLSearchParams(window.location.search).get("k") ?? ""] ?? INVITES.soiree;
const GUEST_EVENTS = EVENTS.filter((event) => INCLUDED.includes(event.slug));
const FIRST_EVENT = GUEST_EVENTS[0];
const TWO_DAYS = INCLUDED.includes("bash");
const DATE_TEXT = TWO_DAYS ? "4 – 5 December 2026" : "5 December 2026";
const VENUES = [...new Map(GUEST_EVENTS.map((event) => [event.venue, event])).values()];

const RSVP_CONTACTS: (readonly [string, string, string])[] = [];

const istTime = (local: string) => new Date(`${local}:00+05:30`).getTime();
const mapsQuery = (event: (typeof EVENTS)[number]) => encodeURIComponent(`${event.venue}, ${event.area}`);

function googleCalendarUrl(event: (typeof EVENTS)[number]) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${event.name} · Harini & Kevin`,
    dates: [event.start, event.end].map((t) => `${t.replace(/[-:]/g, "")}00`).join("/"),
    ctz: "Asia/Kolkata",
    location: `${event.venue}, ${event.area}`,
    details: event.theme,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function useRevealOnScroll() {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>(".reveal-on-scroll");
    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
}

function Twinkles({ count }: { count: number }) {
  return (
    <div className="twinkle-field" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => <i key={index} style={{ left: `${(index * 37) % 100}%`, top: `${(index * 53) % 100}%`, animationDelay: `${(index % 9) * 0.31}s` }} />)}
    </div>
  );
}

function Divider({ light = false }: { light?: boolean }) {
  return (
    <div className={`ornament-divider ${light ? "is-light" : ""}`} aria-hidden="true">
      <span />
      <b>✦</b>
      <span />
    </div>
  );
}

function SectionTitle({
  eyebrow,
  title,
  copy,
  light = false,
}: {
  eyebrow: string;
  title: string;
  copy?: string;
  light?: boolean;
}) {
  return (
    <div className={`section-title reveal-on-scroll ${light ? "is-light" : ""}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <Divider light={light} />
      {copy && <p className="section-copy">{copy}</p>}
    </div>
  );
}

function CelebrationBurst({ active }: { active: boolean }) {
  const confetti = useMemo(
    () =>
      Array.from({ length: 140 }, (_, id) => ({
        id,
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        duration: 2.5 + Math.random() * 2.5,
        size: 6 + Math.random() * 10,
        color: ["#b8112e", "#d4a017", "#f4c98c", "#e89bb0", "#7a1c2e", "#f6e3a3"][id % 6],
        rotate: Math.random() * 360,
      })),
    [],
  );
  const hearts = useMemo(
    () =>
      Array.from({ length: 30 }, (_, id) => ({
        id,
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        duration: 3 + Math.random() * 2.5,
        size: 18 + Math.random() * 22,
      })),
    [],
  );
  if (!active) return null;

  return (
    <div className="celebration-layer" aria-hidden="true">
      {confetti.map((piece) => (
        <i
          key={`c-${piece.id}`}
          className="confetti"
          style={{
            left: `${piece.left}%`,
            width: piece.size,
            height: piece.size * 0.4,
            background: piece.color,
            animationDuration: `${piece.duration}s`,
            animationDelay: `${piece.delay}s`,
            transform: `rotate(${piece.rotate}deg)`,
          }}
        />
      ))}
      {hearts.map((heart) => (
        <i
          key={`h-${heart.id}`}
          className="rising-heart"
          style={{
            left: `${heart.left}%`,
            fontSize: heart.size,
            animationDuration: `${heart.duration}s`,
            animationDelay: `${heart.delay}s`,
          }}
        >
          ♥
        </i>
      ))}
    </div>
  );
}

function ScratchCard({
  children,
  hint,
  onReveal,
  threshold = 0.45,
}: {
  children: ReactNode;
  hint: string;
  threshold?: number;
  onReveal: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const completedRef = useRef(false);
  const [revealed, setRevealed] = useState(false);

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || revealed) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = parent.clientWidth * dpr;
    canvas.height = parent.clientHeight * dpr;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    const gradient = context.createLinearGradient(0, 0, parent.clientWidth, parent.clientHeight);
    gradient.addColorStop(0, "#e8c163");
    gradient.addColorStop(0.5, "#b58632");
    gradient.addColorStop(1, "#7a5418");
    context.globalCompositeOperation = "source-over";
    context.fillStyle = gradient;
    context.fillRect(0, 0, parent.clientWidth, parent.clientHeight);
    context.fillStyle = "rgba(255,255,255,.08)";
    for (let i = 0; i < 40; i += 1) {
      context.beginPath();
      context.arc(Math.random() * parent.clientWidth, Math.random() * parent.clientHeight, 2 + Math.random() * 3, 0, Math.PI * 2);
      context.fill();
    }
    context.fillStyle = "rgba(255,255,255,.9)";
    context.textAlign = "center";
    context.font = "600 14px Cinzel, serif";
    context.fillText("✦ SCRATCH TO REVEAL ✦", parent.clientWidth / 2, parent.clientHeight / 2 - 10);
    context.font = "italic 13px 'Cormorant Garamond', serif";
    context.fillText(hint, parent.clientWidth / 2, parent.clientHeight / 2 + 14);
  }, [hint, revealed]);

  useEffect(() => {
    setupCanvas();
    window.addEventListener("resize", setupCanvas);
    return () => window.removeEventListener("resize", setupCanvas);
  }, [setupCanvas]);

  const pointFromEvent = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const bounds = canvas.getBoundingClientRect();
    return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
  };

  const reveal = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    setRevealed(true);
    onReveal();
  }, [onReveal]);

  const draw = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    const point = pointFromEvent(event);
    const context = canvas?.getContext("2d");
    if (!canvas || !point || !context) return;
    context.globalCompositeOperation = "destination-out";
    context.lineWidth = 36;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.beginPath();
    if (lastPointRef.current) {
      context.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      context.lineTo(point.x, point.y);
    } else {
      context.arc(point.x, point.y, 18, 0, Math.PI * 2);
    }
    context.stroke();
    context.fill();
    lastPointRef.current = point;

    if (Math.random() < 0.08) {
      const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let clear = 0;
      let sampled = 0;
      for (let index = 3; index < data.length; index += 200 * 4) {
        sampled += 1;
        if (data[index] === 0) clear += 1;
      }
      if (clear / sampled > threshold) reveal();
    }
  };

  const pointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    lastPointRef.current = pointFromEvent(event);
    draw(event);
  };

  const pointerUp = () => {
    drawingRef.current = false;
    lastPointRef.current = null;
  };

  return (
    <div className="scratch-card">
      <div className="scratch-message">{children}</div>
      <canvas
        ref={canvasRef}
        className={revealed ? "is-revealed" : ""}
        onPointerDown={pointerDown}
        onPointerMove={draw}
        onPointerUp={pointerUp}
        onPointerCancel={pointerUp}
        onPointerLeave={pointerUp}
        aria-label={hint}
      />
      {!revealed && (
        <button className="scratch-accessible" onClick={reveal} type="button">
          Reveal without scratching
        </button>
      )}
    </div>
  );
}

// Playing while still downloading stutters, so every video is fetched whole (as a blob) behind the envelope.
const VIDEO_URLS = new Map<string, Promise<string>>();
const loadedUrls = new Map<string, string>();
const videoProgress = new Map<string, [number, number]>();

function loadVideo(src: string, onProgress?: () => void) {
  let url = VIDEO_URLS.get(src);
  if (!url) {
    url = fetch(src)
      .then(async (response) => {
        if (!response.ok || !response.body) throw new Error(src);
        const total = Number(response.headers.get("content-length")) || 0;
        const reader = response.body.getReader();
        const chunks: Uint8Array[] = [];
        let loaded = 0;
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          loaded += value.length;
          videoProgress.set(src, [loaded, total || loaded]);
          onProgress?.();
        }
        return URL.createObjectURL(new Blob(chunks as BlobPart[], { type: response.headers.get("content-type") || "video/mp4" }));
      })
      .catch(() => src)
      .then((url) => {
        loadedUrls.set(src, url);
        return url;
      });
    VIDEO_URLS.set(src, url);
  }
  return url;
}

const MUSIC = "/assets/wedding-music.m4a";
let music: HTMLAudioElement | null = null;

// iOS only lets audio start from inside the tap handler, so the envelope tap calls this directly.
function startMusic() {
  if (music) return;
  const audio = new Audio(loadedUrls.get(MUSIC) ?? MUSIC);
  audio.loop = true;
  audio.volume = 0.45;
  audio.play().catch(() => undefined);
  music = audio;
}

function BackgroundMusic() {
  const [playing, setPlaying] = useState(() => Boolean(music && !music.paused));

  useEffect(() => {
    const audio = music;
    if (!audio) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    // Mobile browsers keep audio running after the guest switches apps.
    let resumeOnReturn = false;
    const onVisibility = () => {
      if (document.hidden) {
        resumeOnReturn = !audio.paused;
        audio.pause();
      } else if (resumeOnReturn) {
        audio.play().catch(() => undefined);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const toggle = () => {
    if (!music) startMusic();
    else if (music.paused) music.play().catch(() => undefined);
    else music.pause();
  };

  return (
    <button
      type="button"
      className={`music-toggle ${playing ? "is-playing" : ""}`}
      onClick={toggle}
      aria-label={playing ? "Pause music" : "Play music"}
      aria-pressed={playing}
    >
      <span />
      <span />
      <span />
      <span />
    </button>
  );
}

const HERO_VIDEO = "/assets/hero.mp4";
const ENVELOPE_VIDEO = "/assets/envelope.mp4";

function Fleur({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" aria-hidden="true">
      <path d="M20 4c3 5 3 10 0 15-3-5-3-10 0-15zM20 19c-4-4-10-5-15-2 4 4 10 5 15 2zM20 19c4-4 10-5 15-2-4 4-10 5-15 2zM20 19v15M15 31h10" />
    </svg>
  );
}

function Sprig() {
  return (
    <svg className="env-sprig" viewBox="0 0 30 40" aria-hidden="true">
      <path d="M24 38C18 28 14 18 15 4M15 10c-5-1-8-4-8-7 4 0 7 3 8 7zM15 18c-5 0-9-3-10-6 5-1 8 2 10 6zM16 26c-5 1-9-1-11-4 5-2 9 0 11 4zM15 12c4-2 6-6 6-9-4 1-6 5-6 9zM15 20c4-2 7-5 7-9-4 1-7 5-7 9z" />
    </svg>
  );
}

function Envelope({ onOpen }: { onOpen: () => void }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [percent, setPercent] = useState(0);
  const [ready, setReady] = useState(false);
  const [stage, setStage] = useState<"closed" | "opening" | "fading">("closed");

  useEffect(() => {
    // Reloads otherwise restore the old scroll position, so the envelope would open mid-page
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    document.documentElement.classList.add("is-sealed");
    const sources = [ENVELOPE_VIDEO, MUSIC, HERO_VIDEO, ...GUEST_EVENTS.map((event) => event.couple).filter((src) => src.endsWith(".mp4"))];
    const update = () => {
      let loaded = 0;
      let total = 0;
      videoProgress.forEach(([done, size]) => { loaded += done; total += size; });
      setPercent(total ? Math.min(99, Math.round((loaded / total) * 100)) : 0);
    };
    Promise.all(sources.map((src) => loadVideo(src, update))).then(([envelope]) => {
      if (videoRef.current) videoRef.current.src = envelope;
      setReady(true);
    });
  }, []);

  const finish = useCallback(() => {
    setStage("fading");
    window.scrollTo(0, 0);
    document.documentElement.classList.remove("is-sealed");
    onOpen();
  }, [onOpen]);

  const open = () => {
    const video = videoRef.current;
    if (!ready || stage !== "closed" || !video) return;
    setStage("opening");
    startMusic();
    video.muted = false;
    video.play().catch(finish);
  };

  const onTimeUpdate = (event: SyntheticEvent<HTMLVideoElement>) => {
    const video = event.currentTarget;
    if (stage === "opening" && video.duration && video.currentTime > video.duration - 0.7) finish();
  };

  return (
    <div className={`envelope is-${stage}`} onClick={open} role="button" tabIndex={0} aria-label="Open the invitation" onKeyDown={(event) => (event.key === "Enter" || event.key === " ") && open()}>
      <video ref={videoRef} className="envelope-media" poster="/assets/envelope-poster.jpg" playsInline preload="none" aria-hidden="true" onTimeUpdate={onTimeUpdate} onEnded={finish} />
      <div className="envelope-title">
        <Fleur className="env-fleur" />
        <p className="env-ruled">The wedding of</p>
        <p className="env-script"><Sprig />Harini</p>
        <p className="env-ruled is-and">and</p>
        <p className="env-script"><Sprig />Kevin</p>
      </div>
      <Fleur className="env-drop" />
      <p className={`envelope-cta ${ready ? "is-ready" : ""}`}>
        {ready ? "Tap to open" : <>Preparing your invitation <span>{percent}%</span></>}
      </p>
    </div>
  );
}

function Hero({ live }: { live: boolean }) {
  const [rested, setRested] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !live) return;
    let cancelled = false;
    loadVideo(HERO_VIDEO).then((src) => {
      if (cancelled) return;
      video.muted = true;
      video.src = src;
      video.play().catch(() => undefined);
    });
    return () => { cancelled = true; };
  }, [live]);

  // Fallback for Low Power Mode, where iOS blocks autoplay and "ended" never fires.
  useEffect(() => {
    if (!live) return;
    const timer = window.setTimeout(() => setRested(true), 18000);
    return () => window.clearTimeout(timer);
  }, [live]);

  // Two plays, then it rests on the last frame (the couple's closing pose)
  const onEnded = (event: SyntheticEvent<HTMLVideoElement>) => {
    const video = event.currentTarget;
    if (video.dataset.replayed) return setRested(true);
    video.dataset.replayed = "1";
    video.currentTime = 0;
    video.play().catch(() => setRested(true));
  };

  return (
    <section id="home" className={`video-hero ${live ? "is-live" : ""}`}>
      <video
        ref={videoRef}
        className="video-hero-media"
        poster="/assets/hero-poster.jpg"
        muted
        playsInline
        aria-hidden="true"
        onEnded={onEnded}
      />
      <div className="video-hero-copy">
        <p className="vh-eyebrow hero-rise">Together with their families</p>
        <span className="vh-ornament hero-rise" aria-hidden="true"><i />✦<i /></span>
        <h1 className="vh-names hero-rise">
          <span>Harini</span>
          <b>&amp;</b>
          <span>Kevin</span>
        </h1>
        <span className="vh-ornament hero-rise" aria-hidden="true"><i />✦<i /></span>
        <p className="vh-invite hero-rise">invite you to celebrate their wedding</p>
        <p className="vh-date hero-rise">{DATE_TEXT}</p>
        <p className="vh-place hero-rise">Mumbai</p>
      </div>
      <button type="button" className={`vh-scroll ${rested ? "is-shown" : ""}`} onClick={() => scrollToSection("blessings")} tabIndex={rested ? 0 : -1}>
        <span>Scroll down</span>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
      </button>
    </section>
  );
}

function Blessings() {
  return (
    <section id="blessings" className="hero-section blessings-section ivory-section">
      <div className="hero-inner">
        <div className="blessing">
          <svg viewBox="0 0 64 34" aria-hidden="true">
            <path d="M32 3C39 11 39 22 32 29C25 22 25 11 32 3Z" />
            <path d="M32 29C22 27 15 19 15 10C24 12 30 20 32 29Z" />
            <path d="M32 29C42 27 49 19 49 10C40 12 34 20 32 29Z" />
            <path d="M32 29C20 30 8 27 3 20C14 18 26 22 32 29Z" />
            <path d="M32 29C44 30 56 27 61 20C50 18 38 22 32 29Z" />
            <path d="M12 32H52" />
          </svg>
          <p>A celebration of love</p>
        </div>
        <div className="hero-name">
          <p>With the heartfelt blessings of</p>
          <p>Mrs. Manisha &amp; Mr. Vimal Mehta</p>
          <p>Mrs. Minal &amp; Mr. Jayesh Chheda</p>
        </div>
        <img className="blessing-flourish" src="/assets/flourish-wide.webp" alt="" aria-hidden="true" />
        <p className="hero-quote">
          “Two souls, one heart, woven by destiny — request the joy of your presence as we begin our forever.”
        </p>
      </div>
    </section>
  );
}

function SaveTheDate() {
  const [burst, setBurst] = useState(false);
  const [dated, setDated] = useState(false);
  const reveal = () => {
    setDated(true);
    setBurst(false);
    requestAnimationFrame(() => setBurst(true));
    window.setTimeout(() => setBurst(false), 6500);
  };
  return (
    <section id="save-the-date" className="velvet-section std-section">
      <Twinkles count={36} />
      <CelebrationBurst active={burst} />
      <div className="section-shell narrow-shell">
        <SectionTitle eyebrow="Mark your calendar" title="Save the Date" light />
        <p className="std-sub">{TWO_DAYS ? "Two days of celebration" : "One evening to remember"}</p>
        <div className="std-frame reveal-on-scroll">
          <img className="std-frame-art" src="/assets/date-frame.webp" alt="" aria-hidden="true" />
          <div className="std-slot">
            <ScratchCard hint={`Scratch the gold to reveal our ${TWO_DAYS ? "dates" : "date"}`} onReveal={reveal} threshold={0.19}>
              <span className="std-day">{TWO_DAYS ? "Friday & Saturday" : "Saturday"}</span>
              <strong className="std-num">{TWO_DAYS ? "4 & 5" : "5"}</strong>
              <span className="std-month">December · 2026</span>
            </ScratchCard>
          </div>
        </div>
        {dated ? (
          <div className="std-after">
            <Countdown />
            <p className="std-venues">{VENUES.map((venue) => venue.venue).join(" · ")} · Mumbai</p>
          </div>
        ) : (
          <p className="std-hint">Scratch the gold to unveil the magic</p>
        )}
      </div>
    </section>
  );
}

const WEDDING_TIME = istTime(FIRST_EVENT.start);
const WEDDING_DAY_START = istTime(`${FIRST_EVENT.start.slice(0, 10)}T00:00`);
const WEDDING_DAY_END = istTime("2026-12-06T06:00");
// Paste the live-stream link here on the day; the button stays hidden while it is empty.
const LIVE_STREAM_URL = "";

type WeddingPhase = "before" | "wedding" | "after";

function getPhase(): WeddingPhase {
  const preview = new URLSearchParams(window.location.search).get("day");
  if (preview === "wedding" || preview === "after") return preview;
  const now = Date.now();
  if (now >= WEDDING_DAY_END) return "after";
  if (now >= WEDDING_DAY_START) return "wedding";
  return "before";
}

function getRemaining() {
  const remaining = Math.max(0, WEDDING_TIME - Date.now());
  return {
    Days: Math.floor(remaining / 86400000),
    Hours: Math.floor((remaining / 3600000) % 24),
    Minutes: Math.floor((remaining / 60000) % 60),
    Seconds: Math.floor((remaining / 1000) % 60),
  };
}

function Countdown() {
  const [remaining, setRemaining] = useState(getRemaining);
  const [phase, setPhase] = useState(getPhase);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setRemaining(getRemaining());
      setPhase(getPhase());
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="std-count">
        {phase === "wedding" && (
          <>
            <p className="eyebrow">Today’s the day</p>
            <div className="countdown-card wedding-day-card">
              <p className="wedding-day-line">Today, we celebrate</p>
              <p>{GUEST_EVENTS.map((event) => `${event.name}: ${event.date.split(",")[0]}, ${event.time}`).join(" · ")}</p>
              {LIVE_STREAM_URL && (
                <a className="directions-button live-button" href={LIVE_STREAM_URL} target="_blank" rel="noreferrer">
                  <i aria-hidden="true" /> Watch the ceremony live
                </a>
              )}
            </div>
          </>
        )}
        {phase === "after" && (
          <>
            <p className="eyebrow">Just married</p>
            <div className="countdown-card wedding-day-card">
              <p className="wedding-day-line">Harini &amp; Kevin</p>
              <p>Thank you for being part of our story. Your love and blessings made it unforgettable.</p>
            </div>
          </>
        )}
        {phase === "before" && (
          <>
            <p className="eyebrow">Counting the moments</p>
            <div className="countdown-card">
              <div className="countdown-grid">
                {Object.entries(remaining).map(([label, value]) => (
                  <div className="countdown-unit" key={label}>
                    <strong>{String(value).padStart(2, "0")}</strong>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
              <p>Until the {FIRST_EVENT.name.replace(/^The /, "")} ✦ {FIRST_EVENT.date.replace(/^\w+, /, "")}</p>
            </div>
          </>
        )}
    </div>
  );
}

function useInViewPlayback() {
  const ref = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.muted = true;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => undefined);
      else video.pause();
    }, { threshold: 0.25 });
    observer.observe(video);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function PanelVideo({ src }: { src: string }) {
  const ref = useInViewPlayback();
  useEffect(() => {
    loadVideo(src).then((url) => {
      const video = ref.current;
      if (video && !video.src) video.src = url;
    });
  }, [ref, src]);
  return <video ref={ref} className="ep-couple ep-video" poster={src.replace(".mp4", ".jpg")} muted loop playsInline aria-hidden="true" />;
}

function EventPanel({ event }: { event: (typeof EVENTS)[number] }) {
  return (
    <article className={`ep ep-${event.look}`} id={`event-${event.slug}`}>
      {event.look === "night" && <Twinkles count={34} />}
      {event.look === "night" && <div className="bash-ceiling" aria-hidden="true"><i /><i /><i /><b /><b /></div>}
      <div className="ep-inner">
        <div className="ep-copy reveal-on-scroll">
          <p className="ep-eyebrow">{event.date.replace(", ", " · ")}</p>
          <h3 className="ep-title">{event.name}</h3>
          {event.note && <p className="ep-note">{event.note}</p>}
          <dl className="ep-schedule">
            {event.schedule.map(([label, time]) => (
              <div key={label}><dt>{label}</dt><dd>{time}</dd></div>
            ))}
          </dl>
          <img className="ep-flourish" src="/assets/flourish-wide.webp" alt="" aria-hidden="true" />
          <p className="ep-venue">{event.venue}<span>{event.area}</span></p>
          {event.theme && <p className="ep-dress">{event.theme}</p>}
          {"hostedBy" in event && event.hostedBy && <p className="ep-hosts"><span>With love</span>{event.hostedBy}</p>}
          <div className="ep-actions">
            <details className="event-calendar">
              <summary>＋ Add to calendar</summary>
              <div>
                <a href={googleCalendarUrl(event)} target="_blank" rel="noreferrer">Google Calendar</a>
                <a href={`/calendar/${event.slug}.ics`}>iPhone / Outlook</a>
              </div>
            </details>
            <a className="ep-map" href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery(event)}`} target="_blank" rel="noreferrer">⌖ Directions</a>
          </div>
        </div>
        {event.couple.endsWith(".mp4") ? (
          <PanelVideo src={event.couple} />
        ) : (
          <img className="ep-couple reveal-on-scroll" src={event.couple} alt={`Harini and Kevin, ${event.name}`} loading="lazy" />
        )}
      </div>
    </article>
  );
}

function Events() {
  return (
    <section id="events" className="event-panels">
      {GUEST_EVENTS.map((event) => (
        <EventPanel event={event} key={event.slug} />
      ))}
    </section>
  );
}

function Venue() {
  return (
    <section id="venue" className="venue-section section-pad">
      <img className="floral-corner is-tr" src="/assets/floral-tr.webp" alt="" aria-hidden="true" loading="lazy" />
      <img className="floral-corner is-bl" src="/assets/floral-bl.webp" alt="" aria-hidden="true" loading="lazy" />
      <div className="section-shell">
        <SectionTitle eyebrow="Where We Celebrate" title={VENUES.length > 1 ? "The Venues" : "The Venue"} />
        <div className="venue-list">
          {VENUES.map((venue) => (
            <article className="venue-card reveal-on-scroll" key={venue.venue}>
              <img className="venue-flourish" src="/assets/flourish-wide.webp" alt="" aria-hidden="true" loading="lazy" />
              <p className="venue-events">{GUEST_EVENTS.filter((event) => event.venue === venue.venue).map((event) => event.name.replace(/^The /, "")).join(" · ")}</p>
              <h3>{venue.venue}</h3>
              <p className="venue-area">{venue.area}</p>
              <p className="venue-date">{venue.date}</p>
              <div className="venue-map">
                <iframe title={`Map of ${venue.venue}`} src={`https://www.google.com/maps?q=${mapsQuery(venue)}&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
              </div>
              <a className="ep-map" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery(venue)}`}>⌖ Get directions</a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ThankYou() {
  return (
    <section id="thanks" className="velvet-section thank-you">
      <Twinkles count={30} />
      <img className="floral-maroon is-tr" src="/assets/floral-maroon.webp" alt="" aria-hidden="true" loading="lazy" />
      <img className="floral-maroon is-bl" src="/assets/floral-maroon.webp" alt="" aria-hidden="true" loading="lazy" />
      <div className="thank-you-inner reveal-on-scroll">
        <img className="thanks-flourish" src="/assets/flourish-wide.webp" alt="" aria-hidden="true" />
        <p className="eyebrow">With love &amp; gratitude</p>
        <h2>Thank You</h2>
        <Divider light />
        <p className="thank-msg">To every soul who has loved us, prayed for us and journeyed with us — your presence is a blessing we will carry forever.</p>
        <p className="thank-sign">Harini <b>&amp;</b> Kevin</p>
        {RSVP_CONTACTS.length > 0 && <div className="rsvp">
          <Divider light />
          <h3>Kindly RSVP</h3>
          <p>Please let us know you’ll be joining us</p>
          <ul>
            {RSVP_CONTACTS.map(([family, name, phone]) => (
              <li key={phone}>
                <span className="rsvp-family">{family}</span>
                <strong>{name}</strong>
                <a href={`tel:${phone.replace(/\s/g, "")}`} aria-label={`Call ${name}, ${phone}`}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25c1.1.37 2.3.57 3.6.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z" />
                  </svg>
                  {phone}
                </a>
              </li>
            ))}
          </ul>
        </div>}
        <small>{DATE_TEXT} · Mumbai</small>
      </div>
    </section>
  );
}

export default function Home() {
  useRevealOnScroll();
  const [opened, setOpened] = useState(false);
  const [sealed, setSealed] = useState(true);

  useEffect(() => {
    if (!opened) return;
    const timer = window.setTimeout(() => setSealed(false), 1200);
    return () => window.clearTimeout(timer);
  }, [opened]);

  return (
    <main className="site-main">
      {sealed && <Envelope onOpen={() => setOpened(true)} />}
      {opened && <BackgroundMusic />}
      <Hero live={opened} />
      <Blessings />
      <SaveTheDate />
      <Events />
      <Venue />
      <ThankYou />
    </main>
  );
}
