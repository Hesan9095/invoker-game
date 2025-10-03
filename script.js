// Spell Database
const SPELLS = {
  "Cold Snap": {
    combo: ["Q", "Q", "Q"],
    color: "#4a9eff",
    image: "images/ColdSnap.png",
    description: "Freezes enemy in place",
  },
  "Ghost Walk": {
    combo: ["Q", "Q", "W"],
    color: "#7c3aed",
    image: "images/GhostWalk.png",
    description: "Become invisible and slow",
  },
  "Ice Wall": {
    combo: ["Q", "Q", "E"],
    color: "#06b6d4",
    image: "images/IceWall.png",
    description: "Creates wall of ice",
  },
  "EMP": {
    combo: ["W", "W", "W"],
    color: "#a855f7",
    image: "images/EMP.png",
    description: "Drains mana in area",
  },
  "Tornado": {
    combo: ["W", "W", "Q"],
    color: "#8b5cf6",
    image: "images/Tornado.png",
    description: "Lifts enemies into air",
  },
  "Alacrity": {
    combo: ["W", "W", "E"],
    color: "#f59e0b",
    image: "images/Alacrity.png",
    description: "Increases attack speed",
  },
  "Sun Strike": {
    combo: ["E", "E", "E"],
    color: "#ef4444",
    image: "images/SunStrike.png",
    description: "Global fire beam",
  },
  "Forge Spirit": {
    combo: ["E", "E", "Q"],
    color: "#f97316",
    image: "images/ForgeSpirit.png",
    description: "Summons fire spirit",
  },
  "Chaos Meteor": {
    combo: ["E", "E", "W"],
    color: "#dc2626",
    image: "images/ChaosMeteor.png",
    description: "Summons burning meteor",
  },
  "Deafening Blast": {
    combo: ["Q", "W", "E"],
    color: "#fbbf24",
    image: "images/DeafeningBlast.png",
    description: "Pushes and disarms",
  },
}

// Orb Images
const ORB_IMAGES = {
  quas: "images/quas.png",
  wex: "images/wex.png",
  exort: "images/exort.png",
}

// Game State
let gameState = {
  mode: null,
  orbs: [],
  spells: [null, null],
  currentChallenge: null,
  score: 0,
  combo: 0,
  bestCombo: 0,
  timeLeft: 0,
  timerInterval: null,
  startTime: null,
}

// DOM Elements
const modeSelection = document.getElementById("modeSelection")
const gameArea = document.getElementById("gameArea")
const orbSlots = [document.getElementById("orb1"), document.getElementById("orb2"), document.getElementById("orb3")]
const spellSlots = [document.getElementById("spell1"), document.getElementById("spell2")]
const scoreDisplay = document.getElementById("score")
const comboDisplay = document.getElementById("combo")
const timerDisplay = document.getElementById("timer")
const challengeDisplay = document.getElementById("challengeDisplay")
const targetSpell = document.getElementById("targetSpell")
const spellCombo = document.getElementById("spellCombo")
const spellGrid = document.getElementById("spellGrid")
const resultModal = document.getElementById("resultModal")
const invokeBtn = document.getElementById("invokeBtn")

const sounds = {
  quas: document.getElementById("quasSound"),
  wex: document.getElementById("wexSound"),
  exort: document.getElementById("exortSound"),
  invoke: document.getElementById("invokeSound"),
  success: document.getElementById("successSound"),
  error: document.getElementById("errorSound"),
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  setupModeSelection()
  setupOrbControls()
  setupKeyboardControls()
  setupSpellReference()
  setupModalButtons()
})

function setupModeSelection() {
  document.querySelectorAll(".mode-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const mode = btn.dataset.mode
      startGame(mode)
    })
  })
}

function setupOrbControls() {
  document.querySelectorAll(".orb-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const orb = btn.dataset.orb
      addOrb(orb)
    })
  })

  invokeBtn.addEventListener("click", () => {
    invokeSpell()
  })
}

function setupKeyboardControls() {
  document.addEventListener("keydown", (e) => {
    if (gameState.mode === null) return

    const key = e.key.toLowerCase()

    switch (key) {
      case "q":
        addOrb("quas")
        break
      case "w":
        addOrb("wex")
        break
      case "e":
        addOrb("exort")
        break
      case "r":
        invokeSpell()
        break
      case "d":
        castSpell(0)
        break
      case "f":
        castSpell(1)
        break
      case "escape":
        returnToMenu()
        break
    }
  })
}

function setupSpellReference() {
  Object.entries(SPELLS).forEach(([name, data]) => {
    const card = document.createElement("div")
    card.className = "spell-card"
    card.innerHTML = `
      <img src="${data.image}" alt="${name}" class="spell-card-image">
      <div class="spell-card-name">${name}</div>
      <div class="spell-card-combo">${data.combo.join(" + ")}</div>
    `
    spellGrid.appendChild(card)
  })
}

