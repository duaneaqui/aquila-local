const reviews = [
  {
    business: "Northline Pressure Washing",
    agency: "BrightRoute Media",
    sentiment: "Positive",
    stars: "5.0",
    note: "Customer praised same-day driveway cleaning and asked for a receipt copy.",
    draft: "Thank you for choosing us for the driveway cleaning. We are glad the same-day slot helped, and we sent the receipt details to your inbox."
  },
  {
    business: "Urban Nest Cleaners",
    agency: "Hearthside Studio",
    sentiment: "Needs Approval",
    stars: "3.0",
    note: "Customer liked the cleaning but mentioned a missed bathroom mirror.",
    draft: "Thank you for the honest note. We are glad the cleaning helped overall, and we are sorry the mirror was missed. The team will follow up directly to make this right."
  },
  {
    business: "Peak Lawn Care",
    agency: "Local Lift Co.",
    sentiment: "Positive",
    stars: "5.0",
    note: "Customer mentioned punctual crew and clean edging.",
    draft: "We appreciate the kind review. Our crew will be happy to hear that the timing and edging stood out."
  },
  {
    business: "Metro Detail Lab",
    agency: "Shopfront Partners",
    sentiment: "Escalate",
    stars: "2.0",
    note: "Customer says appointment time was unclear and wants a callback.",
    draft: "Thank you for telling us. We are sorry the appointment time was unclear. Our owner will reach out directly so we can review what happened."
  }
];

const agents = [
  ["Review Agent", "Drafts approval-safe replies using each location's style profile."],
  ["Style Profile", "Stores the voice, signature, emphasis, and approval rules per location."],
  ["Post Agent", "Creates useful weekly Google profile post drafts."],
  ["Audit Agent", "Checks review freshness and competitor gaps for sales, onboarding, and add-ons."],
  ["Report Agent", "Builds agency-ready monthly summaries."]
];

