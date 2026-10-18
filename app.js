// Cẩm nang khách lưu trú — đọc nội dung từ Google Sheets (hoặc data/*.csv) rồi hiển thị.
// Thông thường bạn KHÔNG cần sửa file này; nội dung nằm trong Google Sheets.
(function () {
  'use strict';

  // ---------- Chữ cố định trên giao diện ----------
  const UI = {
    vi: {
      loading: 'Đang tải dữ liệu…', loadError: 'Chưa tải được dữ liệu. Vui lòng tải lại trang sau ít phút.',
      search: 'Tìm quán ăn, cà phê, địa điểm…', all: 'Tất cả',
      empty: 'Không tìm thấy địa điểm phù hợp', reset: 'Xoá bộ lọc', count: (n) => n + ' địa điểm', suitFor: 'Phù hợp:',
      tabExplore: '🤯 Khám phá', tabRoom: '🏡 Phòng ở & Nội quy',
      cats: { food: '🍜 Ăn uống', cafe: '☕ Cà phê', nature: '🌿 Thiên nhiên', play: '🎠 Vui chơi', wellness: '💆 Thư giãn', transport: '🚌 Di chuyển', other: 'Khác', home: 'Bạn đang ở đây' },
      zones: { z1: 'Ngay cạnh (dưới 1 km)', z2: 'Trung tâm (1–2,5 km)', z3: 'Mở rộng (2,5–5 km)', z4: 'Xa & thiên nhiên (trên 5 km)' },
      zdesc: {
        z0: 'Bạn đang ở đây', z1: 'Đi bộ khoảng 3–12 phút', z2: 'Xe máy khoảng 5–10 phút',
        z3: 'Xe máy khoảng 10–15 phút', z4: 'Khoảng 20–30 phút, hợp đi cả ngày'
      },
      transportTitle: 'Di chuyển', transportDesc: 'Bến xe, nhà xe & limousine để đi tỉnh khác hoặc ra sân bay — xếp từ gần đến xa',
      promoTitle: 'Thuê xe & dịch vụ của homestay', promoText: 'Xem bảng giá thuê xe máy, ô tô và các dịch vụ khác', promoCta: 'Xem →',
      tags: { trend: '🔥 Trend', family: '👩‍❤️‍💋‍👩 Gia đình', nature: '🏝️ Thiên nhiên' },
      walk: (m) => '🚶 ~' + m + ' phút đi bộ', ride: (m) => '🛵 ~' + m + ' phút', pinned: '📍 Định vị trên bản đồ',
      map: 'Mở Google Maps', phone: 'Hotline', toTop: 'Về đầu trang',
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
      search: 'Search food, cafes, places…', all: 'All',
      empty: 'No matching places', reset: 'Clear filters', count: (n) => n + (n === 1 ? ' place' : ' places'), suitFor: 'Good for:',
      tabExplore: '🤯 Explore', tabRoom: '🏡 Room & Rules',
      cats: { food: '🍜 Food', cafe: '☕ Cafe', nature: '🌿 Nature', play: '🎠 Play', wellness: '💆 Relax', transport: '🚌 Getting around', other: 'Other', home: 'You are here' },
      zones: { z1: 'Right next door (under 1 km)', z2: 'City centre (1–2.5 km)', z3: 'Further out (2.5–5 km)', z4: 'Far & nature (over 5 km)' },
      zdesc: {
        z0: "You're staying here", z1: 'About a 3–12 minute walk', z2: 'About 5–10 minutes by motorbike',
        z3: 'About 10–15 minutes by motorbike', z4: 'About 20–30 minutes, good for a day trip'
      },
      transportTitle: 'Getting around', transportDesc: 'Bus stations, coach & limousine offices for onward travel or the airport — nearest first',
      promoTitle: 'Rentals & homestay services', promoText: 'See prices for motorbike and car rental and other services', promoCta: 'View →',
      tags: { trend: '🔥 Trending', family: '👩‍❤️‍💋‍👩 Family', nature: '🏝️ Nature' },
      walk: (m) => '🚶 ~' + m + ' min walk', ride: (m) => '🛵 ~' + m + ' min ride', pinned: '📍 Pinned on map',
      map: 'Open Google Maps', phone: 'Phone', toTop: 'Back to top',
      feeTitle: '📋 Fees & damage policy', feeDesc: 'Please read before check-in — it keeps things clear for everyone.',
      smokeTitle: 'No smoking in the room', linen: 'Stained or damaged linen', mattress: '🛏️ Mattress & bed',
      colItem: 'Item', colMild: 'Mild', colSevere: 'Damaged',
      wifiTitle: '📶 WiFi', wifiNet: 'Network', wifiPass: 'Password', copy: 'Copy', copied: 'Copied ✓',
      amenTitle: '🛏️ Amenities', amenDesc: 'Included in your room, free to use', roomAmen: 'Room amenities', careAmen: 'Personal care items',
      hoursTitle: '🕒 Check-in / Check-out', hoursDesc: 'Applies to all bookings', early: 'Early check-in', late: 'Late check-out',
      svcTitle: '🛵 Extra services', svcDesc: 'Please ask reception before use'
    }
  };

  // Giá trị người dùng gõ trong Google Sheets (không phân biệt dấu, hoa/thường) → mã nội bộ.
  // "Nhà xe" và "Di chuyển" đều được hiểu là nhóm Di chuyển.
  const CATS = { 'ca phe': 'cafe', 'an uong': 'food', 'thien nhien': 'nature', 'nha xe': 'transport', 'di chuyen': 'transport', 'thu gian': 'wellness', 'vui choi': 'play' };
  const CAT_ORDER = ['food', 'cafe', 'nature', 'play', 'wellness', 'transport'];
  const TAGS = { 'trend': 'trend', 'gia dinh': 'family', 'thien nhien': 'nature' };
  const RULE_KINDS = [
    ['nhan phong som', 'early'], ['tra phong tre', 'late'], ['do vai', 'linen'], ['nem', 'mattress'],
    ['ghi chu', 'feeNote'], ['dich vu', 'service'], ['tien nghi', 'roomAmen'], ['do dung', 'careAmen']
  ];
  const ZONES = ['z1', 'z2', 'z3', 'z4'];

  const state = { lang: 'vi', view: 'explore', cat: 'all', tag: 'all', q: '', info: {}, places: [], rules: {} };
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
  // Đọc toạ độ từ chữ "11.9404, 108.4583" hoặc từ link Google Maps dạng .../@11.94,108.45... hay ?q=11.94,108.45
  function parseCoords(s) {
    s = String(s || '');
    const m = s.match(/^\s*(-?\d{1,2}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)\s*$/) ||
      s.match(/@(-?\d{1,2}\.\d+),(-?\d{1,3}\.\d+)/) ||
      s.match(/[?&](?:q|query|ll|destination)=(-?\d{1,2}\.\d+)(?:,|%2C)\s*(-?\d{1,3}\.\d+)/i);
    if (!m) return null;
    const lat = parseFloat(m[1]), lng = parseFloat(m[2]);
    return Math.abs(lat) <= 90 && Math.abs(lng) <= 180 ? { lat, lng } : null;
  }
  // Khoảng cách theo đường chim bay (km)
  function haversine(a, b) {
    const R = 6371, rad = (x) => x * Math.PI / 180;
    const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }
  function mapsUrl(name, addr, link, coords) {
    if (safeUrl(link)) return link;
    const q = coords ? coords.lat + ',' + coords.lng : [name, addr].filter(Boolean).join(', ');
    return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q);
  }
  function store(key, value) {
    try { if (value === undefined) return localStorage.getItem('guide:' + key); localStorage.setItem('guide:' + key, value); } catch (e) { /* bỏ qua */ }
    return null;
  }
  // Thời gian ước tính: đi bộ ~4,5 km/h khi gần, xe máy ~25 km/h khi xa
  function eta(d) {
    const t = UI[state.lang];
    if (d == null) return '';
    if (d <= 1.2) return t.walk(Math.max(2, Math.round(d * 13)));
    return t.ride(Math.max(3, Math.round(d / 25 * 60 + 2)));
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

  function buildPlaces(rows, home) {
    return rows
      .filter((r) => r.ten && !r.an)
      .map((r) => {
        // Toạ độ có thể nằm ở cột link_google_maps, cột toa_do (nếu có) hoặc dán nhầm vào cột dia_chi
        const coords = parseCoords(r.toa_do) || parseCoords(r.link_google_maps) || parseCoords(r.dia_chi);
        let dist = num(r.khoang_cach_km), distEst = false;
        if (dist == null && coords && home) { // không điền km: tự tính từ toạ độ (x1,3 cho gần với đường đi thực tế)
          dist = Math.round(haversine(home, coords) * 1.3 * 10) / 10; distEst = true;
        }
        return {
          name: r.ten,          // tên gốc tiếng Việt (dùng để tìm trên Google Maps)
          nameEn: r.ten_en || '', // cột ten_en (không bắt buộc)
          addr: parseCoords(r.dia_chi) ? '' : r.dia_chi,
          coords,
          pinned: !!(coords || safeUrl(r.link_google_maps)),
          dist,
          distEst,
          cat: CATS[norm(r.loai)] || 'other',
          tags: String(r.nhom || '').split(/[,;]/).map((t) => TAGS[norm(t)]).filter(Boolean),
          rating: num(r.sao),
          reviews: parseInt(String(r.luot_danh_gia || '').replace(/\D/g, ''), 10) || null,
          hours: r.gio_mo_cua,
          note: { vi: r.ghi_chu_vi, en: r.ghi_chu_en },
          link: safeUrl(r.link_google_maps)
        };
      })
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
    document.querySelectorAll('[data-view]').forEach((b) => {
      const on = b.dataset.view === state.view;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', on);
    });
    $('tab-explore').textContent = t.tabExplore;
    $('tab-room').textContent = t.tabRoom;
    $('search').placeholder = t.search;
    $('search').setAttribute('aria-label', t.search);
    const toTop = $('to-top');
    if (toTop) toTop.setAttribute('aria-label', t.toTop);

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

  // Thanh lọc theo NHÓM (chỉ hiện nhóm có dữ liệu). Khoảng cách được thể hiện bằng các mục trong danh sách.
  function renderFilters() {
    const t = UI[state.lang];
    const present = CAT_ORDER.filter((c) => state.places.some((p) => p.cat === c));
    const chips = [['all', t.all]].concat(present.map((c) => [c, t.cats[c]]));
    $('filters').innerHTML = chips.map(([c, label]) =>
      '<button type="button" class="chip' + (c === 'transport' ? ' chip-transport' : '') + (state.cat === c ? ' active' : '') +
      '" data-cat="' + c + '" aria-pressed="' + (state.cat === c) + '">' + esc(label) + '</button>').join('');
  }

  // ---------- Tab "Khám phá" ----------
  function placeCard(p) {
    const t = UI[state.lang];
    // Dòng địa chỉ: bỏ qua phần trống (địa điểm không có số nhà như đồi, hồ, điểm ngắm cảnh)
    // Không có địa chỉ nhưng có định vị → ghi rõ "Định vị trên bản đồ"
    const addrLine = [p.addr || (p.pinned ? t.pinned : ''), p.dist != null ? (p.distEst ? '~' : '') + fmtNum(p.dist) + ' km' : ''].filter(Boolean).join(' · ');
    const badges = ['<span class="tag tag-' + p.cat + '">' + esc(t.cats[p.cat]) + '</span>']
      .concat(p.tags.filter((g) => !(g === 'nature' && p.cat === 'nature')) // tránh 2 nhãn "Thiên nhiên"
        .map((g) => '<span class="tag badge-' + g + '">' + esc(t.tags[g]) + '</span>')).join('');
    const meta = [
      p.rating != null ? '<span><span class="star">★</span> ' + fmtNum(p.rating) + (p.reviews ? ' (' + fmtNum(p.reviews) + ')' : '') + '</span>' : '',
      p.hours ? '<span>🕒 ' + esc(p.hours) + '</span>' : '',
      p.dist != null ? '<span>' + esc(eta(p.dist)) + '</span>' : ''
    ].join('');
    const note = tr(p.note);
    return '<div class="card">' +
      '<p class="card-name">' + esc(state.lang === 'en' && p.nameEn ? p.nameEn : p.name) + '</p>' +
      // Bản tiếng Anh: giữ tên tiếng Việt nhỏ bên dưới để khách đưa cho tài xế / người địa phương xem
      (state.lang === 'en' && p.nameEn && p.nameEn !== p.name ? '<p class="card-name-orig">' + esc(p.name) + '</p>' : '') +
      (addrLine ? '<p class="card-addr">' + esc(addrLine) + '</p>' : '') +
      '<div class="badge-row">' + badges + '</div>' +
      (meta ? '<div class="meta-row">' + meta + '</div>' : '') +
      (note ? '<div class="note">' + esc(note) + '</div>' : '') +
      '<a class="map-btn" href="' + esc(mapsUrl(p.name, p.addr, p.link, p.coords)) + '" target="_blank" rel="noopener">' + esc(t.map) + '</a>' +
      '</div>';
  }

  function zoneSection(title, desc, cardsHtml) {
    return '<section class="zone"><div class="zone-head"><p class="zone-title">' + esc(title) + '</p>' +
      (desc ? '<p class="zone-desc">' + esc(desc) + '</p>' : '') + '</div>' + cardsHtml + '</section>';
  }

  function renderExplore() {
    const t = UI[state.lang];
    const q = norm(state.q);
    const filtering = q || state.tag !== 'all' || state.cat !== 'all';
    const match = (p) => (!q || norm(p.name + ' ' + p.nameEn + ' ' + p.addr).includes(q)) && (state.tag === 'all' || p.tags.includes(state.tag));

    // "Tất cả" = nơi để đi chơi, ăn uống; nhà xe chỉ nằm trong nhóm "Di chuyển".
    // Khi khách gõ tìm kiếm thì tìm trong mọi nhóm.
    const pool = state.places.filter((p) => state.cat === 'all' ? (q ? true : p.cat !== 'transport') : p.cat === state.cat);
    const items = pool.filter(match);

    // Thanh phụ: lọc theo đối tượng + số kết quả
    let html = '<div class="subbar"><div class="tagfilters"><span class="subbar-label">' + esc(t.suitFor) + '</span>' +
      ['trend', 'family', 'nature'].map((g) =>
        '<button type="button" class="tagchip' + (state.tag === g ? ' active' : '') + '" data-tag="' + g + '" aria-pressed="' + (state.tag === g) + '">' + esc(t.tags[g]) + '</button>').join('') +
      '</div>' +
      (filtering ? '<div class="result-row"><span>' + esc(t.count(items.length)) + '</span><button type="button" class="link-btn" data-reset="1">' + esc(t.reset) + '</button></div>' : '') +
      '</div>';

    if (state.cat === 'all' && !filtering && info('ten_homestay')) {
      const home = '<div class="card card-home"><p class="card-name">' + esc(info('ten_homestay')) + '</p>' +
        (info('dia_chi') ? '<p class="card-addr">' + esc(info('dia_chi')) + '</p>' : '') +
        '<div class="badge-row"><span class="tag tag-home">' + esc(t.cats.home) + '</span></div>' +
        '<a class="map-btn" href="' + esc(mapsUrl(info('ten_homestay'), info('dia_chi'), info('link_google_maps'), parseCoords(info('toa_do')))) + '" target="_blank" rel="noopener">' + esc(t.map) + '</a></div>';
      html += zoneSection('🏠 ' + info('ten_homestay'), t.zdesc.z0, home);
    }

    if (state.cat === 'transport') {
      if (state.rules.service && !q) {
        html += '<button type="button" class="promo" data-goto="sec-service"><span class="promo-icon">🛵</span>' +
          '<span class="promo-body"><b>' + esc(t.promoTitle) + '</b><span>' + esc(t.promoText) + '</span></span>' +
          '<span class="promo-cta">' + esc(t.promoCta) + '</span></button>';
      }
      if (items.length) html += zoneSection(t.transportTitle, t.transportDesc, items.map(placeCard).join(''));
    } else {
      ZONES.forEach((z) => {
        const list = items.filter((p) => zoneOf(p.dist) === z);
        if (list.length) html += zoneSection(t.zones[z], t.zdesc[z], list.map(placeCard).join(''));
      });
    }

    if (!items.length && filtering) {
      html += '<div class="status">' + esc(t.empty) + '<br><button type="button" class="link-btn" data-reset="1">' + esc(t.reset) + '</button></div>';
    }
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

  function section(id, title, desc, body) {
    return '<section class="rsection" id="' + id + '"><p class="rsection-title">' + esc(title) + '</p>' +
      (desc ? '<p class="rsection-desc">' + esc(desc) + '</p>' : '') + body + '</section>';
  }

  // Thứ tự theo nhu cầu của khách: WiFi → giờ giấc → tiện nghi → dịch vụ → phí & đền bù
  function renderRoom() {
    const t = UI[state.lang];
    const R = state.rules;
    let html = '';

    // WiFi
    const wifi = [[t.wifiNet, info('wifi_ten')], [t.wifiPass, info('wifi_mat_khau')]].filter(([, v]) => v);
    if (wifi.length) {
      html += section('sec-wifi', t.wifiTitle, '', '<div class="wifi-card">' + wifi.map(([label, v]) =>
        '<div class="wifi-row"><div><div class="wifi-label">' + esc(label) + '</div><div class="wifi-value">' + esc(v) + '</div></div>' +
        '<button type="button" class="copy-btn" data-copy="' + esc(v) + '">' + esc(t.copy) + '</button></div>').join('') + '</div>');
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
    if (hours) html += section('sec-hours', t.hoursTitle, t.hoursDesc, hours);

    // Tiện nghi
    const boxes = [[t.roomAmen, R.roomAmen], [t.careAmen, R.careAmen]].filter(([, list]) => list);
    if (boxes.length) {
      html += section('sec-amen', t.amenTitle, t.amenDesc, '<div class="amenity-grid">' + boxes.map(([title, list]) =>
        '<div class="amenity-box"><h4>' + esc(title) + '</h4><ul>' + list.map((r) => '<li>' + esc(tr(r.name)) + '</li>').join('') + '</ul></div>').join('') + '</div>');
    }

    // Dịch vụ thêm
    if (R.service) {
      html += section('sec-service', t.svcTitle, t.svcDesc, R.service.map((r) => {
        const note = tr(r.note);
        return '<div class="service-card"><div><p class="service-name">' + esc(tr(r.name)) + '</p>' +
          (note ? '<p class="service-note">' + esc(note) + '</p>' : '') + '</div>' +
          '<div class="service-price">' + esc(tr(r.price)) + '</div></div>';
      }).join(''));
    }

    // Phí & đền bù
    let fees = '';
    const smoke = info('cam_hut_thuoc');
    if (smoke) fees += '<div class="smoke-warning"><div class="smoke-icon">🚭</div><div><p class="smoke-title">' + esc(t.smokeTitle) + '</p><p class="smoke-fine">' + esc(smoke) + '</p></div></div>';
    if (R.linen) fees += '<p class="sub-title">' + esc(t.linen) + '</p>' + priceTable(R.linen, true);
    if (R.mattress) fees += '<p class="sub-title">' + esc(t.mattress) + '</p>' + priceTable(R.mattress, false);
    if (R.feeNote) fees += '<div class="fee-box">' + R.feeNote.map((r) => '<div class="fee-item">' + esc(tr(r.name)) + '</div>').join('') + '</div>';
    if (fees) html += section('sec-fees', t.feeTitle, t.feeDesc, fees);

    $('room-main').innerHTML = html;
  }

  function renderAll() {
    renderChrome();
    renderFilters();
    renderExplore();
    renderRoom();
  }

  // Cuộn tới đầu danh sách (ngay dưới thanh dính) khi đổi bộ lọc, để khách thấy kết quả ngay
  function scrollToList() {
    const bar = document.querySelector('.toolbar');
    const top = $('explore-main').getBoundingClientRect().top + window.scrollY - (bar ? bar.offsetHeight : 0);
    if (window.scrollY > top) window.scrollTo(0, top);
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
    else if (b.dataset.cat) { state.cat = b.dataset.cat; renderFilters(); renderExplore(); scrollToList(); }
    else if (b.dataset.tag) { state.tag = state.tag === b.dataset.tag ? 'all' : b.dataset.tag; renderExplore(); }
    else if (b.dataset.reset) { state.cat = 'all'; state.tag = 'all'; state.q = ''; $('search').value = ''; renderFilters(); renderExplore(); }
    else if (b.dataset.goto) {
      state.view = 'room'; renderChrome();
      const target = $(b.dataset.goto);
      if (target) target.scrollIntoView({ block: 'start' }); else window.scrollTo(0, 0);
    }
    else if (b.dataset.copy != null) copy(b.dataset.copy, b);
  });
  $('search').addEventListener('input', (e) => { state.q = e.target.value; renderExplore(); });

  // ---------- Khởi động ----------
  const urlLang = new URLSearchParams(location.search).get('lang');
  state.lang = (urlLang || store('lang')) === 'en' ? 'en' : 'vi';
  renderChrome();
  $('explore-main').innerHTML = '<div class="status">' + esc(UI[state.lang].loading) + '</div>';

  Promise.all(['thong_tin', 'dia_diem', 'noi_quy'].map(loadSource))
    .then(([infoRows, placeRows, ruleRows]) => {
      state.info = buildInfo(infoRows);
      state.places = buildPlaces(placeRows, parseCoords(info('toa_do')) || parseCoords(info('link_google_maps')));
      state.rules = buildRules(ruleRows);
      renderAll();
    })
    .catch((err) => {
      console.error('[Cẩm nang] Lỗi tải dữ liệu:', err);
      $('explore-main').innerHTML = '<div class="status">' + esc(UI[state.lang].loadError) + '</div>';
    });
})();
