const BASE = "http://localhost:8080/api/users";

export async function login({ email, password }) {
  const res = await fetch(`${BASE}/login`, {
    method: "POST",
    headers: { "Content-Type":"application/json" },
    body: JSON.stringify({ email, password }),
    credentials: 'include' // 세션 쿠키 받기
  });
  if (!res.ok) throw new Error("로그인 실패");
  return res.json();
}

export async function signup({ email, name, password }) {
  const res = await fetch(`${BASE}/signup`, {
    method: "POST",
    headers: { "Content-Type":"application/json" },
    body: JSON.stringify({ email, name, password }),
    credentials: 'include'
  });
  if (!res.ok) throw new Error("회원가입 실패");
}

export async function me(){
  const res = await fetch(`${BASE}/me`, { credentials:'include' });
  if (!res.ok) return null;
  return res.json();
}

export async function logoutReq(){
  await fetch(`${BASE}/logout`, { method:'POST', credentials:'include' });
}

export function setAuthUser(u){ localStorage.setItem("authUser", JSON.stringify(u)); }
export function getAuthUser(){ const s=localStorage.getItem("authUser"); return s?JSON.parse(s):null; }
export function logoutLocal(){ localStorage.removeItem("authUser"); }
