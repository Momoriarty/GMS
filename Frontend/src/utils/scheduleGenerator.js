/**
 * Utility untuk generate jadwal pertandingan secara random di frontend
 * Algoritma yang sama dengan backend namun berjalan di JavaScript
 */

/**
 * Generate jadwal random untuk sebuah event
 * @param {Array} teams - Daftar tim yang terdaftar
 * @param {Object} event - Data event
 * @param {number} minMatches - Minimum pertandingan per tim
 * @returns {Object} - Result dengan success, message, dan data
 */
export function generateSchedule(teams, event, minMatches) {
  console.log('=== GENERATE SCHEDULE START ===');
  console.log('Total teams input:', teams.length);
  console.log('Teams:', teams);
  console.log('Min matches required:', minMatches);

  if (!teams || teams.length < 2) {
    return {
      success: false,
      message: 'Minimal 2 tim dibutuhkan untuk membuat jadwal pertandingan',
      data: []
    };
  }

  // Kelompokkan tim berdasarkan kelompok umur
  const ageGroups = groupTeamsByAgeGroup(teams);

  if (Object.keys(ageGroups).length === 0) {
    return {
      success: false,
      message: 'Tidak ada data kelompok umur pada tim yang terdaftar',
      data: []
    };
  }

  try {
    const allMatches = [];
    const scheduleData = [];

    // Debug: log kelompok umur
    console.log('Age groups found:', Object.keys(ageGroups));
    for (const ageGroup in ageGroups) {
      console.log(`  ${ageGroup}: ${ageGroups[ageGroup].length} teams - ${ageGroups[ageGroup].map(t => t.nama_tim).join(', ')}`);
    }

    // Generate jadwal untuk setiap kelompok umur
    for (const ageGroup in ageGroups) {
      const teamsInGroup = ageGroups[ageGroup];

      if (teamsInGroup.length < 2) {
        console.log(`⚠️  SKIP ${ageGroup} - teams < 2 (only ${teamsInGroup.length})`);
        continue; // Skip jika tim dalam kelompok umur kurang dari 2
      }

      console.log(`\n✓ GENERATING for ${ageGroup}:`);
      const matches = generateMatches(teamsInGroup, minMatches);
      console.log(`Generated ${matches.length} matches for ${ageGroup}`);
      console.log(`Teams in this group: ${teamsInGroup.map(t => `${t.nama_tim}(${t.id})`).join(', ')}`);
      allMatches.push(...matches);

      // Format jadwal untuk preview
      matches.forEach((match) => {
        const tim1 = teamsInGroup.find(t => t.id === match.tim_1_id);
        const tim2 = teamsInGroup.find(t => t.id === match.tim_2_id);

        if (tim1 && tim2) {
          scheduleData.push({
            event_id: event.id,
            tim_1_id: match.tim_1_id,
            tim_1_nama: tim1.nama_tim,
            tim_1_kelompok_umur: tim1.kelompok_umur,
            tim_2_id: match.tim_2_id,
            tim_2_nama: tim2.nama_tim,
            tim_2_kelompok_umur: tim2.kelompok_umur,
            waktu_pertandingan: match.waktu_pertandingan,
            lokasi_lapangan: event.lokasi || 'Lapangan Utama',
            status: 'terjadwal'
          });
        }
      });
    }

    if (scheduleData.length === 0) {
      return {
        success: false,
        message: 'Tidak dapat membuat jadwal untuk kelompok umur yang ada',
        data: []
      };
    }

    // Final summary
    console.log('\n=== SCHEDULE GENERATION COMPLETE ===');
    console.log(`Total schedules generated: ${scheduleData.length}`);
    console.log(`Total age groups: ${Object.keys(ageGroups).length}`);
    
    // Count teams that got at least one match
    const teamsWithMatches = new Set();
    scheduleData.forEach(s => {
      teamsWithMatches.add(s.tim_1_id);
      teamsWithMatches.add(s.tim_2_id);
    });
    console.log(`Teams with matches: ${teamsWithMatches.size} out of ${teams.length}`);
    
    const teamsWithoutMatches = teams.filter(t => !teamsWithMatches.has(t.id));
    if (teamsWithoutMatches.length > 0) {
      console.warn(`⚠️  Teams WITHOUT matches: ${teamsWithoutMatches.map(t => `${t.nama_tim}(${t.id})`).join(', ')}`);
    }

    return {
      success: true,
      message: `Jadwal pertandingan berhasil di-generate (${scheduleData.length} pertandingan)`,
      data: scheduleData,
      total_matches: scheduleData.length,
      age_groups: Object.keys(ageGroups),
      min_pertandingan: minMatches
    };
  } catch (err) {
    console.error('Error generating schedule:', err);
    return {
      success: false,
      message: `Terjadi kesalahan: ${err.message}`,
      data: []
    };
  }
}

/**
 * Kelompokkan tim berdasarkan kelompok umur
 * @param {Array} teams
 * @returns {Object} - Object dengan key = ageGroup, value = array of teams
 */
