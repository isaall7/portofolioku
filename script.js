/* ============================================================
   ADE FAISAL PORTFOLIO - script.js
   Dark Mode · Mobile Menu · Modals · Animations · Galleries
   ============================================================ */

const ThemeManager = {
  key: 'af-theme',
  icons: { dark: '\u2600\uFE0F', light: '\u{1F319}' },

  init() {
    const saved = localStorage.getItem(this.key) || 'light';
    this.apply(saved);
  },

  apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.key, theme);

    const btn = document.getElementById('themeToggle');
    if (btn) {
      btn.textContent = theme === 'dark' ? this.icons.dark : this.icons.light;
    }
  },

  toggle() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    this.apply(current === 'dark' ? 'light' : 'dark');
  }
};

const MobileMenu = {
  isOpen: false,

  init() {
    const btn = document.getElementById('hamburger');
    if (btn) {
      btn.addEventListener('click', () => this.toggle());
    }

    document.querySelectorAll('#mobileMenu a').forEach(link => {
      link.addEventListener('click', () => this.close());
    });

    document.addEventListener('click', event => {
      if (this.isOpen && !event.target.closest('.mobile-menu') && !event.target.closest('#hamburger')) {
        this.close();
      }
    });
  },

  toggle() {
    this.isOpen ? this.close() : this.open();
  },

  open() {
    const btn = document.getElementById('hamburger');
    const menu = document.getElementById('mobileMenu');
    if (!btn || !menu) return;

    this.isOpen = true;
    btn.classList.add('open');
    menu.classList.add('open');
  },

  close() {
    const btn = document.getElementById('hamburger');
    const menu = document.getElementById('mobileMenu');

    this.isOpen = false;
    if (btn) btn.classList.remove('open');
    if (menu) menu.classList.remove('open');
  }
};

const ScrollAnimations = {
  init() {
    this.checkVisible();
    window.addEventListener('scroll', () => this.checkVisible(), { passive: true });
  },

  checkVisible() {
    document.querySelectorAll('.fade-in:not(.visible)').forEach(element => {
      const rect = element.getBoundingClientRect();
      if (rect.top < window.innerHeight - 60) {
        element.classList.add('visible');
      }
    });
  }
};

const Modal = {
  activeModal: null,

  open(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    this.activeModal = modal;
  },

  close(modalId) {
    const modal = modalId ? document.getElementById(modalId) : this.activeModal;
    if (!modal) return;

    modal.classList.remove('open');
    document.body.style.overflow = '';

    const video = modal.querySelector('video');
    if (video) {
      video.pause();
      video.currentTime = 0;
      video.removeAttribute('src');
      video.style.display = 'none';
    }

    const iframe = modal.querySelector('iframe');
    if (iframe) {
      iframe.removeAttribute('src');
      iframe.style.display = 'none';
    }

    this.activeModal = null;
  },

  init() {
    document.addEventListener('click', event => {
      if (event.target.classList.contains('modal-backdrop') || event.target.classList.contains('modal-close')) {
        this.close();
      }
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        this.close();
      }
    });
  }
};

function buildMediaPath(folder, filename) {
  return encodeURI(`fotoku/${folder}/${filename}`);
}

function isExternalUrl(value) {
  return /^https?:\/\//i.test(value);
}

function getYouTubeId(url) {
  try {
    const parsedUrl = new URL(url);
    const host = parsedUrl.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
      return parsedUrl.pathname.split('/').filter(Boolean)[0] || '';
    }

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (parsedUrl.pathname.startsWith('/shorts/')) {
        return parsedUrl.pathname.split('/').filter(Boolean)[1] || '';
      }

      if (parsedUrl.pathname.startsWith('/embed/')) {
        return parsedUrl.pathname.split('/').filter(Boolean)[1] || '';
      }

      return parsedUrl.searchParams.get('v') || '';
    }
  } catch (error) {
    return '';
  }

  return '';
}

function buildVideoItem(filename, index) {
  const youtubeId = getYouTubeId(filename);
  const isYoutube = Boolean(youtubeId);
  const src = isExternalUrl(filename) ? filename : buildMediaPath('videoku', filename);

  return {
    src,
    label: isYoutube ? `YouTube Video ${index + 1}` : formatLabel(filename),
    type: isYoutube ? 'youtube' : 'local',
    embedSrc: isYoutube ? `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0` : '',
    thumbnail: isYoutube ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : ''
  };
}

