# CODING AGENTS: READ THIS FIRST

This is a **handoff bundle** from Claude Design (claude.ai/design).

A user mocked up designs in HTML/CSS/JS using an AI design tool, then exported this bundle so a coding agent can implement the designs for real.

## What you should do — IMPORTANT

**Read `claim-comparison/project/Claim Comparison v3.html` in full.** The user had this file open when they triggered the handoff, so it's almost certainly the primary design they want built. Read it top to bottom — don't skim. Then **follow its imports**: open every file it pulls in (shared components, CSS, scripts) so you understand how the pieces fit together before you start implementing.

**If anything is ambiguous, ask the user to confirm before you start implementing.** It's much cheaper to clarify scope up front than to build the wrong thing.

## About the design files

The design medium is **HTML/CSS/JS** — these are prototypes, not production code. Your job is to **recreate them pixel-perfectly** in whatever technology makes sense for the target codebase (React, Vue, native, whatever fits). Match the visual output; don't copy the prototype's internal structure unless it happens to fit.

**Don't render these files in a browser or take screenshots unless the user asks you to.** Everything you need — dimensions, colors, layout rules — is spelled out in the source. Read the HTML and CSS directly; a screenshot won't tell you anything they don't.

## Bundle contents

- `claim-comparison/README.md` — this file
- `claim-comparison/project/` — the `Claim Comparison` project files (HTML prototypes, assets, components)

## Local dev — Cloudflare Access setup

Both data endpoints live on Bowtie Drop behind Cloudflare Access:

- operation data — `https://rachellam.drop.ai.bowtie.hk/common-operation-data/operations.json`
- benefit schedules — `https://drop.ai.bowtie.hk/proxy`

Deployed, the app is same-origin with Drop, so the browser sends its
`CF_Authorization` cookie automatically. From `localhost` the fetch is
cross-origin and carries no credentials, so Access answers `302` →
`bowtie.cloudflareaccess.com`, which has no CORS headers — the browser reports
that as `TypeError: Failed to fetch`.

So `npm run dev` routes both endpoints through Vite's server-side proxy
(`/drop-data`, `/drop-proxy` — see `vite.config.ts`), which attaches Access
credentials from a gitignored `.env.local`:

```sh
# Option A — reuse your own browser session. Log in to
# https://drop.ai.bowtie.hk, then DevTools → Application → Cookies →
# https://drop.ai.bowtie.hk and copy the CF_Authorization value.
# It expires (typically 24h); re-copy when the Access error reappears.
CF_ACCESS_COOKIE=<CF_Authorization cookie value>

# Option B — a Cloudflare Access service token, if one has been issued for
# these apps. Preferred: it doesn't expire daily. Ask the team that owns
# Bowtie Drop; don't reuse a token issued for another app.
CF_ACCESS_CLIENT_ID=<id>.access
CF_ACCESS_CLIENT_SECRET=<secret>
```

Restart the dev server after editing `.env.local`. The proxy collapses an Access
login redirect into a `511`, which the app surfaces as an actionable
"Cloudflare Access rejected the request" message rather than an opaque fetch
failure. Note the Access policy on these apps also expects the WARP client to be
running and logged in.
