import { renderBoardList } from "./boardListView.js";

const btnOpenWrite = document.getElementById("btnOpenWrite");
const btnCancelWrite = document.getElementById("btnCancelWrite");
const btnWrite = document.getElementById("btnWrite");
const listContainer = document.getElementById("boardList");
const pagerContainer = document.getElementById("pager");
const writeArea = document.getElementById("writeArea");

btnOpenWrite.addEventListener("click", () => writeArea.classList.remove("d-none"));
btnCancelWrite.addEventListener("click", () => writeArea.classList.add("d-none"));

// ✅ 게시글 등록
btnWrite.addEventListener("click", async () => {
  const title = document.getElementById("wTitle").value.trim();
  const content = document.getElementById("wContent").value.trim();
  const fileInput = document.getElementById("wImage");

  if (!title || !content) {
    alert("제목과 내용을 입력하세요.");
    return;
  }

  // ✅ FormData를 사용 (JSON 아님!)
  const formData = new FormData();
  formData.append("title", title);
  formData.append("content", content);
  if (fileInput.files.length > 0) {
    formData.append("image", fileInput.files[0]);
  }

  try {
	const res = await fetch("/api/boards", {
	  method: "POST",
	  body: formData,
	  credentials: "include"   // ✅ 세션 쿠키 전송 (로그인 유지)
	});


    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg);
    }

    alert("게시글이 등록되었습니다!");

    // 입력값 초기화
    document.getElementById("wTitle").value = "";
    document.getElementById("wContent").value = "";
    fileInput.value = "";
    writeArea.classList.add("d-none");

    // ✅ 목록 새로고침
    await renderBoardList({
      listContainer,
      pagerContainer,
      onDelete: () => renderBoardList({ listContainer, pagerContainer })
    });

  } catch (err) {
    console.error("게시글 등록 오류:", err);
    alert("게시글 등록 중 오류가 발생했습니다.");
  }
});

// ✅ 초기 목록 로드
renderBoardList({
  listContainer,
  pagerContainer,
  onDelete: () => renderBoardList({ listContainer, pagerContainer })
});
