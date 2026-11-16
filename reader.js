const reader = document.querySelector('#reader');
const toolbar = document.querySelector('.toolbar');
const select = document.querySelector('#page-select');
const previous = document.querySelector('#previous');
const next = document.querySelector('#next');
const zoomIn = document.querySelector('#zoom-in');
const zoomOut = document.querySelector('#zoom-out');
const fullscreen = document.querySelector('#fullscreen');
const fullscreenMessage = document.querySelector('#fullscreen-message');
const mobile = matchMedia('(max-width: 759px), (hover: none) and (pointer: coarse) and (max-height: 600px)');
let pages = [], current = 0, zoom = 1, ticking = false;
let pan;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function status() {
  select.value = String(current);
  previous.disabled = current === 0;
  next.disabled = current === pages.length - 1;
  document.querySelector('#page-status').textContent = `${pages[current].label} · ${current + 1} / ${pages.length}`;
  document.querySelector('#zoom-level').textContent = `${Math.round(zoom * 100)}%`;
  zoomOut.disabled = zoom <= .5;
  zoomIn.disabled = zoom >= 3;
}

function sizePages() {
  reader.style.setProperty('--reader-height', `${reader.clientHeight}px`);
  for (const figure of reader.querySelectorAll('.page')) {
    const page = pages[Number(figure.dataset.index)];
    const fit = mobile.matches ? reader.clientWidth : Math.min(reader.clientWidth - 32, (reader.clientHeight - 32) * page.width / page.height);
    figure.style.setProperty('--page-width', `${Math.max(1, fit) * zoom}px`);
  }
  const overflows = reader.scrollWidth > reader.clientWidth || reader.scrollHeight > reader.clientHeight;
  reader.classList.toggle('is-pannable', !mobile.matches && zoom > 1 && overflows);
}

function render() {
  reader.replaceChildren();
  pages.forEach((page, index) => {
    const figure = document.createElement('figure');
    figure.className = 'page';
    figure.dataset.index = index;
    figure.setAttribute('aria-label', page.label);
    const image = document.createElement('img');
    image.src = page.src;
    image.alt = `Rite of Spring — ${page.label}`;
    image.width = page.width;
    image.height = page.height;
    image.loading = index < 2 ? 'eager' : 'lazy';
    image.decoding = 'async';
    image.draggable = false;
    image.addEventListener('error', () => {
      const notice = document.createElement('p');
      notice.className = 'image-error';
      notice.textContent = `Could not load ${page.label}. `;
      const retry = document.createElement('button');
      retry.textContent = 'Retry';
      retry.onclick = () => { notice.remove(); image.hidden = false; image.src = page.src; };
      notice.append(retry); image.hidden = true; figure.append(notice);
    });
    figure.append(image); reader.append(figure);
  });
  sizePages(); status();
}

function go(index) {
  current = clamp(index, 0, pages.length - 1);
  const figure = reader.children[current];
  const top = figure.getBoundingClientRect().top;
  if (mobile.matches) {
    window.scrollTo({ top: window.scrollY + top, behavior: 'instant' });
  } else {
    const inset = parseFloat(getComputedStyle(reader).paddingTop);
    reader.scrollTo({ top: reader.scrollTop + top - reader.getBoundingClientRect().top - inset });
  }
  status();
}

function setZoom(value, pointer) {
  const figure = pointer?.target.closest('.page') ?? reader.children[current];
  const artwork = figure.querySelector('img:not([hidden])') ?? figure;
  const before = artwork.getBoundingClientRect();
  const bounds = reader.getBoundingClientRect();
  const anchorX = pointer?.clientX ?? bounds.left + reader.clientWidth / 2;
  const anchorY = pointer?.clientY ?? (mobile.matches ? 0 : bounds.top + reader.clientHeight / 2);
  const fractionY = (anchorY - before.top) / before.height;
  const fractionX = (anchorX - before.left) / before.width;
  const nextZoom = clamp(Math.round(value * 100) / 100, .5, 3);
  if (nextZoom === zoom) return;
  zoom = nextZoom;
  sizePages();
  const after = artwork.getBoundingClientRect();
  const delta = after.top + fractionY * after.height - anchorY;
  if (mobile.matches) window.scrollBy(0, delta); else reader.scrollTop += delta;
  reader.scrollLeft += after.left + fractionX * after.width - anchorX;
  status();
}