const tabs = document.querySelectorAll(".tab-button");
const panels = document.querySelectorAll(".tab-panel");
const reviewList = document.querySelector("#reviewList");
const agentGrid = document.querySelector("#agentGrid");
const refreshQueue = document.querySelector("#refreshQueue");
const buildReport = document.querySelector("#buildReport");
const reportPreview = document.querySelector("#reportPreview");
const dailyDashboardForm = document.querySelector("#dailyDashboardForm");
const dailyDashboardOutput = document.querySelector("#dailyDashboardOutput");
const prospectEntryForm = document.querySelector("#prospectEntryForm");
const prospectEntryOutput = document.querySelector("#prospectEntryOutput");
const scoreForm = document.querySelector("#scoreForm");
const scoreOutput = document.querySelector("#scoreOutput");
const auditForm = document.querySelector("#auditForm");
const auditOutput = document.querySelector("#auditOutput");
const followUpForm = document.querySelector("#followUpForm");
const followUpOutput = document.querySelector("#followUpOutput");
const fulfillmentBatchForm = document.querySelector("#fulfillmentBatchForm");
const fulfillmentBatchOutput = document.querySelector("#fulfillmentBatchOutput");
const replyForm = document.querySelector("#replyForm");
const replyOutput = document.querySelector("#replyOutput");
const monthlyReportForm = document.querySelector("#monthlyReportForm");
const monthlyReportOutput = document.querySelector("#monthlyReportOutput");
const intakeForm = document.querySelector("#intakeForm");
const intakeOutput = document.querySelector("#intakeOutput");
const clientStatusForm = document.querySelector("#clientStatusForm");
const clientStatusOutput = document.querySelector("#clientStatusOutput");
const launchChecklistForm = document.querySelector("#launchChecklistForm");
const launchChecklistOutput = document.querySelector("#launchChecklistOutput");
const dataImportForm = document.querySelector("#dataImportForm");
const dataImportOutput = document.querySelector("#dataImportOutput");
const releaseReadinessForm = document.querySelector("#releaseReadinessForm");
const releaseReadinessOutput = document.querySelector("#releaseReadinessOutput");
const signalCanvas = document.querySelector("#signalCanvas");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function csvField(value) {
  const stringValue = String(value ?? "");
  if (/[",\n\r]/.test(stringValue)) {
    return `"${stringValue.replaceAll('"', '""')}"`;
  }
  return stringValue;
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (quoted) {
      if (char === '"' && next === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }

  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((csvRow) => csvRow.some((cell) => cell.trim()));
}

function sentimentClass(sentiment) {
  if (sentiment === "Needs Approval") return "warning";
  if (sentiment === "Escalate") return "alert";
  return "";
}

function renderReviews(items) {
  reviewList.innerHTML = items.map((item) => `
    <article class="review-item">
      <div>
        <div class="review-meta">
          <span class="chip ${sentimentClass(item.sentiment)}">${item.sentiment}</span>
          <span class="chip">${item.agency}</span>
        </div>
        <h4>${item.business}</h4>
        <p>${item.note}</p>
        <p><strong>Draft:</strong> ${item.draft}</p>
      </div>
      <div class="review-score">${item.stars} stars</div>
    </article>
  `).join("");
}

function renderAgents() {
  agentGrid.innerHTML = agents.map(([name, purpose], index) => `
    <article class="agent-card">
      <small>Agent ${String(index + 1).padStart(2, "0")}</small>
      <h4>${name}</h4>
      <p>${purpose}</p>
    </article>
  `).join("");
}

function initSignalCanvas() {
  if (!signalCanvas) return;

  const context = signalCanvas.getContext("2d");
  const signals = Array.from({ length: 34 }, (_, index) => ({
    x: Math.random(),
    y: Math.random(),
    width: 18 + Math.random() * 42,
    speed: 0.00022 + Math.random() * 0.00028,
    phase: Math.random() * Math.PI * 2,
    tone: index % 3
  }));

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    signalCanvas.width = Math.floor(signalCanvas.clientWidth * ratio);
    signalCanvas.height = Math.floor(signalCanvas.clientHeight * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function draw(time) {
    const width = signalCanvas.clientWidth;
    const height = signalCanvas.clientHeight;
    context.clearRect(0, 0, width, height);
    context.lineWidth = 1;

    signals.forEach((signal, index) => {
      signal.y += signal.speed * (1 + index * 0.015);
      if (signal.y > 1.08) signal.y = -0.08;

      const x = signal.x * width + Math.sin(time * 0.0007 + signal.phase) * 26;
      const y = signal.y * height;
      const alpha = 0.12 + Math.sin(time * 0.001 + signal.phase) * 0.04;
      const colors = [
        `rgba(36, 167, 125, ${alpha})`,
        `rgba(242, 193, 93, ${alpha})`,
        `rgba(78, 127, 194, ${alpha})`
      ];

      context.strokeStyle = colors[signal.tone];
      context.fillStyle = colors[signal.tone];
      context.beginPath();
      context.rect(x, y, signal.width, 6);
      context.stroke();

      if (index % 4 === 0) {
        context.beginPath();
        context.moveTo(x + signal.width, y + 3);
        context.lineTo(Math.min(width, x + signal.width + 84), y + 3 + Math.sin(time * 0.001 + signal.phase) * 20);
        context.stroke();
      }
    });

    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener("resize", resize);
  requestAnimationFrame(draw);
}

function initMotion() {
  document.body.classList.add("motion-ready");

  const revealTargets = [
    ".hero-content",
    ".ops-console",
    ".floating-note",
    ".signal-strip"
  ];

  revealTargets.forEach((selector, groupIndex) => {
    document.querySelectorAll(selector).forEach((element, itemIndex) => {
      element.animate([
        { opacity: 0, transform: "translateY(24px)" },
        { opacity: 1, transform: "translateY(0)" }
      ], {
        duration: 820,
        delay: groupIndex * 90 + itemIndex * 70,
        easing: "cubic-bezier(.16,1,.3,1)",
        fill: "both"
      });
      element.classList.add("is-visible");
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      entry.target.animate([
        { opacity: 0, transform: "translateY(26px)" },
        { opacity: 1, transform: "translateY(0)" }
      ], {
        duration: 760,
        easing: "cubic-bezier(.16,1,.3,1)",
        fill: "both"
      });
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.15 });

  document.querySelectorAll(".section").forEach((section) => observer.observe(section));

  document.querySelectorAll(".motion-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `rotateX(${5 - y * 3}deg) rotateY(${-7 + x * 4}deg) translateY(-2px)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((button) => button.classList.remove("active"));
    panels.forEach((panel) => panel.classList.remove("active"));
    tab.classList.add("active");
    document.querySelector(`#${tab.dataset.tab}`).classList.add("active");
  });
});

if (refreshQueue) refreshQueue.addEventListener("click", () => {
  const rotated = [...reviews.slice(1), reviews[0]];
  reviews.splice(0, reviews.length, ...rotated);
  renderReviews(reviews);
});

if (buildReport && reportPreview) buildReport.addEventListener("click", () => {
  reportPreview.innerHTML = `
    <div>
      <span class="report-label">Replies drafted</span>
      <strong>128</strong>
    </div>
    <div>
      <span class="report-label">Post drafts</span>
      <strong>32</strong>
    </div>
    <div>
      <span class="report-label">Risk flags</span>
      <strong>7</strong>
    </div>
  `;
});

if (dailyDashboardForm && dailyDashboardOutput) dailyDashboardForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(dailyDashboardForm);
  const mode = data.get("mode");
  const hours = Number(data.get("hours"));
  const prospects = Number(data.get("prospects"));
  const qualified = Number(data.get("qualified"));
  const audits = Number(data.get("audits"));
  const emails = Number(data.get("emails"));
  const followUps = Number(data.get("followUps"));
  const onboarding = Number(data.get("onboarding"));
  const fulfillment = Number(data.get("fulfillment"));
  const prospectTarget = 30;
  const qualifiedTarget = 8;
  const auditTarget = 3;
  const emailTarget = hours <= 3 ? 10 : 15;
  const blockers = [];
  const priorities = [];
  const stopList = [
    "Do not build new features today unless a live buyer or paid client requires it.",
    "Do not contact regulated niches first.",
    "Do not promise rankings, review growth, removal of bad reviews, or fake urgency."
  ];

  if (fulfillment > 0) priorities.push(`Complete ${fulfillment} fulfillment batch${fulfillment === 1 ? "" : "es"} before new outreach.`);
  if (onboarding > 0) priorities.push(`Clear ${onboarding} onboarding/invoice task${onboarding === 1 ? "" : "s"} so paid work can start.`);
  if (followUps > 0) priorities.push(`Send ${followUps} due follow-up${followUps === 1 ? "" : "s"} before researching new agencies.`);
  if (audits < auditTarget && qualified > audits) priorities.push(`Build ${Math.min(auditTarget - audits, qualified - audits)} more sample audit${Math.min(auditTarget - audits, qualified - audits) === 1 ? "" : "s"} from qualified prospects.`);
  if (emails < emailTarget) priorities.push(`Send ${emailTarget - emails} more personalized email${emailTarget - emails === 1 ? "" : "s"} after audits/follow-ups are ready.`);
  if (qualified < qualifiedTarget) priorities.push(`Find ${qualifiedTarget - qualified} more high or strong-medium prospect${qualifiedTarget - qualified === 1 ? "" : "s"}.`);
  if (prospects < prospectTarget) priorities.push(`Research ${prospectTarget - prospects} more agenc${prospectTarget - prospects === 1 ? "y" : "ies"} only after follow-ups and paid tasks are handled.`);

  if (!priorities.length) priorities.push("Today is complete enough. Update trackers, record lessons, and stop.");
  if (mode === "fulfillment" && fulfillment === 0) blockers.push("Fulfillment mode selected, but no fulfillment batches are due. Switch to follow-ups or sales unless a client message is waiting.");
  if (mode === "sales" && (fulfillment > 0 || onboarding > 0)) blockers.push("Sales mode selected, but paid/onboarding work exists. Finish paid work first.");
  if (hours > 8) blockers.push("Work block is over 8 hours. Cap the day unless a buyer conversation or paid onboarding task is active.");

  const score = Math.max(0, Math.min(100,
    Math.round(
      (Math.min(prospects, prospectTarget) / prospectTarget) * 20
      + (Math.min(qualified, qualifiedTarget) / qualifiedTarget) * 25
      + (Math.min(audits, auditTarget) / auditTarget) * 20
      + (Math.min(emails, emailTarget) / emailTarget) * 20
      + (followUps === 0 ? 10 : 0)
      + (fulfillment === 0 && onboarding === 0 ? 5 : 0)
    )
  ));
  const modeLabel = mode === "sales" ? "Sales day" : mode === "fulfillment" ? "Fulfillment day" : "Mixed day";
  const nextTool = fulfillment > 0
    ? "Fulfillment Batch Builder"
    : onboarding > 0
      ? "First Client Onboarding Builder"
      : followUps > 0
        ? "Follow-Up Desk"
        : audits < auditTarget && qualified > audits
          ? "Sample Audit Generator v2"
          : emails < emailTarget
            ? "Follow-Up Desk or outreach templates"
            : "Prospect Entry + Prospect Score";

  dailyDashboardOutput.innerHTML = `
    <div class="output-actions">
      <span class="report-label">Founder command plan</span>
      <button class="tool-button" type="button" data-copy-target="dailyDashboardOutput">Copy Plan</button>
    </div>
    <div class="copy-document">
      <div class="score-meter compact-meter">
        <strong>${score}</strong>
        <span>${modeLabel}</span>
      </div>
      <h3>Today&apos;s command plan</h3>
      <p><strong>Use next:</strong> ${nextTool}. <strong>Time cap:</strong> ${Math.min(hours, 8)} focused hour${Math.min(hours, 8) === 1 ? "" : "s"}.</p>
      <h4>Priority order</h4>
      <ul>
        ${priorities.slice(0, 7).map((priority) => `<li>${priority}</li>`).join("")}
      </ul>
      <h4>Watch-outs</h4>
      <ul>
        ${(blockers.length ? blockers : ["No major blockers from today&apos;s inputs. Keep the tracker updated after every touch."]).map((item) => `<li>${item}</li>`).join("")}
      </ul>
      <h4>Stop doing today</h4>
      <ul>
        ${stopList.map((item) => `<li>${item}</li>`).join("")}
      </ul>
      <h4>Tracker note</h4>
      <pre class="csv-output">${escapeHtml(`Daily plan ${formatDate(new Date())}: mode=${modeLabel}; prospects=${prospects}; qualified=${qualified}; audits=${audits}; emails=${emails}; follow_ups=${followUps}; onboarding=${onboarding}; fulfillment=${fulfillment}; next_tool=${nextTool}`)}</pre>
    </div>
  `;
});

if (prospectEntryForm && prospectEntryOutput) prospectEntryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(prospectEntryForm);
  const agencyName = escapeHtml(data.get("agencyName"));
  const website = escapeHtml(data.get("website"));
  const contactName = escapeHtml(data.get("contactName") || "");
  const role = escapeHtml(data.get("role") || "");
  const email = escapeHtml(data.get("email") || "");
  const linkedin = escapeHtml(data.get("linkedin") || "");
  const agencyType = escapeHtml(data.get("agencyType"));
  const nicheFocus = escapeHtml(data.get("nicheFocus"));
  const targetClientType = escapeHtml(data.get("targetClientType") || "local service businesses");
  const emailSource = escapeHtml(data.get("emailSource") || "Manual research");
  const reasons = [];
  const risks = [];
  let score = 20;

  if (nicheFocus === "Home services") {
    score += 20;
    reasons.push("Serves home-service clients.");
  } else if (nicheFocus === "Mixed local") {
    score += 12;
    reasons.push("Serves mixed local businesses.");
  } else if (nicheFocus === "Restaurants") {
    score += 2;
    risks.push("Restaurants may create high review volume and emotional complaint handling.");
  } else if (nicheFocus === "Regulated") {
    score -= 20;
    risks.push("Regulated niches add approval and compliance friction.");
  }

  if (agencyType === "Local SEO" || agencyType === "GBP specialist") {
    score += 18;
    reasons.push("Core offer already connects to local visibility and Google profiles.");
  } else if (agencyType === "Web design") {
    score += 12;
    reasons.push("Can bundle reputation operations into website care plans.");
  } else if (agencyType === "Social media") {
    score += 8;
    reasons.push("Already sells recurring content-style services.");
  } else {
    score += 4;
    risks.push("General agencies may need clearer positioning.");
  }

  const scoringSignals = [
    ["sellsLocalSeo", 18, "Sells local SEO or GBP services."],
    ["smallTeam", 12, "Small or founder-led team."],
    ["visibleContact", 10, "Visible contact path."],
    ["localExamples", 8, "Has local client examples."],
    ["reputationMention", 8, "Mentions reviews, reputation, or GBP posting."],
    ["retainerSignal", 6, "Offers care plans or retainers."]
  ];

  scoringSignals.forEach(([name, points, reason]) => {
    if (data.get(name)) {
      score += points;
      reasons.push(reason);
    }
  });

  if (!email && !linkedin) {
    score -= 10;
    risks.push("No direct contact path entered.");
  }

  score = Math.max(0, Math.min(100, score));
  const priority = score >= 80 ? "High" : score >= 60 ? "Medium" : "Low";
  const status = priority === "High" ? "Sample audit ready" : priority === "Medium" ? "Not contacted" : "Skip for now";
  const auditStatus = priority === "High" ? "Needed" : "Not started";
  const auditNiche = targetClientType;
  const nextAction = priority === "High"
    ? "Create mini audit and send audit-first email."
    : priority === "Medium"
      ? "Add to tracker and contact after high-priority prospects."
      : "Skip unless a clear review/profile pain point appears.";
  const notes = [
    nextAction,
    reasons.slice(0, 3).join(" "),
    risks.length ? `Risks: ${risks.join(" ")}` : ""
  ].filter(Boolean).join(" ");

  const csvValues = [
    agencyName,
    website,
    contactName,
    role,
    email,
    linkedin,
    agencyType,
    nicheFocus,
    targetClientType,
    emailSource,
    score,
    priority,
    status,
    "",
    "",
    "",
    "",
    "",
    auditStatus,
    auditNiche,
    "Not sent",
    "Open",
    notes
  ];
  const csvRow = csvValues.map(csvField).join(",");

  prospectEntryOutput.innerHTML = `
    <div class="output-actions">
      <span class="report-label">Tracker row preview</span>
      <button class="tool-button" type="button" data-copy-target="prospectEntryOutput">Copy CSV Row</button>
    </div>
    <div class="copy-document">
      <div class="score-meter">
        <strong>${score}</strong>
        <span>${priority} priority</span>
      </div>
      <h3>${agencyName} is a ${priority.toLowerCase()} priority prospect.</h3>
      <p><strong>Next action:</strong> ${nextAction}</p>
      <h4>Why</h4>
      <ul>
        ${reasons.slice(0, 5).map((reason) => `<li>${reason}</li>`).join("")}
      </ul>
      <h4>Risks</h4>
      <p>${risks.length ? risks.join(" ") : "No major red flags from the entered signals."}</p>
      <h4>CSV row</h4>
      <pre class="csv-output">${escapeHtml(csvRow)}</pre>
    </div>
  `;
});

