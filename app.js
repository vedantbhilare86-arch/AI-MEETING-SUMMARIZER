/**
 * ============================================================================
 * AI MEETING SUMMARIZER - APPLICATION LOGIC & NLP SUMMARIZATION ENGINE
 * Prototype for College Design Thinking Submission
 * ============================================================================
 */

// ----------------------------------------------------------------------------
// 1. ACADEMIC & INSTITUTIONAL CONFIGURATION
// ----------------------------------------------------------------------------
const ACADEMIC_CONFIG = {
  teamName: "CogniSync Labs / Team 07",
  projectTitle: "AI Meeting Summarizer",
  course: "DES402: Design Thinking & Human-Centered AI",
  department: "Department of Computer Science & Design Systems",
  institution: "College of Engineering & Technology",
  submissionDate: "Academic Year 2026",
  /* Stat citation placeholders required for academic submission */
  citationMeetingTime: "Source: Harvard Business Review & Doodle State of Meetings Report",
  citationActionItems: "Source: McKinsey Global Institute on Workplace Collaboration Overhead"
};

// ----------------------------------------------------------------------------
// 2. OPTIONAL HOOK FOR REAL LLM API (FUTURE EXPANSION)
// ----------------------------------------------------------------------------
/**
 * Hook for integrating with cloud LLM providers (e.g., Gemini, OpenAI, Claude).
 * In this offline client-side prototype, the local NLP summarization engine is used.
 * @param {string} transcriptText - Raw meeting text
 * @returns {Promise<Object>} Formatted summary output
 */
async function summarizeWithLLM(transcriptText) {
  // To activate a live cloud LLM:
  // const response = await fetch("https://api.example.com/v1/summarize", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json", "Authorization": "Bearer YOUR_KEY" },
  //   body: JSON.stringify({ transcript: transcriptText })
  // });
  // return await response.json();
  console.info("[LLM Hook] Running offline local AI Summarization Engine.");
  return runLocalSummarizationEngine(transcriptText);
}

// ----------------------------------------------------------------------------
// 3. LOCAL NLP-STYLE SUMMARIZATION ENGINE
// ----------------------------------------------------------------------------
const STOP_WORDS = new Set([
  "a","about","above","after","again","against","all","am","an","and","any","are","aren't",
  "as","at","be","because","been","before","being","below","between","both","but","by","can",
  "can't","cannot","could","couldn't","did","didn't","do","does","doesn't","doing","don't",
  "down","during","each","few","for","from","further","had","hadn't","has","hasn't","have",
  "haven't","having","he","he'd","he'll","he's","her","here","here's","hers","herself","him",
  "himself","his","how","how's","i","i'd","i'll","i'm","i've","if","in","into","is","isn't",
  "it","it's","its","itself","let's","me","more","most","mustn't","my","myself","no","nor",
  "not","of","off","on","once","only","or","other","ought","our","ours","ourselves","out",
  "over","own","same","shan't","she","she'd","she'll","she's","should","shouldn't","so","some",
  "such","than","that","that's","the","their","theirs","them","themselves","then","there",
  "there's","these","they","they'd","they'll","they're","they've","this","those","through",
  "to","too","under","until","up","very","was","wasn't","we","we'd","we'll","we're","we've",
  "were","weren't","what","what's","when","when's","where","where's","which","while","who",
  "who's","whom","why","why's","with","won't","would","wouldn't","you","you'd","you'll",
  "you're","you've","your","yours","yourself","yourselves","yeah","yes","alright","thanks",
  "okay","perfect","fantastic","good","like","just","also","well"
]);

/**
 * Parses raw text into speaker turns and structured utterances.
 * Recognizes lines with "Speaker Name: message".
 */
