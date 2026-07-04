// 파주 복지 찾기 - 메인 스크립트

// 불러온 복지 데이터를 담아둘 변수 (한 번만 읽어서 재사용)
let allWelfare = [];

// 복지 데이터를 파일에서 불러옵니다.
async function loadWelfare() {
  const response = await fetch("data/welfare.json");
  allWelfare = await response.json();

  // 처음에는 전체 목록을 보여줍니다.
  render(allWelfare);
}

// 조건에 맞는 복지만 골라내는 함수
function applyFilter() {
  // 입력값 읽기
  const ageInput = document.getElementById("filter-age").value;
  const category = document.getElementById("filter-category").value;
  const age = ageInput === "" ? null : Number(ageInput);

  // allWelfare 중에서 조건을 만족하는 것만 남깁니다.
  const filtered = allWelfare.filter(function (item) {
    // 나이 조건: 입력했다면, 그 나이가 대상 범위 안에 있어야 함
    const ageOk = age === null || (age >= item.minAge && age <= item.maxAge);
    // 대상 구분: '전체'면 통과, 아니면 카테고리가 같아야 함
    const categoryOk = category === "전체" || item.category === category;
    return ageOk && categoryOk;
  });

  render(filtered);
}

// 받은 목록을 화면에 카드로 그리는 함수
function render(welfareList) {
  const listBox = document.getElementById("welfare-list");
  const countBox = document.getElementById("result-count");

  // 이전 결과를 비웁니다.
  listBox.innerHTML = "";
  countBox.textContent = `총 ${welfareList.length}개의 복지를 찾았어요`;

  // 결과가 없을 때 안내 문구
  if (welfareList.length === 0) {
    listBox.innerHTML = `<p class="empty">조건에 맞는 복지가 없어요. 조건을 바꿔보세요.</p>`;
    return;
  }

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

// 입력창이 바뀔 때마다 자동으로 필터를 다시 적용합니다.
document.getElementById("filter-age").addEventListener("input", applyFilter);
document.getElementById("filter-category").addEventListener("change", applyFilter);

// 페이지가 열리면 목록을 불러옵니다.
loadWelfare();
