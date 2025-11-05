const BASE = "http://localhost:8080/api/boards";

export async function listBoards(page=0,size=10){
  const url = new URL(BASE);
  url.searchParams.append('page',page);
  url.searchParams.append('size',size);
  const res = await fetch(url, { credentials: 'include' });
  if(!res.ok) throw new Error("게시글 조회 실패");
  return res.json();
}

export async function createBoard(formData){
  const res = await fetch(BASE,{ method:'POST', body:formData, credentials:'include' });
  if(!res.ok) throw new Error("게시글 등록 실패");
  return res.json();
}

export async function deleteBoard(id){
  const res = await fetch(`${BASE}/${id}`,{ method:'DELETE', credentials:'include' });
  if(!res.ok) throw new Error("삭제 실패");
}

export async function updateBoard(id, formData) {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    body: formData,
    credentials: "include"
  });
  if (!res.ok) throw new Error("수정 실패");
  return res.json();
}