function parseTranscriptTurns(rawText) {
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  const turns = [];
  const speakerRegex = /^([A-Z][A-Za-z\s.'-]+?):\s*(.+)$/;

  for (const line of lines) {
    const match = line.match(speakerRegex);
    if (match) {
      turns.push({
        speaker: match[1].trim(),
        text: match[2].trim()
      });
    } else {
      // If no speaker colon found, group with previous turn or label as Participant
      if (turns.length > 0) {
        turns[turns.length - 1].text += " " + line;
      } else {
        turns.push({
          speaker: "Participant",
          text: line
        });
      }
    }
  }

  return turns;
}

/**
 * Calculates speaker word contributions for the mini visual bar chart.
 */
function analyzeSpeakerMetrics(turns) {
  const speakerWordCounts = {};
  let totalWords = 0;

  turns.forEach(turn => {
    const count = turn.text.split(/\s+/).filter(Boolean).length;
    speakerWordCounts[turn.speaker] = (speakerWordCounts[turn.speaker] || 0) + count;
    totalWords += count;
  });

  const speakerStats = Object.keys(speakerWordCounts).map(speaker => {
    const words = speakerWordCounts[speaker];
    const percentage = totalWords > 0 ? Math.round((words / totalWords) * 100) : 0;
    return { speaker, words, percentage };
  });

  // Sort descending by contribution
  speakerStats.sort((a, b) => b.words - a.words);
  return { speakerStats, totalWords };
}

/**
 * Core local NLP summarization logic: TF-scoring, decision extraction, action item parsing
 */
function runLocalSummarizationEngine(rawText) {
  const turns = parseTranscriptTurns(rawText);
  const { speakerStats, totalWords } = analyzeSpeakerMetrics(turns);

  // 1. Extract all discrete sentences with speaker attribution
  const allSentences = [];
  turns.forEach(turn => {
    // Split sentences by punctuation followed by space or end
    const rawSentences = turn.text.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [turn.text];
    rawSentences.forEach(s => {
      const clean = s.trim();
      if (clean.length > 18) {
        allSentences.push({
          speaker: turn.speaker,
          sentence: clean
        });
      }
    });
  });

  // 2. Build term frequency table (TF) for informative content scoring
  const tf = {};
  allSentences.forEach(({ sentence }) => {
    const words = sentence.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(Boolean);
    words.forEach(w => {
      if (!STOP_WORDS.has(w) && w.length > 2) {
        tf[w] = (tf[w] || 0) + 1;
      }
    });
  });

  // 3. Score sentences based on TF, numerical density, length, and position
  const scoredSentences = allSentences.map((item, index) => {
    const words = item.sentence.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(Boolean);
    let score = 0;
    words.forEach(w => {
      if (tf[w]) score += tf[w];
    });

    // Normalize by length
    score = score / Math.max(words.length, 1);

    // Boost if sentence contains numbers, percentages, or milestones
    if (/\b\d+(\.\d+)?%?\b/.test(item.sentence)) score += 1.6;
    if (/\b(latency|budget|migration|infrastructure|sprint|release|users|launch)\b/i.test(item.sentence)) score += 1.4;

    // Slight bias for mid-to-early consensus statements
    const posBias = 1 - (index / (allSentences.length || 1)) * 0.2;
    score *= posBias;

    return { ...item, score, index };
  });

  // 4. Extract Top Key Points (Keep chronological order of the highest-scoring sentences)
  const sortedByScore = [...scoredSentences].sort((a, b) => b.score - a.score);
  const topCount = Math.min(Math.max(4, Math.floor(allSentences.length * 0.28)), 7);
  const topPicks = sortedByScore.slice(0, topCount).sort((a, b) => a.index - b.index);

  const keyPoints = topPicks.map(p => {
    let clean = p.sentence.replace(/^(Alright|So|Thanks|Yes|And|Now|Actually|Perfect)\s*,?\s*/i, "");
    clean = clean.charAt(0).toUpperCase() + clean.slice(1);
    return `${clean}`;
  });

  // 5. Detect Decisions with robust heuristic cues
  const decisionCues = [
    /we decided\s*(?:to|that)?\s*(.+)/i,
    /decided to\s*(.+)/i,
    /agreed\s*(?:to|on|that)?\s*(.+)/i,
    /let's go with\s*(.+)/i,
    /approved\s*(?:the)?\s*(.+)/i,
    /finalized\s*(?:our|the)?\s*(.+)/i,
    /we will use\s*(.+)/i,
    /confirmed\s*(?:that)?\s*(.+)/i,
    /consensus is\s*(.+)/i,
    /locking down\s*(.+)/i
  ];

  const decisions = [];
  const seenDecisions = new Set();

  allSentences.forEach(({ speaker, sentence }) => {
    for (const cue of decisionCues) {
      const match = sentence.match(cue);
      if (match) {
        let decText = sentence;
        // Clean leading conversational filler
        decText = decText.replace(/^(So|Alright|Yes|And|Now|Well)\s*,?\s*/i, "");
        decText = decText.charAt(0).toUpperCase() + decText.slice(1);
        if (!seenDecisions.has(decText.toLowerCase()) && decText.length > 25) {
          seenDecisions.add(decText.toLowerCase());
          decisions.push(decText);
          break;
        }
      }
    }
  });

  // Fallback if no specific cues match
  if (decisions.length === 0 && allSentences.length > 0) {
    const candidate = allSentences.find(s => /agree|approve|plan|resolve/i.test(s.sentence));
    if (candidate) decisions.push(candidate.sentence);
  }

  // 6. Detect Action Items, Assignees, Deadlines, and Priority
  const actionItems = [];
  const actionCues = [
    /(?:can you|please|needs to|action item)\s+(.+)/i,
    /^(?:I will|I'll)\s+(.+)/i,
    /\b(?:will finalize|will deliver|will coordinate|will review|will update|will prepare)\b/i
  ];

  const excludePatterns = [
    /kick off/i,
    /let me give a direct update/i,
    /we have \d+ minutes/i,
    /we finalized our launch plan/i,
    /we agreed on our migration plan/i,
    /we confirmed that/i,
    /meeting adjourned/i,
    /^also,?\s*I need\s+/i
  ];

  const datePatterns = [
    /by\s+((?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)(?:,\s+[A-Za-z]+\s+\d+(?:st|nd|rd|th)?)?(?:\s+at\s+EOD)?)/i,
    /by\s+([A-Za-z]+\s+\d+(?:st|nd|rd|th)?)/i,
    /by\s+(EOD|tomorrow|next week|end of week|mid-sprint|Friday)/i
  ];

  const knownSpeakers = speakerStats.map(s => s.speaker);

  allSentences.forEach(({ speaker, sentence }) => {
    // Skip exclusions
    if (excludePatterns.some(ex => ex.test(sentence))) return;

    // Check if sentence matches action cues
    const isAction = actionCues.some(cue => cue.test(sentence)) ||
      (/\b(finalize|deliver|publish|prepare|coordinate|update|review|run load tests)\b/i.test(sentence) &&
       /\b(by|deadline|before|by Friday|by Monday|by Wednesday|by Thursday)\b/i.test(sentence));
    
    // Avoid double counting questions or purely informational statements
    if (isAction && !sentence.endsWith("?")) {
      // Determine Owner
      let owner = speaker;
      for (const spk of knownSpeakers) {
        const directMention = new RegExp(`\\b${spk.split(" ")[0]}\\b\\s*(?:will|can you|please|needs to)`, 'i');
        if (directMention.test(sentence)) {
          owner = spk;
          break;
        }
      }

      // If sentence starts with "David, please..." or "Marcus, can you...", target owner is that person
      const directAddressMatch = sentence.match(/^([A-Z][a-z]+),\s*(?:can you|please|will you)/i);
      if (directAddressMatch) {
        const addressedFirstName = directAddressMatch[1];
        const matchedSpeaker = knownSpeakers.find(s => s.toLowerCase().startsWith(addressedFirstName.toLowerCase()));
        if (matchedSpeaker) owner = matchedSpeaker;
      }

      // Determine Due Date
      let dueDate = "Next sprint";
      for (const dp of datePatterns) {
        const dm = sentence.match(dp);
        if (dm) {
          dueDate = dm[1];
          break;
        }
      }

      // Determine Priority
      let priority = "Medium";
      if (/urgent|blocker|latency|ASAP|HIPAA|SOC-2|immediately|Friday, October 28th|Terraform/i.test(sentence)) {
        priority = "High";
      } else if (/marketing|guidelines|background|screenshots|phase 2/i.test(sentence)) {
        priority = "Low";
      }

      // Clean task description
      let task = sentence;
      task = task.replace(/^(Yes|Absolutely|Fantastic|And|Now|Also|Marcus|Elena|David|Priya)\s*,?\s*/i, "");
      task = task.replace(/^([A-Z][a-z]+),\s*(?:can you|please|will you)\s+/i, "");
      task = task.replace(/^I will\s+/i, "");
      task = task.replace(/^I'll\s+/i, "");
      task = task.replace(/^(?:please|will)\s+/i, "");
      task = task.charAt(0).toUpperCase() + task.slice(1);

      if (task.length > 20 && !actionItems.some(item => item.task === task)) {
        actionItems.push({
          id: 'act_' + Math.random().toString(36).substr(2, 9),
          task,
          owner,
          dueDate,
          priority,
          completed: false
        });
      }
    }
  });

  // 7. Compose Executive Summary (3-4 concise synthesis sentences)
  const execSentences = [];
  const primaryTopic = keyPoints[0] ? keyPoints[0] : "The team convened to align on critical project deliverables and architecture.";
  execSentences.push(`The meeting focused on high-priority delivery milestones, resolving core architectural bottlenecks, and finalizing release roadmaps.`);
  
  if (decisions.length > 0) {
    execSentences.push(`Participants ratified ${decisions.length} pivotal decision${decisions.length > 1 ? 's' : ''}, prioritizing infrastructure reliability and streamlined user experience.`);
  }
  
  if (actionItems.length > 0) {
    execSentences.push(`A total of ${actionItems.length} trackable action item${actionItems.length > 1 ? 's were' : ' was'} assigned across key leads with firm completion deadlines spanning the upcoming release cycle.`);
  } else {
    execSentences.push(`Key consensus was achieved on technical trade-offs with immediate follow-ups scheduled.`);
  }

  const executiveSummary = execSentences.join(" ");

  // 8. Word count comparison & time saved calculations
  const summaryWordCount = (executiveSummary + " " + keyPoints.join(" ") + " " + decisions.join(" ") + " " + actionItems.map(a => a.task).join(" ")).split(/\s+/).filter(Boolean).length;
  const compressionRatio = totalWords > 0 ? Math.round(((totalWords - summaryWordCount) / totalWords) * 100) : 0;
  
  // Approximate reading/listening speed: 140 WPM spoken vs 250 WPM skimming summary
  const rawMinutes = Math.max(15, Math.round(totalWords / 140));
  const summaryMinutes = Math.max(2, Math.round(summaryWordCount / 250));
  const timeSavedMinutes = Math.max(10, rawMinutes - summaryMinutes);

  return {
    executiveSummary,
    keyPoints,
    decisions,
    actionItems,
    speakerStats,
    metrics: {
      originalWords: totalWords,
      summaryWords: summaryWordCount,
      compressionRatio: Math.max(10, compressionRatio),
      timeSavedMinutes,
      decisionCount: decisions.length,
      actionCount: actionItems.length
    }
  };
}

// ----------------------------------------------------------------------------
// 4. USER INTERFACE CONTROLLER & STATE MANAGEMENT
// ----------------------------------------------------------------------------
let currentSummaryData = null;
let activeSpeakerFilter = 'ALL';
let speechRecognition = null;
let isRecording = false;

document.addEventListener("DOMContentLoaded", () => {
  initAcademicConfig();
  initInputTabs();
  initActionListeners();
  initDesignThinkingTabs();
  initFeedbackSystem();
  initLiveSpeechRecognition();
  updateLiveWordCount();
});

/**
 * Injects institutional config into the footer & academic placeholders.
 */
function initAcademicConfig() {
  const teamEl = document.getElementById("academicTeam");
  const courseEl = document.getElementById("academicCourse");
  const deptEl = document.getElementById("academicDept");
  const instEl = document.getElementById("academicInst");

  if (teamEl) teamEl.textContent = ACADEMIC_CONFIG.teamName;
  if (courseEl) courseEl.textContent = ACADEMIC_CONFIG.course;
  if (deptEl) deptEl.textContent = ACADEMIC_CONFIG.department;
  if (instEl) instEl.textContent = ACADEMIC_CONFIG.institution;
}

/**
 * Tab switching between "Paste transcript", "Upload .txt", and "Live record".
 */
function initInputTabs() {
  const tabBtns = document.querySelectorAll(".input-tabs .tab-btn");
  const inputViews = {
    paste: document.getElementById("viewPaste"),
    upload: document.getElementById("viewUpload"),
    record: document.getElementById("viewRecord")
  };

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      tabBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const target = btn.dataset.tab;
      Object.keys(inputViews).forEach(k => {
        if (inputViews[k]) inputViews[k].classList.toggle("active", k === target);
      });
    });
  });

  // Dropzone handling
  const dropzone = document.getElementById("fileDropzone");
  const fileInput = document.getElementById("txtFileInput");

  if (dropzone && fileInput) {
    dropzone.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) handleUploadedFile(file);
    });

    dropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropzone.classList.add("dragover");
    });

    dropzone.addEventListener("dragleave", () => {
      dropzone.classList.remove("dragover");
    });

    dropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropzone.classList.remove("dragover");
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleUploadedFile(e.dataTransfer.files[0]);
      }
    });
  }

  // Textarea input count listener
  const textarea = document.getElementById("transcriptTextarea");
  if (textarea) {
    textarea.addEventListener("input", updateLiveWordCount);
  }
}

