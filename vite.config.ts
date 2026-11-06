import { readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, type Plugin } from "vite";

const INVITED: Record<string, string[]> = {
  "prewedding-wedding-reception": ["bash", "wedding", "reception"],
  "wedding-reception": ["wedding", "reception"],
  reception: ["reception"],
};

// A locked link (VITE_INVITE set) ships only its own side's calendars and the media for events it includes.
function guestLink(side: string, invite: string | undefined): Plugin {
  let outDir = "dist";
  return {
    name: "guest-link",
    configResolved(config) {
      outDir = config.build.outDir;
    },
    transformIndexHtml(html) {
      return side === "groom" ? html.replaceAll("Harini &amp; Kevin", "Kevin &amp; Harini").replaceAll("Harini and Kevin", "Kevin and Harini") : html;
    },
    closeBundle() {
      if (!invite) return;
      const events = INVITED[invite] ?? INVITED["prewedding-wedding-reception"];
      const calendar = join(outDir, "calendar");
      for (const file of readdirSync(calendar)) {
        const [event, fileSide] = file.replace(".ics", "").split("-");
        if (fileSide !== side || !events.includes(event)) rmSync(join(calendar, file));
      }
      if (!events.includes("bash")) {
        const assets = join(outDir, "assets");
        for (const file of readdirSync(assets)) if (file.startsWith("bash-")) rmSync(join(assets, file));
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const side = env.VITE_SIDE === "groom" ? "groom" : "bride";
  const invite = env.VITE_INVITE && env.VITE_INVITE in INVITED ? env.VITE_INVITE : undefined;
  const query = (key: string, fallback: string, map: string) =>
    `((${map})[new URLSearchParams(location.search).get("${key}") ?? ""] ?? "${fallback}")`;
  return {
    plugins: [react(), guestLink(side, invite)],
    define: invite
      ? { __SIDE__: JSON.stringify(side), __INVITE__: JSON.stringify(invite), __GUEST_LINK__: "true" }
      : {
          __GUEST_LINK__: "false",
          __SIDE__: query("side", "bride", '{ groom: "groom", bride: "bride" }'),
          __INVITE__: query("invite", "prewedding-wedding-reception", '{ "prewedding-wedding-reception": "prewedding-wedding-reception", "wedding-reception": "wedding-reception", reception: "reception" }'),
        },
  };
});