if (scoreForm && scoreOutput) scoreForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(scoreForm);
  const agency = escapeHtml(data.get("agencyName"));
  const agencyType = data.get("agencyType");
  const nicheFocus = data.get("nicheFocus");
  let score = 20;
  const reasons = [];
  const risks = [];

  const agencyLabels = {
    localSeo: "local SEO agency",
    webDesign: "web design agency",
    socialMedia: "social media agency",
    general: "general marketing agency"
  };

  const nicheLabels = {
    homeServices: "home services",
    mixedLocal: "mixed local businesses",
    restaurants: "restaurants",
    regulated: "regulated businesses"
  };

  if (agencyType === "localSeo") {
    score += 18;
    reasons.push("Local SEO agencies already understand Google visibility and reviews.");
  } else if (agencyType === "webDesign") {
    score += 12;
    reasons.push("Web design agencies can bundle this into website care plans.");
  } else if (agencyType === "socialMedia") {
    score += 9;
    reasons.push("Social agencies already sell recurring content work.");
  } else {
    score += 6;
    risks.push("General agencies may need a clearer explanation of the review operations offer.");
  }

  if (nicheFocus === "homeServices") {
    score += 20;
    reasons.push("Home service buyers compare reviews before requesting quotes.");
  } else if (nicheFocus === "mixedLocal") {
    score += 12;
    reasons.push("Mixed local clients can still use review replies and profile post drafts.");
  } else if (nicheFocus === "restaurants") {
    score += 2;
    risks.push("Restaurants can create high review volume and more emotional complaint handling.");
  } else {
    score -= 10;
    risks.push("Regulated niches create approval and compliance friction for a first offer.");
  }

  const checkedSignals = [
    ["localSeo", 10, "They already sell local SEO."],
    ["gbp", 12, "They mention Google Business Profile, so the service is easier to position."],
    ["smallTeam", 12, "Small teams are more likely to need white-label fulfillment."],
    ["caseStudies", 8, "Local case studies make outreach personalization easier."],
    ["contactEmail", 10, "A visible email lowers outreach friction."],
    ["reputationOffer", 8, "They already sell or understand reputation work."]
  ];

  checkedSignals.forEach(([name, points, reason]) => {
    if (data.get(name)) {
      score += points;
      reasons.push(reason);
    }
  });

  score = Math.max(0, Math.min(100, score));
  const priority = score >= 80 ? "High priority" : score >= 60 ? "Medium priority" : "Low priority";
  const nextAction = score >= 80
    ? "Generate a custom mini audit and send the audit-first email today."
    : score >= 60
      ? "Add to the tracker, personalize lightly, and contact after high-priority agencies."
      : "Skip for now unless you find a clear review management pain point.";
  const outreachAngle = nicheFocus === "homeServices"
    ? "Lead with home-service review freshness, competitor proof gaps, and monthly white-label reporting."
    : "Lead with white-label review replies and profile maintenance as a low-lift agency add-on.";

  scoreOutput.innerHTML = `
    <div class="output-actions">
      <span class="report-label">Prospect score</span>
      <button class="tool-button" type="button" data-copy-target="scoreOutput">Copy Score</button>
    </div>
    <div class="score-document">
      <div class="score-meter">
        <strong>${score}</strong>
        <span>${priority}</span>
      </div>
      <h3>${agency} is a ${priority.toLowerCase()} prospect.</h3>
      <p><strong>Profile:</strong> ${agencyLabels[agencyType]} serving ${nicheLabels[nicheFocus]}.</p>
      <h4>Why this score</h4>
      <ul>
        ${reasons.slice(0, 5).map((reason) => `<li>${reason}</li>`).join("")}
      </ul>
      <h4>Risks</h4>
      <p>${risks.length ? risks.join(" ") : "No major early red flags. Keep the first message practical and audit-first."}</p>
      <h4>Outreach angle</h4>
      <p>${outreachAngle}</p>
      <h4>Next action</h4>
      <p>${nextAction}</p>
    </div>
  `;
});