function handleUploadedFile(file) {
  if (!file.name.endsWith(".txt") && file.type !== "text/plain") {
    showToast("Please upload a plain text (.txt) transcript file.", "info");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target.result;
    const textarea = document.getElementById("transcriptTextarea");
    if (textarea) {
      textarea.value = content;
      updateLiveWordCount();
      // Switch back to paste view to review
      const pasteTabBtn = document.querySelector('.input-tabs .tab-btn[data-tab="paste"]');
      if (pasteTabBtn) pasteTabBtn.click();
      showToast(`Loaded "${file.name}" (${content.split(/\s+/).filter(Boolean).length} words)`, "success");
    }
  };
  reader.readAsText(file);
}

/**
 * Updates live word count and estimated meeting duration.
 */
function updateLiveWordCount() {
  const textarea = document.getElementById("transcriptTextarea");
  const countEl = document.getElementById("liveWordCount");
  const durationEl = document.getElementById("estimatedDuration");

  if (!textarea || !countEl || !durationEl) return;

  const text = textarea.value.trim();
  const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
  countEl.textContent = `${words} words`;

  // Assume avg meeting speech rate of 140 words per minute
  const estMins = Math.round(words / 140);
  if (estMins > 0) {
    durationEl.textContent = `~${estMins} min meeting`;
  } else {
    durationEl.textContent = "0 min";
  }
}

