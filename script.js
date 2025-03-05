const API_URL = "http://localhost:5000/api/pairs";

// DOM elementlarini olish
const uploadForm = document.getElementById("upload-form");
const pairNameInput = document.getElementById("pair-name");
const imageUpload = document.getElementById("image-upload");
const videoUpload = document.getElementById("video-upload");
const imagePreview = document.getElementById("image-preview");
const videoPreview = document.getElementById("video-preview");
const pairsList = document.getElementById("pairs-list");
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const notification = document.getElementById("notification");
let pairs = [];

// 🟢 API orqali barcha ma'lumotlarni yuklash
async function loadPairsFromDB() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    pairs = data;
    renderPairs();
  } catch (error) {
    console.error("API orqali ma'lumot olishda xatolik:", error);
  }
}

// 🟢 API orqali yangi rasm va video saqlash
async function savePairToDB(name, image, video) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, image, video }),
    });

    const newPair = await response.json();
    pairs.push(newPair);
    renderPairs();
    showNotification("Juftlik muvaffaqiyatli saqlandi", "success");
  } catch (error) {
    console.error("API orqali saqlashda xatolik:", error);
  }
}

// 🟢 API orqali juftlikni o‘chirish
async function deletePair(id) {
  try {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    pairs = pairs.filter((p) => p._id !== id);
    renderPairs();
    showNotification("Juftlik muvaffaqiyatli o‘chirildi", "success");
  } catch (error) {
    console.error("API orqali o‘chirishda xatolik:", error);
  }
}

// 🟢 API orqali juftlikni tahrirlash
async function updatePair(id, name, image, video) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, image, video }),
    });

    const updatedPair = await response.json();
    pairs = pairs.map((p) => (p._id === id ? updatedPair : p));
    renderPairs();
    showNotification("Juftlik muvaffaqiyatli yangilandi", "success");
  } catch (error) {
    console.error("API orqali yangilashda xatolik:", error);
  }
}

// 🔵 Forma yuborish (yangi rasm va video qo‘shish)
uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = pairNameInput.value.trim();
  if (!name || !imageUpload.files[0] || !videoUpload.files[0]) {
    showNotification("Barcha maydonlarni to‘ldiring!", "error");
    return;
  }

  const imageData = await readFileAsDataURL(imageUpload.files[0]);
  const videoData = await readFileAsDataURL(videoUpload.files[0]);

  savePairToDB(name, imageData, videoData);
  uploadForm.reset();
  imagePreview.innerHTML = "";
  videoPreview.innerHTML = "";
});

// 🔵 Rasm va videoni oldindan ko‘rish
imageUpload.addEventListener("change", function () {
  previewFile(this, imagePreview, "image");
});
videoUpload.addEventListener("change", function () {
  previewFile(this, videoPreview, "video");
});

// 🔵 Faylni oldindan ko‘rish
function previewFile(input, previewElement, type) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      previewElement.innerHTML = type === "image"
        ? `<img src="${e.target.result}" alt="Preview">`
        : `<video src="${e.target.result}" controls></video>`;
    };
    reader.readAsDataURL(input.files[0]);
  }
}

// 🔵 Faylni Base64 ga o‘tkazish
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 🔵 Juftliklarni ekranga chiqarish
function renderPairs() {
  pairsList.innerHTML = pairs.length === 0
    ? '<div class="empty-message">Hozircha hech qanday juftlik yo‘q</div>'
    : pairs.map(pair => `
      <div class="pair-item">
        <img src="${pair.image}" class="pair-image">
        <div class="pair-info">
          <div class="pair-name">${pair.name}</div>
          <button class="btn edit edit-btn" onclick="openEditModal('${pair._id}')">Tahrirlash</button>
          <button class="btn danger delete-btn" onclick="deletePair('${pair._id}')">O‘chirish</button>
        </div>
      </div>`).join("");
}

// 🔵 Qidirish
searchBtn.addEventListener("click", handleSearch);
searchInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    handleSearch();
  }
});

function handleSearch() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const filteredPairs = pairs.filter((pair) =>
    pair.name.toLowerCase().includes(searchTerm)
  );
  renderPairs(filteredPairs);
}

// 🔵 Xabar ko‘rsatish
function showNotification(message, type) {
  notification.textContent = message;
  notification.className = `notification ${type}`;
  notification.style.display = "block";
  setTimeout(() => { notification.style.display = "none"; }, 3000);
}

// 🔵 Ilovani ishga tushirish
document.addEventListener("DOMContentLoaded", loadPairsFromDB);
