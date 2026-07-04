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
export function generateSchedule(teams, event, minMatches, courtCount = 1) {
  console.log('=== GENERATE SCHEDULE START ===');
  console.log('Total teams input:', teams.length);
  console.log('Teams:', teams);
  console.log('Min matches required:', minMatches);
  console.log('Court count:', courtCount);

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
    const teamMap = new Map(teams.map((team) => [team.id, team]));
    const teamMatchCount = {};
    teams.forEach((team) => {
      teamMatchCount[team.id] = 0;
    });

    const eventStart = parseEventDate(event.tanggal_mulai) || new Date('2026-07-01T08:00:00Z');
    const eventEnd = parseEventDate(event.tanggal_selesai) || new Date(new Date(eventStart).getTime() + 3 * 24 * 60 * 60 * 1000);
    if (eventEnd <= eventStart) {
      eventEnd.setTime(eventStart.getTime() + 3 * 24 * 60 * 60 * 1000);
    }

    console.log('Event raw values:', { raw_start: event.tanggal_mulai, raw_end: event.tanggal_selesai });
    console.log('Parsed eventStart:', eventStart, 'iso:', eventStart.toISOString(), 'str:', eventStart.toString());
    console.log('Parsed eventEnd  :', eventEnd,   'iso:', eventEnd.toISOString(),   'str:', eventEnd.toString());
    console.log('Timezone offset (minutes):', eventStart.getTimezoneOffset());

    const eventDurationMinutes = Math.floor((eventEnd.getTime() - eventStart.getTime()) / (1000 * 60));
    const availableSlots = Math.floor(eventDurationMinutes / 15);
    const maxMatchesAllowed = availableSlots * courtCount;

    if (availableSlots < 1) {
      return {
        success: false,
        message: 'Durasi event terlalu pendek untuk membuat jadwal 15 menit',
        data: []
      };
    }

    console.log('Age groups found:', Object.keys(ageGroups));
    Object.entries(ageGroups).forEach(([ageGroup, list]) => {
      console.log(`  ${ageGroup}: ${list.length} teams - ${list.map((t) => t.nama_tim).join(', ')}`);
    });

    const sortedAgeGroups = sortAgeGroups(Object.keys(ageGroups));
    const matchHistory = new Set();
    const maxMatchCap = Math.max(minMatches, 3);

    sortedAgeGroups.forEach((ageGroup) => {
      const teamsInGroup = ageGroups[ageGroup];
      if (teamsInGroup.length < 2) {
        console.log(`⚠️  SKIP ${ageGroup} - teams < 2 (only ${teamsInGroup.length})`);
        return;
      }

      const internalMatches = generateInternalGroupMatches(teamsInGroup, minMatches, teamMatchCount, matchHistory);
      console.log(`Generated ${internalMatches.length} internal matches for ${ageGroup}`);
      allMatches.push(...internalMatches);
    });

    sortedAgeGroups.forEach((ageGroup) => {
      const teamsInGroup = ageGroups[ageGroup] || [];
      teamsInGroup.forEach((team) => {
        while (teamMatchCount[team.id] < minMatches) {
          const crossMatch = findCrossGroupMatch(team, ageGroup, sortedAgeGroups, ageGroups, minMatches, teamMatchCount, matchHistory);
          if (!crossMatch) {
            break;
          }
          allMatches.push(crossMatch);
        }
      });
    });

    if (allMatches.length === 0) {
      return {
        success: false,
        message: 'Tidak dapat membuat jadwal untuk kelompok umur yang ada',
        data: []
      };
    }

    if (allMatches.length > maxMatchesAllowed) {
      return {
        success: false,
        message: `Terlalu banyak pertandingan untuk durasi event dan jumlah lapangan yang dipilih. Maksimum ${maxMatchesAllowed} pertandingan bisa dijadwalkan dalam jendela waktu ini.`,
        data: []
      };
    }

    const slotTimes = generateSlotTimes(eventStart, eventEnd, courtCount, allMatches.length);
    console.log('Generated slot times (count:', slotTimes.length, '):');
    slotTimes.forEach((s, i) => console.log(i, s, s.toISOString(), s.toString()));
    allMatches.forEach((match, index) => {
      const slotIndex = Math.floor(index / courtCount);
      const chosen = slotTimes[slotIndex] || new Date(eventEnd);
      console.log('Assigning match index', index, 'to slotIndex', slotIndex, '->', chosen.toISOString(), chosen.toString());
      // Use a local-ISO string (no trailing Z) so browsers interpret it as local time
      match.waktu_pertandingan = formatLocalIso(chosen);
    });

    const usedMatchIds = new Set();
    allMatches.forEach((match) => {
      const tim1 = teamMap.get(match.tim_1_id);
      const tim2 = teamMap.get(match.tim_2_id);
      if (!tim1 || !tim2) {
        return;
      }

      const matchKey = `${match.tim_1_id}-${match.tim_2_id}-${match.waktu_pertandingan}`;
      if (usedMatchIds.has(matchKey)) {
        return;
      }
      usedMatchIds.add(matchKey);

      scheduleData.push({
        event_id: event.id,
        tim_1_id: match.tim_1_id,
        tim_1_asli_id: tim1.asli_tim_id || match.tim_1_id,
        tim_1_nama: tim1.nama_tim,
        tim_1_kelompok_umur: tim1.kelompok_umur,
        tim_2_id: match.tim_2_id,
        tim_2_asli_id: tim2.asli_tim_id || match.tim_2_id,
        tim_2_nama: tim2.nama_tim,
        tim_2_kelompok_umur: tim2.kelompok_umur,
        waktu_pertandingan: match.waktu_pertandingan,
        lokasi_lapangan: event.lokasi || 'Lapangan Utama',
        status: 'terjadwal'
      });
    });

    if (scheduleData.length === 0) {
      return {
        success: false,
        message: 'Tidak ada jadwal yang bisa disimpan setelah proses generate',
        data: []
      };
    }

    console.log('\n=== SCHEDULE GENERATION COMPLETE ===');
    console.log(`Total schedules generated: ${scheduleData.length}`);
    console.log(`Total age groups: ${sortedAgeGroups.length}`);

    const teamsWithMatches = new Set();
    scheduleData.forEach((s) => {
      teamsWithMatches.add(s.tim_1_id);
      teamsWithMatches.add(s.tim_2_id);
    });
    console.log(`Teams with matches: ${teamsWithMatches.size} out of ${teams.length}`);

    const teamsWithoutMatches = teams.filter((t) => !teamsWithMatches.has(t.id));
    if (teamsWithoutMatches.length > 0) {
      console.warn(`⚠️  Teams WITHOUT matches: ${teamsWithoutMatches.map((t) => `${t.nama_tim}(${t.id})`).join(', ')}`);
    }

    return {
      success: true,
      message: `Jadwal pertandingan berhasil di-generate (${scheduleData.length} pertandingan)`,
      data: scheduleData,
      total_matches: scheduleData.length,
      age_groups: sortedAgeGroups,
      min_pertandingan: minMatches,
      courts: courtCount,
      event_window: {
        start: eventStart.toISOString(),
        end: eventEnd.toISOString(),
        available_slots: availableSlots,
        max_matches: maxMatchesAllowed,
      }
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
  const teamIds = teams.map((t) => t.id);
  const teamCount = teamIds.length;

  if (teamCount < 2) {
    return [];
  }

  const matches = [];
  const teamMatchCount = {};

  // Initialize team match counter
  teamIds.forEach((id) => {
    teamMatchCount[id] = teamMatchCount[id] || 0;
  });

  const possiblePairings = [];
  for (let i = 0; i < teamIds.length; i++) {
    for (let j = i + 1; j < teamIds.length; j++) {
      const t1 = teams.find(t => t.id === teamIds[i]);
      const t2 = teams.find(t => t.id === teamIds[j]);
      if (t1 && t2 && t1.asli_tim_id && t2.asli_tim_id && t1.asli_tim_id === t2.asli_tim_id) {
        continue;
      }
      possiblePairings.push({
        tim_1_id: teamIds[i],
        tim_2_id: teamIds[j],
      });
    }
  }

  shuffleArray(possiblePairings);

  for (const pairing of possiblePairings) {
    const tim1Id = pairing.tim_1_id;
    const tim2Id = pairing.tim_2_id;

    if (teamMatchCount[tim1Id] < minMatches && teamMatchCount[tim2Id] < minMatches) {
      matches.push({
        tim_1_id: tim1Id,
        tim_2_id: tim2Id,
        waktu_pertandingan: null,
      });
      teamMatchCount[tim1Id]++;
      teamMatchCount[tim2Id]++;
    }
  }

  let stillNeedMatches = true;
  let iterations = 0;
  const maxIterations = 100;

  while (stillNeedMatches && iterations < maxIterations) {
    stillNeedMatches = false;
    iterations++;

    for (const pairing of possiblePairings) {
      const tim1Id = pairing.tim_1_id;
      const tim2Id = pairing.tim_2_id;
      const tim1Needs = teamMatchCount[tim1Id] < minMatches;
      const tim2Needs = teamMatchCount[tim2Id] < minMatches;

      if (!tim1Needs && !tim2Needs) {
        continue;
      }

      const exists = matches.some(
        (match) =>
          (match.tim_1_id === tim1Id && match.tim_2_id === tim2Id) ||
          (match.tim_1_id === tim2Id && match.tim_2_id === tim1Id)
      );

      if (exists) {
        continue;
      }

      matches.push({
        tim_1_id: tim1Id,
        tim_2_id: tim2Id,
        waktu_pertandingan: null,
      });
      teamMatchCount[tim1Id]++;
      teamMatchCount[tim2Id]++;
      stillNeedMatches = true;
    }
  }

  console.log(`\nMatch Distribution for this group:`);
  for (const teamId of teamIds) {
    const teamName = teams.find((t) => t.id === teamId)?.nama_tim || `Tim ${teamId}`;
    console.log(`  ${teamName}: ${teamMatchCount[teamId]} matches (required: ${minMatches})`);
  }

  return matches;
}

function generateInternalGroupMatches(teams, minMatches, teamMatchCount, matchHistory) {
  const teamIds = teams.map((t) => t.id);
  const groupMatches = [];
  const possiblePairings = [];

  for (let i = 0; i < teamIds.length; i++) {
    for (let j = i + 1; j < teamIds.length; j++) {
      const t1 = teams.find(t => t.id === teamIds[i]);
      const t2 = teams.find(t => t.id === teamIds[j]);
      if (t1 && t2 && t1.asli_tim_id && t2.asli_tim_id && t1.asli_tim_id === t2.asli_tim_id) {
        continue;
      }
      possiblePairings.push({ tim_1_id: teamIds[i], tim_2_id: teamIds[j] });
    }
  }

  shuffleArray(possiblePairings);

  possiblePairings.forEach((pairing) => {
    const tim1Id = pairing.tim_1_id;
    const tim2Id = pairing.tim_2_id;
    const keyA = `${tim1Id}-${tim2Id}`;
    if (matchHistory.has(keyA)) {
      return;
    }

    const tim1Needs = teamMatchCount[tim1Id] < minMatches;
    const tim2Needs = teamMatchCount[tim2Id] < minMatches;
    if (!tim1Needs && !tim2Needs) {
      return;
    }

    groupMatches.push({
      tim_1_id: tim1Id,
      tim_2_id: tim2Id,
      waktu_pertandingan: null,
    });

    teamMatchCount[tim1Id] = (teamMatchCount[tim1Id] || 0) + 1;
    teamMatchCount[tim2Id] = (teamMatchCount[tim2Id] || 0) + 1;
    matchHistory.add(keyA);
  });

  let stillNeedMatches = true;
  let iterations = 0;
  const maxIterations = 100;

  while (stillNeedMatches && iterations < maxIterations) {
    stillNeedMatches = false;
    iterations++;

    possiblePairings.forEach((pairing) => {
      const tim1Id = pairing.tim_1_id;
      const tim2Id = pairing.tim_2_id;
      const keyA = `${tim1Id}-${tim2Id}`;
      if (matchHistory.has(keyA)) {
        return;
      }

      const tim1Needs = teamMatchCount[tim1Id] < minMatches;
      const tim2Needs = teamMatchCount[tim2Id] < minMatches;
      if (!tim1Needs && !tim2Needs) {
        return;
      }

      groupMatches.push({
        tim_1_id: tim1Id,
        tim_2_id: tim2Id,
        waktu_pertandingan: null,
      });

      teamMatchCount[tim1Id] = (teamMatchCount[tim1Id] || 0) + 1;
      teamMatchCount[tim2Id] = (teamMatchCount[tim2Id] || 0) + 1;
      matchHistory.add(keyA);
      stillNeedMatches = true;
    });
  }

  return groupMatches;
}

/**
 * Generate waktu pertandingan random
 * @returns {string} - ISO datetime string
 */
function generateMatchTime() {
  const hours = [8, 10, 12, 14, 16, 18];
  const hour = hours[Math.floor(Math.random() * hours.length)];
  const minute = Math.random() > 0.5 ? 30 : 0;

  const startDate = new Date('2026-07-01');
  const endDate = new Date('2026-07-10');

  const randomTime = new Date(
    startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())
  );

  randomTime.setHours(hour, minute, 0, 0);

  return randomTime.toISOString();
}

