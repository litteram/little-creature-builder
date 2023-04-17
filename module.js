(function () {
  'use strict';

  function keys(x){
    return Object.keys(x)
  }

  function fnProperty(fn, base, prop, objs) {
      return Math.ceil(objs.map((o) => o[prop]).reduce(fn, base));
  }
  function mulp(prop, ...objs) {
      return fnProperty((a, b) => a * b, 1, prop, objs);
  }
  function sump(prop, ...objs) {
      return fnProperty((a, b) => a + b, 0, prop, objs);
  }
  function sum(...stats) {
      return stats.reduce((a, b) => a + b, 0);
  }
  function rnd(i) {
      return Math.floor(Math.random() * i) + 1;
  }
  const dices = {
      dx(i) {
          return rnd(i);
      },
      d8() {
          return rnd(8);
      },
      d12() {
          return rnd(20);
      },
      d20() {
          return rnd(20);
      },
      d100() {
          return rnd(100);
      }
  };

  const crcTable = [
      0x0000, 0x1021, 0x2042, 0x3063, 0x4084, 0x50a5,
      0x60c6, 0x70e7, 0x8108, 0x9129, 0xa14a, 0xb16b,
      0xc18c, 0xd1ad, 0xe1ce, 0xf1ef, 0x1231, 0x0210,
      0x3273, 0x2252, 0x52b5, 0x4294, 0x72f7, 0x62d6,
      0x9339, 0x8318, 0xb37b, 0xa35a, 0xd3bd, 0xc39c,
      0xf3ff, 0xe3de, 0x2462, 0x3443, 0x0420, 0x1401,
      0x64e6, 0x74c7, 0x44a4, 0x5485, 0xa56a, 0xb54b,
      0x8528, 0x9509, 0xe5ee, 0xf5cf, 0xc5ac, 0xd58d,
      0x3653, 0x2672, 0x1611, 0x0630, 0x76d7, 0x66f6,
      0x5695, 0x46b4, 0xb75b, 0xa77a, 0x9719, 0x8738,
      0xf7df, 0xe7fe, 0xd79d, 0xc7bc, 0x48c4, 0x58e5,
      0x6886, 0x78a7, 0x0840, 0x1861, 0x2802, 0x3823,
      0xc9cc, 0xd9ed, 0xe98e, 0xf9af, 0x8948, 0x9969,
      0xa90a, 0xb92b, 0x5af5, 0x4ad4, 0x7ab7, 0x6a96,
      0x1a71, 0x0a50, 0x3a33, 0x2a12, 0xdbfd, 0xcbdc,
      0xfbbf, 0xeb9e, 0x9b79, 0x8b58, 0xbb3b, 0xab1a,
      0x6ca6, 0x7c87, 0x4ce4, 0x5cc5, 0x2c22, 0x3c03,
      0x0c60, 0x1c41, 0xedae, 0xfd8f, 0xcdec, 0xddcd,
      0xad2a, 0xbd0b, 0x8d68, 0x9d49, 0x7e97, 0x6eb6,
      0x5ed5, 0x4ef4, 0x3e13, 0x2e32, 0x1e51, 0x0e70,
      0xff9f, 0xefbe, 0xdfdd, 0xcffc, 0xbf1b, 0xaf3a,
      0x9f59, 0x8f78, 0x9188, 0x81a9, 0xb1ca, 0xa1eb,
      0xd10c, 0xc12d, 0xf14e, 0xe16f, 0x1080, 0x00a1,
      0x30c2, 0x20e3, 0x5004, 0x4025, 0x7046, 0x6067,
      0x83b9, 0x9398, 0xa3fb, 0xb3da, 0xc33d, 0xd31c,
      0xe37f, 0xf35e, 0x02b1, 0x1290, 0x22f3, 0x32d2,
      0x4235, 0x5214, 0x6277, 0x7256, 0xb5ea, 0xa5cb,
      0x95a8, 0x8589, 0xf56e, 0xe54f, 0xd52c, 0xc50d,
      0x34e2, 0x24c3, 0x14a0, 0x0481, 0x7466, 0x6447,
      0x5424, 0x4405, 0xa7db, 0xb7fa, 0x8799, 0x97b8,
      0xe75f, 0xf77e, 0xc71d, 0xd73c, 0x26d3, 0x36f2,
      0x0691, 0x16b0, 0x6657, 0x7676, 0x4615, 0x5634,
      0xd94c, 0xc96d, 0xf90e, 0xe92f, 0x99c8, 0x89e9,
      0xb98a, 0xa9ab, 0x5844, 0x4865, 0x7806, 0x6827,
      0x18c0, 0x08e1, 0x3882, 0x28a3, 0xcb7d, 0xdb5c,
      0xeb3f, 0xfb1e, 0x8bf9, 0x9bd8, 0xabbb, 0xbb9a,
      0x4a75, 0x5a54, 0x6a37, 0x7a16, 0x0af1, 0x1ad0,
      0x2ab3, 0x3a92, 0xfd2e, 0xed0f, 0xdd6c, 0xcd4d,
      0xbdaa, 0xad8b, 0x9de8, 0x8dc9, 0x7c26, 0x6c07,
      0x5c64, 0x4c45, 0x3ca2, 0x2c83, 0x1ce0, 0x0cc1,
      0xef1f, 0xff3e, 0xcf5d, 0xdf7c, 0xaf9b, 0xbfba,
      0x8fd9, 0x9ff8, 0x6e17, 0x7e36, 0x4e55, 0x5e74,
      0x2e93, 0x3eb2, 0x0ed1, 0x1ef0
  ];
  function crc16(s) {
      let crc = 0xFFFF;
      let j;
      for (let i = 0; i < s.length; i++) {
          let c = s.charCodeAt(i);
          if (c > 255) {
              throw new RangeError();
          }
          j = (c ^ (crc >> 8)) & 0xFF;
          crc = crcTable[j] ^ (crc << 8);
      }
      return ((crc ^ 0) & 0xFFFF).toString(16);
  }

  const levels = [
      {
          level: -5,
          armor_class: 11,
          hit_points: 1,
          attack_bonus: -1,
          damage_per_action: 1,
          spell_dc: [8, 5],
          perception: 0,
          proficiency_bonus: 0,
          saving_throws: [1, 0, -1],
          ability_modifiers: [1, 0, 0, 0, 0, -1],
          experience: 0,
      },
      {
          level: -4,
          armor_class: 12,
          hit_points: 1,
          attack_bonus: 0,
          damage_per_action: 1,
          spell_dc: [9, 6],
          perception: 1,
          proficiency_bonus: 0,
          saving_throws: [2, 1, -1],
          ability_modifiers: [2, 1, 1, 0, 0, -1],
          experience: 0,
      },
      {
          level: -3,
          armor_class: 13,
          hit_points: 4,
          attack_bonus: 1,
          damage_per_action: 1,
          spell_dc: [10, 7],
          perception: 1,
          proficiency_bonus: 1,
          saving_throws: [3, 1, 0],
          ability_modifiers: [2, 1, 1, 0, 0, -1],
          experience: 2,
      },
      {
          level: -2,
          armor_class: 13,
          hit_points: 8,
          attack_bonus: 1,
          damage_per_action: 1,
          spell_dc: [10, 7],
          perception: 1,
          proficiency_bonus: 1,
          saving_throws: [3, 1, 0],
          ability_modifiers: [2, 1, 1, 0, 0, -1],
          experience: 6,
      },
      {
          level: -1,
          armor_class: 13,
          hit_points: 12,
          attack_bonus: 1,
          damage_per_action: 1,
          spell_dc: [10, 7],
          perception: 1,
          proficiency_bonus: 1,
          saving_throws: [3, 1, 0],
          ability_modifiers: [2, 1, 1, 0, 0, -1],
          experience: 12,
      },
      {
          level: 0,
          armor_class: 14,
          hit_points: 16,
          attack_bonus: 2,
          damage_per_action: 1,
          spell_dc: [10, 7],
          perception: 1,
          proficiency_bonus: 1,
          saving_throws: [4, 2, 0],
          ability_modifiers: [3, 2, 1, 1, 0, -1],
          experience: 25,
      },
      {
          level: 1,
          armor_class: 14,
          hit_points: 26,
          attack_bonus: 3,
          damage_per_action: 2,
          spell_dc: [11, 8],
          perception: 1,
          proficiency_bonus: 2,
          saving_throws: [5, 3, 0],
          ability_modifiers: [3, 2, 1, 1, 0, -1],
          experience: 50,
      },
      {
          level: 2,
          armor_class: 14,
          hit_points: 30,
          attack_bonus: 3,
          damage_per_action: 4,
          spell_dc: [11, 8],
          perception: 1,
          proficiency_bonus: 2,
          saving_throws: [5, 3, 0],
          ability_modifiers: [3, 2, 1, 1, 0, -1],
          experience: 112,
      },
      {
          level: 3,
          armor_class: 14,
          hit_points: 33,
          attack_bonus: 3,
          damage_per_action: 5,
          spell_dc: [11, 8],
          perception: 1,
          proficiency_bonus: 2,
          saving_throws: [5, 3, 0],
          ability_modifiers: [3, 2, 1, 1, 0, -1],
          experience: 175,
      },
      {
          level: 4,
          armor_class: 15,
          hit_points: 36,
          attack_bonus: 4,
          damage_per_action: 8,
          spell_dc: [12, 9],
          perception: 2,
          proficiency_bonus: 2,
          saving_throws: [6, 3, 1],
          ability_modifiers: [4, 3, 2, 1, 1, 0],
          experience: 275,
      },
      {
          level: 5,
          armor_class: 16,
          hit_points: 60,
          attack_bonus: 5,
          damage_per_action: 10,
          spell_dc: [13, 10],
          perception: 2,
          proficiency_bonus: 3,
          saving_throws: [7, 4, 1],
          ability_modifiers: [4, 3, 2, 1, 1, 0],
          experience: 450,
      },
      {
          level: 6,
          armor_class: 16,
          hit_points: 64,
          attack_bonus: 5,
          damage_per_action: 11,
          spell_dc: [13, 10],
          perception: 2,
          proficiency_bonus: 3,
          saving_throws: [7, 4, 1],
          ability_modifiers: [4, 3, 2, 1, 1, 0],
          experience: 575,
      },
      {
          level: 7,
          armor_class: 16,
          hit_points: 68,
          attack_bonus: 5,
          damage_per_action: 13,
          spell_dc: [13, 10],
          perception: 2,
          proficiency_bonus: 3,
          saving_throws: [7, 4, 1],
          ability_modifiers: [4, 3, 2, 1, 1, 0],
          experience: 725,
      },
      {
          level: 8,
          armor_class: 17,
          hit_points: 72,
          attack_bonus: 6,
          damage_per_action: 17,
          spell_dc: [14, 11],
          perception: 3,
          proficiency_bonus: 3,
          saving_throws: [8, 5, 1],
          ability_modifiers: [5, 3, 2, 2, 1, 0],
          experience: 975,
      },
      {
          level: 9,
          armor_class: 18,
          hit_points: 102,
          attack_bonus: 7,
          damage_per_action: 19,
          spell_dc: [15, 12],
          perception: 3,
          proficiency_bonus: 4,
          saving_throws: [9, 5, 2],
          ability_modifiers: [5, 3, 2, 2, 1, 0],
          experience: 1250,
      },
      {
          level: 10,
          armor_class: 18,
          hit_points: 107,
          attack_bonus: 7,
          damage_per_action: 21,
          spell_dc: [15, 12],
          perception: 3,
          proficiency_bonus: 4,
          saving_throws: [9, 5, 2],
          ability_modifiers: [5, 3, 2, 2, 1, 0],
          experience: 1475,
      },
      {
          level: 11,
          armor_class: 18,
          hit_points: 111,
          attack_bonus: 7,
          damage_per_action: 23,
          spell_dc: [15, 12],
          perception: 3,
          proficiency_bonus: 4,
          saving_throws: [9, 5, 2],
          ability_modifiers: [5, 3, 2, 2, 1, 0],
          experience: 1800,
      },
      {
          level: 12,
          armor_class: 18,
          hit_points: 115,
          attack_bonus: 8,
          damage_per_action: 28,
          spell_dc: [15, 12],
          perception: 3,
          proficiency_bonus: 4,
          saving_throws: [10, 6, 2],
          ability_modifiers: [6, 4, 3, 2, 1, 0],
          experience: 2100,
      },
      {
          level: 13,
          armor_class: 19,
          hit_points: 152,
          attack_bonus: 9,
          damage_per_action: 30,
          spell_dc: [16, 13],
          perception: 3,
          proficiency_bonus: 5,
          saving_throws: [11, 7, 2],
          ability_modifiers: [6, 4, 3, 2, 1, 0],
          experience: 2500,
      },
      {
          level: 14,
          armor_class: 19,
          hit_points: 157,
          attack_bonus: 9,
          damage_per_action: 32,
          spell_dc: [16, 13],
          perception: 3,
          proficiency_bonus: 5,
          saving_throws: [11, 7, 2],
          ability_modifiers: [6, 4, 3, 2, 1, 0],
          experience: 2875,
      },
      {
          level: 15,
          armor_class: 19,
          hit_points: 162,
          attack_bonus: 9,
          damage_per_action: 35,
          spell_dc: [16, 13],
          perception: 3,
          proficiency_bonus: 5,
          saving_throws: [11, 7, 2],
          ability_modifiers: [6, 4, 3, 2, 1, 0],
          experience: 3250,
      },
      {
          level: 16,
          armor_class: 20,
          hit_points: 167,
          attack_bonus: 10,
          damage_per_action: 41,
          spell_dc: [17, 14],
          perception: 4,
          proficiency_bonus: 5,
          saving_throws: [12, 7, 3],
          ability_modifiers: [7, 5, 3, 2, 2, 1],
          experience: 3750,
      },
      {
          level: 17,
          armor_class: 21,
          hit_points: 210,
          attack_bonus: 11,
          damage_per_action: 43,
          spell_dc: [18, 15],
          perception: 4,
          proficiency_bonus: 6,
          saving_throws: [13, 8, 3],
          ability_modifiers: [7, 5, 3, 2, 2, 1],
          experience: 4500,
      },
      {
          level: 18,
          armor_class: 21,
          hit_points: 216,
          attack_bonus: 11,
          damage_per_action: 46,
          spell_dc: [18, 15],
          perception: 4,
          proficiency_bonus: 6,
          saving_throws: [13, 8, 3],
          ability_modifiers: [7, 5, 3, 2, 2, 1],
          experience: 5000,
      },
      {
          level: 19,
          armor_class: 21,
          hit_points: 221,
          attack_bonus: 11,
          damage_per_action: 48,
          spell_dc: [18, 15],
          perception: 4,
          proficiency_bonus: 6,
          saving_throws: [13, 8, 3],
          ability_modifiers: [7, 5, 3, 2, 2, 1],
          experience: 5500,
      },
      {
          level: 20,
          armor_class: 22,
          hit_points: 226,
          attack_bonus: 12,
          damage_per_action: 51,
          spell_dc: [19, 16],
          perception: 5,
          proficiency_bonus: 6,
          saving_throws: [14, 9, 3],
          ability_modifiers: [8, 6, 4, 3, 2, 1],
          experience: 6250,
      },
      {
          level: 21,
          armor_class: 22,
          hit_points: 276,
          attack_bonus: 13,
          damage_per_action: 53,
          spell_dc: [20, 17],
          perception: 5,
          proficiency_bonus: 7,
          saving_throws: [15, 9, 4],
          ability_modifiers: [8, 6, 4, 3, 2, 1],
          experience: 8250,
      },
      {
          level: 22,
          armor_class: 22,
          hit_points: 282,
          attack_bonus: 13,
          damage_per_action: 56,
          spell_dc: [20, 17],
          perception: 5,
          proficiency_bonus: 7,
          saving_throws: [15, 9, 4],
          ability_modifiers: [8, 6, 4, 3, 2, 1],
          experience: 10250,
      },
      {
          level: 23,
          armor_class: 22,
          hit_points: 288,
          attack_bonus: 13,
          damage_per_action: 58,
          spell_dc: [20, 17],
          perception: 5,
          proficiency_bonus: 7,
          saving_throws: [15, 9, 4],
          ability_modifiers: [8, 6, 4, 3, 2, 1],
          experience: 12500,
      },
      {
          level: 24,
          armor_class: 23,
          hit_points: 294,
          attack_bonus: 14,
          damage_per_action: 61,
          spell_dc: [20, 17],
          perception: 5,
          proficiency_bonus: 7,
          saving_throws: [16, 10, 4],
          ability_modifiers: [9, 6, 4, 3, 2, 1],
          experience: 15500,
      },
      {
          level: 25,
          armor_class: 24,
          hit_points: 350,
          attack_bonus: 15,
          damage_per_action: 63,
          spell_dc: [21, 18],
          perception: 5,
          proficiency_bonus: 8,
          saving_throws: [17, 11, 4],
          ability_modifiers: [9, 6, 4, 3, 2, 1],
          experience: 18750,
      },
      {
          level: 26,
          armor_class: 24,
          hit_points: 357,
          attack_bonus: 15,
          damage_per_action: 66,
          spell_dc: [21, 18],
          perception: 5,
          proficiency_bonus: 8,
          saving_throws: [17, 11, 4],
          ability_modifiers: [9, 6, 4, 3, 2, 1],
          experience: 22500,
      },
      {
          level: 27,
          armor_class: 24,
          hit_points: 363,
          attack_bonus: 15,
          damage_per_action: 68,
          spell_dc: [21, 18],
          perception: 5,
          proficiency_bonus: 8,
          saving_throws: [17, 11, 4],
          ability_modifiers: [9, 6, 4, 3, 2, 1],
          experience: 26250,
      },
      {
          level: 28,
          armor_class: 25,
          hit_points: 369,
          attack_bonus: 16,
          damage_per_action: 71,
          spell_dc: [22, 19],
          perception: 6,
          proficiency_bonus: 8,
          saving_throws: [18, 11, 5],
          ability_modifiers: [10, 7, 5, 4, 3, 2],
          experience: 30000,
      },
      {
          level: 29,
          armor_class: 26,
          hit_points: 432,
          attack_bonus: 17,
          damage_per_action: 73,
          spell_dc: [23, 20],
          perception: 6,
          proficiency_bonus: 9,
          saving_throws: [19, 12, 5],
          ability_modifiers: [10, 7, 5, 4, 3, 2],
          experience: 33750,
      },
      {
          level: 30,
          armor_class: 26,
          hit_points: 439,
          attack_bonus: 17,
          damage_per_action: 76,
          spell_dc: [23, 20],
          perception: 6,
          proficiency_bonus: 9,
          saving_throws: [19, 12, 5],
          ability_modifiers: [10, 7, 5, 4, 3, 2],
          experience: 38750,
      },
      {
          level: 31,
          armor_class: 26,
          hit_points: 446,
          attack_bonus: 17,
          damage_per_action: 78,
          spell_dc: [23, 20],
          perception: 6,
          proficiency_bonus: 9,
          saving_throws: [19, 12, 5],
          ability_modifiers: [10, 7, 5, 4, 3, 2],
          experience: 44500,
      },
      {
          level: 32,
          armor_class: 26,
          hit_points: 453,
          attack_bonus: 18,
          damage_per_action: 81,
          spell_dc: [24, 21],
          perception: 7,
          proficiency_bonus: 9,
          saving_throws: [20, 13, 5],
          ability_modifiers: [11, 8, 5, 4, 3, 2],
          experience: 51000,
      },
      {
          level: 33,
          armor_class: 27,
          hit_points: 522,
          attack_bonus: 19,
          damage_per_action: 83,
          spell_dc: [25, 22],
          perception: 7,
          proficiency_bonus: 10,
          saving_throws: [21, 13, 6],
          ability_modifiers: [11, 8, 5, 4, 3, 2],
          experience: 58000,
      },
      {
          level: 34,
          armor_class: 27,
          hit_points: 530,
          attack_bonus: 19,
          damage_per_action: 86,
          spell_dc: [25, 22],
          perception: 7,
          proficiency_bonus: 10,
          saving_throws: [21, 13, 6],
          ability_modifiers: [11, 8, 5, 4, 3, 2],
          experience: 67750,
      },
      {
          level: 35,
          armor_class: 27,
          hit_points: 537,
          attack_bonus: 19,
          damage_per_action: 88,
          spell_dc: [25, 22],
          perception: 7,
          proficiency_bonus: 10,
          saving_throws: [21, 13, 6],
          ability_modifiers: [11, 8, 5, 4, 3, 2],
          experience: 77750,
      },
  ];
  const roles = {
      brute: {
          armor_class: 4,
          hit_points: 1.2,
          attack_bonus: 0,
          damage_per_action: 1,
          saving_throws: -2,
          spell_dc: 0,
          initiative: -2,
          perception: -2,
          speed: -10,
          stat_priorities: ["con", "str", "dex", "wis", "cha", "int"],
      },
      magical_striker: {
          armor_class: -4,
          hit_points: 0.6,
          attack_bonus: 4,
          damage_per_action: 1.25,
          saving_throws: -2,
          spell_dc: 2,
          initiative: 0,
          perception: 0,
          speed: -5,
          stat_priorities: ["int", "wis", "cha", "dex", "con", "str"],
      },
      skill_paragon: {
          armor_class: -2,
          hit_points: 1,
          attack_bonus: 2,
          damage_per_action: 1,
          saving_throws: 2,
          spell_dc: 0,
          initiative: 2,
          perception: 2,
          speed: 0,
          stat_priorities: ["str", "dex", "con", "wis", "int", "cha"],
      },
      skirmisher: {
          armor_class: -4,
          hit_points: 0.5,
          attack_bonus: 2,
          damage_per_action: 1.5,
          saving_throws: -2,
          spell_dc: 0,
          initiative: 1,
          perception: 2,
          speed: 5,
          stat_priorities: ["dex", "wis", "str", "con", "int", "cha"],
      },
      sniper: {
          armor_class: 0,
          hit_points: 0.75,
          attack_bonus: 0,
          damage_per_action: 1.25,
          saving_throws: 0,
          spell_dc: 0,
          initiative: 0,
          perception: 2,
          speed: -10,
          stat_priorities: ["dex", "wis", "str", "int", "cha", "con"],
      },
      soldier: {
          armor_class: 0,
          hit_points: 1,
          attack_bonus: 0,
          damage_per_action: 1,
          saving_throws: 0,
          spell_dc: 0,
          initiative: 0,
          perception: 0,
          speed: 0,
          stat_priorities: ["str", "dex", "con", "wis", "cha", "int"],
      },
      spellcaster: {
          armor_class: -4,
          hit_points: 0.75,
          attack_bonus: 0,
          damage_per_action: 0.75,
          saving_throws: -1,
          spell_dc: 2,
          initiative: -1,
          perception: 1,
          speed: -5,
          stat_priorities: ["int", "wis", "cha", "con", "dex", "str"],
      },
  };
  const modifiers = {
      normal: {
          armor_class: 0,
          attack_bonus: 0,
          hit_points: 1,
          damage_per_action: 1,
          saving_throws: 0,
          spell_dc: 0,
          initiative: 0,
          perception: 0,
          stealth: 0,
          experience: 1,
          special: [],
      },
      minion: {
          armor_class: -2,
          attack_bonus: -2,
          hit_points: 0.2,
          damage_per_action: 0.75,
          saving_throws: -2,
          spell_dc: -2,
          initiative: -2,
          perception: -2,
          stealth: -2,
          experience: 0.25,
          special: [],
      },
      elite: {
          armor_class: 2,
          attack_bonus: 2,
          hit_points: 2,
          damage_per_action: 1.2,
          saving_throws: 2,
          spell_dc: 2,
          initiative: 2,
          perception: 2,
          stealth: 2,
          experience: 2,
          special: ["paragon"],
      },
      solo: {
          armor_class: 2,
          attack_bonus: 2,
          hit_points: 4,
          damage_per_action: 1.2,
          saving_throws: 2,
          spell_dc: 2,
          initiative: 4,
          perception: 4,
          stealth: 4,
          experience: 4,
          special: ["paragon", "phase_66", "phase_33"],
      },
  };
  const HitDies = {
      small: "d4",
      medium: "d6",
      large: "d8",
      huge: "d10",
      gargantuan: "d20",
  };
  const dies_avg = {
      d2: 1,
      d3: 1.5,
      d4: 2.5,
      d6: 3.5,
      d8: 4.5,
      d10: 5.5,
      d12: 6.5,
      d20: 10.5,
  };
  const dies = keys(dies_avg);
  dies.map((i) => i.replace(/[^\d]/, "")).map(parseInt);
  const cr_exp = [
      { cr: "0", exp: 10 },
      { cr: "1/8", exp: 25 },
      { cr: "1/4", exp: 50 },
      { cr: "1/2", exp: 100 },
      { cr: "1", exp: 200 },
      { cr: "2", exp: 450 },
      { cr: "3", exp: 700 },
      { cr: "4", exp: 1100 },
      { cr: "5", exp: 1800 },
      { cr: "6", exp: 2300 },
      { cr: "7", exp: 2900 },
      { cr: "8", exp: 3900 },
      { cr: "9", exp: 5000 },
      { cr: "10", exp: 5900 },
      { cr: "11", exp: 7200 },
      { cr: "12", exp: 8400 },
      { cr: "13", exp: 10000 },
      { cr: "14", exp: 11500 },
      { cr: "15", exp: 13000 },
      { cr: "16", exp: 15000 },
      { cr: "17", exp: 18000 },
      { cr: "18", exp: 20000 },
      { cr: "19", exp: 22000 },
      { cr: "20", exp: 25000 },
      { cr: "21", exp: 33000 },
      { cr: "22", exp: 41000 },
      { cr: "23", exp: 50000 },
      { cr: "24", exp: 62000 },
      { cr: "25", exp: 75000 },
      { cr: "26", exp: 90000 },
      { cr: "27", exp: 105000 },
      { cr: "28", exp: 120000 },
      { cr: "29", exp: 135000 },
      { cr: "30", exp: 155000 },
  ];

  function templateByLevel(lvl) {
      return levels.filter((i) => lvl == i.level)[0];
  }
  function generateUuid(opts) {
      let name = opts.name.toLowerCase();
      let { level, role, modifier, size } = opts;
      return crc16(name + level + role + modifier + size);
  }
  function createCreature(opts) {
      const role = roles[opts.role];
      const modifier = modifiers[opts.modifier];
      const template = templateByLevel(opts.level);
      const saving_throws = template.saving_throws.map((s) => s + role.saving_throws + modifier.saving_throws);
      ({
          major: {
              stat: saving_throws[0],
              abilities: [role.stat_priorities[0], role.stat_priorities[1]],
          },
          minor: {
              stat: saving_throws[1],
              abilities: [role.stat_priorities[2], role.stat_priorities[3]],
          },
          lower: {
              stat: saving_throws[2],
              abilities: [role.stat_priorities[4], role.stat_priorities[5]],
          },
      });
      const ability_modifiers = {
          str: 0,
          dex: 0,
          con: 0,
          int: 0,
          wis: 0,
          cha: 0,
      };
      for (const key in template.ability_modifiers) {
          ability_modifiers[role.stat_priorities[key]] =
              template.ability_modifiers[key];
      }
      const hit_points = mulp("hit_points", template, role, modifier);
      const experience = mulp("experience", template, modifier);
      const challenge_rating = calculateChallengeRating({ experience });
      return {
          uid: generateUuid(opts),
          name: opts.name,
          level: template.level,
          role: opts.role,
          modifier: opts.modifier,
          size: opts.size,
          category: opts.category,
          alignment: opts.alignment,
          armor_class: sump("armor_class", template, role, modifier),
          hit_die: calculateHitDie({
              size: opts.size,
              level: opts.level,
              ability_modifiers,
              hit_points,
          }),
          hit_points,
          attack_bonus: sump("attack_bonus", template, role, modifier),
          damage_per_action: mulp("damage_per_action", template, role, modifier),
          spell_dc: template.spell_dc
              .map((spell_dc) => spell_dc + modifier.spell_dc),
          initiative: sum(template.proficiency_bonus, role.initiative, modifier.initiative),
          perception: sum(template.proficiency_bonus, role.perception, modifier.perception),
          stealth: sum(0, modifier.stealth),
          speed: sum(25, role.speed),
          experience,
          challenge_rating,
          saving_throws,
          ability_modifiers,
          multiattacks: opts.multiattacks || [],
          attacks: opts.attacks || [],
          properties: opts.properties || {},
      };
  }
  /**
   * From HP to die + constitution modifier estimates
   */
  function calculateHitDie(sb) {
      let die = HitDies[sb.size];
      let estimate = dies_avg[die];
      let sway = Math.ceil((sb.hit_points / 100) * 15);
      let result = 0;
      let dies = 0;
      while (result < (sb.hit_points - sway) && result < (sb.hit_points + sway)) {
          dies += 1;
          result = estimate * dies;
      }
      let base = dies > 0 ? sb.ability_modifiers.con * dies : 1;
      return [
          dies,
          die,
          base,
      ];
  }
  function calculateChallengeRating(sb) {
      let result = "0";
      for (let cr of cr_exp) {
          if (sb.experience >= cr.exp) {
              result = cr.cr;
          }
          else {
              break;
          }
      }
      return result;
  }

  // Using:
  // https://songoftheblade.wordpress.com/2018/03/11/dd-5th-edition-monster-stats-on-a-business-card/
  function BusinessCardStats(l) {
      let armour_class = 10 + Math.ceil(l / 2);
      let health_points = dices.d8() * (l + 1);
      let hit_dice = l + 1;
      let damage_per_round = 2 * l;
      let proficiency_bonus = 0;
      let saving_throws = {
          bad: dices.d20() + Math.ceil(l / 2),
          good: dices.d20() + Math.ceil(l / 2) + proficiency_bonus,
      };
      let difficulty_class = 10 + Math.ceil(l / 2); // as maximum
      return {
          armour_class,
          health_points,
          hit_dice,
          damage_per_round,
          proficiency_bonus,
          saving_throws,
          difficulty_class,
      };
  }

  console.log("giff:", createCreature({
      name: "Sample",
      level: 5,
      role: "soldier",
      modifier: "normal",
      size: "medium",
      category: "humanoid",
      alignment: "neutral",
  }));
  console.log("businesscard:", BusinessCardStats(5));
  console.log();

})();
//# sourceMappingURL=module.js.map