if (auditForm && auditOutput) auditForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(auditForm);
  const agency = escapeHtml(data.get("agency"));
  const contact = escapeHtml(data.get("contact"));
  const website = escapeHtml(data.get("website"));
  const niche = escapeHtml(data.get("niche"));
  const rating = Number(data.get("rating"));
  const reviewsCount = Number(data.get("reviews"));
  const competitorReviews = Number(data.get("competitorReviews"));
  const freshness = Number(data.get("freshness"));
  const coverage = escapeHtml(data.get("coverage"));
  const postActivity = escapeHtml(data.get("postActivity") || "no recent Google posts found");
  const urgency = escapeHtml(data.get("urgency") || "high-intent local service");
  const packageName = escapeHtml(data.get("package"));
  const freshnessRisk = freshness > 30 ? "a visible review freshness gap" : "a decent review freshness signal";
  const ratingRisk = rating < 4.5 ? "rating improvement room" : "a strong rating worth protecting";
  const reviewRisk = reviewsCount < 50 ? "thin review volume" : "enough review volume to convert into stronger proof";
  const competitorGap = Math.max(competitorReviews - reviewsCount, 0);
  const competitorLine = competitorGap > 0
    ? `The nearest visible competitor has ${competitorReviews} reviews, leaving a ${competitorGap}-review proof gap.`
    : "The business is not behind on review volume, so the fastest win is freshness and response quality.";
  const coverageIsWeak = coverage.includes("unanswered") || coverage.includes("some");
  const postIsWeak = !postActivity.includes("active");
  const highFrictionNiches = ["pest control", "lawn care", "mobile auto detailer"];
  const isHighFriction = highFrictionNiches.some((phrase) => niche.includes(phrase));
  const trustGaps = [
    `Freshness: ${freshness} days since the latest review creates ${freshness > 30 ? "a stale first impression" : "a signal worth protecting before it slips"}.`,
    `Reply coverage: ${coverage} replies ${coverageIsWeak ? "makes maintenance an easy agency add-on" : "is already solid, so the angle is consistency and reporting"}.`,
    `Proof gap: ${competitorGap} fewer reviews than the top visible competitor.`,
    `Google post activity: ${postActivity}, which ${postIsWeak ? "leaves a simple weekly content gap" : "can be folded into a monthly proof report"}.`
  ];
  const workflow = [
    "Draft owner-style replies for new reviews and flag low-star reviews for human approval.",
    "Prepare one weekly Google profile post draft tied to service demand, seasonality, or trust proof.",
    "Send a monthly white-label activity report the agency can forward under its own brand.",
    "Track review count, rating, freshness, reply coverage, post cadence, and next suggested action."
  ];
  const riskFlags = [
    rating < 4.2 ? "Rating under 4.2: avoid aggressive sales language; position the service as trust recovery and owner-approved response support." : "",
    freshness > 45 ? "Freshness gap over 45 days: lead with profile maintenance, not ranking promises." : "",
    competitorGap > 75 ? "Large competitor proof gap: frame this as a long-term proof-building support system, not an overnight fix." : "",
    isHighFriction ? "Higher-friction niche: complaints can involve appointments, damage, pests, weather, or service quality; keep negative reviews approval-only." : "",
    urgency.includes("lower") ? "Lower urgency service: outreach should emphasize retention and professionalism more than emergency buyer behavior." : ""
  ].filter(Boolean);
  const shortRiskFlags = riskFlags.length ? riskFlags : ["No major red flags. Keep claims conservative and make the audit useful before asking for a call."];
  const auditHeadline = `${agency} can add a white-label reputation desk for ${niche} clients.`;
  const trackerNotes = [
    `Audit v2: ${niche}; ${rating.toFixed(1)} rating; ${reviewsCount} reviews; ${freshness} days since latest review; ${coverage}; ${postActivity}; competitor gap ${competitorGap}.`,
    `Angle: offer a white-label trust desk with review reply drafts, weekly Google post drafts, escalation flags, and monthly reporting.`,
    `Suggested package: ${packageName}.`
  ].join(" ");

  auditOutput.innerHTML = `
    <div class="output-actions">
      <span class="report-label">Sample Audit Generator v2</span>
      <button class="tool-button" type="button" data-copy-target="auditOutput">Copy All</button>
    </div>
    <div class="audit-document">
      <h3>${auditHeadline}</h3>
      <p><strong>Prospect:</strong> ${website}</p>
      <p>
        A ${niche} with ${reviewsCount} reviews, a ${rating.toFixed(1)} rating, ${coverage} replies, ${freshness} days since the latest review, and ${postActivity} has ${freshnessRisk}, ${ratingRisk}, and ${reviewRisk}. ${competitorLine}
      </p>
      <h4>Trust gaps</h4>
      <ul>
        ${trustGaps.map((gap) => `<li>${gap}</li>`).join("")}
      </ul>
      <h4>Recommended monthly workflow</h4>
      <ul>
        ${workflow.map((step) => `<li>${step}</li>`).join("")}
      </ul>
      <h4>Risk flags</h4>
      <ul>
        ${shortRiskFlags.map((flag) => `<li>${flag}</li>`).join("")}
      </ul>
      <h4>Suggested offer</h4>
      <p>${packageName}. Start with a bounded pilot, protect delivery with per-location limits, keep negative reviews approval-only, then add locations only when the agency has real client work to offload.</p>
      <hr>
      <h4>Email-ready message</h4>
      <p>Subject: quick review trust sample for ${agency}</p>
      <p>Hi ${contact},</p>
      <p>I noticed ${agency} works with local businesses. I made a quick white-label sample showing how one ${niche} could look more current and easier to trust on Google.</p>
      <p>The quick issue: ${reviewsCount} reviews, a ${rating.toFixed(1)} rating, ${freshness} days since the latest review, ${coverage} replies, and ${postActivity}. ${competitorLine}</p>
      <p>I help agencies handle this quietly under their brand: Google review reply drafts, weekly profile post drafts, escalation flags for risky reviews, and monthly reputation activity reports.</p>
      <p>Want me to send the full white-label sample?</p>
      <h4>LinkedIn version</h4>
      <p>Hi ${contact}, I noticed ${agency} serves local businesses. I put together a quick white-label trust audit for a ${niche}: ${rating.toFixed(1)} rating, ${reviewsCount} reviews, ${freshness} days since the latest review, and ${coverage} replies. Want me to send the sample?</p>
      <h4>Tracker notes</h4>
      <pre class="csv-output">${escapeHtml(trackerNotes)}</pre>
    </div>
  `;
});

if (followUpForm && followUpOutput) followUpForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(followUpForm);
  const agency = escapeHtml(data.get("agency"));
  const contact = escapeHtml(data.get("contact"));
  const niche = escapeHtml(data.get("niche"));
  const stage = data.get("stage");
  const replySignal = escapeHtml(data.get("replySignal"));
  const note = escapeHtml(data.get("note") || "");
  const today = new Date();
  const lastTouchRaw = data.get("lastTouch");
  const lastTouch = lastTouchRaw ? new Date(`${lastTouchRaw}T00:00:00`) : today;
  const firstEmailDate = stage === "notContacted" ? formatDate(today) : "";
  const followUpOneDate = stage === "firstSent" ? formatDate(today) : "";
  const followUpTwoDate = stage === "followOneSent" ? formatDate(today) : "";

  const stagePlans = {
    notContacted: {
      label: "Send first audit email",
      status: "First email sent",
      replyStatus: "Not sent",
      closeStatus: "Open",
      nextFollowUp: formatDate(addDays(today, 3)),
      cadence: "Follow up in 3 days if there is no reply.",
      subject: `quick white-label sample for ${agency}`,
      message: [
        `Hi ${contact},`,
        `I noticed ${agency} works with local businesses, so I put together a quick white-label reputation sample for a ${niche} client.`,
        "The angle is simple: review reply drafts, weekly Google profile post drafts, escalation flags, and a monthly activity report your agency can forward under its own brand.",
        "Want me to send the sample?"
      ]
    },
    firstSent: {
      label: "Send follow-up 1",
      status: "Follow-up 1 sent",
      replyStatus: "No reply",
      closeStatus: "Open",
      nextFollowUp: formatDate(addDays(today, 4)),
      cadence: "Follow up again in 4 days if there is no reply.",
      subject: `re: quick white-label sample for ${agency}`,
      message: [
        `Hi ${contact}, quick follow-up.`,
        `The sample I made for the ${niche} angle is meant to show how ${agency} could add a reputation desk without hiring another operator.`,
        "It is built around bounded deliverables: review reply drafts, Google post drafts, approval flags, and a monthly report.",
        "Should I send it over?"
      ]
    },
    followOneSent: {
      label: "Send follow-up 2",
      status: "Follow-up 2 sent",
      replyStatus: "No reply",
      closeStatus: "Open",
      nextFollowUp: formatDate(addDays(today, 7)),
      cadence: "Final soft close in 7 days if there is still no reply.",
      subject: `worth sending the sample?`,
      message: [
        `Hi ${contact}, one more note from me.`,
        `For agencies serving ${niche} or similar local businesses, the main gap is usually not strategy. It is keeping review replies, Google profile posts, and reporting consistently handled.`,
        "That is the piece I can run quietly under your brand.",
        "Worth sending the sample, or should I close the loop?"
      ]
    },
    followTwoSent: {
      label: "Send final close-the-loop note",
      status: "Final follow-up sent",
      replyStatus: "No reply",
      closeStatus: "Close if no reply",
      nextFollowUp: formatDate(addDays(today, 14)),
      cadence: "Archive or recycle in 14 days unless they respond.",
      subject: `closing the loop`,
      message: [
        `Hi ${contact}, I will close the loop here.`,
        `If ${agency} ever wants white-label help with review replies, Google profile post drafts, escalation notes, and simple monthly reputation reports, I can send a sample.`,
        "No need to reply if this is not relevant."
      ]
    },
    interested: {
      label: "Send qualification reply",
      status: "Reply received",
      replyStatus: replySignal,
      closeStatus: "Active conversation",
      nextFollowUp: formatDate(addDays(today, 1)),
      cadence: "Reply within 24 hours and move toward a pilot invoice or short call.",
      subject: `re: white-label reputation sample`,
      message: [
        `Hi ${contact}, thanks for getting back to me.`,
        `The easiest next step is for me to build one sample around a real ${niche} or similar client profile, then you can judge if the workflow fits ${agency}.`,
        "If helpful, send one client niche, their Google profile link, and the brand tone you want replies to follow."
      ]
    },
    notInterested: {
      label: "Mark closed",
      status: "Closed",
      replyStatus: "Not interested",
      closeStatus: "Closed - not interested",
      nextFollowUp: "",
      cadence: "Do not follow up unless they ask you to.",
      subject: `re: white-label reputation sample`,
      message: [
        `Thanks ${contact}, understood.`,
        "I will not follow up further. Wishing you and the team well."
      ]
    }
  };

  const plan = stagePlans[stage] || stagePlans.notContacted;
  const trackerUpdates = [
    ["status", plan.status],
    ["first_email_date", firstEmailDate || "keep existing"],
    ["follow_up_1_date", followUpOneDate || "keep existing"],
    ["follow_up_2_date", followUpTwoDate || "keep existing"],
    ["last_touch_date", formatDate(today)],
    ["next_follow_up", plan.nextFollowUp || "blank"],
    ["reply_status", plan.replyStatus],
    ["close_status", plan.closeStatus],
    ["notes", `${plan.label}. ${plan.cadence} ${note}`.trim()]
  ];

  followUpOutput.innerHTML = `
    <div class="output-actions">
      <span class="report-label">Next outreach move</span>
      <button class="tool-button" type="button" data-copy-target="followUpOutput">Copy Follow-up</button>
    </div>
    <div class="copy-document">
      <h3>${plan.label} for ${agency}</h3>
      <p><strong>Last touch:</strong> ${formatDate(lastTouch)}. <strong>Next follow-up:</strong> ${plan.nextFollowUp || "none"}.</p>
      <p><strong>Cadence:</strong> ${plan.cadence}</p>
      <h4>Message to send</h4>
      <p><strong>Subject:</strong> ${plan.subject}</p>
      ${plan.message.map((line) => `<p>${line}</p>`).join("")}
      <h4>Tracker update values</h4>
      <ul>
        ${trackerUpdates.map(([field, value]) => `<li><strong>${field}:</strong> ${escapeHtml(value)}</li>`).join("")}
      </ul>
      <h4>CSV note</h4>
      <pre class="csv-output">${escapeHtml(trackerUpdates.map(([field, value]) => `${field}=${value}`).join(" | "))}</pre>
    </div>
  `;
});

