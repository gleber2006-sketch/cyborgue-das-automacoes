'use strict';

/* ============================================================
   CONFIGURAÇÃO DO CLIENTE — preencher antes de publicar.
   Telefone no formato 5515999999999 (apenas números).
   Se deixar ambos em branco, o formulário copia o briefing
   do visitante, mas NÃO envia os dados a ninguém.
   ============================================================ */
const CONTACT = {
  whatsapp: '',
  email: ''
};

const FRAME_COUNT = 120;
const sceneRoot = document.getElementById('inicio');
const canvas = document.getElementById('hero-canvas');
const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
const poster = document.getElementById('hero-poster');
const progressIndicator = document.getElementById('hero-progress');
const phaseLabel = document.getElementById('phase-label');
const counterLabel = document.getElementById('hero-counter');
const sceneTexts = [...document.querySelectorAll('.hero-copy')];
const loadOverlay = document.getElementById('boot');
const loadPercent = document.getElementById('loader-percent');
const loadCircle = document.getElementById('loader-circle');
const loadBar = document.getElementById('loader-bar');
const loadFrameCount = document.getElementById('loader-frame-count');
const loadMessage = document.getElementById('loader-message');
const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobileFrames = matchMedia('(max-width: 720px)').matches;
const frameFolder = `assets/frames/${mobileFrames ? 'mobile' : 'desktop'}/`;
const images = Array(FRAME_COUNT).fill(null);
let lastPainted = -1;
let currentPosition = 0;
let targetPosition = 0;
let playing = false;
let preloadCompleted = false;
let lastScene = -1;