function formatLabel(filename) {
  return filename
    .replace(/\.[^.]+$/, '')
    .replace(/\s*\[[^\]]+\]$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function guessDesignCategory(filename) {
  const name = filename.toLowerCase();
  if (name.includes('poster')) return 'poster';
  if (name.includes('banner')) return 'banner';
  if (name.includes('announcement') || name.includes('pendaftaran') || name.includes('demokrasi') || name.includes('manasik') || name.includes('idul')) return 'announcement';
  if (name.includes('social') || name.includes('pp ') || name.includes('reels') || name.includes('parfum') || name.includes('youtube')) return 'social';
  return 'all';
}

function guessPhotoCategory(filename) {
  const name = filename.toLowerCase();
  if (name.includes('portrait') || name.includes('ade')) return 'portrait';
  if (name.includes('leica') || name.includes('land') || name.includes('lembang') || name.includes('rancabali') || name.includes('tahura')) return 'landscape';
  if (name.includes('street') || name.includes('screenshot') || name.includes('wa')) return 'street';
  if (name.includes('nature') || name.includes('patenggang')) return 'nature';
  return 'all';
}

function createLazyImageMarkup(item) {
  return `
    <div class="media-shell" aria-hidden="true"></div>
    <img data-src="${item.src}" alt="${item.label}" loading="lazy" decoding="async" />
    <div class="gallery-overlay"><span>${item.label}</span></div>
  `;
}

function markMediaLoaded(card) {
  card.classList.add('is-loaded');
}

function observeGalleryMedia() {
  const mediaElements = document.querySelectorAll('.gallery-item img[data-src]');
  if (!mediaElements.length) return;

  const activateMedia = element => {
    const src = element.dataset.src;
    if (!src) return;

    element.src = src;
    element.removeAttribute('data-src');
  };

  if (!('IntersectionObserver' in window)) {
    mediaElements.forEach(element => activateMedia(element));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      activateMedia(entry.target);
      observer.unobserve(entry.target);
    });
  }, {
    rootMargin: '300px 0px'
  });

  mediaElements.forEach(element => observer.observe(element));
}

const designFiles = [
  'Ade Faisal [2F43011].png',
  'bang rani [DB095E3].png',
  'burangrang trip [4F7C050].png',
  'cermin fitrah kita pancasila - XI RPL 3 [0BA08E6].png',
  'demokrasi [A8E0536].png',
  'design 1. [370F4DA].png',
  'design ICT [91B21EB].png',
  'bagi kopi.png',
  'cap kaki 3.png',
  'chatime design.png',
  'golda design.png',
  'matcha design.png',
  'Nescafe design.png',
  'gabut [821BE71].png',
  'gfx [652743A].png',
  'ict [9BF98EA].png',
  'idul Fitri [61879A7].png',
  'ini abadi - perunggu 1.png',
  'ini abadi - perunggu 2.png',
  'lembang - karawang [1B8486B].png',
  'lembang - karawang [64442F6].png',
  'manasikk [D2A0490].png',
  'manip 3.1 [AF460E7].png',
  'manip 3.1 [E3F0FCC].png',
  'manip again [B22D813].png',
  'moment [8F4D253].png',
  'parfum braven cool wotah [385D4F9].png',
  'pendaftaran ict [A523C5D].png',
  'poster [C61F85F].png',
  'poster kartini [E0B7061].png',
  'pp gweh [1D6B452].png',
  'project manip [C365FE5].png',
  'project manip 2 [51A0102].png',
  'Proyek Baru 114 [7E15C55].png',
  'Proyek Baru 142 [F2BB789].png',
  'Proyek Baru 155 [BC22D9D].png',
  'Proyek Baru 171 [B0754AD].png',
  'Proyek Baru 56 [185A988].png',
  'Proyek Baru 84 [35E1A95].png',
  'Proyek Baru 84 [5C82FA3].png',
  'Proyek Baru 9 [28C5736].png',
  'reunian [920D8CA].png',
  'Revan risaldi [74A0A35].png',
];