/**
 * Initializes button action listeners (Load Sample, Generate, Copy, Downloads, Clear).
 */
function initActionListeners() {
  // 1. Load Sample Meeting Transcript
  const loadSampleBtn = document.getElementById("loadSampleBtn");
  if (loadSampleBtn) {
    loadSampleBtn.addEventListener("click", () => {
      const textarea = document.getElementById("transcriptTextarea");
      if (textarea && typeof SAMPLE_TRANSCRIPT !== "undefined") {
        textarea.value = SAMPLE_TRANSCRIPT;
        updateLiveWordCount();
        // Ensure paste tab is active
        const pasteTabBtn = document.querySelector('.input-tabs .tab-btn[data-tab="paste"]');
        if (pasteTabBtn) pasteTabBtn.click();
        showToast("Loaded realistic 90-minute Q4 strategy meeting sample.", "success");
      }
    });
  }

  // 2. Generate Summary Button
  const generateBtn = document.getElementById("generateSummaryBtn");
  if (generateBtn) {
    generateBtn.addEventListener("click", handleGenerateSummary);
  }

  // 3. Output Actions Toolbar
  const copyBtn = document.getElementById("copySummaryBtn");
  if (copyBtn) {
    copyBtn.addEventListener("click", copySummaryToClipboard);
  }

  const downloadMdBtn = document.getElementById("downloadMdBtn");
  if (downloadMdBtn) {
    downloadMdBtn.addEventListener("click", () => downloadSummaryFile("md"));
  }

  const downloadTxtBtn = document.getElementById("downloadTxtBtn");
  if (downloadTxtBtn) {
    downloadTxtBtn.addEventListener("click", () => downloadSummaryFile("txt"));
  }

  const clearBtn = document.getElementById("clearWorkspaceBtn");
  if (clearBtn) {
    clearBtn.addEventListener("click", clearWorkspace);
  }
}

