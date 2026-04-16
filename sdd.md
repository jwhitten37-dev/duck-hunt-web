---
organization: Artificial Intelligence Integration Center (AI2C)
software_name: Duck Hunt Web
software_version: v0.1.0
logo: docs/sdd/logo.png
classification: CUI
prepared_for:
  Organization: AI2C
  Name: CW3 Justin Whitten
  E-mail: justin.w.whitten.mil@army.mil
  Address: 6425 Living Place, Pittsburgh 15206
---

<!--
  NOTE: THIS MARKDOWN TEMPLATE IS NOT GITLAB FLAVORED, AND THUS WILL NOT RENDER CORRECTLY ON GITLAB IT IS DESIGNED TO BE RENDERED BY PANDOC INTO A PDF OR OTHER FORMAT. PLEASE REFER TO THE PANDOC DOCUMENTATION FOR MORE INFORMATION ON HOW TO DO THIS (https://pandoc.org/MANUAL.html#pandocs-markdown).

  THIS TEMPLATE IS DESIGNED TO BE USED WITH THE PANDOC CONTAINER IMAGE (https://code.code.cdso.army.mil/cdso/containers/tool/pandoc)

  THERE ARE PORTIONS OF THIS TEMPLATE THAT SERVE AS A FORM TO BE FILLED IN, AND OTHERS THAT ARE MEANT TO BE EDITED. PLEASE REFER TO THE COMMENTS IN THE TEMPLATE FOR MORE INFORMATION.

  THERE ARE ALSO PORTIONS THAT ARE FILLED OUT IN THEIR ENTIRETY AND ARE TARGETED FOR THE CDSO APPROVAL SYSTEM. DO NOT EDIT THESE UNLESS YOU HAVE A COMPELLING REASON TO OR ARE DEVIATING FROM THE CDSO PROCESS.
-->

<!--
 PORTION MARKINGS: You must use portion markings for all paragraphs and headers in this document. You must have specified the top-level classification of the SDD in the front-matter of this document (under the 'classification' key).

-->

## Classification Instruction

(U) Add the portion marking before each paragraph. This paragraph is marked as Unclassified, as denoted by the '(U)' at the beginning of this paragraph.

## Responsible Organization

(U) Who is the cognizant Authorizing Official (AO) for the organization?

(U) Mr. Joseph Welch

(U) Is your system funded by Title 10 or Title 50?

| Title 10 | Title 50 |
| -------- | -------- |
| x        |          |

### Points of Contact

| Name                     | Role                                | Phone Number   | Email                           |
| ------------------------ | ----------------------------------- | -------------- | ------------------------------- |
| LTC Scott Anderson       | Mission Owner                       | (978) 654-3210 | scott.t.anderson.mil@army.mil   |
| CPT Angus Ferrell        | Information System Owner            | (978) 654-3210 | angus.m.ferrell.mil@army.mil    |
| CW3 Victor Fernandez III | Information System Security Manager | (978) 654-3210 | victor.fernandez19.mil@army.mil |
| CIV Geoffrey Oldland     | Information System Security Officer | (978) 654-3210 | geoffrey.j.oldland.ctr@army.mil |

```{=latex}
\newpage
```

## cDSO Container Technology Pipeline Process

(U) The cDSO is a low cost, secure, flexible, and enterprise-wide containerized application development pipeline. Using the cDSO improves the quality and timeliness of the Risk Management Framework (RMF) process. It distributes the responsibility for security while enabling developers at all levels and organizations to develop and secure containerized applications with unmatched agility.

### Process

a. (U) System Owner completes CSDD and BoE with Cybersecurity Office assistance

b. (U) Cybersecurity Office POC reviews BoE and sends it to ISSM.

c. (U) ISSM reviews BoE and sends it to SCA-V or returns for rework.

d. (U) SCA-V reviews BoE and signs approval or returns for rework.

e. (U) ISSM signs approval. ISSM enters approval in the GitLab Merge Request.

f. (U) SCA-V enters approval in the GitLab Merge Request and Merges the CSDD.

g. (U) Container Software/Pipeline can now be installed, and BoE is incorporated into System BoE

```{=latex}
\newpage
```

## Software Overview

### Purpose

(U) Duck Hunt Web is a browser-based fan recreation of the NES classic Duck Hunt, developed by CW3 Justin Whitten as a demonstration and morale application. It provides authorized DoD personnel with a fully playable game featuring NES-accurate gameplay mechanics, synthesized audio, and animated sprite graphics — all rendered client-side in the browser with no external API dependencies. An arcade-style leaderboard with persistent top-10 scores provides a competitive element for users across sessions.

### Intended Users

a. (U) Intended users include personnel within the Artificial Intelligence Integration Center (AI2C) and other authorized U.S. Army organizations with access to the NIPRNet deployment of the application.

### Identification

(U) Duck Hunt Web is a Government Off-the-Shelf (GOTS) and Free and Open Source Software (FOSS) solution developed by CW3 Justin Whitten. It will be deployed on NIPRNET as a demonstration and morale application.

<!-- Fill in this form's header with your project info and with an 'X' where applicable -->

```{=tex}
\begin{center}
\begin{tabular}{|c|c|}
\hline
\textbf{Software Name} & <Duck Hunt Web> \\
\hline
\textbf{Version}   & v0.1.0 \\
\hline
\end{tabular}

\begin{tabular}{|c|c|}
\hline
 & \textbf{Software Type}  \\
\hline
 & Commercial Off-the-Shelf (COTS)  \\
\hline
X & Government Off-the-Shelf (GOTS)  \\
\hline
X & Free and Open Source Software (FOSS)  \\
\hline
 & Contract-Developed / Modified Off-the-Shelf (MOTS)  \\
\hline
\end{tabular}

\begin{tabular}{|c|c|}
\hline
 & \textbf{Architecture}  \\
\hline
 & Installed on Desktop  \\
\hline
 & Application Server with Database  \\
\hline
X & Application Server with Persistent Storage  \\
\hline
\end{tabular}

% NOTE: Please specify as narrowly as possible the organization/group your users are a part in the table below
\begin{tabular}{|c|c|}
\hline
 & \textbf{Users of the Software}  \\
\hline
X & U.S. Army Cyber Command  \\
\hline
 & U.S. Army Cyber Command and other DoD organizations  \\
\hline
\end{tabular}

\begin{tabular}{|c|c|}
\hline
 & \textbf{Networks} \\
\hline
 & JWICS  \\
\hline
 & SIPRNET  \\
\hline
X & NIPRNET  \\
\hline
 & STEMSNET  \\
\hline
 & Stand-Alone (Name: )  \\
\hline
\end{tabular}

\begin{tabular}{|c|c|}
\hline
 & \textbf{Privacy Act Data} \\
\hline
 & "Business" or "Rolodex" PII  \\
\hline
 & PII  \\
\hline
 & PHI  \\
\hline
\end{tabular}
\end{center}
```

```{=latex}
\newpage
```

## Security Overview

### System Categorization

(U) The system is categorized as LOW Confidentiality, LOW Integrity, and LOW Availability. It does not store or process classified information or PII. The only persistent data is the leaderboard (player-chosen 3-letter initials and numeric scores). Temporary loss or corruption of leaderboard data would not result in mission failure.

**Security categorization of the system that is the consumer of this pipeline**:

<!-- Replace the space in between brackents with an 'x' to select your information category. -->
<!-- More information on information categories can be found in NIST FIPS PUB 199: https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.199.pdf -->

**Confidentiality**

- [x] LOW

- [ ] MODERATE

- [ ] HIGH

**Integrity**

- [x] LOW

- [ ] MODERATE

- [ ] HIGH

**Availability**

- [x] LOW

- [ ] MODERATE

- [ ] HIGH

<!-- (highest classification of data processing, regardless of which network it sits on) -->
<!-- Fill in with the appropriate items and / or add any that apply -->

```{=tex}
\begin{center}
\begin{tabular}{|c|c|}
\hline
 & \textbf{Anticipated Domain(s)} (CUI when filled out) \\
\hline
 & Unclass (IL2) (DEV)   \\
\hline
X & NIPRNet (IL5) (TEST, PROD)  \\
\hline
 & SIPRNet (DEV, TEST, PROD)  \\
\hline
 & JWICS (DEV, TEST, PROD)  \\
\hline
\end{tabular}

\begin{tabular}{|c|c|}
\hline
 & \textbf{Anticipated Dissemination Controls (SIPR)} (CUI when filled out) \\
\hline
 & NOFORN   \\
\hline
 & FRD  \\
\hline
 & NATO  \\
\hline
 & ORCON  \\
\hline
 & PROPIN  \\
\hline
 & RESEN  \\
\hline
 & REL TO USA, AUS, CAN, GBR  \\
\hline
 & REL TO USA, AUS, CAN, GBR, NZL  \\
\hline
 & Other: (Please specify)  \\
\hline
\end{tabular}

\begin{tabular}{|c|c|}
\hline
 & \textbf{Anticipated Dissemination Controls (JWICS)} (CUI when filled out) \\
\hline
 & SI-G   \\
\hline
 & TK  \\
\hline
 & HCS-P  \\
\hline
 & COMINT  \\
\hline
 & MASINT  \\
\hline
 & NATO  \\
\hline
 & REL TO USA, AUS, CAN, GBR \\
\hline
 & REL TO USA, AUS, CAN, GBR, NZL  \\
\hline
 & COMSEC  \\
\hline
 & Other: (Please specify)  \\
\hline
\end{tabular}
\end{center}
```

```{=latex}
\newpage
```

### Architecture Diagram

(U) Duck Hunt Web follows a single-container architecture. A Go HTTP server serves both the compiled TypeScript/Vite frontend as static files and the leaderboard REST API from a single binary on port 8080. All game logic, rendering (Canvas 2D), and audio synthesis (Web Audio API) execute entirely client-side in the user's browser. The only server-side persistence is the leaderboard (`scores.json`), stored in a flat JSON file on a Kubernetes PersistentVolumeClaim mounted at `/app/data`. There are no external API calls, no authentication backends, and no inter-service dependencies.

![Architecture Diagram](docs/sdd/architecture-diagram.png)

```{=latex}
\newpage
```

## Detailed Software Description

### Software Purpose / Goals

(U) The primary goal of Duck Hunt Web is to provide AI2C personnel with an interactive, browser-based demonstration of modern web game development techniques and a morale application deployable within the DoD NIPRNet environment. Key objectives include: delivering NES-accurate duck hunting gameplay entirely client-side with no ROM or proprietary asset distribution, synthesizing all audio programmatically via the Web Audio API, implementing an arcade-style persistent leaderboard backed by a minimal Go REST API, and packaging the entire application as a single container deployable via Docker Compose or Kubernetes.

### Software Functionality

(U) Duck Hunt Web provides the following core functions:

1. **Game Loop**: Ducks spawn from the bottom of the screen in pairs per round. Each duck flies in a randomized direction, bounces off screen edges, and escapes upward if not shot within the time limit. Three shots are available per round and three lives total.

2. **Scoring**: Each duck hit awards 500 points. A perfect round (all ducks hit) adds a 500-point flat bonus. Consecutive perfect rounds apply a streak multiplier (`round_total × streak × 10%`). Losing all ducks in a round costs one life. Floating score popups display points at the duck's landing position.

3. **Dog Animation**: An intro sequence plays at the start of each round — the dog sprints in from the left, sniff-walks toward center screen, perks up on alert, and dives into the bush foreground. After each round the dog emerges to celebrate (holding ducks) or mock the player (no ducks hit).

4. **Audio**: All sounds are synthesized at runtime via the Web Audio API. Sounds include: gunshot, duck hit, duck escape, empty gun click, dog laugh, score fanfare, and a looping background music track. A global mute toggle (M key) applies a smooth gain ramp.

5. **Leaderboard**: A top-10 arcade-style leaderboard stores player initials (3 letters) and scores server-side as JSON, persisted across container restarts via a Kubernetes PVC. Automatically falls back to browser `localStorage` if the Go API is unreachable.

6. **Pause / Quit**: ESC toggles pause from the playing state. Q quits to game over while paused. Click resumes from pause.

### Software Components

| Component | Technology | Function |
| --------- | ---------- | -------- |
| Go HTTP Server | Go 1.22, `net/http` | Serves compiled static frontend assets and the `/api/scores` REST API. Single binary, no external framework. |
| Frontend Application | TypeScript, Vite | Compiled and served as static files. All game logic, state management, and input handling execute client-side in the browser. |
| Game Engine | HTML5 Canvas 2D | Renders all game graphics: NES background sprite, ducks, dog, HUD, title screen, leaderboard, and name entry screens. |
| Audio Engine | Web Audio API | Synthesizes all game audio at runtime using oscillators, noise buffers, and envelope shaping. No audio files are distributed. |
| Sprite Sheet Loader | TypeScript (`SpriteSheet.ts`) | Loads a user-supplied PNG sprite atlas and draws named frames. Gracefully falls back to canvas primitives if the sprite sheet is absent. |
| Leaderboard Storage | `scores.json` on PVC | Flat JSON file persisted on a Kubernetes PersistentVolumeClaim. Stores the top-10 scores with player initials. |
| Client Fallback Storage | Browser `localStorage` | Used automatically when the Go API is unreachable (development without backend). |

### User Interface

(U) The application is a full-canvas HTML5 experience. All screens — the animated title card, gameplay HUD, pause overlay, leaderboard display, and 3-letter initials entry — are rendered exclusively via the Canvas 2D API. There are no traditional HTML form elements in the game UI.

(U) Input is handled via mouse clicks and keyboard events. The browser cursor is hidden during gameplay and replaced by a crosshair drawn on the canvas. Keyboard controls include: click to shoot or advance screens, ESC to pause, Q to quit, M to mute, and arrow keys with Enter/Space for leaderboard name entry.

### Configuration Management

(U) Application configuration is managed entirely through environment variables injected at container startup via Kubernetes ConfigMaps.

- **`PORT`**: HTTP listen port for the Go server (default: `8080`).

- **`STATIC_DIR`**: Path to the compiled Vite frontend assets served as static files (default: `./static`; production: `/app/static`).

- **`SCORES_FILE`**: Path to the leaderboard JSON file (default: `./scores.json`; production: `/app/data/scores.json`).

(U) No secrets or sensitive configuration values are required. There is no database connection string, no authentication client ID, and no external API key.

### Development and Testing

(U) Development follows an iterative workflow. The application consists of two primary components: a TypeScript/Vite frontend and a Go HTTP backend.

- **Frontend Development**: Vite provides hot module replacement (HMR) for rapid iteration. The Vite dev server proxies `/api` requests to the Go server automatically, allowing full-stack local development without rebuilding.

- **Backend Development**: The Go server is built with a single `go build` command and has no external runtime dependencies beyond the standard library.

- **CI/CD**: All code is managed in a Git repository and is subject to automated testing and security scans via the cDSO pipeline on every commit.

- **Container Testing**: `docker compose up --build` provides a single-command full-stack test environment matching production behavior.

#### Milestones

(U) Project progress is measured by the completion of versioned feature sets.

- v0.1.0: Initial release — full NES-accurate gameplay, duck and dog sprite animations, synthesized Web Audio API sounds, arcade leaderboard with Go backend, Docker multi-stage build, Kubernetes manifests.

#### Failure Conditions & Mitigations

| Failure Condition | Impact | Mitigation |
| ----------------- | ------ | ----------- |
| Go server fails/crashes | Users cannot access the application or submit scores. | Kubernetes will automatically restart the failing pod. |
| PVC unavailable | Leaderboard scores cannot be read or written. | Application automatically falls back to `localStorage` for leaderboard data. |
| `sprites.png` absent from container | Game renders with canvas primitive fallback graphics instead of sprite sheet. | Automatic fallback — gameplay is fully functional without the sprite sheet. |
| Browser lacks Canvas 2D or Web Audio API support | Game cannot render or produce audio. | Application requires a modern browser (Chrome, Firefox, Edge). No legacy browser support is planned. |
| User submits score while API is unreachable | Score is written to `localStorage` only and will not appear on the server-side leaderboard. | User is notified; score is preserved locally. |


```{=latex}
\newpage
```

## Technical Overview

### Networking Capabilities

(U) Duck Hunt Web is a single-container web application with no inter-service communication. The Go HTTP server handles all traffic — both static file serving and the leaderboard API — from a single port (8080). All user-facing traffic flows through the Kubernetes Ingress over HTTPS (TLS 1.2 or higher). There are no external API calls, no outbound network dependencies, and no communication between services within the cluster.

### Ports / Protocol / Services

| Service/Component | Port(s) | Protocol(s) | Purpose |
| ----------------- | ------- | ----------- | ------- |
| Go HTTP Server | 8080 | TCP | Internal port serving static frontend files and the `/api/scores` REST API. |
| Kubernetes Ingress | 443 | TCP | External HTTPS entry point for all user traffic. TLS terminated at the Ingress. |

### Encryption

(U) Encryption in Transit: All user-facing traffic is encrypted via TLS (HTTPS) as enforced by the Kubernetes Ingress. Internal cluster traffic between the Ingress and the Go server pod is HTTP over the cluster-internal network.

(U) Encryption at Rest: The only persistent data is `scores.json` stored on a Kubernetes PersistentVolumeClaim backed by an Azure Managed Disk. Azure Managed Disks are encrypted at rest by default using platform-managed keys (Azure Storage Service Encryption). No application-level encryption of this file is implemented, as it contains only non-sensitive leaderboard data (player initials and scores).

### Authentication

(U) Duck Hunt Web does not implement application-level user authentication. No user accounts, credentials, or identity tokens are collected or stored. Access control is enforced at the Kubernetes Ingress and network boundary layer by the AKS platform and cDSO infrastructure. The only persistent user data is a voluntarily entered 3-letter display name and numeric score submitted to the leaderboard.

### Operating System

(U) The application is designed and tested to run exclusively on Linux-based container operating systems using a multi-stage Docker build.

- **Frontend Build Stage**: node:20-alpine

- **Backend Build Stage**: golang:1.22-alpine

- **Final Runtime Stage**: alpine:3.19 (minimal runtime image containing only the Go binary and compiled static assets)

- **Target Architecture**: linux/amd64

### Role-Based Access Control (RBAC)

(U) Duck Hunt Web does not implement internal role-based access control. All users who can reach the application have identical access: play the game and submit a leaderboard score. No administrative interface or privileged operations exist within the application. Access restriction is the sole responsibility of the Kubernetes Ingress configuration and network boundary.

<!-- START: DO NOT EDIT -->

### Audit Capabilities

This application uses the Continuous Integration (CI) services provided through Community DevSecOps (CDSO), which is an inner-sourced CI solution provided for use within the Department of the Army. The pipelines provided by CDSO are all open and auditable for anybody within the department of the Army. The source code for all components can be found here: <https://code.code.cdso.army.mil/cdso>. The documentation can be found here: <https://cdso.pages.code.cdso.army.mil/>.

### Dependencies

This application's dependencies can be viewed by looking at the pipeline artifacts for the most recent CI iteration under the `syft-grype` job artifacts.

This job produces a `syft.json` artifact which contains the Software Bill of Materials (SBOM) for the application image.

### Assumptions

List any assumptions made during the design of this application. This could include assumptions about the network or operating environment, assumptions about the end-user, etc.

```{=latex}
\newpage
```

## Constraints

List what constraints there are that affect this application in its design, implementation, deployment, etc.

### Scanning Tools & Remediation

This application uses all of the scanning tools as defined in the `application-security-review` Pipeline from CDSO. You can find details about the pipeline and its tools here: <https://cdso.pages.code.cdso.army.mil/components/pipelines/#application-security-reviewyml> .

Its definition can be found here: <https://code.code.cdso.army.mil/cdso/cdso/-/blob/main/pipelines/application-security-review.yml>.

<!-- END: DO NOT EDIT -->

### Security Technical Implementation Guides (STIGs)

(U) The containerized application will be deployed on a Kubernetes cluster that is hardened according to the latest DoD Kubernetes Security Technical Implementation Guide (STIG). The application's base images (Alpine Linux) are STIG'd by the cDSO platform.

```{=latex}
\newpage
```

# Appendix A -- References

1. (U) HTML Canvas API: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API

2. (U) Web Audio API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API

3. (U) Vite Documentation: https://vitejs.dev/

4. (U) Go `net/http` Documentation: https://pkg.go.dev/net/http

5. (U) Keep a Changelog: https://keepachangelog.com/en/1.1.0/

```{=latex}
\newpage
```

# Appendix B -- Acronyms

Make sure to add any acronyms used in this CSDD that are pertinent to your organization and application/pipeline.

| Acronym | Definition                                     |
| ------- | ---------------------------------------------- |
| AI2C    | Artificial Intelligence Integration Center
| AO      | Authorizing Official
| API     | Application Programming Interface
| CDSO    | Community DevSecOps
| CI / CD | Continuous Integration / Continuous Deployment
| GOTS    | Government Off-the-Shelf
| GUI     | Graphical User Interface
| HMR     | Hot Module Replacement
| HUD     | Heads-Up Display
| ISSM    | Information System Security Manager
| NES     | Nintendo Entertainment System
| PVC     | PersistentVolumeClaim
| RBAC    | Role-Based Access Control
| RMF     | Risk Management Framework
| SDD     | Software Design Document
| SPA     | Single-Page Application
| STIG    | Security Technical Implementation Guide
| TLS     | Transport Layer Security
| UI      | User Interface

```{=latex}
\newpage
```

## SRG (Security Requirements Guide)

(U) The Cloud Computing (CC) Security Requirements Guide (SRG) is the applicable SRG for the system these containers support, as the application is hosted within a DoD-approved cloud environment.
