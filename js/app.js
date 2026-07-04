// 파주 복지 찾기 - 메인 스크립트

// 불러온 데이터를 담아둘 변수 (한 번만 읽어서 재사용)
let allWelfare = [];
let medianIncome = null; // 가구원 수별 기준 중위소득 정보

// 데이터를 파일에서 불러옵니다.
async function loadData() {
  const [welfareRes, incomeRes] = await Promise.all([
    fetch("data/welfare.json"),
    fetch("data/median-income.json"),
  ]);
  allWelfare = await welfareRes.json();
  medianIncome = await incomeRes.json();

  applyFilter(); // 처음에는 전체 목록을 보여줍니다.
}

// 입력한 가구원 수·소득으로 "기준 중위소득 대비 몇 %"인지 계산합니다.
// 둘 중 하나라도 비어 있으면 계산할 수 없으므로 null을 돌려줍니다.
function getUserIncomePercent() {
  const household = document.getElementById("filter-household").value;
  const incomeManwon = document.getElementById("filter-income").value;

  if (household === "" || incomeManwon === "") {
    return null;
  }

  const median = medianIncome.byHousehold[household]; // 원 단위
  const userWon = Number(incomeManwon) * 10000; // 만원 → 원
  return (userWon / median) * 100;
}

// 체크된 자격 목록을 배열로 가져옵니다.
function getCheckedQualifications() {
  const checks = document.querySelectorAll(".qual-check:checked");
  return Array.from(checks).map(function (c) {
    return c.value;
  });
}

// 조건에 맞는 복지만 골라내는 함수
function applyFilter() {
  const ageInput = document.getElementById("filter-age").value;
  const category = document.getElementById("filter-category").value;
  const age = ageInput === "" ? null : Number(ageInput);
  const userPercent = getUserIncomePercent();
  const checkedQuals = getCheckedQualifications();

  const filtered = allWelfare.filter(function (item) {
    // 1) 나이: 입력했다면 대상 범위 안에 있어야 함
    const ageOk = age === null || (age >= item.minAge && age <= item.maxAge);

    // 2) 대상 구분: '전체'면 통과, 아니면 카테고리가 같아야 함
    const categoryOk = category === "전체" || item.category === category;

    // 3) 소득: 소득 무관(null)이거나, 소득을 아직 안 넣었으면 통과.
    //    넣었다면 내 소득 %가 복지 기준 % 이하일 때 통과.
    const incomeOk =
      item.incomePercent === null ||
      userPercent === null ||
      userPercent <= item.incomePercent;

    // 4) 자격: 요구 자격이 없으면 통과.
    //    요구 자격이 있으면, 내가 체크한 자격 중 하나라도 맞아야 통과.
    const qualOk =
      item.qualifications.length === 0 ||
      item.qualifications.some(function (q) {
        return checkedQuals.includes(q);
      });

    return ageOk && categoryOk && incomeOk && qualOk;
  });

  showIncomeInfo(userPercent);
  render(filtered);
}

// "회원님은 기준 중위소득의 약 OO% 수준" 안내를 보여줍니다.
function showIncomeInfo(userPercent) {
  const box = document.getElementById("income-info");
  if (userPercent === null) {
    box.textContent = "";
    return;
  }
  box.textContent = `회원님은 기준 중위소득의 약 ${Math.round(userPercent)}% 수준이에요.`;
}

// 받은 목록을 화면에 카드로 그리는 함수
function render(welfareList) {
  const listBox = document.getElementById("welfare-list");
  const countBox = document.getElementById("result-count");

  listBox.innerHTML = "";
  countBox.textContent = `총 ${welfareList.length}개의 복지를 찾았어요`;

  if (welfareList.length === 0) {
    listBox.innerHTML = `<p class="empty">조건에 맞는 복지가 없어요. 조건을 바꿔보세요.</p>`;
    return;
  }

  welfareList.forEach(function (item) {
    // 소득 기준 안내 문구
    const incomeText =
      item.incomePercent === null
        ? "소득 무관"
        : `중위소득 ${item.incomePercent}% 이하`;
    // 요구 자격 안내 문구 (있을 때만)
    const qualText =
      item.qualifications.length === 0
        ? ""
        : `<p class="meta">필요 자격: ${item.qualifications.join(", ")}</p>`;

    const card = document.createElement("article");
    card.className = "welfare-card";
    card.innerHTML = `
      <span class="badge">${item.category}</span>
      <h2>${item.title}</h2>
      <p>${item.summary}</p>
      <p class="meta">대상 나이: ${item.minAge}세 ~ ${item.maxAge}세 · 담당: ${item.department}</p>
      <p class="meta">소득 기준: ${incomeText}</p>
      ${qualText}
      <a href="${item.applyUrl}" target="_blank" rel="noopener">신청 안내 보기</a>
    `;
    listBox.appendChild(card);
  });
}

// 입력이 바뀔 때마다 자동으로 다시 필터링합니다.
document.getElementById("filter-age").addEventListener("input", applyFilter);
document.getElementById("filter-category").addEventListener("change", applyFilter);
document.getElementById("filter-household").addEventListener("change", applyFilter);
document.getElementById("filter-income").addEventListener("input", applyFilter);
document.querySelectorAll(".qual-check").forEach(function (c) {
  c.addEventListener("change", applyFilter);
});

// 페이지가 열리면 데이터를 불러옵니다.
loadData();