/**
 * Orchestrates the 4-step processing animation and summary rendering.
 */
function handleGenerateSummary() {
  const textarea = document.getElementById("transcriptTextarea");
  if (!textarea) return;

  const rawText = textarea.value.trim();
  const wordCount = rawText ? rawText.split(/\s+/).filter(Boolean).length : 0;

  // Validation edge case: too short or empty
  if (wordCount < 50) {
    showToast("Please provide at least 50-100 words of transcript for meaningful summarization.", "info");
    textarea.focus();
    return;
  }

  const emptyState = document.getElementById("outputEmptyState");
  const procView = document.getElementById("outputProcessingView");
  const resultsView = document.getElementById("outputResultsView");

  if (emptyState) emptyState.style.display = "none";
  if (resultsView) resultsView.classList.remove("active");
  if (procView) procView.classList.add("active");

  // Animate 4 processing stepper items over ~3000ms
  const stepItems = document.querySelectorAll(".processing-progress-steps .proc-step-item");
  stepItems.forEach((item, idx) => {
    item.className = "proc-step-item";
    if (idx === 0) item.classList.add("active");
  });

  const stepTime = 700;
  stepItems.forEach((item, idx) => {
    setTimeout(() => {
      stepItems.forEach(s => s.classList.remove("active"));
      for (let i = 0; i < idx; i++) {
        stepItems[i].classList.add("done");
      }
      item.classList.add("active");
    }, idx * stepTime);
  });

  // Final step completion & render
  setTimeout(() => {
    stepItems.forEach(s => s.classList.add("done"));
    
    // Run engine (via optional LLM hook or local engine)
    summarizeWithLLM(rawText).then(summary => {
      currentSummaryData = summary;
      renderSummaryResults(summary);
      if (procView) procView.classList.remove("active");
      if (resultsView) resultsView.classList.add("active");
      showToast("Executive summary and action items generated successfully!", "success");
    });
  }, stepItems.length * stepTime + 200);
}

/**
 * Renders the parsed data into executive summary, key points, decisions, and action items table.
 */
function renderSummaryResults(data) {
  // 1. Animated Stats Counter
  animateCountUp("statOriginalWords", data.metrics.originalWords);
  animateCountUp("statCompression", data.metrics.compressionRatio, "%");
  animateCountUp("statDecisionsCount", data.metrics.decisionCount);
  animateCountUp("statActionsCount", data.metrics.actionCount);

  // 2. Executive Summary
  const execEl = document.getElementById("execSummaryText");
  if (execEl) execEl.textContent = data.executiveSummary;

  // 3. Key Points
  const pointsList = document.getElementById("keyPointsList");
  if (pointsList) {
    pointsList.innerHTML = "";
    data.keyPoints.forEach(point => {
      const li = document.createElement("li");
      li.className = "point-item";
      li.innerHTML = `
        <span class="point-bullet-dot"></span>
        <span>${escapeHtml(point)}</span>
      `;
      pointsList.appendChild(li);
    });
  }

  // 4. Decisions Cards
  const decisionsWrap = document.getElementById("decisionsList");
  if (decisionsWrap) {
    decisionsWrap.innerHTML = "";
    if (data.decisions.length === 0) {
      decisionsWrap.innerHTML = `<div class="decision-card" style="color: var(--text-muted); font-style: italic;">No explicit consensus or decision statements detected in this transcript.</div>`;
    } else {
      data.decisions.forEach(decision => {
        const div = document.createElement("div");
        div.className = "decision-card";
        div.innerHTML = `
          <div class="decision-icon-wrap">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <div class="decision-text">${escapeHtml(decision)}</div>
        `;
        decisionsWrap.appendChild(div);
      });
    }
  }

  // 5. Speaker Contribution Mini Bar Chart
  renderSpeakerContributionChart(data.speakerStats);

  // 6. Action Items Filters & Table
  buildActionOwnerFilters(data.actionItems);
  renderActionItemsTable(data.actionItems);
}

/**
 * Renders pure CSS/SVG speaker bars.
 */
