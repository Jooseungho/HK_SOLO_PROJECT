const BASE = "http://localhost:8080/api/hospitals";

export async function fetchHospitals({region, keyword="", category="", page=0, size=100}){
  const url = new URL(BASE);
  if(region)   url.searchParams.append("region", region);
  if(keyword)  url.searchParams.append("keyword", keyword);
  if(category) url.searchParams.append("category", category);
  url.searchParams.append("page", page);
  url.searchParams.append("size", size);
  const res = await fetch(url, { credentials: 'include' });
  if(!res.ok) throw new Error("병원 조회 실패");
  return res.json();
}
