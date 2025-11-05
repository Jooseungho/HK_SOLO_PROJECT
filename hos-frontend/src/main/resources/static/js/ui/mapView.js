import { fetchHospitals } from "/js/api/hospitalApi.js";

let map = null;
let markers = [];
let markerMap = {};
let infoWindows = {};

const SEOUL_DISTRICTS = {
  "서울특별시 전체": [37.5665, 126.9780],
  "서울특별시 강남구": [37.5173, 127.0474],
  "서울특별시 서초구": [37.4765, 127.0371],
  "서울특별시 송파구": [37.5145, 127.1059],
  "서울특별시 강동구": [37.5301, 127.1238],
  "서울특별시 동작구": [37.5124, 126.9392],
  "서울특별시 관악구": [37.4784, 126.9516],
  "서울특별시 영등포구": [37.5204, 126.9138],
  "서울특별시 마포구": [37.5663, 126.9018],
  "서울특별시 중구": [37.5636, 126.9976],
  "서울특별시 종로구": [37.57305, 126.97946],
  "서울특별시 용산구": [37.5326, 126.9906],
  "서울특별시 성동구": [37.5633, 127.0369],
  "서울특별시 광진구": [37.5383, 127.0822],
  "서울특별시 동대문구": [37.5744, 127.0396],
  "서울특별시 성북구": [37.5894, 127.0167],
  "서울특별시 노원구": [37.6543, 127.0565],
  "서울특별시 강북구": [37.6396, 127.0257],
  "서울특별시 은평구": [37.6176, 126.9227],
  "서울특별시 서대문구": [37.5791, 126.9368],
  "서울특별시 양천구": [37.5169, 126.8665],
  "서울특별시 강서구": [37.5509, 126.8495],
  "서울특별시 구로구": [37.4955, 126.8877],
  "서울특별시 금천구": [37.4569, 126.8956]
};

// ✅ 보훈 위탁병원 목록 (DB에 없음 → JS에서 직접 필터링)
const VETERAN_NAMES = [
  "서울현대요양병원",
  "더서밋요양병원",
  "의료법인 미소들노인전문병원",
  "팔팔요양병원",
  "햇살요양병원",
  "의료법인유라의료재단 온누리요양병원",
  "한국효요양병원"
];

export function fillDistricts(selectEl) {
  selectEl.innerHTML = Object.keys(SEOUL_DISTRICTS)
    .map(k => `<option>${k}</option>`)
    .join("");
}

export function createMap(containerEl) {
  kakao.maps.load(() => {
    map = new kakao.maps.Map(containerEl, {
      center: new kakao.maps.LatLng(37.5665, 126.9780),
      level: 7
    });
  });
}

export function destroyMap() {
  markers.forEach(m => m.setMap(null));
  markers = [];
  markerMap = {};
  infoWindows = {};
  map = null;
}

/** ✅ 병원 검색 + 필터링 */
export async function searchHospitalsOnMap({ region, keyword = "", category = "" }) {
  // 🟢 region="서울특별시 전체" → undefined로 변환 (전체 불러오기)
  const data = await fetchHospitals({
    region: region === "서울특별시 전체" ? undefined : region,
    keyword
  });

  let hospitals = data.content || [];

  // ✅ 이름 비교 정규화
  const normalize = s => s?.replace(/\s|\(|\)|\./g, "").trim();
  const isVeteran = name =>
    VETERAN_NAMES.some(v =>
      normalize(name).includes(normalize(v)) || normalize(v).includes(normalize(name))
    );

  // ✅ “보훈병원” 선택 시 필터링
  if (category === "보훈병원") {
    hospitals = hospitals.filter(h => isVeteran(h.name));
  }

  // 🟢 지도 중심 및 줌 조정 (보훈병원 선택 시 서울 전체 표시)
  const coords = SEOUL_DISTRICTS[region] || [37.5665, 126.9780];
  if (map) {
    map.setCenter(new kakao.maps.LatLng(coords[0], coords[1]));
    map.setLevel(category === "보훈병원" ? 6 : 7); // ✅ 보훈병원 검색 시 줌아웃
  }

  console.log("검색 조건:", { region, keyword, category });
  console.log("받은 병원 수:", data.content?.length);
  console.log("보훈 필터 통과:", hospitals.length);

  renderMarkers(hospitals, isVeteran);
  renderHospitalList(hospitals, isVeteran);
}