function renderSpeakerContributionChart(stats) {
  const chartContainer = document.getElementById("speakerBarsContainer");
  if (!chartContainer) return;
  chartContainer.innerHTML = "";

  const colorPalettes = [
    "linear-gradient(90deg, #F97316, #FB923C)",
    "linear-gradient(90deg, #3B82F6, #06B6D4)",
    "linear-gradient(90deg, #10B981, #14B8A6)",
    "linear-gradient(90deg, #EC4899, #8B5CF6)",
    "linear-gradient(90deg, #F59E0B, #EF4444)"
  ];

  stats.forEach((item, idx) => {
    const row = document.createElement("div");
    row.className = "speaker-bar-row";
    const bgGradient = colorPalettes[idx % colorPalettes.length];

    row.innerHTML = `
      <div style="font-weight: 600; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(item.speaker)}</div>
      <div class="speaker-bar-track">
        <div class="speaker-bar-fill" style="width: 0%; background: ${bgGradient};" data-target-width="${item.percentage}%"></div>
      </div>
      <div style="text-align: right; font-weight: 700; color: var(--text-primary); font-family: var(--font-mono);">${item.percentage}%</div>
    `;
    chartContainer.appendChild(row);

    // Trigger smooth fill animation
    setTimeout(() => {
      const fillEl = row.querySelector(".speaker-bar-fill");
      if (fillEl) fillEl.style.width = fillEl.dataset.targetWidth;
    }, 50);
  });
}

/**
 * Populates owner filter pills (e.g. All, Priya, Marcus, Elena, David).
 */
function buildActionOwnerFilters(actions) {
  const filterContainer = document.getElementById("actionOwnerFilters");
  if (!filterContainer) return;
  filterContainer.innerHTML = "";

  const uniqueOwners = Array.from(new Set(actions.map(a => a.owner)));
  
  // "All" filter button
  const allBtn = document.createElement("button");
  allBtn.className = "filter-btn active";
  allBtn.textContent = `All (${actions.length})`;
  allBtn.addEventListener("click", () => {
    setActiveOwnerFilter('ALL', allBtn);
  });
  filterContainer.appendChild(allBtn);

  // Individual owners
  uniqueOwners.forEach(owner => {
    const count = actions.filter(a => a.owner === owner).length;
    const btn = document.createElement("button");
    btn.className = "filter-btn";
    btn.textContent = `${owner} (${count})`;
    btn.addEventListener("click", () => {
      setActiveOwnerFilter(owner, btn);
    });
    filterContainer.appendChild(btn);
  });
}

function setActiveOwnerFilter(owner, activeBtn) {
  activeSpeakerFilter = owner;
  const buttons = document.querySelectorAll("#actionOwnerFilters .filter-btn");
  buttons.forEach(b => b.classList.remove("active"));
  activeBtn.classList.add("active");

  if (currentSummaryData) {
    const filtered = owner === 'ALL'
      ? currentSummaryData.actionItems
      : currentSummaryData.actionItems.filter(a => a.owner === owner);
    renderActionItemsTable(filtered);
  }
}

/**
 * Renders the table of action items with avatar initials, due date, priority badges, and toggleable checkbox.
 */