function setupModalButtons() {
  document.getElementById("playAgainBtn").addEventListener("click", () => {
    resultModal.classList.add("hidden")
    startGame(gameState.mode)
  })

  document.getElementById("menuBtn").addEventListener("click", () => {
    resultModal.classList.add("hidden")
    returnToMenu()
  })
}

function startGame(mode) {
  console.log("[v0] Starting game with mode:", mode)

  gameState = {
    mode: mode,
    orbs: [],
    spells: [null, null],
    currentChallenge: null,
    score: 0,
    combo: 0,
    bestCombo: 0,
    timeLeft: mode === "timed" ? 60 : 0,
    timerInterval: null,
    startTime: Date.now(),
  }

  modeSelection.classList.add("hidden")
  gameArea.classList.remove("hidden")

  updateDisplay()

  if (mode === "timed") {
    startTimer()
  }

  if (mode !== "practice") {
    generateChallenge()
  } else {
    challengeDisplay.classList.add("hidden")
  }
}

function addOrb(orbType) {
  console.log("[v0] Adding orb:", orbType)

  if (gameState.orbs.length >= 3) {
    gameState.orbs.shift()
  }

  gameState.orbs.push(orbType)
  updateOrbDisplay()

  playSound(orbType)

  const btn = document.querySelector(`[data-orb="${orbType}"]`)
  const rect = btn.getBoundingClientRect()
  const colors = { quas: "#4a9eff", wex: "#a855f7", exort: "#ef4444" }
  createParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, colors[orbType], 8)

  btn.style.transform = "scale(1.15)"
  setTimeout(() => {
    btn.style.transform = ""
  }, 150)
}

function updateOrbDisplay() {
  orbSlots.forEach((slot, index) => {
    const img = slot.querySelector(".orb-image")
    slot.className = "orb-slot"
    img.classList.remove("visible")

    if (gameState.orbs[index]) {
      const orbType = gameState.orbs[index]
      slot.classList.add(orbType)
      img.src = ORB_IMAGES[orbType]
      img.alt = orbType
      img.classList.add("visible")
    }
  })
}

function invokeSpell() {
  console.log("[v0] Invoking spell with orbs:", gameState.orbs)

  if (gameState.orbs.length !== 3) {
    showFeedback("Need 3 orbs!", "error")
    playSound("error")
    return
  }

  const combo = gameState.orbs.map((o) => o[0].toUpperCase())
  const sortedCombo = [...combo].sort().join("")

  let foundSpell = null
  for (const [name, data] of Object.entries(SPELLS)) {
    const spellCombo = [...data.combo].sort().join("")
    if (spellCombo === sortedCombo) {
      foundSpell = { name, ...data }
      break
    }
  }

  if (foundSpell) {
    playSound("invoke")

    const invokeBtn = document.getElementById("invokeBtn")
    const rect = invokeBtn.getBoundingClientRect()
    createParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, "#fbbf24", 15)

    addSpellToSlot(foundSpell)
    checkChallenge(foundSpell.name)
  } else {
    showFeedback("Invalid combination!", "error")
    playSound("error")
  }
}

function addSpellToSlot(spell) {
  // Add to first empty slot or replace oldest
  if (gameState.spells[0] === null) {
    gameState.spells[0] = spell
  } else if (gameState.spells[1] === null) {
    gameState.spells[1] = spell
  } else {
    gameState.spells[0] = gameState.spells[1]
    gameState.spells[1] = spell
  }

  updateSpellDisplay()
}

function updateSpellDisplay() {
  spellSlots.forEach((slot, index) => {
    const spell = gameState.spells[index]
    const icon = slot.querySelector(".spell-icon")
    const nameEl = slot.querySelector(".spell-name")

    if (spell) {
      icon.style.background = `url('${spell.image}') center/cover`
      icon.style.border = `2px solid ${spell.color}`
      icon.style.boxShadow = `0 0 20px ${spell.color}`
      icon.textContent = ""
      nameEl.textContent = spell.name
      nameEl.style.color = spell.color
    } else {
      icon.style.background = "rgba(100, 150, 255, 0.1)"
      icon.style.border = "none"
      icon.style.boxShadow = "none"
      icon.textContent = ""
      nameEl.textContent = ""
    }
  })
}

function castSpell(slotIndex) {
  const spell = gameState.spells[slotIndex]
  if (spell) {
    console.log("[v0] Casting spell:", spell.name)

    const slot = spellSlots[slotIndex]
    const rect = slot.getBoundingClientRect()
    createParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, spell.color, 12)

    showFeedback(`Cast: ${spell.name}`, "cast")

    // Visual feedback
    slot.classList.add("active")
    setTimeout(() => {
      slot.classList.remove("active")
    }, 300)
  }
}

