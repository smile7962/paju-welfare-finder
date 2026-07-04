// 파주 복지 찾기 - 메인 스크립트

// 복지 데이터를 불러와서 화면에 목록으로 그리는 함수
async function loadWelfare() {
  // data/welfare.json 파일을 읽어옵니다.
  const response = await fetch("data/welfare.json");
  const welfareList = await response.json();

  // 목록을 그릴 위치(빈 상자)를 가져옵니다.
  const listBox = document.getElementById("welfare-list");

  // 복지 항목 하나하나를 카드로 만들어 상자에 넣습니다.
  welfareList.forEach(function (item) {
    const card = document.createElement("article");
    card.className = "welfare-card";
    card.innerHTML = `
      <span class="badge">${item.category}</span>
      <h2>${item.title}</h2>
      <p>${item.summary}</p>
      <p class="meta">대상 나이: ${item.minAge}세 ~ ${item.maxAge}세 · 담당: ${item.department}</p>
      <a href="${item.applyUrl}" target="_blank" rel="noopener">신청 안내 보기</a>
    `;
    listBox.appendChild(card);
  });
}

// 페이지가 열리면 목록을 불러옵니다.
loadWelfare();
