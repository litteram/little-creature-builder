'use strict';

const { isArray } = Array;

const INCORRECT_ITERABLE_INPUT = 'Incorrect iterable input';

const { keys } = Object;

function mapArray(
  fn, list, isIndexed = false
){
  let index = 0;
  const willReturn = Array(list.length);

  while (index < list.length){
    willReturn[ index ] = isIndexed ? fn(list[ index ], index) : fn(list[ index ]);

    index++;
  }

  return willReturn
}

function mapObject(fn, obj){
  if (arguments.length === 1){
    return _obj => mapObject(fn, _obj)
  }
  let index = 0;
  const objKeys = keys(obj);
  const len = objKeys.length;
  const willReturn = {};

  while (index < len){
    const key = objKeys[ index ];
    willReturn[ key ] = fn(
      obj[ key ], key, obj
    );
    index++;
  }

  return willReturn
}

function map(fn, iterable){
  if (arguments.length === 1) return _iterable => map(fn, _iterable)
  if (!iterable){
    throw new Error(INCORRECT_ITERABLE_INPUT)
  }

  if (isArray(iterable)) return mapArray(fn, iterable)

  return mapObject(fn, iterable)
}

function fnProperty(fn, base, prop, objs) {
    return Math.ceil(objs.map(function (o) { return o[prop]; }).reduce(fn, base));
}
function mulp(prop) {
    var objs = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        objs[_i - 1] = arguments[_i];
    }
    return fnProperty(function (a, b) { return a * b; }, 1, prop, objs);
}
function sump(prop) {
    var objs = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        objs[_i - 1] = arguments[_i];
    }
    return fnProperty(function (a, b) { return a + b; }, 0, prop, objs);
}
function sum() {
    var stats = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        stats[_i] = arguments[_i];
    }
    return stats.reduce(function (a, b) { return a + b; }, 0);
}
function rnd(i) {
    return Math.floor(Math.random() * i) + 1;
}
var dices = {
    d8: function () {
        return rnd(8);
    },
    d12: function () {
        return rnd(20);
    },
    d20: function () {
        return rnd(20);
    },
    d100: function () {
        return rnd(100);
    }
};

var levels = [
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
var roles = {
    controller: {
        armor_class: -2,
        hit_points: 1,
        attack_bonus: 0,
        damage_per_action: 1,
        saving_throws: -1,
        attack_dcs: 0,
        initiative: 2,
        perception: 0,
        speed: 0,
        stat_priorities: ["int", "dex", "con", "wis", "cha", "str"],
    },
    defender: {
        armor_class: 2,
        hit_points: 1,
        attack_bonus: 0,
        damage_per_action: 1,
        saving_throws: 1,
        attack_dcs: 0,
        initiative: 0,
        perception: 2,
        speed: -10,
        stat_priorities: ["con", "str", "dex", "wis", "cha", "int"],
    },
    lurker: {
        armor_class: -4,
        hit_points: 0.5,
        attack_bonus: 2,
        damage_per_action: 1.5,
        saving_throws: -2,
        attack_dcs: 2,
        initiative: 0,
        perception: 2,
        speed: 0,
        stat_priorities: ["dex", "wis", "con", "str", "int", "cha"],
    },
    scout: {
        armor_class: -2,
        hit_points: 1,
        attack_bonus: 0,
        damage_per_action: 0.75,
        saving_throws: -1,
        attack_dcs: 0,
        initiative: 2,
        perception: 2,
        speed: 10,
        stat_priorities: ["dex", "wis", "con", "str", "int", "cha"],
    },
    sniper: {
        armor_class: 0,
        hit_points: 0.75,
        attack_bonus: 0,
        damage_per_action: 1.25,
        saving_throws: 0,
        attack_dcs: 0,
        initiative: 0,
        perception: 0,
        speed: 0,
        stat_priorities: ["dex", "wis", "str", "int", "cha", "con"],
    },
    striker: {
        armor_class: -4,
        hit_points: 1.25,
        attack_bonus: 2,
        damage_per_action: 1.25,
        saving_throws: -2,
        attack_dcs: 2,
        initiative: 0,
        perception: 0,
        speed: 0,
        stat_priorities: ["str", "con", "dex", "wis", "cha", "int"],
    },
    supporter: {
        armor_class: -2,
        hit_points: 0.75,
        attack_bonus: 0,
        damage_per_action: 0.75,
        saving_throws: -1,
        attack_dcs: 0,
        initiative: 2,
        perception: 0,
        speed: 0,
        stat_priorities: ["wis", "con", "dex", "str", "int", "cha"],
    },
};
var modifiers = {
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

// Using:
// https://songoftheblade.wordpress.com/2018/03/11/dd-5th-edition-monster-stats-on-a-business-card/
function BusinessCardStats(l) {
    var armour_class = 10 + Math.ceil(l / 2);
    var health_points = dices.d8() * (l + 1);
    var hit_dice = l + 1;
    var damage_per_round = 2 * l;
    var proficiency_bonus = 0;
    var saving_throws = {
        bad: dices.d20() + Math.ceil(l / 2),
        good: dices.d20() + Math.ceil(l / 2) + proficiency_bonus,
    };
    var difficulty_class = 10 + Math.ceil(l / 2); // as maximum
    return {
        armour_class: armour_class,
        health_points: health_points,
        hit_dice: hit_dice,
        damage_per_round: damage_per_round,
        proficiency_bonus: proficiency_bonus,
        saving_throws: saving_throws,
        difficulty_class: difficulty_class,
    };
}
function templateByLevel(lvl) {
    return levels.filter(function (i) { return lvl == i.level; })[0];
}
function createMonster(opts) {
    var role = roles[opts.role];
    var modifier = modifiers[opts.modifier];
    var template = templateByLevel(opts.level);
    var saving_throws = map(function (s) { return s + role.saving_throws + modifier.saving_throws; }, template.saving_throws);
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
    var ability_modifiers = {}; // {int: 2, str: -2 ...}
    for (var key in template.ability_modifiers) {
        ability_modifiers[role.stat_priorities[key]] =
            template.ability_modifiers[key];
    }
    return {
        level: template.level,
        armor_class: sump("armor_class", template, role, modifier),
        hit_dice: "".concat(template.level, "d8"),
        hit_points: mulp("hit_points", template, role, modifier),
        attack_bonus: sump("attack_bonus", template, role, modifier),
        damage_per_action: mulp("damage_per_action", template, role, modifier),
        spell_dc: template.spell_dc.map(function (spell_dc) { return spell_dc + modifier.spell_dc; }),
        initiative: sum(template.proficiency_bonus, role.initiative, modifier.initiative),
        perception: sum(template.proficiency_bonus, role.perception, modifier.perception),
        stealth: sum(0, modifier.stealth),
        speed: sum(25, role.speed),
        experience: mulp("experience", template, modifier),
        saving_throws: saving_throws,
        ability_modifiers: ability_modifiers,
    };
}

console.log("giff:", createMonster(5));
console.log("businesscard:", BusinessCardStats(5));
console.log();
//# sourceMappingURL=module.js.map