/** ✅ 마커 렌더링 */
function renderMarkers(hospitals, isVeteran) {
  const geocoder = new kakao.maps.services.Geocoder();

  hospitals.forEach(h => {
    const veteran = isVeteran(h.name);

    // ✅ 민트색 카카오스타 (Base64 SVG)
    const iconUrl = veteran
      ? "data:image/svg+xml;base64," +
        btoa(`
          <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='36' height='36'>
            <path fill='#64c8c0' d='M12 2l3 7h7l-5 5 2 7-7-4-7 4 2-7-5-5h7z'/>
          </svg>
        `)
      : (h.category || "").includes("요양")
      ? "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png"
      : "https://cdn-icons-png.flaticon.com/512/684/684908.png";

    const makeMarker = coords => {
      const marker = new kakao.maps.Marker({
        map,
        position: coords,
        image: new kakao.maps.MarkerImage(iconUrl, new kakao.maps.Size(28, 38))
      });
      registerMarkerEvents(marker, h);
    };

    if (h.latitude && h.longitude) {
      makeMarker(new kakao.maps.LatLng(h.latitude, h.longitude));
      return;
    }

    if (h.address) {
      geocoder.addressSearch(h.address, (result, status) => {
        if (status === kakao.maps.services.Status.OK && result[0]) {
          makeMarker(new kakao.maps.LatLng(result[0].y, result[0].x));
        }
      });
    }
  });
}

/** ✅ 리스트 렌더링 */
function renderHospitalList(hospitals, isVeteran) {
  const wrap = document.getElementById("hospitalList");
  wrap.innerHTML = hospitals.length
    ? hospitals
        .map(h => {
          const veteran = isVeteran(h.name);

          // ✅ 보훈병원 + 요양병원 태그 동시 표시
          let badges = "";
          if (veteran)
            badges += `<span class="badge" style="background-color:#64c8c0;color:white;">보훈병원</span> `;
          if ((h.category || "").includes("요양"))
            badges += `<span class="badge bg-warning text-dark">요양병원</span>`;

          const btn = h.homepage?.startsWith("http")
            ? `<a href="${h.homepage}" target="_blank" class="btn btn-outline-success btn-sm" onclick="event.stopPropagation();">바로가기</a>`
            : `<button class="btn btn-outline-primary btn-sm" onclick="event.stopPropagation();">지도보기</button>`;

          return `
          <div class="col-12">
            <div class="card hospital-card" data-id="${h.id}" style="cursor:pointer;">
              <div class="card-body d-flex justify-content-between align-items-center">
                <div>
                  <div class="fw-bold">${escapeHtml(h.name)}</div>
                  <div class="text-muted small">${escapeHtml(h.address || "")}</div>
                  ${badges}
                </div>
                ${btn}
              </div>
            </div>
          </div>`;
        })
        .join("")
    : `<div class="alert alert-warning text-center">해당 구에 등록된 병원이 없습니다.</div>`;

  document.querySelectorAll(".hospital-card").forEach(card => {
    card.onclick = () => {
      const id = card.getAttribute("data-id");
      focusOnMarker(id);
      highlightCard(id);
    };
  });
}

/** ✅ 마커 클릭 이벤트 */
function registerMarkerEvents(marker, h) {
  const iw = new kakao.maps.InfoWindow({
    content: `<div style="padding:6px 8px;font-size:13px">
      <b>${escapeHtml(h.name)}</b><br>
      <small>${escapeHtml(h.address || "")}</small>
    </div>`
  });
  markers.push(marker);
  markerMap[h.id] = marker;
  infoWindows[h.id] = iw;
  kakao.maps.event.addListener(marker, "click", () => {
    focusOnMarker(h.id);
    highlightCard(h.id);
  });
}

/** ✅ 지도 포커스 */
function focusOnMarker(id) {
  const m = markerMap[id];
  if (!m) return;
  const pos = m.getPosition();
  map.setLevel(5);
  map.panTo(pos);
  Object.values(infoWindows).forEach(w => w.close());
  infoWindows[id].open(map, m);
}

/** ✅ 카드 강조 + 지도 영역으로 자동 스크롤 */
function highlightCard(id) {
  document.querySelectorAll(".hospital-card").forEach(c => c.classList.remove("active"));
  const el = document.querySelector(`.hospital-card[data-id="${id}"]`);
  if (el) {
    el.classList.add("active");
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  // 🟢 지도 영역으로 자동 스크롤 (위로 부드럽게)
  const mapContainer = document.querySelector("#map"); // 지도 element id 확인
  if (mapContainer) {
    mapContainer.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}


/** ✅ HTML Escape */
function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