function framePath(index) {
  return `${frameFolder}frame_${String(index).padStart(3, '0')}.webp`;
}
function updateProgress(progress, count) {
  const percent = Math.round(progress * 100);
  loadPercent.textContent = String(percent).padStart(2, '0');
  loadBar.style.width = `${percent}%`;
  loadCircle.style.strokeDashoffset = String(540.35 * (1 - progress));
  loadFrameCount.textContent = `${String(count).padStart(3, '0')} / ${FRAME_COUNT}`;
}
function sizeCanvas() {
  const bounds = canvas.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, mobileFrames ? 1.5 : 1.7);
  canvas.width = Math.round(bounds.width * ratio);
  canvas.height = Math.round(bounds.height * ratio);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  lastPainted = -1;
  paintFrame(Math.round(currentPosition));
}
function paintFrame(number) {
  if (!ctx) return;
  const index = Math.max(0, Math.min(FRAME_COUNT - 1, number));
  if (index === lastPainted) return;
  const img = images[index] || findClosestFrame(index);
  if (!img || !img.complete || !img.naturalWidth) return;
  const w = canvas.width;
  const h = canvas.height;
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const scale = Math.max(w / iw, h / ih);
  const sw = w / scale;
  const sh = h / scale;
  const cropX = (iw - sw) / 2;
  const cropY = (ih - sh) / 2;
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(img, cropX, cropY, sw, sh, 0, 0, w, h);
  lastPainted = index;
}
function findClosestFrame(index) {
  for (let distance = 1; distance < FRAME_COUNT; distance++) {
    if (images[index - distance]) return images[index - distance];
    if (images[index + distance]) return images[index + distance];
  }
  return null;
}
function activateScene(sceneIndex) {
  if (sceneIndex === lastScene) return;
  lastScene = sceneIndex;
  sceneTexts.forEach((element, index) => {
    const active = index === sceneIndex;
    element.classList.toggle('active', active);
    element.setAttribute('aria-hidden', String(!active));
    element.querySelectorAll('a').forEach(link => { link.tabIndex = active ? 0 : -1; });
  });
}
function setStoryLabels(progress) {
  const scene = progress < 0.24 ? 0 : progress < 0.7 ? 1 : 2;
  activateScene(scene);
  progressIndicator.style.width = `${(progress * 100).toFixed(2)}%`;
  phaseLabel.textContent = scene === 0 ? 'PROTOCOLO // ABERTURA' : scene === 1 ? 'IDENTIDADE // REVELADA' : 'PROTOCOLO // FECHAMENTO';
  counterLabel.innerHTML = `${String(Math.round(progress * (FRAME_COUNT - 1))).padStart(3, '0')} <em>/ 119</em>`;
}
function readScroll() {
  const rect = sceneRoot.getBoundingClientRect();
  const scrollable = Math.max(1, rect.height - window.innerHeight);
  const fraction = Math.max(0, Math.min(1, -rect.top / scrollable));
  targetPosition = fraction * (FRAME_COUNT - 1);
  setStoryLabels(fraction);
  const pastHero = rect.bottom <= 88;
  document.getElementById('site-header').classList.toggle('scrolled', pastHero);
  if (!playing && preloadCompleted) {
    playing = true;
    requestAnimationFrame(animate);
  }
}
function animate() {
  const distance = targetPosition - currentPosition;
  if (Math.abs(distance) > 0.06) {
    currentPosition += distance * 0.24;
    paintFrame(Math.round(currentPosition));
    requestAnimationFrame(animate);
  } else {
    currentPosition = targetPosition;
    paintFrame(Math.round(currentPosition));
    playing = false;
  }
}
async function loadOne(index) {
  const img = new Image();
  img.decoding = 'async';
  img.src = framePath(index);
  try {
    await new Promise((resolve, reject) => {
      if (img.complete) return img.naturalWidth ? resolve() : reject(new Error('Imagem inválida'));
      img.onload = resolve;
      img.onerror = reject;
    });
    // A decodificação antecipada reduz engasgos no scroll, especialmente no celular.
    if (typeof img.decode === 'function') await img.decode();
    images[index] = img;
    return true;
  } catch (error) {
    console.warn('Frame indisponível:', index, error);
    return false;
  }
}
async function initSequence() {
  if (!ctx) {
    loadMessage.textContent = 'Este navegador não oferece suporte ao Canvas.';
    setTimeout(() => loadOverlay.classList.add('hidden'), 900);
    return;
  }
  sizeCanvas();
  updateProgress(0, 0);
  if (prefersReducedMotion) {
    const loaded = await loadOne(0);
    preloadCompleted = true;
    if (loaded) { paintFrame(0); canvas.classList.add('ready'); }
    loadOverlay.classList.add('hidden');
    loadOverlay.setAttribute('aria-hidden', 'true');
    return;
  }
  // Imagem inicial primeiro, para que a interface tenha um frame confiável.
  await loadOne(0);
  sizeCanvas();
  canvas.classList.add('ready');
  poster.style.opacity = '0';
  let cursor = 1;
  let count = 1;
  let failed = 0;
  const worker = async () => {
    while (cursor < FRAME_COUNT) {
      const index = cursor++;
      if (!await loadOne(index)) failed++;
      count++;
      updateProgress(count / FRAME_COUNT, count);
    }
  };
  await Promise.all(Array.from({ length: 8 }, worker));
  preloadCompleted = true;
  if (failed) loadMessage.textContent = `${FRAME_COUNT - failed} frames preparados. Prosseguindo...`;
  else loadMessage.textContent = 'Sistema pronto. Aproveite a experiência.';
  readScroll();
  setTimeout(() => {
    loadOverlay.classList.add('hidden');
    loadOverlay.setAttribute('aria-hidden', 'true');
  }, 340);
}
window.addEventListener('scroll', readScroll, { passive: true });
window.addEventListener('resize', () => { sizeCanvas(); readScroll(); }, { passive: true });
window.addEventListener('orientationchange', () => { sizeCanvas(); readScroll(); });
readScroll();
initSequence().catch(error => {
  console.error('Não foi possível inicializar a sequência:', error);
  loadOverlay.classList.add('hidden');
  loadOverlay.setAttribute('aria-hidden', 'true');
});

/* Native MP4 mode preserves the actual soundtrack and its synchronization.
   It must be activated by a user click: browsers block autoplay with sound.
   Scrubbed frames do not continuously play video audio because the visitor
   can stop, rewind or scroll at any speed. */
