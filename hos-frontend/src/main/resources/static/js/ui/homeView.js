// /static/js/ui/homeView.js
// 홈 화면 유튜브 영상 고정 표시

document.addEventListener("DOMContentLoaded", () => {
  const videoId = "1aXkjmiYK-Y"; // ✅ 이게 당신이 준 유튜브 ID

  const youtubeBox = document.getElementById("youtubeBox");
  if (youtubeBox) {
    youtubeBox.innerHTML = `
      <div style="
        width:100%;
        height:100%;
        border-radius:10px;
        overflow:hidden;
        box-shadow:0 2px 10px rgba(0,0,0,0.2);
      ">
        <iframe 
          width="100%" 
          height="100%"
          src="https://www.youtube.com/embed/${videoId}?autoplay=0&mute=0"
          title="요양병원 비교 영상"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen>
        </iframe>
      </div>
    `;
  }
});