function groupTeamsByAgeGroup(teams) {
  const grouped = {};

  teams.forEach(team => {
    const ageGroup = team.kelompok_umur;
    if (!grouped[ageGroup]) {
      grouped[ageGroup] = [];
    }
    grouped[ageGroup].push(team);
  });

  return grouped;
}

/**
 * Generate matches untuk sekelompok tim
 * @param {Array} teams
 * @param {number} minMatches - Minimum pertandingan per tim
 * @returns {Array} - Array of match objects
 */
function generateMatches(teams, minMatches) {
  const teamIds = teams.map(t => t.id);
  const teamCount = teamIds.length;

  if (teamCount < 2) {
    return [];
  }

  const matches = [];
  const teamMatchCount = {};

  // Initialize team match counter
  teamIds.forEach(id => {
    teamMatchCount[id] = 0;
  });

  // Generate semua kemungkinan pasangan unik
  const possiblePairings = [];
  for (let i = 0; i < teamIds.length; i++) {
    for (let j = i + 1; j < teamIds.length; j++) {
      possiblePairings.push({
        tim_1_id: teamIds[i],
        tim_2_id: teamIds[j]
      });
    }
  }

  // Shuffle pasangan untuk randomness
  shuffleArray(possiblePairings);

  // Phase 1: Ambil pasangan yang membuat setiap tim mencapai minMatches
  for (const pairing of possiblePairings) {
    const tim1Id = pairing.tim_1_id;
    const tim2Id = pairing.tim_2_id;

    // Jika kedua tim belum mencapai minMatches, ambil pairing ini
    if (teamMatchCount[tim1Id] < minMatches && teamMatchCount[tim2Id] < minMatches) {
      matches.push({
        tim_1_id: tim1Id,
        tim_2_id: tim2Id,
        waktu_pertandingan: generateMatchTime()
      });

      teamMatchCount[tim1Id]++;
      teamMatchCount[tim2Id]++;
    }
  }

  // Phase 2: Jika masih ada tim yang belum mencapai minMatches, loop sampai semua terpenuhi
  let stillNeedMatches = true;
  let iterations = 0;
  const maxIterations = 100; // Safety limit

  while (stillNeedMatches && iterations < maxIterations) {
    stillNeedMatches = false;
    iterations++;

    for (const pairing of possiblePairings) {
      const tim1Id = pairing.tim_1_id;
      const tim2Id = pairing.tim_2_id;

      // Check apakah ada tim yang masih butuh pertandingan
      const tim1NeedsMatch = teamMatchCount[tim1Id] < minMatches;
      const tim2NeedsMatch = teamMatchCount[tim2Id] < minMatches;

      if (!tim1NeedsMatch && !tim2NeedsMatch) {
        continue; // Both teams sudah cukup
      }

      // Skip jika pairing ini sudah digunakan
      const exists = matches.some(match => 
        (match.tim_1_id === tim1Id && match.tim_2_id === tim2Id) ||
        (match.tim_1_id === tim2Id && match.tim_2_id === tim1Id)
      );

      if (exists) {
        continue;
      }

      // Jika salah satu atau kedua tim belum mencapai minMatches, ambil pairing ini
      matches.push({
        tim_1_id: tim1Id,
        tim_2_id: tim2Id,
        waktu_pertandingan: generateMatchTime()
      });

      teamMatchCount[tim1Id]++;
      teamMatchCount[tim2Id]++;

      stillNeedMatches = true;
    }
  }

  // Debug log
  console.log(`\nMatch Distribution for this group:`);
  const distribution = {};
  for (const teamId in teamMatchCount) {
    const teamName = teams.find(t => t.id === parseInt(teamId))?.nama_tim || `Tim ${teamId}`;
    distribution[teamName] = teamMatchCount[teamId];
    console.log(`  ${teamName}: ${teamMatchCount[teamId]} matches (required: ${minMatches})`);
  }
  
  const teamsWithoutEnough = Object.entries(teamMatchCount).filter(([_, count]) => count < minMatches).length;
  console.log(`Total matches in this group: ${matches.length}`);
  console.log(`Teams without enough matches: ${teamsWithoutEnough}`);

  return matches;
}

/**
 * Generate waktu pertandingan random
 * @returns {string} - ISO datetime string
 */
function generateMatchTime() {
  const hours = [8, 10, 12, 14, 16, 18];
  const hour = hours[Math.floor(Math.random() * hours.length)];
  const minute = Math.random() > 0.5 ? 30 : 0;

  // Generate date dalam range event (default: 2026-07-01 sampai 2026-07-10)
  const startDate = new Date('2026-07-01');
  const endDate = new Date('2026-07-10');

  const randomTime = new Date(
    startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())
  );

  randomTime.setHours(hour, minute, 0, 0);

  return randomTime.toISOString();
}

/**
 * Shuffle array menggunakan Fisher-Yates algorithm
 * @param {Array} array
 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
