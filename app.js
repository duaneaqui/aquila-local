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
const scoreForm = document.querySelector("#scoreForm");
const scoreOutput = document.querySelector("#scoreOutput");
const auditForm = document.querySelector("#auditForm");
const auditOutput = document.querySelector("#auditOutput");
const replyForm = document.querySelector("#replyForm");
const replyOutput = document.querySelector("#replyOutput");
const monthlyReportForm = document.querySelector("#monthlyReportForm");
const monthlyReportOutput = document.querySelector("#monthlyReportOutput");
const intakeForm = document.querySelector("#intakeForm");
const intakeOutput = document.querySelector("#intakeOutput");
const signalCanvas = document.querySelector("#signalCanvas");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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
  const packageName = escapeHtml(data.get("package"));
  const freshnessRisk = freshness > 30 ? "a visible review freshness gap" : "a decent review freshness signal";
  const ratingRisk = rating < 4.5 ? "rating improvement room" : "a strong rating worth protecting";
  const reviewRisk = reviewsCount < 50 ? "thin review volume" : "enough review volume to convert into stronger proof";
  const competitorGap = Math.max(competitorReviews - reviewsCount, 0);
  const competitorLine = competitorGap > 0
    ? `The nearest visible competitor has ${competitorReviews} reviews, leaving a ${competitorGap}-review proof gap.`
    : "The business is not behind on review volume, so the fastest win is freshness and response quality.";

  auditOutput.innerHTML = `
    <div class="output-actions">
      <span class="report-label">Outreach asset preview</span>
      <button class="tool-button" type="button" data-copy-target="auditOutput">Copy All</button>
    </div>
    <div class="audit-document">
      <h3>${agency} can turn review maintenance into a simple monthly retainer.</h3>
      <p><strong>Prospect:</strong> ${website}</p>
      <p>
        A ${niche} with ${reviewsCount} reviews, a ${rating.toFixed(1)} rating, ${coverage} replies, and ${freshness} days since the latest review has ${freshnessRisk}, ${ratingRisk}, and ${reviewRisk}. ${competitorLine}
      </p>
      <h4>Trust gaps</h4>
      <ul>
        <li>Freshness: ${freshness} days since the latest review makes the business look less active.</li>
        <li>Response coverage: ${coverage} replies creates an easy service add-on for the agency.</li>
        <li>Proof gap: ${competitorGap} fewer reviews than the top visible competitor.</li>
      </ul>
      <h4>Recommended workflow</h4>
      <ul>
        <li>Reply to every recent review with specific, owner-style responses.</li>
        <li>Draft weekly Google profile post copy tied to the services customers are already searching for.</li>
        <li>Send a monthly reputation activity report showing review count, freshness, response coverage, and next actions.</li>
      </ul>
      <h4>Suggested offer</h4>
      <p>${packageName}. Start with a bounded pilot, protect delivery with per-location limits, then add locations only when the agency has real client work to offload.</p>
      <hr>
      <h4>Email draft</h4>
      <p>Subject: quick review trust sample for ${agency}</p>
      <p>Hi ${contact},</p>
      <p>I noticed ${agency} works with local businesses. I made a quick sample of how a review trust desk could help one ${niche} look more current and easier to trust.</p>
      <p>The quick issue: ${reviewsCount} reviews, a ${rating.toFixed(1)} rating, ${freshness} days since the latest review, and ${coverage} replies. ${competitorLine}</p>
      <p>I help agencies handle this quietly under their brand: Google review reply drafts, weekly profile post drafts, and monthly reputation activity reports.</p>
      <p>Want me to send the full white-label sample?</p>
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
  const client = escapeHtml(data.get("client"));
  const owner = escapeHtml(data.get("owner"));
  const tone = escapeHtml(data.get("tone"));
  const threshold = escapeHtml(data.get("threshold"));

  intakeOutput.innerHTML = `
    <div class="output-actions">
      <span class="report-label">Client intake checklist</span>
      <button class="tool-button" type="button" data-copy-target="intakeOutput">Copy Intake</button>
    </div>
    <div class="copy-document">
      <h4>Aquila Local Pilot Intake</h4>
      <p><strong>Agency:</strong> ${agency}</p>
      <p><strong>Client:</strong> ${client}</p>
      <p><strong>Approval owner:</strong> ${owner}</p>
      <p><strong>Brand tone:</strong> ${tone}</p>
      <p><strong>Escalation rule:</strong> ${threshold}</p>
      <ul>
        <li>Confirm Google Business Profile manager access or review export workflow.</li>
        <li>Confirm the client business authorized this work and keeps owner access.</li>
        <li>Do not request or store client passwords.</li>
        <li>Collect approved facts, offers, links, service areas, tone notes, and phrases to avoid.</li>
        <li>Confirm whether Aquila Local posts replies directly or sends approval batches.</li>
        <li>Confirm four monthly Google profile post draft topics.</li>
        <li>Confirm report recipient, reporting date, and agency branding requirements.</li>
      </ul>
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