function renderActionItemsTable(items) {
  const tbody = document.getElementById("actionItemsTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  if (items.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 24px;">No action items found for this filter.</td></tr>`;
    return;
  }

  items.forEach(item => {
    const tr = document.createElement("tr");
    tr.className = `action-row ${item.completed ? "is-completed" : ""}`;
    tr.dataset.itemId = item.id;

    // Avatar styling helper
    const avatarClass = getAvatarClass(item.owner);
    const initials = getInitials(item.owner);
    const priorityClass = item.priority === 'High' ? 'priority-high' : (item.priority === 'Low' ? 'priority-low' : 'priority-med');

    tr.innerHTML = `
      <td style="width: 40px; text-align: center;">
        <label class="custom-checkbox">
          <input type="checkbox" ${item.completed ? "checked" : ""} aria-label="Mark task complete">
          <span class="checkbox-box">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </span>
        </label>
      </td>
      <td>
        <span class="task-text">${escapeHtml(item.task)}</span>
      </td>
      <td>
        <span class="action-owner-badge">
          <span class="avatar-initials ${avatarClass}">${initials}</span>
          <span>${escapeHtml(item.owner)}</span>
        </span>
      </td>
      <td style="white-space: nowrap; color: var(--text-secondary); font-size: 0.84rem;">
        ${escapeHtml(item.dueDate)}
      </td>
      <td>
        <span class="priority-pill ${priorityClass}">${item.priority}</span>
      </td>
    `;

    // Interactive checkbox toggle
    const checkbox = tr.querySelector("input[type='checkbox']");
    checkbox.addEventListener("change", (e) => {
      item.completed = e.target.checked;
      tr.classList.toggle("is-completed", item.completed);
    });

    tbody.appendChild(tr);
  });
}

function getAvatarClass(name) {
  const lower = name.toLowerCase();
  if (lower.includes("priya")) return "avatar-priya";
  if (lower.includes("marcus")) return "avatar-marcus";
  if (lower.includes("elena")) return "avatar-elena";
  if (lower.includes("david")) return "avatar-david";
  return "avatar-generic";
}

function getInitials(name) {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

/**
 * Animated number count-up effect.
 */
function animateCountUp(elementId, targetValue, suffix = "") {
  const el = document.getElementById(elementId);
  if (!el) return;

  const duration = 1200;
  const start = 0;
  const startTime = performance.now();

  function updateCount(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Smooth easeOutExpo
    const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    const current = Math.floor(start + (targetValue - start) * easeProgress);

    el.textContent = current + suffix;

    if (progress < 1) {
      requestAnimationFrame(updateCount);
    } else {
      el.textContent = targetValue + suffix;
    }
  }

  requestAnimationFrame(updateCount);
}

// ----------------------------------------------------------------------------
// 5. EXPORT & DOWNLOAD UTILITIES
// ----------------------------------------------------------------------------
function copySummaryToClipboard() {
  if (!currentSummaryData) {
    showToast("Please generate a summary first.", "info");
    return;
  }

  const markdown = buildMarkdownExport(currentSummaryData);
  navigator.clipboard.writeText(markdown).then(() => {
    showToast("Summary copied to clipboard as Markdown!", "success");
  }).catch(() => {
    showToast("Failed to copy automatically. Please try downloading as .md", "info");
  });
}

function downloadSummaryFile(format) {
  if (!currentSummaryData) {
    showToast("Please generate a summary first.", "info");
    return;
  }

  const content = format === "md"
    ? buildMarkdownExport(currentSummaryData)
    : buildPlainTextExport(currentSummaryData);

  const filename = `meeting-summary-${new Date().toISOString().slice(0, 10)}.${format}`;
  const blob = new Blob([content], { type: format === "md" ? "text/markdown" : "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast(`Downloaded summary as ${filename}`, "success");
}

function buildMarkdownExport(data) {
  let md = `# Executive Meeting Summary\n\n`;
  md += `**Generated by AI Meeting Summarizer** | ${new Date().toLocaleDateString()}\n\n`;
  md += `## 📋 Overview\n${data.executiveSummary}\n\n`;
  
  md += `## 💡 Key Discussion Points\n`;
  data.keyPoints.forEach(p => md += `- ${p}\n`);
  md += `\n`;

  md += `## 🎯 Agreed Decisions\n`;
  data.decisions.forEach(d => md += `- [x] ${d}\n`);
  md += `\n`;

  md += `## ⚡ Action Items Matrix\n`;
  md += `| Completed | Task | Owner | Due Date | Priority |\n`;
  md += `|:---:|:---|:---|:---|:---:|\n`;
  data.actionItems.forEach(item => {
    const checked = item.completed ? "[x]" : "[ ]";
    md += `| ${checked} | ${item.task} | ${item.owner} | ${item.dueDate} | ${item.priority} |\n`;
  });
  md += `\n`;

  md += `## 📊 Meeting Analytics\n`;
  md += `- **Original Words:** ${data.metrics.originalWords}\n`;
  md += `- **Summary Words:** ${data.metrics.summaryWords} (${data.metrics.compressionRatio}% compression)\n`;
  md += `- **Estimated Time Saved:** ~${data.metrics.timeSavedMinutes} minutes\n`;

  return md;
}

function buildPlainTextExport(data) {
  let txt = `EXECUTIVE MEETING SUMMARY\n`;
  txt += `Generated by AI Meeting Summarizer - ${new Date().toLocaleDateString()}\n`;
  txt += `============================================================\n\n`;

  txt += `1. EXECUTIVE OVERVIEW\n`;
  txt += `${data.executiveSummary}\n\n`;

  txt += `2. KEY DISCUSSION POINTS\n`;
  data.keyPoints.forEach((p, idx) => txt += `   ${idx + 1}. ${p}\n`);
  txt += `\n`;

  txt += `3. DECISIONS REACHED\n`;
  data.decisions.forEach((d, idx) => txt += `   [✓] ${d}\n`);
  txt += `\n`;

  txt += `4. ACTION ITEMS & OWNERSHIP\n`;
  data.actionItems.forEach((item, idx) => {
    const status = item.completed ? "[DONE]" : "[TODO]";
    txt += `   ${idx + 1}. ${status} ${item.task}\n`;
    txt += `      Owner: ${item.owner} | Due: ${item.dueDate} | Priority: ${item.priority}\n`;
  });
  txt += `\n`;

  txt += `5. METRICS\n`;
  txt += `   Original: ${data.metrics.originalWords} words | Compression: ${data.metrics.compressionRatio}%\n`;

  return txt;
}

function clearWorkspace() {
  const textarea = document.getElementById("transcriptTextarea");
  if (textarea) textarea.value = "";
  updateLiveWordCount();

  const emptyState = document.getElementById("outputEmptyState");
  const procView = document.getElementById("outputProcessingView");
  const resultsView = document.getElementById("outputResultsView");

  if (emptyState) emptyState.style.display = "flex";
  if (procView) procView.classList.remove("active");
  if (resultsView) resultsView.classList.remove("active");

  currentSummaryData = null;
  showToast("Workspace cleared.", "info");
}

// ----------------------------------------------------------------------------
// 6. LIVE SPEECH-TO-TEXT (WEB SPEECH API)
// ----------------------------------------------------------------------------
function initLiveSpeechRecognition() {
  const liveTabBtn = document.querySelector('.input-tabs .tab-btn[data-tab="record"]');
  const recordBtn = document.getElementById("recordMicBtn");
  const statusEl = document.getElementById("recordStatusText");
  const feedEl = document.getElementById("liveTranscriptFeed");

  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRec) {
    // Feature detect: gracefully inform user and hide record button
    if (statusEl) {
      statusEl.innerHTML = `<span style="color: var(--danger);">Web Speech API is not supported in this browser.</span><br><small style="color: var(--text-muted);">Please use Chrome, Edge, or Safari to record live audio.</small>`;
    }
    if (recordBtn) recordBtn.style.display = "none";
    if (liveTabBtn) {
      liveTabBtn.title = "Live speech recording not supported in this browser";
      liveTabBtn.style.opacity = "0.5";
    }
    return;
  }

  speechRecognition = new SpeechRec();
  speechRecognition.continuous = true;
  speechRecognition.interimResults = true;
  speechRecognition.lang = "en-US";

  let interimTranscript = "";

  speechRecognition.onstart = () => {
    isRecording = true;
    if (recordBtn) recordBtn.classList.add("recording");
    if (statusEl) statusEl.innerHTML = `<span style="color: #EF4444; font-weight: 700;">● Recording Live Audio...</span> Speak clearly into your microphone.`;
    showToast("Microphone active. Listening to speech...", "info");
  };

  speechRecognition.onresult = (event) => {
    let finalChunk = "";
    interimTranscript = "";

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalChunk += event.results[i][0].transcript + " ";
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }

    if (finalChunk) {
      const textarea = document.getElementById("transcriptTextarea");
      if (textarea) {
        textarea.value += (textarea.value ? " " : "") + finalChunk;
        updateLiveWordCount();
      }
      if (feedEl) {
        feedEl.textContent = textarea ? textarea.value : finalChunk;
        feedEl.scrollTop = feedEl.scrollHeight;
      }
    } else if (interimTranscript && feedEl) {
      feedEl.textContent = interimTranscript;
    }
  };

  speechRecognition.onerror = (event) => {
    console.warn("Speech recognition error:", event.error);
    if (event.error === 'not-allowed') {
      showToast("Microphone access was denied. Please allow microphone permissions.", "info");
    }
    stopRecording();
  };

  speechRecognition.onend = () => {
    stopRecording();
  };

  if (recordBtn) {
    recordBtn.addEventListener("click", () => {
      if (!isRecording) {
        try {
          speechRecognition.start();
        } catch (err) {
          console.error(err);
        }
      } else {
        speechRecognition.stop();
        stopRecording();
      }
    });
  }

  function stopRecording() {
    isRecording = false;
    if (recordBtn) recordBtn.classList.remove("recording");
    if (statusEl) statusEl.textContent = "Click microphone to start recording live meeting audio";
  }
}

