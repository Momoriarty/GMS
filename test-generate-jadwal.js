// Test script untuk debug generate jadwal
// Jalankan di browser console

// 1. Fetch pendaftaran
const eventId = 1;
const token = localStorage.getItem("token");

fetch(`http://127.0.0.1:8000/api/pendaftaran?event_id=${eventId}&status=diterima`, {
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  }
})
.then(res => res.json())
.then(json => {
  console.log("=== PENDAFTARAN RESPONSE ===");
  console.log(json);
  
  // Extract teams
  const pendaftaranList = json.data || [];
  console.log("\nTotal pendaftaran:", pendaftaranList.length);
  
  const teams = pendaftaranList
    .filter(p => p.user && p.user.tim)
    .map(p => ({
      id: p.user.tim.id,
      nama_tim: p.user.tim.nama_tim,
      kelompok_umur: p.user.tim.kelompok_umur
    }));
  
  console.log("\nTeams extracted:", teams);
  console.log("Total teams:", teams.length);
  
  // Group by age
  const grouped = {};
  teams.forEach(t => {
    if (!grouped[t.kelompok_umur]) grouped[t.kelompok_umur] = [];
    grouped[t.kelompok_umur].push(t);
  });
  
  console.log("\nGrouped by age group:");
  for (const age in grouped) {
    console.log(`  ${age}: ${grouped[age].length} teams`);
  }
})
.catch(err => console.error("Error:", err));
