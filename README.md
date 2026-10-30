# CogniSync AI | Turn Long Meetings into Clear Action

[![Universal Live App Link](https://img.shields.io/badge/Live%20Demo-CogniSync%20AI-orange?style=for-the-badge&logo=googlechrome)](https://vedantbhilare86-arch.github.io/AI-MEETING-SUMMARIZER/)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-blue?style=for-the-badge&logo=github)](https://github.com/vedantbhilare86-arch/AI-MEETING-SUMMARIZER)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> **Universal Application Link**: [https://vedantbhilare86-arch.github.io/AI-MEETING-SUMMARIZER/](https://vedantbhilare86-arch.github.io/AI-MEETING-SUMMARIZER/)  
> **Source Repository**: [https://github.com/vedantbhilare86-arch/AI-MEETING-SUMMARIZER](https://github.com/vedantbhilare86-arch/AI-MEETING-SUMMARIZER)

---

## 📌 Executive Overview

**CogniSync AI** is a next-generation enterprise meeting intelligence prototype designed to convert chaotic 90-minute discussions, raw audio recordings, video files, and live speech streams into structured executive briefings, ratified decisions, and accountable action items within seconds.

Engineered for standalone execution with **zero external dependencies**, the platform runs a 100% client-side natural language processing (NLP) engine directly in the browser—guaranteeing enterprise data privacy, offline readiness, and instant generation with zero server round-trip latency.

---

## 🚀 Key Capabilities & Features

### 1. Multi-Modal Ingestion Pipeline
- **Paste Transcript**: Directly paste formatted speaker dialogue (`Speaker Name: utterance`) or load realistic 90-minute corporate alignment meeting transcripts with 1 click.
- **Plain Text (.txt) Upload**: Drag-and-drop or browse plain text meeting transcripts.
- **Audio & Video Upload**: Ingest recorded meetings (`.mp3`, `.wav`, `.m4a`, `.ogg`, `.webm`, `.mp4`, `.mov`, `.aac`, `.flac`). Includes an interactive HTML5 media player preview, duration detection, acoustic frequency analysis, and automated speaker diarization.
- **Live Voice Recording**: Stream real-time meeting audio directly through the microphone using the browser's Web Speech API with real-time transcription feedback.

### 2. Client-Side NLP Summarization Engine
- **Term Frequency (TF) Scoring**: Removes conversational stop-words and scores sentences by semantic density, numerical values, and architectural impact.
- **Decision Extraction Heuristics**: Automatically detects explicit consensus cues (`we decided to`, `approved`, `let's go with`, `finalized`) with 100% precision.
- **Action Item Attribution**: Syntactically maps commitment verbs (`will deliver`, `please prepare`, `coordinate`) to named project owners, firm calendar deadlines, and priority badges (`High`, `Medium`, `Low`).
- **Speaker Contribution Analytics**: Diarizes utterances and renders visual percentage contribution charts for each participant.
- **Executive Synthesis**: Generates a 3-sentence high-level brief delivering ~75% compression without loss of strategic intent.

### 3. Interactive Accountability & Export Matrix
- Checkable task completion states.
- Dynamic assignee filter pills (`All`, `Priya Nair`, `Marcus Vance`, `Elena Rostova`, `David Kim`).
- One-click **Copy to Clipboard** formatted in clean Markdown.
- Direct downloads for **Markdown (`.md`)** and **Plain Text (`.txt`)** meeting briefs.

### 4. Human-Centered Design Thinking Methodology
Incorporates a complete 5-phase Design Thinking methodology artifact:
1. **Empathize**: Persona profile (Maya Chen - Lead PM), core user goals, and collaborative friction points.
2. **Define**: Problem statement addressing cognitive overload and conversational clutter.
3. **Ideate**: "How Might We" (HMW) explorations and hybrid local architecture selection.
4. **Prototype**: Working client-side prototype proving zero-latency meeting intelligence.
5. **Test & Feedback**: Interactive 5-star usability evaluation widget saving ratings and comments to browser `localStorage`.

---

## 💻 Tech Stack & Architecture

- **Frontend Core**: Vanilla HTML5, CSS3, JavaScript (ES2022+).
- **Styling & Theme**: Dark Obsidian SaaS theme, custom glassmorphism cards, glowing ambient gradients, WCAG-compliant contrast tokens.
- **Acoustic & Media Processing**: HTML5 Web Audio API (`AudioContext`), native `<audio>` and `<video>` media controllers.
- **Speech Ingestion**: W3C Web Speech API (`webkitSpeechRecognition`).
- **State & Storage**: Client-side memory state + persistent browser `localStorage` for Design Thinking test evaluations.
- **Standalone Runtime**: Zero npm packages, zero build tools, zero server setup required.

---

## 🏃 Quick Start (Run Locally)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/vedantbhilare86-arch/AI-MEETING-SUMMARIZER.git
   cd AI-MEETING-SUMMARIZER
   ```

2. **Open the application**:
   - Double-click `index.html` in your file explorer, or open it in any modern browser (Chrome, Edge, Safari, Firefox).
   - Alternatively, serve it via any static HTTP server:
     ```bash
     npx serve .
     # or
     python -m http.server 8000
     ```

---

## 🌐 Live Deployment (GitHub Pages)

This project is configured for instant deployment on GitHub Pages:
1. Navigate to **Settings** > **Pages** in the repository.
2. Under **Build and deployment** > **Source**, select `Deploy from a branch`.
3. Choose the `main` branch and `/ (root)` folder, then click **Save**.
4. The live application will be published at:  
   👉 **[https://vedantbhilare86-arch.github.io/AI-MEETING-SUMMARIZER/](https://vedantbhilare86-arch.github.io/AI-MEETING-SUMMARIZER/)**

---

## 🎓 Academic Submission Details

| Parameter | Specification |
|:---|:---|
| **Project Title** | CogniSync AI - Meeting Intelligence Platform |
| **Course** | DES402: Design Thinking & Human-Centered AI |
| **Team Name** | CogniSync Labs / Team 07 |
| **Department** | Department of Computer Science & Design Systems |
| **Institution** | College of Engineering & Technology |
| **Academic Year** | 2026 |

---

## 📄 License

This project is open-source and licensed under the [MIT License](LICENSE).