function parseEventDate(value) {
  if (!value) return null;
  // If already a Date instance
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  // If timestamp number
  if (typeof value === 'number') return new Date(value);

  // Accept common backend format: 'YYYY-MM-DD HH:MM:SS' and parse as local time
  const match = String(value).trim().match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/);
  if (match) {
    const [, y, mo, d, hh, mm, ss] = match;
    const dt = new Date(Number(y), Number(mo) - 1, Number(d), Number(hh), Number(mm), Number(ss));
    return Number.isNaN(dt.getTime()) ? null : dt;
  }

  // Fallback to Date constructor for ISO strings, timestamps with timezone, etc.
  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function sortAgeGroups(ageGroups) {
  return ageGroups.sort((a, b) => {
    const valueA = parseAgeGroup(a);
    const valueB = parseAgeGroup(b);
    return valueA - valueB;
  });
}

function parseAgeGroup(ageGroup) {
  if (typeof ageGroup !== 'string') return Number.MAX_SAFE_INTEGER;
  const digits = ageGroup.match(/\d+/);
  return digits ? parseInt(digits[0], 10) : Number.MAX_SAFE_INTEGER;
}

function findCrossGroupMatch(team, teamAgeGroup, sortedAgeGroups, ageGroups, minMatches, teamMatchCount, matchHistory) {
  const teamId = team.id;
  const teamAge = parseAgeGroup(teamAgeGroup);
  const availableGroups = sortedAgeGroups.map((group) => ({
    name: group,
    value: parseAgeGroup(group),
  })).filter((group) => group.value !== Number.MAX_SAFE_INTEGER);

  const currentIndex = availableGroups.findIndex((group) => group.name === teamAgeGroup);
  const adjacentGroups = [];
  if (currentIndex > 0) adjacentGroups.push(availableGroups[currentIndex - 1]);
  if (currentIndex < availableGroups.length - 1) adjacentGroups.push(availableGroups[currentIndex + 1]);

  for (const group of adjacentGroups) {
    const candidates = ageGroups[group.name] || [];
    const candidate = candidates.find((other) => {
      if (team.asli_tim_id && other.asli_tim_id && team.asli_tim_id === other.asli_tim_id) {
        return false;
      }
      const keyA = `${teamId}-${other.id}`;
      const keyB = `${other.id}-${teamId}`;
      if (matchHistory.has(keyA) || matchHistory.has(keyB)) {
        return false;
      }
      return teamMatchCount[other.id] < minMatches;
    });
    if (candidate) {
      matchHistory.add(`${teamId}-${candidate.id}`);
      teamMatchCount[teamId]++;
      teamMatchCount[candidate.id]++;
      return {
        tim_1_id: teamId,
        tim_2_id: candidate.id,
        waktu_pertandingan: null,
      };
    }
  }

  // Jika tidak ditemukan di adjacent group, coba tim mana pun dengan match count di bawah minMatches
  for (const group of availableGroups) {
    const candidates = ageGroups[group.name] || [];
      const candidate = candidates.find((other) => {
      if (team.asli_tim_id && other.asli_tim_id && team.asli_tim_id === other.asli_tim_id) {
        return false;
      }
      const keyA = `${teamId}-${other.id}`;
      const keyB = `${other.id}-${teamId}`;
      if (matchHistory.has(keyA) || matchHistory.has(keyB)) {
        return false;
      }
      return teamMatchCount[other.id] < minMatches;
    });
    if (candidate) {
      matchHistory.add(`${teamId}-${candidate.id}`);
      teamMatchCount[teamId]++;
      teamMatchCount[candidate.id]++;
      return {
        tim_1_id: teamId,
        tim_2_id: candidate.id,
        waktu_pertandingan: null,
      };
    }
  }

  return null;
}

function generateSlotTimes(startDate, endDate, courtCount, totalMatches) {
  const slotDurationMinutes = 15;
  const result = [];
  const totalSlots = Math.ceil(totalMatches / courtCount);

  for (let slotIndex = 0; slotIndex < totalSlots; slotIndex++) {
    const slotTime = new Date(startDate.getTime() + slotIndex * slotDurationMinutes * 60 * 1000);
    if (slotTime >= endDate) break;
    result.push(slotTime);
  }

  if (result.length === 0 && startDate < endDate) {
    result.push(new Date(startDate));
  }

  return result;
}

function pad(n){return n<10? '0'+n: ''+n}

// Format a Date as local ISO without timezone Z: 'YYYY-MM-DDTHH:mm:ss'
function formatLocalIso(d){
  if (!(d instanceof Date)) d = new Date(d);
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
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