if (fulfillmentBatchForm && fulfillmentBatchOutput) fulfillmentBatchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(fulfillmentBatchForm);
  const agency = escapeHtml(data.get("agency"));
  const client = escapeHtml(data.get("client"));
  const businessType = escapeHtml(data.get("businessType"));
  const tone = escapeHtml(data.get("tone"));
  const operatorNote = escapeHtml(data.get("operatorNote") || "");
  const reviewRows = String(data.get("reviewBatch") || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const postTopics = String(data.get("postTopics") || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 4);

  const parsedReviews = reviewRows.map((line, index) => {
    const match = line.match(/^([1-5])\s*[\|\-:]\s*(.+)$/);
    const stars = match ? Number(match[1]) : 5;
    const text = match ? match[2] : line;
    const reviewText = escapeHtml(text);
    const lower = text.toLowerCase();
    const riskyWords = ["refund", "legal", "lawyer", "damage", "unsafe", "injury", "discrimination", "fraud", "private", "called me back", "nobody called"];
    const hasRiskTerm = riskyWords.some((word) => lower.includes(word));
    const risk = stars < 3 || hasRiskTerm ? "Escalate" : stars === 3 ? "Approval" : "Normal";
    const detail = lower.includes("time") || lower.includes("on time")
      ? "arriving on time"
      : lower.includes("communication") || lower.includes("called")
        ? "the communication"
        : lower.includes("clean") || lower.includes("driveway") || lower.includes("patio")
          ? "the cleaning work"
          : "sharing the details of the visit";
    const reply = risk === "Escalate"
      ? `Internal briefing only: Review ${index + 1} should be approved by ${agency} or the client owner before public use. Suggested holding response: Thank you for telling us about this. We are sorry the experience did not go as expected, and our owner will review the details directly.`
      : stars === 3
        ? `Thank you for the honest feedback. We are glad part of the service helped, and we are sorry it was not as smooth as it should have been. The owner will review this with the team.`
        : `${tone.includes("warm") ? "Thank you so much" : "Thank you"} for choosing ${client}. We are glad ${detail} stood out, and we appreciate you taking the time to share your experience.`;

    return {
      stars,
      reviewText,
      risk,
      reply
    };
  });

  const normalReplies = parsedReviews.filter((review) => review.risk === "Normal");
  const approvalReplies = parsedReviews.filter((review) => review.risk === "Approval");
  const escalations = parsedReviews.filter((review) => review.risk === "Escalate");
  const postDrafts = postTopics.map((topic) => {
    const safeTopic = escapeHtml(topic);
    return {
      topic: safeTopic,
      hook: `${client}: ${safeTopic}`,
      value: `If ${safeTopic} is on your list, ${client} can help keep the job simple and practical. Our team focuses on clear communication, careful work, and a clean finish for local customers.`,
      cta: "Call Now"
    };
  });
  const weeklyNote = [
    `${client} weekly batch prepared for ${agency}.`,
    `${parsedReviews.length} review${parsedReviews.length === 1 ? "" : "s"} processed: ${normalReplies.length} normal, ${approvalReplies.length} approval-needed, ${escalations.length} escalated.`,
    `${postDrafts.length} Google profile post draft${postDrafts.length === 1 ? "" : "s"} prepared.`,
    operatorNote
  ].filter(Boolean).join(" ");

  fulfillmentBatchOutput.innerHTML = `
    <div class="output-actions">
      <span class="report-label">Weekly fulfillment batch</span>
      <button class="tool-button" type="button" data-copy-target="fulfillmentBatchOutput">Copy Batch</button>
    </div>
    <div class="copy-document">
      <h4>Weekly Fulfillment Batch for ${client}</h4>
      <p><strong>Prepared for:</strong> ${agency}</p>
      <p><strong>Business type:</strong> ${businessType}. <strong>Tone:</strong> ${tone}.</p>
      <h4>Review reply drafts</h4>
      <ul>
        ${parsedReviews.map((review, index) => `<li><strong>Review ${index + 1} (${review.stars} stars, ${review.risk}):</strong> ${review.reply}<br><em>Source review:</em> ${review.reviewText}</li>`).join("")}
      </ul>
      <h4>Escalation notes</h4>
      <ul>
        ${escalations.length ? escalations.map((review, index) => `<li><strong>Escalation ${index + 1}:</strong> ${review.stars}-star review requires approval before public use. Do not mention refunds, private details, legal issues, or blame unless the owner confirms the facts.</li>`).join("") : "<li>No high-risk reviews in this batch.</li>"}
      </ul>
      <h4>Google profile post drafts</h4>
      <ul>
        ${postDrafts.map((post) => `<li><strong>${post.hook}</strong><br>${post.value}<br><strong>CTA:</strong> ${post.cta}<br><strong>Link:</strong> [agency/client link]</li>`).join("")}
      </ul>
      <h4>Weekly agency update</h4>
      <p>Hi ${agency}, this week&apos;s ${client} reputation batch is ready: ${parsedReviews.length} review draft${parsedReviews.length === 1 ? "" : "s"}, ${escalations.length} escalation flag${escalations.length === 1 ? "" : "s"}, and ${postDrafts.length} Google profile post draft${postDrafts.length === 1 ? "" : "s"}. Please review any approval-needed items before public use.</p>
      <h4>Tracker note</h4>
      <pre class="csv-output">${escapeHtml(weeklyNote)}</pre>
    </div>
  `;
});

if (replyForm && replyOutput) replyForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(replyForm);
  const business = escapeHtml(data.get("business"));
  const businessType = escapeHtml(data.get("businessType"));
  const stars = Number(data.get("stars"));
  const review = escapeHtml(data.get("review"));
  const tone = escapeHtml(data.get("tone"));
  const risk = stars < 3 ? "High" : stars === 3 ? "Medium" : "Low";
  const approval = risk === "Low" ? "Owner approval optional" : "Owner approval required";
  const reviewLower = review.toLowerCase();
  const detail = reviewLower.includes("time") || reviewLower.includes("on time")
    ? "arriving on time"
    : reviewLower.includes("communication")
      ? "the clear communication"
      : reviewLower.includes("clean")
        ? "the quality of the cleaning"
        : "sharing the details of your experience";
  const apology = stars < 3
    ? "Internal briefing only: this review should be approved by the agency or business owner before any public response is used."
    : stars === 3
      ? "We are sorry the experience was not as smooth as it should have been. Our owner will review this and follow up directly."
    : `We are glad ${detail} stood out.`;
  const thanks = tone.includes("warm")
    ? "Thank you so much for taking the time to leave this review."
    : "Thank you for taking the time to leave this review.";

  replyOutput.innerHTML = `
    <div class="output-actions">
      <span class="report-label">Reply draft</span>
      <button class="tool-button" type="button" data-copy-target="replyOutput">Copy Reply</button>
    </div>
    <div class="copy-document">
      <p>${stars < 3 ? apology : `${thanks} ${apology} We appreciate you choosing ${business} for your ${businessType} needs.`}</p>
      <p><strong>Risk:</strong> ${risk}. ${approval}.</p>
      <p><strong>Internal note:</strong> Do not add discounts, guarantees, or private details unless the owner approves them.</p>
    </div>
  `;
});

