// /static/js/ui/boardEditView.js
import { updateBoard } from "../api/boardApi.js";
import { listBoards } from "../api/boardApi.js";

export async function renderBoardEditView(container, id) {
  container.innerHTML = `
    <div class="d-flex align-items-center mb-3">
      <a href="#/board" class="btn btn-light me-2">← 목록으로</a>
      <h3 class="fw-bold mb-0">게시글 수정</h3>
    </div>

    <div id="editFormArea" class="card p-3 shadow-sm">
      <input id="editTitle" class="form-control mb-2" placeholder="제목" />
      <textarea id="editContent" rows="6" class="form-control mb-2" placeholder="내용"></textarea>
      <input id="editImage" type="file" class="form-control mb-2" />
      <div class="d-flex gap-2">
        <button id="btnUpdate" class="btn btn-primary">수정 완료</button>
        <a href="#/board" class="btn btn-outline-secondary">취소</a>
      </div>
    </div>
  `;

  // 기존 게시글 불러오기
  const data = await listBoards(0, 100); // 단순히 목록 가져와서 찾기 (간단한 방식)
  const post = data.content.find(p => p.id == id);
  if (!post) {
    container.innerHTML = `<div class="alert alert-danger">게시글을 찾을 수 없습니다.</div>`;
    return;
  }

  document.getElementById("editTitle").value = post.title;
  document.getElementById("editContent").value = post.content || "";

  // ✅ 수정 완료 버튼 클릭 이벤트
  document.getElementById("btnUpdate").onclick = async () => {
    const formData = new FormData();
    formData.append("title", document.getElementById("editTitle").value);
    formData.append("content", document.getElementById("editContent").value);
    const img = document.getElementById("editImage").files[0];
    if (img) formData.append("image", img);

    await updateBoard(id, formData);
    alert("수정이 완료되었습니다.");
    window.location.hash = "#/board";
  };
}