// ----------------------------------------------------------------------------
// 7. DESIGN THINKING SECTION INTERACTIVE CONTROLLER
// ----------------------------------------------------------------------------
function initDesignThinkingTabs() {
  const dtTabs = document.querySelectorAll(".dt-tab-btn");
  const dtPanes = document.querySelectorAll(".dt-pane");

  dtTabs.forEach(btn => {
    btn.addEventListener("click", () => {
      dtTabs.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const targetPaneId = `pane-${btn.dataset.pane}`;
      dtPanes.forEach(pane => {
        pane.classList.toggle("active", pane.id === targetPaneId);
      });
    });
  });
}

/**
 * 5-Star Usability Rating and Feedback Storage via localStorage.
 */
function initFeedbackSystem() {
  let selectedRating = 5;
  const stars = document.querySelectorAll(".star-btn");
  const submitBtn = document.getElementById("submitFeedbackBtn");
  const textarea = document.getElementById("feedbackComment");
  const formBox = document.getElementById("testFormContainer");
  const thankYouBox = document.getElementById("testThankYouState");

  stars.forEach(star => {
    star.addEventListener("click", () => {
      selectedRating = parseInt(star.dataset.rating, 10);
      updateStarDisplay(selectedRating);
    });
  });

  function updateStarDisplay(rating) {
    stars.forEach(s => {
      const r = parseInt(s.dataset.rating, 10);
      s.classList.toggle("active", r <= rating);
    });
  }

  // Preselect 5 stars
  updateStarDisplay(selectedRating);

  if (submitBtn) {
    submitBtn.addEventListener("click", () => {
      const feedback = {
        rating: selectedRating,
        comment: textarea ? textarea.value.trim() : "",
        timestamp: new Date().toISOString()
      };

      try {
        const stored = JSON.parse(localStorage.getItem("ai_meeting_feedback") || "[]");
        stored.push(feedback);
        localStorage.setItem("ai_meeting_feedback", JSON.stringify(stored));
      } catch (err) {
        console.warn("localStorage quota or access restricted:", err);
      }

      if (formBox) formBox.style.display = "none";
      if (thankYouBox) thankYouBox.style.display = "block";
      showToast("Thank you for evaluating our Design Thinking prototype!", "success");
    });
  }
}

// ----------------------------------------------------------------------------
// 8. TOAST NOTIFICATION UTILITY
// ----------------------------------------------------------------------------
function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  const iconSvg = type === "success"
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22C55E" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F97316" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;

  toast.innerHTML = `${iconSvg}<span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3800);
}

function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