if (monthlyReportForm && monthlyReportOutput) monthlyReportForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(monthlyReportForm);
  const agency = escapeHtml(data.get("agency"));
  const client = escapeHtml(data.get("client"));
  const newReviews = Number(data.get("newReviews"));
  const replies = Number(data.get("replies"));
  const posts = Number(data.get("posts"));
  const flags = Number(data.get("flags"));
  const coverageNote = replies >= newReviews
    ? "Reply coverage stayed strong, which keeps the profile looking actively managed."
    : "Reply coverage needs attention next month so new reviews do not sit unanswered.";
  const riskNote = flags > 0
    ? `${flags} review${flags === 1 ? " was" : "s were"} flagged for owner approval before response.`
    : "No high-risk reviews were flagged this month.";

  monthlyReportOutput.innerHTML = `
    <div class="output-actions">
      <span class="report-label">Monthly summary</span>
      <button class="tool-button" type="button" data-copy-target="monthlyReportOutput">Copy Report</button>
    </div>
    <div class="copy-document">
      <h4>Monthly Reputation Activity Report for ${client}</h4>
      <p><strong>Prepared for:</strong> ${agency}</p>
      <p>${client} added ${newReviews} new review${newReviews === 1 ? "" : "s"}, received ${replies} review reply draft${replies === 1 ? "" : "s"}, and received ${posts} Google Business Profile post draft${posts === 1 ? "" : "s"} this month.</p>
      <p>${coverageNote}</p>
      <p>${riskNote}</p>
      <p><strong>Next month:</strong> keep review replies current, draft one useful Google profile post per week, and review competitor movement only during quarterly or paid add-on analysis.</p>
    </div>
  `;
});

if (intakeForm && intakeOutput) intakeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(intakeForm);
  const agency = escapeHtml(data.get("agency"));
  const contact = escapeHtml(data.get("contact"));
  const client = escapeHtml(data.get("client"));
  const businessType = escapeHtml(data.get("businessType"));
  const owner = escapeHtml(data.get("owner"));
  const reportRecipient = escapeHtml(data.get("reportRecipient"));
  const packageName = escapeHtml(data.get("package"));
  const locations = Number(data.get("locations"));
  const tone = escapeHtml(data.get("tone"));
  const threshold = escapeHtml(data.get("threshold"));
  const gbpAccess = escapeHtml(data.get("gbpAccess"));
  const amountMap = {
    "Founding Agency Pilot": 199,
    "Review Desk": 299,
    "Additional Location": 89
  };
  const amount = amountMap[data.get("package")] || 199;
  const today = formatDate(new Date());
  const invoiceId = `INV-${today.replaceAll("-", "")}-${agency.replace(/[^A-Za-z0-9]/g, "").slice(0, 6).toUpperCase() || "CLIENT"}`;
  const serviceScope = packageName === "Additional Location"
    ? "additional active client location for the current service month"
    : packageName === "Review Desk"
      ? `monthly white-label reputation operations desk for up to ${Math.max(locations, 1)} active location${locations === 1 ? "" : "s"}`
      : `30-day white-label reputation operations pilot for up to ${Math.max(locations, 1)} active location${locations === 1 ? "" : "s"}`;
  const clientLocationRow = [
    agency,
    client,
    businessType,
    gbpAccess,
    owner,
    tone,
    threshold,
    reportRecipient,
    "Onboarding",
    `Package: ${packageName}. Payment and intake required before fulfillment.`
  ].map(csvField).join(",");
  const invoiceRow = [
    invoiceId,
    agency,
    client,
    packageName,
    amount,
    "Draft",
    today,
    "",
    "PayPal Invoice",
    "PayPal account on file",
    "",
    `Send before work starts. ${serviceScope}.`
  ].map(csvField).join(",");

  intakeOutput.innerHTML = `
    <div class="output-actions">
      <span class="report-label">First client onboarding pack</span>
      <button class="tool-button" type="button" data-copy-target="intakeOutput">Copy Intake</button>
    </div>
    <div class="copy-document">
      <h4>Aquila Local First Client Onboarding</h4>
      <p><strong>Agency:</strong> ${agency}</p>
      <p><strong>Client:</strong> ${client}</p>
      <p><strong>Package:</strong> ${packageName} for $${amount}.00 USD</p>
      <p><strong>Approval owner:</strong> ${owner}</p>
      <p><strong>Brand tone:</strong> ${tone}</p>
      <p><strong>Escalation rule:</strong> ${threshold}</p>
      <h4>Invoice prep</h4>
      <ul>
        <li><strong>Invoice ID:</strong> ${invoiceId}</li>
        <li><strong>Title:</strong> Aquila Local - ${packageName}</li>
        <li><strong>Amount:</strong> $${amount}.00 USD</li>
        <li><strong>Terms:</strong> Due on receipt. Work begins after payment and intake details are received.</li>
        <li><strong>Description:</strong> ${serviceScope}. Includes Google review reply drafts, four Google profile post drafts per location, one monthly activity report, and escalation notes for risky reviews.</li>
      </ul>
      <h4>Welcome email</h4>
      <p>Subject: ${client} setup for Aquila Local</p>
      <p>Hi ${contact},</p>
      <p>Great, I will prepare the ${packageName.toLowerCase()} for ${client}. I will send the PayPal invoice first, and work begins after payment and intake details are received.</p>
      <p>For setup, please send the Google Business Profile manager access or a recent review export, the approved brand tone, service areas, key offers, preferred website link, and any phrases the client wants us to avoid.</p>
      <p>Risky reviews under the escalation rule will be flagged for approval before any public reply is used.</p>
      <p>Best,<br>Duane</p>
      <h4>Access and intake checklist</h4>
      <ul>
        <li>Confirm Google Business Profile manager access or review export workflow.</li>
        <li>Confirm the client business authorized this work and keeps owner access.</li>
        <li>Do not request or store client passwords.</li>
        <li>Collect approved facts, offers, links, service areas, tone notes, and phrases to avoid.</li>
        <li>Confirm whether Aquila Local posts replies directly or sends approval batches.</li>
        <li>Confirm four monthly Google profile post draft topics.</li>
        <li>Confirm report recipient, reporting date, and agency branding requirements.</li>
      </ul>
      <h4>First-week delivery plan</h4>
      <ul>
        <li>Day 0: invoice sent and tracker rows created.</li>
        <li>Day 1: payment confirmed, intake reviewed, style profile drafted.</li>
        <li>Day 2: first review reply batch drafted and risky reviews flagged.</li>
        <li>Day 3: four Google profile post topics drafted for agency approval.</li>
        <li>Day 5: send first short status update to the agency.</li>
      </ul>
      <h4>client-locations.csv row</h4>
      <pre class="csv-output">${escapeHtml(clientLocationRow)}</pre>
      <h4>invoice-tracker.csv row</h4>
      <pre class="csv-output">${escapeHtml(invoiceRow)}</pre>
    </div>
  `;
});