const photoFiles = [
  'IMG_0019 (1).jpg',
  'IMG_0096 (2).jpg',
  'IMG_0111.jpg',
  'IMG_0129 (1).jpg',
  'IMG_0129.jpg',
  'IMG_0229.jpg',
  'IMG_0235.jpg',
  'IMG_0274@1650900639.jpg',
  'IMG_0312.jpg',
  'IMG_0346.jpg',
  'IMG_0361.jpg',
  'IMG_0378.jpg',
  'IMG_0399 (1).jpg',
  'IMG_0399.jpg',
  'IMG_0549.jpg',
  'IMG_0598.jpg',
  'IMG_0607.jpg',
  'IMG_0659.jpg',
  'IMG_0722@637758523.jpg',
  'IMG_0751.jpg',
  'IMG_20250326_175231_819.jpg',
  'IMG_20250329_173126_186.jpg',
  'IMG_20250330_091337_233.jpg',
  'IMG_20250405_194934_935.jpg',
  'IMG_20250407_174746_161 (1).jpg',
  'IMG_20250425_093824_501 (1).jpg',
  'IMG_20250526_195445_112.jpg',
  'IMG_20250526_195701_525 (1).jpg',
  'IMG_20250526_195701_525.jpg',
  'IMG_20250526_195710_353.jpg',
  'IMG_20250618_062813_208 (1).jpg',
  'IMG_20250618_062813_208.jpg',
  'IMG_20250630_062533_914.jpg',
  'IMG_20250630_174203_007.jpg',
  'IMG_20250815_062945_668.jpg',
  'IMG_20250923_165716_481.jpg',
  'IMG_20250924_163459_066 (1).jpg',
  'IMG_20250927_200254_152.jpg',
  'IMG_20250928_052357_750.jpg',
  'IMG_20251012_112559 (1).jpg',
  'IMG_20251012_124942.jpg',
  'IMG_20251102_152625.jpg',
  'IMG_20251105_164158_999.jpg',
  'IMG_20251121_150215_742.jpg',
  'IMG_20251121_150502_830.jpg',
  'IMG_20260124_093217_932.jpg',
  'IMG_20260217_172422_823 (1).jpg',
  'IMG_20260312_215909.jpg',
  'IMG_20260313_100629.jpg',
  'IMG_8923.jpg',
  'IMG_8925.jpg',
  'IMG_8929 (1).jpg',
  'IMG_8930.jpg',
  'IMG_8935.jpg',
  'IMG_8941.jpg',
  'IMG_8943.jpg',
  'IMG_8945.jpg',
  'IMG_8951.jpg',
  'IMG_8960.jpg',
  'IMG_8963 (1).jpg',
  'IMG_8963.jpg',
  'IMG_8964.jpg',
  'IMG_8972.jpg',
  'IMG_8975.jpg',
  'IMG_8987.jpg',
  'IMG_9014.jpg',
  'IMG_9020 (1).jpg',
  'IMG_9020.jpg',
  'IMG_9026.jpg',
  'IMG_9029.jpg',
  'IMG_9033.jpg',
  'IMG_9037 (1).jpg',
  'IMG_9037.jpg',
  'IMG_9042.jpg',
  'IMG-20250904-WA0063.jpg',
  'MI13T_Leica20251012_112519_100zoom.jpg',
  'Screenshot_20250411-154858 (1).jpg',
  'Screenshot_20251001-191441.jpg',
  'Screenshot_20251214-173556.jpg'
];

const videoFiles = [
  {
    label: 'Koleksi Videography',
    src: 'https://drive.google.com/drive/u/3/folders/1t8MCTwipeYgYruvDxATELQNVbOefsswy',
    type: 'drive'
  }
];

