import { listBoards, deleteBoard } from "../api/boardApi.js";
import { getAuthUser } from "../api/userApi.js";

/**
 * 게시판 목록 렌더링
 */
export async function renderBoardList({ listContainer, pagerContainer, page = 0, size = 10, onDelete }) {
  const data = await listBoards(page, size);
  const user = getAuthUser(); // ✅ 현재 로그인 사용자 (로컬스토리지에서 가져오기)

  listContainer.innerHTML = data.content
    .map(p => `
      <div class="card mb-2 board-item" data-id="${p.id}">
        <div class="card-header d-flex justify-content-between align-items-center" style="cursor:pointer;">
          <span class="fw-bold">${escapeHtml(p.title)}</span>
          <small class="text-muted">
            ${escapeHtml(p.writer || "익명")} · 
            ${p.updatedAt && p.updatedAt !== p.createdAt
              ? `${formatDate(p.updatedAt)} <span class="text-danger">(수정됨)</span>`
              : formatDate(p.createdAt)
            }
          </small>
        </div>

        <!-- 상세 내용 (기본 숨김) -->
        <div class="card-body collapse" id="post-${p.id}">
          ${
            p.imageUrl
              ? `<img src="${escapeHtml(p.imageUrl)}" class="rounded mb-2" style="max-width:200px; max-height:150px; object-fit:cover;">`
              : ""
          }
          <div class="mb-3">${nl2br(escapeHtml(p.content || ""))}</div>

          <div class="d-flex gap-2">
            <button class="btn btn-outline-primary btn-sm edit-btn" data-id="${p.id}">수정</button>
            ${
              // ✅ 관리자 또는 본인 글만 삭제 가능
              (user && (user.role === "ADMIN" || user.name === p.writer))
                ? `<button class="btn btn-outline-danger btn-sm delete-btn" data-id="${p.id}">삭제</button>`
                : ""
            }
          </div>
        </div>
      </div>
    `)
    .join("");

  // ✅ 제목 클릭 시 상세 내용 토글
  listContainer.querySelectorAll(".card-header").forEach(header => {
    header.addEventListener("click", () => {
      const id = header.parentElement.getAttribute("data-id");
      const body = document.getElementById(`post-${id}`);
      body.classList.toggle("collapse");
    });
  });

  // ✅ 삭제 버튼 (관리자/본인만)
  listContainer.querySelectorAll(".delete-btn").forEach(btn => {
    btn.onclick = async () => {
      if (!confirm("정말 삭제하시겠습니까?")) return;
      await deleteBoard(btn.getAttribute("data-id"));
      onDelete?.();
    };
  });

  // ✅ 수정 버튼 → 수정 페이지로 이동
  listContainer.querySelectorAll(".edit-btn").forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute("data-id");
      window.location.hash = `#/board/edit/${id}`;
    };
  });

  // ✅ 페이징 처리
  pagerContainer.innerHTML = Array.from({ length: data.totalPages }, (_, i) => {
    const active = i === data.number ? "active" : "";
    return `<li class="page-item ${active}">
              <a class="page-link" href="#" data-page="${i}">${i + 1}</a>
            </li>`;
  }).join("");

  pagerContainer.querySelectorAll(".page-link").forEach(a => {
    a.onclick = async e => {
      e.preventDefault();
      const targetPage = Number(a.getAttribute("data-page"));
      await renderBoardList({ listContainer, pagerContainer, page: targetPage, size, onDelete });
    };
  });
}

/** 날짜 문자열 포맷 */
function formatDate(iso) {
  if (!iso) return "";
  return String(iso).replace("T", " ").slice(0, 16);
}

/** 개행 → <br> */
function nl2br(s) {
  return s.replaceAll("\n", "<br>");
}

/** XSS 방지용 */
function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