if (clientStatusForm && clientStatusOutput) clientStatusForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(clientStatusForm);
  const agency = escapeHtml(data.get("agency"));
  const client = escapeHtml(data.get("client"));
  const packageName = escapeHtml(data.get("package"));
  const invoiceStatus = escapeHtml(data.get("invoiceStatus"));
  const gbpAccess = escapeHtml(data.get("gbpAccess"));
  const owner = escapeHtml(data.get("owner"));
  const serviceStatus = escapeHtml(data.get("serviceStatus"));
  const dueDate = escapeHtml(data.get("dueDate") || "");
  const note = escapeHtml(data.get("note") || "");
  const today = formatDate(new Date());
  const blockers = [];

  if (invoiceStatus !== "Paid") blockers.push(`Invoice is ${invoiceStatus.toLowerCase()}. Do not start fulfillment until payment is confirmed.`);
  if (gbpAccess.includes("pending") || gbpAccess.includes("Waiting")) blockers.push(`Google profile access is not ready: ${gbpAccess}.`);
  if (serviceStatus === "Blocked") blockers.push("Service is marked blocked. Resolve the note before drafting deliverables.");
  if (serviceStatus === "Paused") blockers.push("Service is paused. Confirm restart before doing fulfillment work.");

  const isReady = invoiceStatus === "Paid" && !gbpAccess.includes("pending") && !gbpAccess.includes("Waiting") && serviceStatus !== "Blocked" && serviceStatus !== "Paused";
  const due = dueDate ? new Date(`${dueDate}T00:00:00`) : null;
  const dueTodayOrPast = due ? due <= new Date(`${today}T23:59:59`) : false;
  const health = blockers.length
    ? "Blocked"
    : dueTodayOrPast
      ? "Due now"
      : isReady && serviceStatus === "Ready for first batch"
        ? "Ready"
        : isReady
          ? "Active"
          : "Onboarding";
  const nextAction = blockers.length
    ? blockers[0]
    : dueTodayOrPast
      ? "Build the weekly fulfillment batch and send the approval update to the agency."
      : serviceStatus === "Ready for first batch"
        ? "Prepare the first review reply batch and one Google post draft for approval."
        : "No urgent client action. Check again on the next fulfillment due date.";
  const clientStatusUpdate = blockers.length ? "Blocked" : serviceStatus === "Ready for first batch" ? "Ready for first batch" : serviceStatus;
  const invoiceTrackerNote = `Checked ${today}. ${health}. ${nextAction} ${note}`.trim();
  const clientLocationUpdate = [
    ["agency_name", agency],
    ["client_business", client],
    ["gbp_access", gbpAccess],
    ["approval_owner", owner],
    ["status", clientStatusUpdate],
    ["notes", invoiceTrackerNote]
  ];
  const invoiceUpdate = [
    ["agency_name", agency],
    ["client_business", client],
    ["package", packageName],
    ["status", invoiceStatus],
    ["notes", invoiceTrackerNote]
  ];

  clientStatusOutput.innerHTML = `
    <div class="output-actions">
      <span class="report-label">Client status brief</span>
      <button class="tool-button" type="button" data-copy-target="clientStatusOutput">Copy Status</button>
    </div>
    <div class="copy-document">
      <div class="score-meter compact-meter">
        <strong>${health}</strong>
        <span>${packageName}</span>
      </div>
      <h4>${client} status brief</h4>
      <p><strong>Agency:</strong> ${agency}. <strong>Approval owner:</strong> ${owner}.</p>
      <p><strong>Invoice:</strong> ${invoiceStatus}. <strong>Access:</strong> ${gbpAccess}. <strong>Service:</strong> ${serviceStatus}.</p>
      <p><strong>Next fulfillment due:</strong> ${dueDate || "not set"}.</p>
      <h4>Next action</h4>
      <p>${nextAction}</p>
      <h4>Blockers</h4>
      <ul>
        ${blockers.length ? blockers.map((blocker) => `<li>${blocker}</li>`).join("") : "<li>No blockers. Client is safe to work on within the approved scope.</li>"}
      </ul>
      <h4>Agency update</h4>
      <p>Hi ${agency}, quick status update for ${client}: current state is ${health.toLowerCase()}. ${nextAction}</p>
      <h4>client-locations.csv updates</h4>
      <ul>
        ${clientLocationUpdate.map(([field, value]) => `<li><strong>${field}:</strong> ${value}</li>`).join("")}
      </ul>
      <h4>invoice-tracker.csv updates</h4>
      <ul>
        ${invoiceUpdate.map(([field, value]) => `<li><strong>${field}:</strong> ${value}</li>`).join("")}
      </ul>
      <h4>Tracker note</h4>
      <pre class="csv-output">${escapeHtml(invoiceTrackerNote)}</pre>
    </div>
  `;
});

if (launchChecklistForm && launchChecklistOutput) launchChecklistForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(launchChecklistForm);
  const stage = data.get("stage");
  const name = escapeHtml(data.get("name"));
  const concern = escapeHtml(data.get("concern") || "");
  const stageLabels = {
    outreach: "Before outreach",
    invoice: "Before invoice",
    fulfillment: "Before fulfillment",
    renewal: "Before renewal"
  };
  const stageTools = {
    outreach: "Prospect Entry, Prospect Score, and Sample Audit Generator v2",
    invoice: "First Client Onboarding Builder and PayPal invoice draft",
    fulfillment: "Client Status Tracker and Fulfillment Batch Builder",
    renewal: "Monthly Report Generator and Client Status Tracker"
  };
  const checks = [
    ["targetFit", "Target fits small U.S. local agency profile"],
    ["auditReady", "Useful sample audit or clear client need exists"],
    ["noBadClaims", "No ranking, fake review, or removal promises"],
    ["scopeBounded", "Scope is bounded by package, locations, and review limits"],
    ["paymentReady", "Payment/invoice path is ready or paid"],
    ["authorization", "Agency/client authorization is confirmed"],
    ["accessReady", "GBP access or review export workflow is ready"],
    ["approvalOwner", "Approval owner and escalation rules are confirmed"],
    ["trackersUpdated", "Relevant trackers are updated"],
    ["deliveryReviewed", "Prior delivery/results reviewed for renewal"]
  ];
  const requiredByStage = {
    outreach: ["targetFit", "auditReady", "noBadClaims", "trackersUpdated"],
    invoice: ["targetFit", "scopeBounded", "paymentReady", "noBadClaims", "trackersUpdated"],
    fulfillment: ["paymentReady", "authorization", "accessReady", "approvalOwner", "scopeBounded", "trackersUpdated"],
    renewal: ["deliveryReviewed", "scopeBounded", "noBadClaims", "trackersUpdated"]
  };
  const required = requiredByStage[stage] || requiredByStage.outreach;
  const missing = required
    .filter((name) => !data.get(name))
    .map((field) => checks.find(([key]) => key === field)?.[1] || field);
  const completeOptional = checks.filter(([field]) => data.get(field)).length;
  const verdict = missing.length
    ? "Pause"
    : stage === "fulfillment" || stage === "invoice"
      ? "Proceed carefully"
      : "Proceed";
  const nextAction = missing.length
    ? `Fix the missing gate first: ${missing[0]}.`
    : stage === "outreach"
      ? "Send audit-first outreach and update the prospect tracker after the touch."
      : stage === "invoice"
        ? "Send the invoice, record the invoice row, and wait for payment before fulfillment."
        : stage === "fulfillment"
          ? "Build the fulfillment batch, flag risky reviews, and send the agency approval update."
          : "Send the monthly report, ask for renewal decision, testimonial, anonymized sample, or referral.";

  launchChecklistOutput.innerHTML = `
    <div class="output-actions">
      <span class="report-label">SOP verdict</span>
      <button class="tool-button" type="button" data-copy-target="launchChecklistOutput">Copy SOP</button>
    </div>
    <div class="copy-document">
      <div class="score-meter compact-meter">
        <strong>${verdict}</strong>
        <span>${stageLabels[stage]}</span>
      </div>
      <h4>${stageLabels[stage]} gate check for ${name}</h4>
      <p><strong>Use next:</strong> ${stageTools[stage]}.</p>
      <p><strong>Next action:</strong> ${nextAction}</p>
      <h4>Required blockers</h4>
      <ul>
        ${missing.length ? missing.map((item) => `<li>${item}</li>`).join("") : "<li>No required blockers for this stage.</li>"}
      </ul>
      <h4>Rules that must stay true</h4>
      <ul>
        <li>Do not start fulfillment before payment and intake details are received.</li>
        <li>Do not request or store client passwords.</li>
        <li>Risky reviews require approval before public use.</li>
        <li>Never create fake reviews, buy reviews, suppress legitimate reviews, or guarantee rankings.</li>
        <li>Keep manual delivery until there is proof the offer sells and can be fulfilled within the time budget.</li>
      </ul>
      <h4>Checklist score</h4>
      <p>${completeOptional} of ${checks.length} total checks marked complete. Required checks for this stage: ${required.length - missing.length} of ${required.length}.</p>
      <h4>Concern</h4>
      <p>${concern}</p>
      <h4>Tracker note</h4>
      <pre class="csv-output">${escapeHtml(`SOP ${formatDate(new Date())}: stage=${stageLabels[stage]}; verdict=${verdict}; missing=${missing.length ? missing.join("; ") : "none"}; next=${nextAction}`)}</pre>
    </div>
  `;
});