const Gallery = {
  data: {
    desainkugrafis: designFiles.map(filename => ({
      src: buildMediaPath('designku', filename),
      label: formatLabel(filename),
      category: guessDesignCategory(filename)
    })),
    fotoku: photoFiles.map(filename => ({
      src: buildMediaPath('fotoku', filename),
      label: formatLabel(filename),
      category: guessPhotoCategory(filename)
    })),
    videoku: videoFiles
  },

  renderDesain(filter = 'all') {
    const grid = document.getElementById('desainGrid');
    if (!grid) return;

    let items = filter === 'all'
      ? this.data.desainkugrafis
      : this.data.desainkugrafis.filter(item => item.category === filter);

    if (items.length === 0) {
      items = this.data.desainkugrafis;
    }

    grid.innerHTML = '';

    items.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'gallery-item fade-in';
      card.style.transitionDelay = `${(index % 4) * 0.05}s`;
      card.innerHTML = createLazyImageMarkup(item);

      const img = card.querySelector('img');
      if (img) {
        img.addEventListener('load', () => markMediaLoaded(card), { once: true });
        img.addEventListener('error', () => markMediaLoaded(card), { once: true });
      }

      card.addEventListener('click', () => this.openImageModal(item.src, item.label));
      grid.appendChild(card);
    });

    observeGalleryMedia();
    ScrollAnimations.checkVisible();
  },

  renderFoto(filter = 'all') {
    const grid = document.getElementById('fotoGrid');
    if (!grid) return;

    let items = filter === 'all'
      ? this.data.fotoku
      : this.data.fotoku.filter(item => item.category === filter);

    if (items.length === 0) {
      items = this.data.fotoku;
    }

    grid.innerHTML = '';

    items.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'gallery-item fade-in';
      card.style.transitionDelay = `${(index % 4) * 0.05}s`;
      card.innerHTML = createLazyImageMarkup(item);

      const img = card.querySelector('img');
      if (img) {
        img.addEventListener('load', () => markMediaLoaded(card), { once: true });
        img.addEventListener('error', () => markMediaLoaded(card), { once: true });
      }

      card.addEventListener('click', () => this.openImageModal(item.src, item.label));
      grid.appendChild(card);
    });

    observeGalleryMedia();
    ScrollAnimations.checkVisible();
  },

  renderVideo() {
    const grid = document.getElementById('videoGrid');
    if (!grid) return;

    grid.innerHTML = '';

    this.data.videoku.forEach((item, index) => {
      const card = document.createElement('a');
      card.href = item.src;
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
      card.className = 'gallery-item video-drive-card fade-in';
      card.style.transitionDelay = `${(index % 4) * 0.05}s`;
      card.style.aspectRatio = '16/9';
      card.classList.add('is-loaded');
      card.innerHTML = `
        <div class="video-thumb-placeholder drive-thumb">
          <div class="drive-icon" aria-hidden="true">G</div>
          <div class="drive-title">${item.label}</div>
          <div class="drive-subtitle">Buka folder Google Drive</div>
        </div>
        <div class="gallery-overlay"><span>Buka Google Drive</span></div>
      `;

      grid.appendChild(card);
    });

    ScrollAnimations.checkVisible();
  },

  openImageModal(src, label) {
    const img = document.getElementById('modalImage');
    const caption = document.getElementById('modalCaption');
    const placeholder = document.getElementById('imageModalPlaceholder');
    if (!img) return;

    img.src = src;
    img.style.display = 'block';
    if (placeholder) placeholder.style.display = 'none';

    if (caption) {
      caption.textContent = label || 'Preview';
    }

    Modal.open('imageModal');
  },

  openVideoModal(item) {
    const video = document.getElementById('modalVideo');
    const iframe = document.getElementById('modalYoutube');
    const caption = document.getElementById('videoCaption');
    const placeholder = document.getElementById('videoPlaceholder');
    if (!video || !iframe) return;

    if (placeholder) placeholder.style.display = 'none';

    if (item.type === 'youtube') {
      video.pause();
      video.removeAttribute('src');
      video.style.display = 'none';
      iframe.src = item.embedSrc;
      iframe.style.display = 'block';
    } else {
      iframe.removeAttribute('src');
      iframe.style.display = 'none';
      video.src = item.src;
      video.style.display = 'block';
      video.play().catch(() => {});
    }

    if (caption) {
      caption.textContent = item.label || 'Video Preview';
    }

    Modal.open('videoModal');
  }
};

function initFilterTabs() {
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const group = tab.dataset.group;
      const filter = tab.dataset.filter;

      document.querySelectorAll(`.filter-tab[data-group="${group}"]`).forEach(item => {
        item.classList.toggle('active', item === tab);
      });

      if (group === 'desain') Gallery.renderDesain(filter);
      if (group === 'foto') Gallery.renderFoto(filter);
    });
  });
}

function initLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;

  setTimeout(() => {
    loader.classList.add('hide');
    setTimeout(() => loader.remove(), 600);
  }, 1400);
}

document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  ThemeManager.init();
  document.getElementById('themeToggle')?.addEventListener('click', () => ThemeManager.toggle());

  MobileMenu.init();
  Modal.init();
  ScrollAnimations.init();

  Gallery.renderDesain();
  Gallery.renderFoto();
  Gallery.renderVideo();
  initFilterTabs();
});
