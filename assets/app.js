const cardsData = [
  { title: "Circolo Solare", tagline: "Energia che ruota", shape: "circle" },
  { title: "Quadrato Urbano", tagline: "Linee precise", shape: "square" },
  { title: "Triangolo Agile", tagline: "Punta verso il futuro", shape: "triangle" },
  { title: "Esagono Zenith", tagline: "Equilibrio perfetto", shape: "hex" },
  { title: "Orbita Rosa", tagline: "Dolcezza in movimento", shape: "circle" },
  { title: "Blocco Blu", tagline: "Stabilità e calma", shape: "square" },
  { title: "Picco Viola", tagline: "Sfida verticale", shape: "triangle" },
  { title: "Alveare", tagline: "Geometrie naturali", shape: "hex" },
  { title: "Aura Calda", tagline: "Mood estivo", shape: "circle" },
  { title: "Cubo Soft", tagline: "Minimal vibes", shape: "square" },
  { title: "Direzione", tagline: "Sempre avanti", shape: "triangle" },
  { title: "Nido Tech", tagline: "Ordine modulare", shape: "hex" },
  { title: "Luna Piena", tagline: "Notte brillante", shape: "circle" },
  { title: "Quattro Lati", tagline: "Simmetria pura", shape: "square" },
  { title: "Triade", tagline: "Connessioni forti", shape: "triangle" },
  { title: "Esagono Pop", tagline: "Colori dinamici", shape: "hex" }
];

const deck = document.getElementById("deck");
const emptyState = document.getElementById("empty-state");
const likeBtn = document.getElementById("like-btn");
const nopeBtn = document.getElementById("nope-btn");
const resetBtn = document.getElementById("reset-btn");

let currentIndex = 0;
let activeCard = null;
let startX = 0;
let startY = 0;
let currentX = 0;
let currentY = 0;
let isDragging = false;

const maxVisible = 3;

const createCard = (data, position) => {
  const card = document.createElement("article");
  card.className = "card";
  card.dataset.index = position;
  card.style.zIndex = maxVisible - position;
  card.style.transform = getStackTransform(position);

  card.innerHTML = `
    <div class="overlay overlay--like">LIKE</div>
    <div class="overlay overlay--nope">NOPE</div>
    <div class="card__media">
      <div class="media">
        <!-- TODO: replace shape with <img src='...'> -->
        <div class="shape shape--${data.shape}"></div>
      </div>
    </div>
    <div class="card__content">
      <h2>${data.title}</h2>
      <p>${data.tagline}</p>
    </div>
  `;

  return card;
};

const getStackTransform = (position) => {
  const scale = 1 - position * 0.04;
  const translateY = position * 12;
  return `translateY(${translateY}px) scale(${scale})`;
};

const renderDeck = () => {
  deck.innerHTML = "";
  const remaining = cardsData.slice(currentIndex, currentIndex + maxVisible);

  if (remaining.length === 0) {
    emptyState.hidden = false;
    likeBtn.disabled = true;
    nopeBtn.disabled = true;
    return;
  }

  emptyState.hidden = true;
  likeBtn.disabled = false;
  nopeBtn.disabled = false;

  remaining.forEach((data, position) => {
    const card = createCard(data, position);
    deck.appendChild(card);
  });

  attachTopCardHandlers();
};

const attachTopCardHandlers = () => {
  activeCard = deck.querySelector(".card");
  if (!activeCard) return;

  activeCard.addEventListener("pointerdown", onPointerDown);
};

const onPointerDown = (event) => {
  if (!activeCard) return;
  isDragging = true;
  startX = event.clientX;
  startY = event.clientY;
  activeCard.setPointerCapture(event.pointerId);
  activeCard.classList.add("is-dragging");

  activeCard.addEventListener("pointermove", onPointerMove);
  activeCard.addEventListener("pointerup", onPointerUp);
  activeCard.addEventListener("pointercancel", onPointerUp);
};

const onPointerMove = (event) => {
  if (!isDragging || !activeCard) return;
  currentX = event.clientX - startX;
  currentY = event.clientY - startY;

  const rotate = currentX / 12;
  activeCard.style.transform = `translate(${currentX}px, ${currentY}px) rotate(${rotate}deg)`;

  updateOverlays(currentX);
};

const onPointerUp = () => {
  if (!activeCard) return;
  isDragging = false;
  activeCard.classList.remove("is-dragging");

  const threshold = getThreshold();
  if (Math.abs(currentX) > threshold) {
    const direction = currentX > 0 ? "right" : "left";
    swipeCard(direction);
  } else {
    resetCardPosition();
  }

  activeCard.removeEventListener("pointermove", onPointerMove);
  activeCard.removeEventListener("pointerup", onPointerUp);
  activeCard.removeEventListener("pointercancel", onPointerUp);

  currentX = 0;
  currentY = 0;
};

const updateOverlays = (deltaX) => {
  if (!activeCard) return;
  const likeOverlay = activeCard.querySelector(".overlay--like");
  const nopeOverlay = activeCard.querySelector(".overlay--nope");
  const threshold = getThreshold();
  const opacity = Math.min(Math.abs(deltaX) / threshold, 1);

  if (deltaX > 0) {
    likeOverlay.style.opacity = opacity;
    nopeOverlay.style.opacity = 0;
  } else if (deltaX < 0) {
    nopeOverlay.style.opacity = opacity;
    likeOverlay.style.opacity = 0;
  } else {
    likeOverlay.style.opacity = 0;
    nopeOverlay.style.opacity = 0;
  }
};

const resetCardPosition = () => {
  if (!activeCard) return;
  activeCard.style.transform = "translate(0, 0) rotate(0deg)";
  const overlays = activeCard.querySelectorAll(".overlay");
  overlays.forEach((overlay) => (overlay.style.opacity = 0));
};

const swipeCard = (direction) => {
  if (!activeCard) return;
  const multiplier = direction === "right" ? 1 : -1;
  const offscreenX = window.innerWidth * 1.2 * multiplier;
  const offscreenY = currentY;
  const rotate = 24 * multiplier;

  activeCard.style.transform = `translate(${offscreenX}px, ${offscreenY}px) rotate(${rotate}deg)`;
  activeCard.style.opacity = 0;

  activeCard.addEventListener(
    "transitionend",
    () => {
      currentIndex += 1;
      renderDeck();
      currentX = 0;
      currentY = 0;
    },
    { once: true }
  );
};

const getThreshold = () => {
  if (!activeCard) return 120;
  const rect = activeCard.getBoundingClientRect();
  return Math.min(120, rect.width * 0.3);
};

likeBtn.addEventListener("click", () => {
  if (!activeCard) return;
  currentX = getThreshold() + 10;
  swipeCard("right");
});

nopeBtn.addEventListener("click", () => {
  if (!activeCard) return;
  currentX = -getThreshold() - 10;
  swipeCard("left");
});

resetBtn.addEventListener("click", () => {
  currentIndex = 0;
  renderDeck();
});

renderDeck();
