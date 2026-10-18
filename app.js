// Cẩm nang khách lưu trú — đọc nội dung từ Google Sheets (hoặc data/*.csv) rồi hiển thị.
// Thông thường bạn KHÔNG cần sửa file này; nội dung nằm trong Google Sheets.
(function () {
  'use strict';

  // ---------- Chữ cố định trên giao diện ----------
  const UI = {
    vi: {
      loading: 'Đang tải dữ liệu…', loadError: 'Chưa tải được dữ liệu. Vui lòng tải lại trang sau ít phút.',
      search: 'Tìm địa điểm…', all: 'Tất cả', empty: 'Không tìm thấy địa điểm phù hợp',
      tabExplore: '🌲 Khám phá quanh đây', tabRoom: '🏠 Phòng ở & Nội quy',
      chips: { z1: 'Dưới 1 km', z2: '1–2,5 km', z3: '2,5–5 km', z4: 'Trên 5 km', zb: '🚌 Nhà xe' },
      zones: { z1: 'Ngay cạnh (dưới 1 km)', z2: 'Trung tâm (1–2,5 km)', z3: 'Mở rộng (2,5–5 km)', z4: 'Xa & thiên nhiên (trên 5 km)', zb: 'Bến xe & Limousine' },
      zdesc: {
        z0: 'Bạn đang ở đây', z1: 'Đi bộ khoảng 3–12 phút', z2: 'Xe máy khoảng 5–10 phút',
        z3: 'Xe máy khoảng 10–15 phút', z4: 'Khoảng 20–30 phút, hợp đi cả ngày', zb: 'Sắp xếp từ gần đến xa, tiện đặt vé đi tỉnh khác'
      },
      tags: { trend: '🔥 Trend giới trẻ', family: '👨‍👩‍👧 Gia đình', nature: '🌿 Thiên nhiên' },
      cats: { cafe: 'Cà phê', food: 'Ăn uống', nature: 'Thiên nhiên', transport: 'Nhà xe', wellness: 'Thư giãn', play: 'Vui chơi', other: 'Khác', home: 'Bạn đang ở đây' },
      map: 'Mở Google Maps', phone: 'Hotline',
      feeTitle: '📋 Chính sách phí & đền bù', feeDesc: 'Vui lòng đọc trước khi nhận phòng để hai bên minh bạch, tránh hiểu lầm khi trả phòng.',
      smokeTitle: 'Không hút thuốc trong phòng', linen: 'Đồ vải bị bẩn / hư hỏng', mattress: '🛏️ Nệm & giường',
      colItem: 'Hạng mục', colMild: 'Bẩn nhẹ', colSevere: 'Hư hỏng',
      wifiTitle: '📶 WiFi', wifiNet: 'Tên mạng', wifiPass: 'Mật khẩu', copy: 'Sao chép', copied: 'Đã sao chép ✓',
      amenTitle: '🛏️ Tiện nghi & đồ dùng', amenDesc: 'Có sẵn trong phòng, dùng thoải mái', roomAmen: 'Tiện nghi phòng', careAmen: 'Đồ dùng cá nhân',
      hoursTitle: '🕒 Giờ nhận / trả phòng', hoursDesc: 'Áp dụng cho mọi đặt phòng', early: 'Nhận phòng sớm', late: 'Trả phòng trễ',
      svcTitle: '🛵 Dịch vụ thêm', svcDesc: 'Vui lòng đăng ký với lễ tân trước khi sử dụng'
    },
    en: {
      loading: 'Loading…', loadError: 'Could not load the guide. Please reload the page in a few minutes.',
      search: 'Search a place…', all: 'All', empty: 'No matching places',
      tabExplore: '🌲 Explore nearby', tabRoom: '🏠 Room & House rules',
      chips: { z1: 'Under 1 km', z2: '1–2.5 km', z3: '2.5–5 km', z4: 'Over 5 km', zb: '🚌 Buses' },
      zones: { z1: 'Right next door (under 1 km)', z2: 'City centre (1–2.5 km)', z3: 'Further out (2.5–5 km)', z4: 'Far & nature (over 5 km)', zb: 'Bus & limousine offices' },
      zdesc: {
        z0: "You're staying here", z1: 'About a 3–12 minute walk', z2: 'About 5–10 minutes by motorbike',
        z3: 'About 10–15 minutes by motorbike', z4: 'About 20–30 minutes, good for a day trip', zb: 'Sorted near to far, for booking onward travel'
      },
      tags: { trend: '🔥 Trending', family: '👨‍👩‍👧 Family', nature: '🌿 Nature' },
      cats: { cafe: 'Cafe', food: 'Food', nature: 'Nature', transport: 'Bus office', wellness: 'Relax', play: 'Play', other: 'Other', home: 'You are here' },
      map: 'Open Google Maps', phone: 'Phone',
      feeTitle: '📋 Fees & damage policy', feeDesc: 'Please read before check-in — it keeps things clear for everyone.',
      smokeTitle: 'No smoking in the room', linen: 'Stained or damaged linen', mattress: '🛏️ Mattress & bed',
      colItem: 'Item', colMild: 'Mild', colSevere: 'Damaged',
      wifiTitle: '📶 WiFi', wifiNet: 'Network', wifiPass: 'Password', copy: 'Copy', copied: 'Copied ✓',
      amenTitle: '🛏️ Amenities', amenDesc: 'Included in your room, free to use', roomAmen: 'Room amenities', careAmen: 'Personal care items',
      hoursTitle: '🕒 Check-in / Check-out', hoursDesc: 'Applies to all bookings', early: 'Early check-in', late: 'Late check-out',
      svcTitle: '🛵 Extra services', svcDesc: 'Please ask reception before use'
    }
  };

  // Giá trị người dùng gõ trong Google Sheets (không phân biệt dấu, hoa/thường) → mã nội bộ
  const CATS = { 'ca phe': 'cafe', 'an uong': 'food', 'thien nhien': 'nature', 'nha xe': 'transport', 'thu gian': 'wellness', 'vui choi': 'play' };
  const TAGS = { 'trend': 'trend', 'gia dinh': 'family', 'thien nhien': 'nature' };
  const RULE_KINDS = [
    ['nhan phong som', 'early'], ['tra phong tre', 'late'], ['do vai', 'linen'], ['nem', 'mattress'],
    ['ghi chu', 'feeNote'], ['dich vu', 'service'], ['tien nghi', 'roomAmen'], ['do dung', 'careAmen']
  ];
  const ZONES = ['z1', 'z2', 'z3', 'z4'];

  const state = { lang: 'vi', view: 'explore', zone: 'all', tag: 'all', q: '', info: {}, places: [], rules: {} };
  const $ = (id) => document.getElementById(id);

  // ---------- Tiện ích ----------
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function norm(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/\s+/g, ' ').trim();
  }
  function num(s) {
    const n = parseFloat(String(s || '').replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  }
  function fmtNum(n) {
    return n.toLocaleString(state.lang === 'vi' ? 'vi-VN' : 'en-US', { maximumFractionDigits: 2 });
  }
  function tr(obj) { return (obj && (obj[state.lang] || obj.vi)) || ''; }
  function info(key) { return tr(state.info[key]); }
  function safeUrl(u) { return /^https?:\/\//i.test(u || '') ? u : ''; }
  function mapsUrl(name, addr, link) {
    return safeUrl(link) || 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent([name, addr].filter(Boolean).join(', '));
  }
  function store(key, value) {
    try { if (value === undefined) return localStorage.getItem('guide:' + key); localStorage.setItem('guide:' + key, value); } catch (e) { /* bỏ qua */ }
    return null;
  }

  // ---------- Đọc CSV ----------
  function parseCSV(text) {
    text = String(text).replace(/^﻿/, '');
    const rows = []; let row = [], field = '', inQ = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (inQ) {
        if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
        else if (c === '"') inQ = false;
        else field += c;
      } else if (c === '"') inQ = true;
      else if (c === ',') { row.push(field); field = ''; }
      else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
      else if (c !== '\r') field += c;
    }
    if (field !== '' || row.length) { row.push(field); rows.push(row); }
    if (!rows.length) return [];
    const head = rows[0].map((h) => norm(h).replace(/ /g, '_'));
    return rows.slice(1)
      .filter((r) => r.some((v) => v.trim() !== ''))
      .map((r) => Object.fromEntries(head.map((h, j) => [h, (r[j] || '').trim()])));
  }

  async function fetchText(url) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 10000);
    try {
      const res = await fetch(url, { signal: ctrl.signal, cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return await res.text();
    } finally { clearTimeout(timer); }
  }

  // Ưu tiên Google Sheets → bản lưu gần nhất trên máy khách → data/*.csv → du-lieu-du-phong.js
  async function loadSource(name) {
    const url = (window.GUIDE_CONFIG || {})[name];
    if (url) {
      try {
        const text = await fetchText(url);
        if (/^\s*</.test(text)) throw new Error('Link không trả về CSV — kiểm tra lại bước "Công bố lên web".');
        store('csv:' + name, text);
        return parseCSV(text);
      } catch (e) {
        console.warn('[Cẩm nang] Không đọc được "' + name + '" từ Google Sheets:', e);
        const cached = store('csv:' + name);
        if (cached) return parseCSV(cached);
      }
    }
    try {
      return parseCSV(await fetchText('data/' + name + '.csv'));
    } catch (e) {
      // Mở thẳng file index.html trên máy: trình duyệt không cho đọc data/*.csv
      const embedded = (window.GUIDE_FALLBACK || {})[name];
      if (embedded) return parseCSV(embedded);
      throw e;
    }
  }

  // ---------- Chuyển dữ liệu bảng tính thành đối tượng ----------
  function buildInfo(rows) {
    const out = {};
    rows.forEach((r) => { if (r.khoa) out[r.khoa.trim()] = { vi: r.vi, en: r.en }; });
    return out;
  }

  function buildPlaces(rows) {
    return rows
      .filter((r) => r.ten && !r.an)
      .map((r) => ({
        name: r.ten,
        addr: r.dia_chi,
        dist: num(r.khoang_cach_km),
        cat: CATS[norm(r.loai)] || 'other',
        tags: String(r.nhom || '').split(/[,;]/).map((t) => TAGS[norm(t)]).filter(Boolean),
        rating: num(r.sao),
        reviews: parseInt(String(r.luot_danh_gia || '').replace(/\D/g, ''), 10) || null,
        hours: r.gio_mo_cua,
        note: { vi: r.ghi_chu_vi, en: r.ghi_chu_en },
        link: r.link_google_maps
      }))
      .sort((a, b) => (a.dist ?? Infinity) - (b.dist ?? Infinity));
  }

  function buildRules(rows) {
    const out = {};
    rows.filter((r) => r.muc && !r.an).forEach((r) => {
      const m = norm(r.muc);
      const kind = (RULE_KINDS.find(([k]) => m.startsWith(k)) || [])[1];
      if (!kind) return;
      (out[kind] = out[kind] || []).push({
        name: { vi: r.ten_vi, en: r.ten_en },
        note: { vi: r.ghi_chu_vi, en: r.ghi_chu_en },
        price: { vi: r.gia_vi, en: r.gia_en },
        price2: { vi: r.gia2_vi, en: r.gia2_en }
      });
    });
    return out;
  }

  function zoneOf(d) {
    if (d == null || d >= 5) return 'z4';
    if (d < 1) return 'z1';
    if (d < 2.5) return 'z2';
    return 'z3';
  }

  // ---------- Giao diện chung ----------
  function renderChrome() {
    const t = UI[state.lang];
    document.documentElement.lang = state.lang;
    document.querySelectorAll('[data-lang]').forEach((b) => b.classList.toggle('active', b.dataset.lang === state.lang));
    document.querySelectorAll('[data-view]').forEach((b) => b.classList.toggle('active', b.dataset.view === state.view));
    $('tab-explore').textContent = t.tabExplore;
    $('tab-room').textContent = t.tabRoom;
    $('search').placeholder = t.search;

    const name = info('ten_homestay');
    $('brand-name').textContent = name || ' ';
    $('brand-sub').textContent = info('mo_ta_ngan');
    if (name) document.title = name + (state.lang === 'vi' ? ' — Cẩm nang khách lưu trú' : ' — Guest guide');
    if (info('logo')) {
      $('logo').src = info('logo');
      document.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]').forEach((l) => { l.href = info('logo'); });
    }
    $('logo').alt = name;

    $('foot-name').textContent = name;
    $('foot-addr').textContent = info('dia_chi');
    const phone = info('hotline');
    $('foot-phone').innerHTML = phone ? t.phone + ': <a href="tel:' + esc(phone.replace(/[^\d+]/g, '')) + '">' + esc(phone) + '</a>' : '';

    $('explore-controls').hidden = state.view !== 'explore';
    $('explore-main').hidden = state.view !== 'explore';
    $('room-main').hidden = state.view !== 'room';
  }

  function renderFilters() {
    const t = UI[state.lang];
    const chips = [['all', t.all]].concat(ZONES.concat('zb').map((z) => [z, t.chips[z]]));
    $('filters').innerHTML = chips.map(([z, label]) =>
      '<button type="button" class="chip' + (state.zone === z ? ' active' : '') + '" data-zone="' + z + '">' + esc(label) + '</button>').join('');
    $('tagfilters').innerHTML = Object.keys(TAGS).map((k) => TAGS[k]).map((tag) =>
      '<button type="button" class="tagchip' + (state.tag === tag ? ' active' : '') + '" data-tag="' + tag + '">' + esc(t.tags[tag]) + '</button>').join('');
  }

  // ---------- Tab "Khám phá" ----------
  function placeCard(p) {
    const t = UI[state.lang];
    const distText = p.dist != null ? ' · ' + fmtNum(p.dist) + ' km' : '';
    const badges = ['<span class="tag tag-' + p.cat + '">' + esc(t.cats[p.cat]) + '</span>']
      .concat(p.tags.map((g) => '<span class="tag badge-' + g + '">' + esc(t.tags[g]) + '</span>')).join('');
    const meta = [
      p.rating != null ? '<span><span class="star">★</span> ' + fmtNum(p.rating) + (p.reviews ? ' (' + fmtNum(p.reviews) + ')' : '') + '</span>' : '',
      p.hours ? '<span>🕒 ' + esc(p.hours) + '</span>' : ''
    ].join('');
    const note = tr(p.note);
    return '<div class="card">' +
      '<p class="card-name">' + esc(p.name) + '</p>' +
      '<p class="card-addr">' + esc(p.addr) + distText + '</p>' +
      '<div class="badge-row">' + badges + '</div>' +
      (meta ? '<div class="meta-row">' + meta + '</div>' : '') +
      (note ? '<div class="note">' + esc(note) + '</div>' : '') +
      '<a class="map-btn" href="' + esc(mapsUrl(p.name, p.addr, p.link)) + '" target="_blank" rel="noopener">' + esc(t.map) + '</a>' +
      '</div>';
  }

  function zoneSection(title, desc, cardsHtml) {
    return '<section class="zone"><div class="zone-head"><p class="zone-title">' + esc(title) + '</p>' +
      (desc ? '<p class="zone-desc">' + esc(desc) + '</p>' : '') + '</div>' + cardsHtml + '</section>';
  }

  function renderExplore() {
    const t = UI[state.lang];
    const q = norm(state.q);
    const match = (p) => (!q || norm(p.name + ' ' + p.addr).includes(q)) && (state.tag === 'all' || p.tags.includes(state.tag));
    let html = '';

    if (state.zone === 'all' && !q && state.tag === 'all' && info('ten_homestay')) {
      const home = '<div class="card"><p class="card-name">' + esc(info('ten_homestay')) + '</p>' +
        '<p class="card-addr">' + esc(info('dia_chi')) + '</p>' +
        '<div class="badge-row"><span class="tag tag-home">' + esc(t.cats.home) + '</span></div>' +
        '<a class="map-btn" href="' + esc(mapsUrl(info('ten_homestay'), info('dia_chi'), info('link_google_maps'))) + '" target="_blank" rel="noopener">' + esc(t.map) + '</a></div>';
      html += zoneSection('🏠 ' + info('ten_homestay'), t.zdesc.z0, home);
    }

    const groups = state.zone === 'zb'
      ? [['zb', state.places.filter((p) => p.cat === 'transport')]]
      : (state.zone === 'all' ? ZONES : [state.zone]).map((z) => [z, state.places.filter((p) => zoneOf(p.dist) === z)]);

    let shown = 0;
    groups.forEach(([z, list]) => {
      const items = list.filter(match);
      if (!items.length) return;
      shown += items.length;
      html += zoneSection(t.zones[z], t.zdesc[z], items.map(placeCard).join(''));
    });
    if (!shown && (q || state.tag !== 'all' || state.zone !== 'all')) html += '<div class="status">' + esc(t.empty) + '</div>';
    $('explore-main').innerHTML = html;
  }

  // ---------- Tab "Phòng ở & Nội quy" ----------
  function priceSpan(p) {
    const text = tr(p);
    if (!text) return '';
    const free = /^(mien phi|free)/.test(norm(text));
    return '<span class="price' + (free ? ' free' : '') + '">' + esc(text) + '</span>';
  }

  function priceTable(rows, withHeader) {
    const t = UI[state.lang];
    const twoCols = rows.some((r) => tr(r.price2));
    const head = withHeader && twoCols
      ? '<div class="prow prow-head"><span>' + esc(t.colItem) + '</span><span class="prices"><span class="price">' + esc(t.colMild) + '</span><span class="price">' + esc(t.colSevere) + '</span></span></div>'
      : '';
    return '<div class="ptable">' + head + rows.map((r) => {
      const note = tr(r.note);
      const prices = twoCols ? (priceSpan(r.price) || '<span class="price">—</span>') + (priceSpan(r.price2) || '<span class="price">—</span>') : priceSpan(r.price);
      return '<div class="prow"><span>' + esc(tr(r.name)) + (note ? '<span class="prow-sub">' + esc(note) + '</span>' : '') + '</span>' +
        '<span class="prices">' + prices + '</span></div>';
    }).join('') + '</div>';
  }

  function section(title, desc, body) {
    return '<section class="rsection"><p class="rsection-title">' + esc(title) + '</p>' +
      (desc ? '<p class="rsection-desc">' + esc(desc) + '</p>' : '') + body + '</section>';
  }

  function renderRoom() {
    const t = UI[state.lang];
    const R = state.rules;
    let html = '';

    // Phí & đền bù
    let fees = '';
    const smoke = info('cam_hut_thuoc');
    if (smoke) fees += '<div class="smoke-warning"><div class="smoke-icon">🚭</div><div><p class="smoke-title">' + esc(t.smokeTitle) + '</p><p class="smoke-fine">' + esc(smoke) + '</p></div></div>';
    if (R.linen) fees += '<p class="sub-title">' + esc(t.linen) + '</p>' + priceTable(R.linen, true);
    if (R.mattress) fees += '<p class="sub-title">' + esc(t.mattress) + '</p>' + priceTable(R.mattress, false);
    if (R.feeNote) fees += '<div class="fee-box">' + R.feeNote.map((r) => '<div class="fee-item">' + esc(tr(r.name)) + '</div>').join('') + '</div>';
    if (fees) html += section(t.feeTitle, t.feeDesc, fees);

    // WiFi
    const wifi = [[t.wifiNet, info('wifi_ten')], [t.wifiPass, info('wifi_mat_khau')]].filter(([, v]) => v);
    if (wifi.length) {
      html += section(t.wifiTitle, '', '<div class="wifi-card">' + wifi.map(([label, v]) =>
        '<div class="wifi-row"><div><div class="wifi-label">' + esc(label) + '</div><div class="wifi-value">' + esc(v) + '</div></div>' +
        '<button type="button" class="copy-btn" data-copy="' + esc(v) + '">' + esc(t.copy) + '</button></div>').join('') + '</div>');
    }

    // Tiện nghi
    const boxes = [[t.roomAmen, R.roomAmen], [t.careAmen, R.careAmen]].filter(([, list]) => list);
    if (boxes.length) {
      html += section(t.amenTitle, t.amenDesc, '<div class="amenity-grid">' + boxes.map(([title, list]) =>
        '<div class="amenity-box"><h4>' + esc(title) + '</h4><ul>' + list.map((r) => '<li>' + esc(tr(r.name)) + '</li>').join('') + '</ul></div>').join('') + '</div>');
    }

    // Giờ nhận / trả phòng
    const cin = info('gio_nhan_phong'), cout = info('gio_tra_phong');
    let hours = '';
    if (cin || cout) {
      hours += '<div class="stat-grid">' +
        (cin ? '<div class="stat-box"><div class="stat-label">Check-in</div><div class="stat-value">' + esc(cin) + '</div></div>' : '') +
        (cout ? '<div class="stat-box"><div class="stat-label">Check-out</div><div class="stat-value">' + esc(cout) + '</div></div>' : '') + '</div>';
    }
    if (R.early) hours += '<p class="sub-title">' + esc(t.early) + '</p>' + priceTable(R.early, false);
    if (R.late) hours += '<p class="sub-title">' + esc(t.late) + '</p>' + priceTable(R.late, false);
    if (hours) html += section(t.hoursTitle, t.hoursDesc, hours);

    // Dịch vụ thêm
    if (R.service) {
      html += section(t.svcTitle, t.svcDesc, R.service.map((r) => {
        const note = tr(r.note);
        return '<div class="service-card"><div><p class="service-name">' + esc(tr(r.name)) + '</p>' +
          (note ? '<p class="service-note">' + esc(note) + '</p>' : '') + '</div>' +
          '<div class="service-price">' + esc(tr(r.price)) + '</div></div>';
      }).join(''));
    }

    $('room-main').innerHTML = html;
  }

  function renderAll() {
    renderChrome();
    renderFilters();
    renderExplore();
    renderRoom();
  }

  // ---------- Sao chép ----------
  function copy(text, btn) {
    const done = () => {
      btn.textContent = UI[state.lang].copied;
      setTimeout(() => { btn.textContent = UI[state.lang].copy; }, 1500);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, () => {});
      return;
    }
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { /* bỏ qua */ }
    ta.remove();
  }

  // ---------- Sự kiện ----------
  document.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.lang) { state.lang = b.dataset.lang; store('lang', state.lang); renderAll(); }
    else if (b.dataset.view) { state.view = b.dataset.view; renderChrome(); window.scrollTo(0, 0); }
    else if (b.dataset.zone) { state.zone = b.dataset.zone; renderFilters(); renderExplore(); }
    else if (b.dataset.tag) { state.tag = state.tag === b.dataset.tag ? 'all' : b.dataset.tag; renderFilters(); renderExplore(); }
    else if (b.dataset.copy != null) copy(b.dataset.copy, b);
  });
  $('search').addEventListener('input', (e) => { state.q = e.target.value; renderExplore(); });

  // ---------- Khởi động ----------
  const urlLang = new URLSearchParams(location.search).get('lang');
  state.lang = (urlLang || store('lang')) === 'en' ? 'en' : 'vi';
  renderChrome();
  renderFilters();
  $('explore-main').innerHTML = '<div class="status">' + esc(UI[state.lang].loading) + '</div>';

  Promise.all(['thong_tin', 'dia_diem', 'noi_quy'].map(loadSource))
    .then(([infoRows, placeRows, ruleRows]) => {
      state.info = buildInfo(infoRows);
      state.places = buildPlaces(placeRows);
      state.rules = buildRules(ruleRows);
      renderAll();
    })
    .catch((err) => {
      console.error('[Cẩm nang] Lỗi tải dữ liệu:', err);
      $('explore-main').innerHTML = '<div class="status">' + esc(UI[state.lang].loadError) + '</div>';
    });
})();