function enableDesktopControls() {
  fullscreen.hidden = !document.fullscreenEnabled;
  fullscreen.onclick = async () => {
    fullscreenMessage.hidden = true;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      fullscreenMessage.textContent = 'Full screen is unavailable in this browser window.';
      fullscreenMessage.hidden = false;
    }
  };
  document.addEventListener('fullscreenchange', () => {
    fullscreen.textContent = document.fullscreenElement ? 'Exit full screen' : 'Full screen';
    toolbar.classList.remove('show-at-edge');
    if (document.fullscreenElement) reader.focus({ preventScroll: true });
    const page = current;
    requestAnimationFrame(() => {
      sizePages();
      go(page);
    });
  });
  document.addEventListener('pointermove', event => {
    if (!document.fullscreenElement || event.pointerType !== 'mouse') return;
    const reveal = !pan && (event.clientY <= 24 ||
      (toolbar.classList.contains('show-at-edge') && event.clientY < toolbar.offsetHeight));
    toolbar.classList.toggle('show-at-edge', reveal);
  });
  document.documentElement.addEventListener('pointerleave', () => toolbar.classList.remove('show-at-edge'));

  reader.addEventListener('wheel', event => {
    if (mobile.matches || !event.ctrlKey || !event.deltaY) return;
    event.preventDefault();
    const distance = event.deltaMode === 1 ? event.deltaY * 16
      : event.deltaMode === 2 ? event.deltaY * reader.clientHeight : event.deltaY;
    setZoom(zoom * Math.exp(-distance / 600), event);
  }, { passive: false });

  reader.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' || event.button !== 0 || event.target.tagName !== 'IMG'
      || !reader.classList.contains('is-pannable')) return;
    event.preventDefault();
    pan = { id: event.pointerId, x: event.clientX, y: event.clientY, left: reader.scrollLeft, top: reader.scrollTop };
    reader.setPointerCapture(pan.id);
    reader.classList.add('is-panning');
  });
  reader.addEventListener('pointermove', event => {
    if (pan?.id !== event.pointerId) return;
    reader.scrollLeft = pan.left + pan.x - event.clientX;
    reader.scrollTop = pan.top + pan.y - event.clientY;
  });
  reader.addEventListener('lostpointercapture', () => {
    pan = undefined;
    reader.classList.remove('is-panning');
  });
}

async function start() {
  const response = await fetch('./pages.json');
  if (!response.ok) throw new Error('Page list unavailable');
  pages = await response.json();
  if (!pages.length) throw new Error('No pages available');
  pages.forEach((page, index) => select.add(new Option(`${page.label} · ${index + 1} / ${pages.length}`, index)));
  render();
  enableDesktopControls();
  previous.onclick = () => go(current - 1);
  next.onclick = () => go(current + 1);
  select.onchange = () => go(Number(select.value));
  zoomIn.onclick = () => setZoom(zoom + .25);
  zoomOut.onclick = () => setZoom(zoom - .25);
  document.querySelector('#fit').onclick = () => setZoom(1);
  document.addEventListener('keydown', event => {
    if (mobile.matches) return;
    if (event.ctrlKey || event.metaKey || event.altKey || /INPUT|SELECT|TEXTAREA/.test(event.target.tagName) || event.target.isContentEditable) return;
    const actions = { ArrowLeft: () => go(current - 1), ArrowRight: () => go(current + 1), '+': () => setZoom(zoom + .25), '=': () => setZoom(zoom + .25), '-': () => setZoom(zoom - .25), '0': () => setZoom(1) };
    if (actions[event.key]) { event.preventDefault(); actions[event.key](); }
  });
  mobile.addEventListener('change', () => { zoom = 1; sizePages(); go(current); });
  window.addEventListener('resize', sizePages);
  function trackPage() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const line = mobile.matches ? 40
        : reader.getBoundingClientRect().top + Math.min(120, reader.clientHeight / 4);
      let visible = 0;
      for (const figure of reader.children) {
        if (figure.getBoundingClientRect().top > line) break;
        visible = Number(figure.dataset.index);
      }
      if (mobile.matches && window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
        visible = pages.length - 1;
      }
      if (visible !== current) {
        current = visible;
        status();
      }
      ticking = false;
    });
  }
  reader.addEventListener('scroll', () => { if (!mobile.matches) trackPage(); }, { passive: true });
  window.addEventListener('scroll', () => { if (mobile.matches) trackPage(); }, { passive: true });
}
start().catch(() => {
  reader.innerHTML = '<p class="message">The comic could not load. Please refresh to try again.</p>';
});