if (dataImportForm && dataImportOutput) dataImportForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(dataImportForm);
  const requestedType = data.get("dataType");
  const rows = parseCsv(String(data.get("csvText") || ""));
  const headers = rows[0]?.map((header) => header.trim()) || [];
  const records = rows.slice(1).map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] || ""])));
  const headerSet = new Set(headers);
  const detectedType = requestedType !== "auto"
    ? requestedType
    : headerSet.has("next_follow_up")
      ? "prospects"
      : headerSet.has("gbp_access")
        ? "clients"
        : headerSet.has("payment_method")
          ? "invoices"
          : "unknown";
  const today = formatDate(new Date());
  const actions = [];
  const warnings = [];
  let nextTool = "Founder Daily Dashboard";

  if (!headers.length || !records.length) {
    warnings.push("No usable data rows found. Paste the header row plus at least one tracker row.");
  } else if (detectedType === "prospects") {
    const dueFollowUps = records.filter((record) => record.next_follow_up && record.next_follow_up <= today && !String(record.close_status).toLowerCase().includes("closed"));
    const auditReady = records.filter((record) => String(record.status).toLowerCase().includes("sample audit") || String(record.audit_status).toLowerCase().includes("needed"));
    const openHigh = records.filter((record) => ["High", "Medium"].includes(record.priority) && !String(record.close_status).toLowerCase().includes("closed"));
    actions.push(`${dueFollowUps.length} follow-up${dueFollowUps.length === 1 ? "" : "s"} due today or earlier.`);
    actions.push(`${auditReady.length} prospect${auditReady.length === 1 ? "" : "s"} ready for a sample audit or audit follow-up.`);
    actions.push(`${openHigh.length} high/medium open prospect${openHigh.length === 1 ? "" : "s"} in this paste.`);
    nextTool = dueFollowUps.length ? "Follow-Up Desk" : auditReady.length ? "Sample Audit Generator v2" : "Prospect Entry + Prospect Score";
  } else if (detectedType === "clients") {
    const blocked = records.filter((record) => /pending|waiting|blocked|paused/i.test(`${record.gbp_access} ${record.status} ${record.notes}`));
    const active = records.filter((record) => /active|ready/i.test(record.status));
    actions.push(`${blocked.length} client location${blocked.length === 1 ? "" : "s"} blocked or waiting on access/status.`);
    actions.push(`${active.length} client location${active.length === 1 ? "" : "s"} active or ready for a batch.`);
    nextTool = blocked.length ? "Client Status Tracker" : active.length ? "Fulfillment Batch Builder" : "First Client Onboarding Builder";
  } else if (detectedType === "invoices") {
    const unpaid = records.filter((record) => !/paid/i.test(record.status));
    const overdue = records.filter((record) => /overdue/i.test(record.status));
    const draft = records.filter((record) => /draft/i.test(record.status));
    actions.push(`${unpaid.length} unpaid invoice${unpaid.length === 1 ? "" : "s"} in this paste.`);
    actions.push(`${overdue.length} overdue invoice${overdue.length === 1 ? "" : "s"} needing follow-up.`);
    actions.push(`${draft.length} draft invoice${draft.length === 1 ? "" : "s"} to send or complete.`);
    nextTool = overdue.length || unpaid.length ? "Client Status Tracker" : "First Client Onboarding Builder";
  } else {
    warnings.push("Tracker type could not be detected. Use one of the known tracker headers or choose the type manually.");
  }

  const rowNames = records.slice(0, 6).map((record) => record.agency_name || record.client_business || record.invoice_id || "Unnamed row");
  const summaryNote = `Import ${formatDate(new Date())}: type=${detectedType}; rows=${records.length}; next_tool=${nextTool}; actions=${actions.join(" ")}`;

  dataImportOutput.innerHTML = `
    <div class="output-actions">
      <span class="report-label">Import action summary</span>
      <button class="tool-button" type="button" data-copy-target="dataImportOutput">Copy Summary</button>
    </div>
    <div class="copy-document">
      <div class="score-meter compact-meter">
        <strong>${records.length}</strong>
        <span>${detectedType} rows</span>
      </div>
      <h4>Tracker import summary</h4>
      <p><strong>Detected type:</strong> ${detectedType}. <strong>Use next:</strong> ${nextTool}.</p>
      <h4>Actions found</h4>
      <ul>
        ${actions.length ? actions.map((action) => `<li>${action}</li>`).join("") : "<li>No action summary available for this data.</li>"}
      </ul>
      <h4>Rows sampled</h4>
      <ul>
        ${rowNames.length ? rowNames.map((name) => `<li>${escapeHtml(name)}</li>`).join("") : "<li>No named rows found.</li>"}
      </ul>
      <h4>Warnings</h4>
      <ul>
        ${warnings.length ? warnings.map((warning) => `<li>${warning}</li>`).join("") : "<li>No import warnings.</li>"}
      </ul>
      <h4>Tracker note</h4>
      <pre class="csv-output">${escapeHtml(summaryNote)}</pre>
    </div>
  `;
});

if (releaseReadinessForm && releaseReadinessOutput) releaseReadinessForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(releaseReadinessForm);
  const releaseLabel = escapeHtml(data.get("releaseLabel"));
  const releaseNote = escapeHtml(data.get("releaseNote") || "");
  const checks = [
    ["localQa", "Local browser QA passed"],
    ["syntaxCheck", "JS syntax check passed"],
    ["privacyScan", "Private address/payment scan passed"],
    ["publicClean", "Public homepage exposes no internal tools"],
    ["queuedCommits", "Local commits are checkpointed"],
    ["operatorFlow", "Sales, onboarding, fulfillment, status, SOP, and import flows exist"],
    ["noSecrets", "No API keys, passwords, or exact payment account in deploy files"],
    ["ownerApproval", "Owner approves pushing to GitHub"],
    ["deployApproval", "Owner approves Vercel production deploy"]
  ];
  const requiredForReview = ["localQa", "syntaxCheck", "privacyScan", "publicClean", "queuedCommits", "operatorFlow", "noSecrets"];
  const requiredForDeploy = [...requiredForReview, "ownerApproval", "deployApproval"];
  const missingReview = requiredForReview
    .filter((field) => !data.get(field))
    .map((field) => checks.find(([key]) => key === field)?.[1] || field);
  const missingDeploy = requiredForDeploy
    .filter((field) => !data.get(field))
    .map((field) => checks.find(([key]) => key === field)?.[1] || field);
  const verdict = missingReview.length
    ? "Not ready"
    : missingDeploy.length
      ? "Ready for owner review"
      : "Approved to release";
  const nextAction = missingReview.length
    ? `Fix before review: ${missingReview[0]}.`
    : missingDeploy.length
      ? "Show the local build to the owner, then request explicit GitHub push and Vercel deploy approval."
      : "Push queued commits to GitHub, deploy to Vercel production, and verify the live operator page.";

  releaseReadinessOutput.innerHTML = `
    <div class="output-actions">
      <span class="report-label">Deployment gate verdict</span>
      <button class="tool-button" type="button" data-copy-target="releaseReadinessOutput">Copy Verdict</button>
    </div>
    <div class="copy-document">
      <div class="score-meter compact-meter">
        <strong>${verdict}</strong>
        <span>${releaseLabel}</span>
      </div>
      <h4>Release readiness verdict</h4>
      <p><strong>Next action:</strong> ${nextAction}</p>
      <h4>Missing before review</h4>
      <ul>
        ${missingReview.length ? missingReview.map((item) => `<li>${item}</li>`).join("") : "<li>No review blockers.</li>"}
      </ul>
      <h4>Missing before push/deploy</h4>
      <ul>
        ${missingDeploy.length ? missingDeploy.map((item) => `<li>${item}</li>`).join("") : "<li>No deployment blockers.</li>"}
      </ul>
      <h4>Release rules</h4>
      <ul>
        <li>Do not deploy internal tools until local browser QA passes.</li>
        <li>Do not push private address, payment account, passwords, API keys, or unpublished private docs.</li>
        <li>After deploy, verify the live operator page returns 200 and contains the newest release marker.</li>
        <li>Keep the public landing page free of internal operator forms.</li>
      </ul>
      <h4>Release note</h4>
      <p>${releaseNote}</p>
      <h4>Tracker note</h4>
      <pre class="csv-output">${escapeHtml(`Release gate ${formatDate(new Date())}: label=${releaseLabel}; verdict=${verdict}; next=${nextAction}`)}</pre>
    </div>
  `;
});

document.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-copy-target]");
  if (!button) return;

  const target = document.querySelector(`#${button.dataset.copyTarget}`);
  const documentText = target.querySelector(".audit-document, .score-document, .copy-document")?.innerText.trim();
  if (!documentText) return;

  try {
    await navigator.clipboard.writeText(documentText);
    const originalLabel = button.dataset.originalLabel || button.textContent;
    button.dataset.originalLabel = originalLabel;
    button.textContent = "Copied";
    target.classList.add("copy-flash");
    window.setTimeout(() => {
      button.textContent = originalLabel;
      target.classList.remove("copy-flash");
    }, 1100);
  } catch {
    button.textContent = "Select Text";
  }
});

initSignalCanvas();
initMotion();
if (reviewList) renderReviews(reviews);
if (agentGrid) renderAgents();