function generateChallenge() {
  const spellNames = Object.keys(SPELLS)
  const randomSpell = spellNames[Math.floor(Math.random() * spellNames.length)]

  gameState.currentChallenge = randomSpell

  const targetSpellEl = document.getElementById("targetSpell")
  const targetSpellImageEl = document.getElementById("targetSpellImage")
  const spellComboEl = document.getElementById("spellCombo")

  if (gameState.mode === "timed" || gameState.mode === "combo") {
    targetSpellEl.style.display = "none"
    spellComboEl.style.display = "none"
    targetSpellImageEl.classList.add("visible")
    targetSpellImageEl.innerHTML = `<img src="${SPELLS[randomSpell].image}" alt="${randomSpell}">`
  } else {
    targetSpellEl.style.display = "block"
    spellComboEl.style.display = "flex"
    targetSpellImageEl.classList.remove("visible")
    targetSpellEl.textContent = randomSpell
    spellComboEl.textContent = SPELLS[randomSpell].combo.join(" + ")
  }

  challengeDisplay.classList.remove("hidden")
}

function checkChallenge(spellName) {
  if (gameState.mode === "practice") return

  if (spellName === gameState.currentChallenge) {
    gameState.score += 100
    gameState.combo++

    if (gameState.combo > gameState.bestCombo) {
      gameState.bestCombo = gameState.combo
    }

    playSound("success")

    if (gameState.mode === "timed") {
      gameState.timeLeft += 5 // Bonus time
    }

    setTimeout(() => {
      generateChallenge()
    }, 500)
  } else {
    gameState.combo = 0
    playSound("error")
    showFeedback("Wrong spell!", "error")
  }

  updateDisplay()
}

function startTimer() {
  gameState.timerInterval = setInterval(() => {
    gameState.timeLeft--
    updateDisplay()

    if (gameState.timeLeft <= 0) {
      endGame()
    }
  }, 1000)
}

function updateDisplay() {
  scoreDisplay.textContent = gameState.score
  comboDisplay.textContent = gameState.combo

  if (gameState.mode === "timed") {
    const minutes = Math.floor(gameState.timeLeft / 60)
    const seconds = gameState.timeLeft % 60
    timerDisplay.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  } else if (gameState.mode === "practice") {
    const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000)
    const minutes = Math.floor(elapsed / 60)
    const seconds = elapsed % 60
    timerDisplay.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }
}

function showFeedback(message, type) {
  const feedback = document.createElement("div")
  feedback.textContent = message
  feedback.style.position = "fixed"
  feedback.style.top = "50%"
  feedback.style.left = "50%"
  feedback.style.transform = "translate(-50%, -50%)"
  feedback.style.padding = "20px 40px"
  feedback.style.borderRadius = "12px"
  feedback.style.fontSize = "1.5rem"
  feedback.style.fontWeight = "bold"
  feedback.style.zIndex = "999"
  feedback.style.pointerEvents = "none"
  feedback.style.animation = "fadeInOut 1s ease"

  if (type === "success") {
    feedback.style.background = "rgba(34, 197, 94, 0.9)"
    feedback.style.color = "#fff"
  } else if (type === "error") {
    feedback.style.background = "rgba(239, 68, 68, 0.9)"
    feedback.style.color = "#fff"
  } else {
    feedback.style.background = "rgba(74, 158, 255, 0.9)"
    feedback.style.color = "#fff"
  }

  document.body.appendChild(feedback)

  setTimeout(() => {
    feedback.remove()
  }, 1000)
}

function endGame() {
  if (gameState.timerInterval) {
    clearInterval(gameState.timerInterval)
  }

  document.getElementById("finalScore").textContent = gameState.score
  document.getElementById("bestCombo").textContent = gameState.bestCombo

  const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000)
  const minutes = Math.floor(elapsed / 60)
  const seconds = elapsed % 60
  document.getElementById("finalTime").textContent =
    `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`

  resultModal.classList.remove("hidden")
}

function returnToMenu() {
  if (gameState.timerInterval) {
    clearInterval(gameState.timerInterval)
  }

  gameArea.classList.add("hidden")
  modeSelection.classList.remove("hidden")
  gameState.mode = null
}

function playSound(soundName) {
  const sound = sounds[soundName]
  if (sound) {
    sound.currentTime = 0
    sound.volume = 0.3
    sound.play().catch((e) => console.log("[v0] Audio play failed:", e))
  }
}

function createParticles(x, y, color, count = 10) {
  const container = document.getElementById("particles")
  for (let i = 0; i < count; i++) {
    const particle = document.createElement("div")
    particle.className = "particle"
    particle.style.left = x + "px"
    particle.style.top = y + "px"
    particle.style.background = color
    particle.style.animationDelay = i * 0.05 + "s"
    container.appendChild(particle)

    setTimeout(() => particle.remove(), 2000)
  }
}

const style = document.createElement("style")
style.textContent = `
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        50% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
    }
`
document.head.appendChild(style)
