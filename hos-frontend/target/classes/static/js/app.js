import { listBoards, createBoard, deleteBoard, updateBoard } from "./api/boardApi.js";
import { me, login, signup, logoutReq, getAuthUser, setAuthUser, logoutLocal } from "./api/userApi.js";
import { fillDistricts, createMap, destroyMap, searchHospitalsOnMap } from "./ui/mapView.js";
import { renderBoardList } from "./ui/boardListView.js";

// ================= 로그인 상태 표시 =================
async function renderAuthArea() {
  const authArea = document.getElementById("authArea");
  const serverUser = await me(); // 서버 세션 확인
  if (serverUser) setAuthUser(serverUser);
  const user = serverUser || getAuthUser();

  authArea.innerHTML = user
    ? `
       <span class="me-2">
         ${user.name || user.email}님 
         ${user.role === "ADMIN" ? '<span class="badge bg-danger ms-1">관리자</span>' : ''}
       </span>
       ${user.role === "ADMIN" ? '<a href="#/admin/board" class="btn btn-warning btn-sm me-2">관리자</a>' : ''}
       <button id="btnLogout" class="btn btn-outline-secondary btn-sm">로그아웃</button>`
    : `<a href="#/login" class="btn btn-primary btn-sm">로그인</a>`;

  const btnLogout = document.getElementById("btnLogout");
  if (btnLogout) btnLogout.onclick = async () => {
    await logoutReq();
    logoutLocal();
    location.hash = "#/login";
  };
}

// ================= 뷰 전환 =================
const views = ["view-login", "view-signup", "view-home", "view-map", "view-board", "view-edit", "view-admin-board"];
function showView(id) {
  views.forEach(v => document.getElementById(v)?.classList.add("d-none"));
  document.getElementById(id)?.classList.remove("d-none");
}

// ================= 라우팅 =================
async function router() {
  await renderAuthArea();
  const hash = location.hash || "#/home";
  const user = getAuthUser();

  // 로그인 필요 페이지
  if (hash === "#/board" && !user) return (location.hash = "#/login");

  // ✅ 수정 페이지 라우트
  if (hash.startsWith("#/board/edit/")) {
    const id = hash.split("/").pop();
    await setupEditScreen(id);
    return;
  }

  // ✅ 관리자 페이지 라우트
  if (hash === "#/admin/board") {
    if (!user || user.role !== "ADMIN") {
      alert("관리자만 접근할 수 있습니다.");
      location.hash = "#/home";
      return;
    }
    showView("view-admin-board");
    await setupAdminBoardScreen();
    return;
  }

  switch (hash) {
    case "#/login":
      showView("view-login");
      break;
    case "#/signup":
      showView("view-signup");
      break;
    case "#/map":
      showView("view-map");
      setupMapScreen();
      break;
    case "#/board":
      showView("view-board");
      await setupBoardScreen();
      break;
    case "#/home":
    default:
      showView("view-home");
      destroyMap();
      break;
  }
}

// ================= 로그인 / 회원가입 =================
function bindAuthEvents() {
  const btnLogin = document.getElementById("btnLogin");
  const btnSignup = document.getElementById("btnSignup");

  if (btnLogin) {
    btnLogin.onclick = async () => {
      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value.trim();
      const user = await login({ email, password });
      setAuthUser(user);
      location.hash = "#/home";
    };
  }

  if (btnSignup) {
    btnSignup.onclick = async () => {
      const email = document.getElementById("signupEmail").value.trim();
      const name = document.getElementById("signupName").value.trim();
      const password = document.getElementById("signupPassword").value.trim();
      await signup({ email, name, password });
      alert("회원가입이 완료되었습니다. 로그인해주세요.");
      location.hash = "#/login";
    };
  }
}

// ================= 지도 화면 =================
function setupMapScreen() {
  fillDistricts(document.getElementById("regionSelect"));
  createMap(document.getElementById("map"));

  const doSearch = async () => {
    const region = document.getElementById("regionSelect").value;
    const keyword = document.getElementById("keyword").value.trim();
    const category = document.getElementById("categorySelect").value;
    await searchHospitalsOnMap({ region, keyword, category });
  };

  document.getElementById("btnSearch").onclick = doSearch;
  document.getElementById("regionSelect").onchange = doSearch;
  doSearch();
}