const filmDialog = document.getElementById('film-dialog');
const filmVideo = document.getElementById('film-video');
const menuButton = document.getElementById('menu-button');
const mobileNav = document.getElementById('mobile-nav');
let lastFilmTrigger = null;
function closeMenu() {
  menuButton.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir menu');
  mobileNav.classList.remove('open');
  mobileNav.inert = true;
}
menuButton.addEventListener('click', () => {
  const opening = !mobileNav.classList.contains('open');
  menuButton.classList.toggle('open', opening);
  menuButton.setAttribute('aria-expanded', String(opening));
  menuButton.setAttribute('aria-label', opening ? 'Fechar menu' : 'Abrir menu');
  mobileNav.classList.toggle('open', opening);
  mobileNav.inert = !opening;
});
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.querySelectorAll('[data-open-film]').forEach(button => {
  button.addEventListener('click', () => {
    lastFilmTrigger = button;
    closeMenu();
    if (typeof filmDialog.showModal === 'function') filmDialog.showModal();
    else filmDialog.setAttribute('open', '');
    document.body.classList.add('dialog-open');
    filmVideo.currentTime = 0;
    filmVideo.muted = false;
    const start = filmVideo.play();
    if (start && typeof start.catch === 'function') start.catch(() => {
      showToast('Toque em reproduzir no vídeo para iniciar o áudio.');
    });
  });
});
function stopFilm() {
  filmVideo.pause();
  filmVideo.currentTime = 0;
  document.body.classList.remove('dialog-open');
  if (lastFilmTrigger && lastFilmTrigger.isConnected) lastFilmTrigger.focus({ preventScroll: true });
}
document.getElementById('close-film').addEventListener('click', () => filmDialog.close());
filmDialog.addEventListener('close', stopFilm);
filmDialog.addEventListener('click', e => {
  if (e.target === filmDialog) filmDialog.close();
});
window.addEventListener('keydown', e => {
  if (e.key === 'Escape' && mobileNav.classList.contains('open')) closeMenu();
});

/* Light visual reveals on sections that are not frame animations. */
if ('IntersectionObserver' in window && !prefersReducedMotion) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -35px 0px', threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
} else {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('in-view'));
}

/* Contact: functional only after adding an actual destination to CONTACT. */
const briefForm = document.getElementById('brief-form');
const formFeedback = document.getElementById('form-feedback');
const toast = document.getElementById('toast');
let toastHandle;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastHandle);
  toastHandle = setTimeout(() => toast.classList.remove('visible'), 4500);
}
function copyText(value) {
  if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(value);
  const input = document.createElement('textarea');
  input.value = value;
  input.style.position = 'fixed'; input.style.opacity = '0';
  document.body.appendChild(input);
  input.select();
  let copied = false;
  try { copied = document.execCommand('copy'); }
  finally { input.remove(); }
  return copied ? Promise.resolve() : Promise.reject(new Error('Cópia não permitida'));
}
briefForm.addEventListener('submit', event => {
  event.preventDefault();
  if (!briefForm.reportValidity()) return;
  const data = new FormData(briefForm);
  const message = [
    'Olá! Quero conversar sobre um projeto com a Cyborgue das Automações.',
    '', `Nome: ${data.get('name')}`,
    `Contato: ${data.get('contact')}`,
    `Projeto: ${data.get('type')}`,
    `Descrição: ${data.get('description')}`
  ].join('\n');
  const phone = CONTACT.whatsapp.replace(/\D/g, '');
  if (phone.length >= 11 && phone.length <= 15) {
    const link = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    formFeedback.textContent = 'Abrindo seu WhatsApp com a mensagem preparada...';
    window.open(link, '_blank', 'noopener,noreferrer');
    showToast('Mensagem preparada no WhatsApp. Confirme o envio no aplicativo.');
  } else if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(CONTACT.email)) {
    window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent('Novo projeto — Cyborgue das Automações')}&body=${encodeURIComponent(message)}`;
    formFeedback.textContent = 'Seu aplicativo de e-mail será aberto com o briefing preenchido.';
  } else {
    copyText(message).then(() => {
      formFeedback.textContent = 'Seu briefing foi copiado! Antes de publicar, configure o WhatsApp ou e-mail do responsável em script.js para receber solicitações diretamente.';
      showToast('Briefing copiado. Falta configurar o destinatário do formulário.');
    }).catch(() => {
      formFeedback.textContent = 'Falta configurar o WhatsApp ou e-mail do responsável em script.js. Nenhuma solicitação foi enviada.';
      showToast('O contato ainda não está configurado.');
    });
  }
});
document.getElementById('copyright-year').textContent = String(new Date().getFullYear());