// ================= 게시판 화면 =================
async function setupBoardScreen() {
  const writeArea = document.getElementById("writeArea");
  const btnOpen = document.getElementById("btnOpenWrite");
  const btnWrite = document.getElementById("btnWrite");
  const btnCancel = document.getElementById("btnCancelWrite");

  btnOpen.onclick = () => writeArea.classList.remove("d-none");
  btnCancel.onclick = () => writeArea.classList.add("d-none");

  await renderBoardList({
    listContainer: document.getElementById("boardList"),
    pagerContainer: document.getElementById("pager"),
    onDelete: async () => await setupBoardScreen()
  });

  btnWrite.onclick = async () => {
    const fd = new FormData();
    fd.append("title", document.getElementById("wTitle").value);
    fd.append("content", document.getElementById("wContent").value);
    const f = document.getElementById("wImage").files[0];
    if (f) fd.append("image", f);
    await createBoard(fd);
    writeArea.classList.add("d-none");
    await setupBoardScreen();
  };
}

// ================= 게시글 수정 화면 =================
async function setupEditScreen(id) {
  showView("view-edit");

  const data = await listBoards(0, 100);
  const post = data.content.find(p => p.id == id);
  if (!post) {
    alert("게시글을 찾을 수 없습니다.");
    location.hash = "#/board";
    return;
  }

  document.getElementById("editTitle").value = post.title;
  document.getElementById("editContent").value = post.content || "";

  document.getElementById("btnUpdate").onclick = async () => {
    const formData = new FormData();
    formData.append("title", document.getElementById("editTitle").value);
    formData.append("content", document.getElementById("editContent").value);
    const f = document.getElementById("editImage").files[0];
    if (f) formData.append("image", f);

    await updateBoard(id, formData);
    alert("수정이 완료되었습니다.");
    location.hash = "#/board";
  };
}

// ================= 관리자 게시판 화면 =================
async function setupAdminBoardScreen() {
  const listContainer = document.getElementById("adminBoardList");
  const pagerContainer = document.getElementById("adminPager");
  const keywordInput = document.getElementById("adminSearch");
  const btnSearch = document.getElementById("btnAdminSearch");

  async function load(page = 0, size = 10) {
    const data = await listBoards(page, size);
    const keyword = keywordInput.value.trim();

    const filtered = keyword
      ? data.content.filter(p =>
          (p.title && p.title.includes(keyword)) ||
          (p.writer && p.writer.includes(keyword))
        )
      : data.content;

    listContainer.innerHTML = filtered
      .map(
        p => `
        <div class="card mb-2">
          <div class="card-body d-flex gap-3">
            ${
              p.imageUrl
                ? `<img src="${p.imageUrl}" style="width:100px;height:80px;object-fit:cover;" class="rounded">`
                : ""
            }
            <div class="flex-grow-1">
              <div class="fw-bold">${p.title}</div>
              <div class="text-muted small">${p.writer} · ${formatDate(p.createdAt)}</div>
              <div class="small">${p.content ? p.content.slice(0, 80) + "..." : ""}</div>
            </div>
            <button class="btn btn-outline-danger btn-sm" data-id="${p.id}">삭제</button>
          </div>
        </div>`
      )
      .join("");

    listContainer.querySelectorAll("button[data-id]").forEach(btn => {
      btn.onclick = async () => {
        if (!confirm("이 게시글을 삭제하시겠습니까?")) return;
        await deleteBoard(btn.getAttribute("data-id"));
        await load();
      };
    });

    pagerContainer.innerHTML = `
      <ul class="pagination justify-content-center">
        ${Array.from({ length: data.totalPages }, (_, i) => {
          const active = i === data.number ? "active" : "";
          return `<li class="page-item ${active}">
                    <a class="page-link" href="#" data-page="${i}">${i + 1}</a>
                  </li>`;
        }).join("")}
      </ul>`;

    pagerContainer.querySelectorAll(".page-link").forEach(a => {
      a.onclick = async e => {
        e.preventDefault();
        const page = Number(a.dataset.page);
        await load(page);
      };
    });
  }

  btnSearch.onclick = async () => await load();
  await load();
}

// ================= 유틸: 날짜 포맷 =================
function formatDate(iso) {
  if (!iso) return "";
  return String(iso).replace("T", " ").slice(0, 16);
}

// ================= 초기 실행 =================
window.addEventListener("hashchange", router);
window.addEventListener("DOMContentLoaded", () => {
  bindAuthEvents();
  router();
});
