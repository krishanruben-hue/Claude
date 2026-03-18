import type { StoredCard } from './types';

const DB_KEY = 'pokerade_cards';

const now = new Date().toISOString();

/* eslint-disable @typescript-eslint/no-explicit-any */
function c(
  id: string,
  name: string,
  set: string,
  number: string,
  rawNok: number,
  psa10Usd: number,
  psa10Pop: number,
  totalGraded: number,
  gemRate: number,
  finnAvgPrice = 0,
  finnListingsCount = 0,
): StoredCard {
  return { id, name, set, number, rawNok, psa10Usd, psa10Pop, totalGraded, gemRate, finnAvgPrice, finnListingsCount, lastUpdated: now };
}

// ─────────────────────────────────────────────────────────────────────────────
// All prices are approximate market values (early 2026).
// PSA 10 prices in USD; raw prices in NOK.
// Gem rates, pop counts and total-graded are estimates based on PSA data.
// ─────────────────────────────────────────────────────────────────────────────

const SEED_DATA: StoredCard[] = [

  // ══════════════════════════════════════════════════════════════════════════
  // SUN & MOON ERA  (ME – "Modern Era", 2017–2019)
  // ══════════════════════════════════════════════════════════════════════════

  // Sun & Moon Base Set
  c('sm1-solgaleo-gx-fa',        'Solgaleo GX Full Art',          'Sun & Moon',          '173/149', 280,    42,    3500,  10000, 0.35, 260,  3),
  c('sm1-lunala-gx-fa',          'Lunala GX Full Art',            'Sun & Moon',          '174/149', 250,    35,    3000,   9000, 0.33, 230,  2),
  c('sm1-umbreon-gx-fa',         'Umbreon GX Full Art',           'Sun & Moon',          '180/149', 450,    70,    4500,  13000, 0.35, 420,  4),

  // Guardians Rising
  c('sm2-tapu-lele-gx-fa',       'Tapu Lele GX Full Art',         'Guardians Rising',    '137/145', 200,    32,    5500,  17000, 0.32, 180,  5),
  c('sm2-metagross-gx-fa',       'Metagross GX Full Art',         'Guardians Rising',    '140/145', 120,    22,    2500,   8000, 0.31, 110,  2),

  // Burning Shadows
  c('sm3-charizard-gx-rainbow',  'Charizard GX Rainbow Rare',     'Burning Shadows',     '150/147', 1900,  295,    5500,  17000, 0.32, 1800, 6),
  c('sm3-ho-oh-gx-fa',           'Ho-Oh GX Full Art',             'Burning Shadows',     '131/147', 150,    26,    2800,   9000, 0.31, 140,  3),
  c('sm3-gardevoir-gx-fa',       'Gardevoir GX Full Art',         'Burning Shadows',     '137/147', 150,    26,    2800,   9000, 0.31, 140,  3),
  c('sm3-marshadow-gx-fa',       'Marshadow GX Full Art',         'Burning Shadows',     '148/147', 120,    22,    2200,   7000, 0.31, 110,  2),

  // Shining Legends
  c('sm3.5-mewtwo-gx-fa',        'Mewtwo GX Full Art',            'Shining Legends',     '39/73',   150,    28,    2500,   8000, 0.31, 140,  2),
  c('sm3.5-shining-jirachi',     'Shining Jirachi',               'Shining Legends',     '42/73',   300,    52,    3200,  10500, 0.30, 280,  3),
  c('sm3.5-shining-genesect',    'Shining Genesect',              'Shining Legends',     '10/73',   200,    35,    2200,   7500, 0.29, 180,  2),

  // Crimson Invasion
  c('sm4-nihilego-gx-fa',        'Nihilego GX Full Art',          'Crimson Invasion',    '104/111', 100,    20,    1800,   6000, 0.30, 90,   2),
  c('sm4-buzzwole-gx-fa',        'Buzzwole GX Full Art',          'Crimson Invasion',    '104/111', 100,    20,    1600,   5500, 0.29, 90,   1),

  // Ultra Prism
  c('sm5-cynthia-fa',            'Cynthia Full Art',              'Ultra Prism',         '148/156', 180,    32,    4500,  14000, 0.32, 160,  4),
  c('sm5-dialga-prism',          'Dialga ◇ Prism Star',           'Ultra Prism',         '100/156', 120,    22,    2000,   6500, 0.31, 110,  2),
  c('sm5-dawn-fa',               'Dawn Full Art',                 'Ultra Prism',         '149/156', 200,    35,    3500,  11000, 0.32, 180,  3),

  // Forbidden Light
  c('sm6-ultra-necrozma-fa',     'Ultra Necrozma GX Full Art',    'Forbidden Light',     '130/131', 130,    24,    2000,   6500, 0.31, 120,  2),
  c('sm6-naganadel-gx-fa',       'Naganadel GX Full Art',         'Forbidden Light',     '125/131', 100,    20,    1500,   5000, 0.30, 90,   1),

  // Celestial Storm
  c('sm7-blaziken-gx-fa',        'Blaziken GX Full Art',          'Celestial Storm',     '163/168', 120,    22,    1800,   6000, 0.30, 110,  2),
  c('sm7-articuno-gx-fa',        'Articuno GX Full Art',          'Celestial Storm',     '153/168', 100,    20,    1600,   5500, 0.29, 90,   1),

  // Dragon Majesty
  c('sm7.5-reshiram-gx-fa',      'Reshiram GX Full Art',          'Dragon Majesty',      '72/70',   150,    28,    1800,   6000, 0.30, 140,  2),
  c('sm7.5-dragonite-gx-fa',     'Dragonite GX Full Art',         'Dragon Majesty',      '73/70',   120,    22,    1500,   5000, 0.30, 110,  1),

  // Lost Thunder
  c('sm8-lugia-gx-fa',           'Lugia GX Full Art',             'Lost Thunder',        '159/214', 180,    32,    3200,  10500, 0.30, 160,  3),
  c('sm8-zeraora-gx-fa',         'Zeraora GX Full Art',           'Lost Thunder',        '211/214', 120,    22,    2500,   8000, 0.31, 110,  2),
  c('sm8-tyranitar-gx-alt',      'Tyranitar GX Alt Art',          'Lost Thunder',        '182/214', 350,    55,    4000,  13000, 0.31, 330,  3),

  // Team Up
  c('sm9-pikachu-zekrom-fa',     'Pikachu & Zekrom GX Full Art',  'Team Up',             '184/181', 380,    62,    7000,  22000, 0.32, 360,  6),
  c('sm9-eevee-snorlax-fa',      'Eevee & Snorlax GX Full Art',   'Team Up',             '191/181', 220,    38,    3500,  11000, 0.32, 200,  3),
  c('sm9-greninja-zoroark-alt',  'Greninja & Zoroark GX Alt Art', 'Team Up',             '183/181', 180,    32,    2800,   9000, 0.31, 160,  2),

  // Unbroken Bonds
  c('sm10-reshizard-alt',        'Reshiram & Charizard GX Alt Art','Unbroken Bonds',     '217/214', 2100,  325,    9000,  28000, 0.32, 2000, 8),
  c('sm10-gardevoir-sylveon-fa', 'Gardevoir & Sylveon GX Full Art','Unbroken Bonds',     '235/214', 420,    70,    5200,  16500, 0.32, 390,  4),
  c('sm10-reshizard-rainbow',    'Reshiram & Charizard GX Rainbow','Unbroken Bonds',     '215/214', 550,    88,    5000,  16000, 0.31, 510,  5),

  // Unified Minds
  c('sm11-mewtwo-mew-fa',        'Mewtwo & Mew GX Full Art',      'Unified Minds',       '244/236', 430,    72,    9000,  28000, 0.32, 400,  6),
  c('sm11-umbreon-darkrai-alt',  'Umbreon & Darkrai GX Alt Art',  'Unified Minds',       '215/236', 350,    58,    5000,  16000, 0.31, 330,  4),

  // Cosmic Eclipse
  c('sm12-pikachu-zekrom-alt',   'Pikachu & Zekrom GX Alt Art',   'Cosmic Eclipse',      '224/236', 450,    75,    6000,  19000, 0.32, 420,  5),
  c('sm12-venusaur-clefairy-alt','Venusaur & Clefairy GX Alt Art','Cosmic Eclipse',      '182/236', 320,    52,    3800,  12000, 0.32, 300,  3),
  c('sm12-arceus-dialga-alt',    'Arceus & Dialga & Palkia Alt',  'Cosmic Eclipse',      '258/236', 380,    62,    5000,  16000, 0.31, 350,  4),

  // Hidden Fates
  c('sm11.5-shiny-charizard-gx', 'Shiny Charizard GX',           'Hidden Fates',         'SV49/SV94', 3100, 520, 13000, 40000, 0.33, 2900, 10),
  c('sm11.5-shiny-rayquaza-gx',  'Shiny Rayquaza GX',            'Hidden Fates',         'SV42/SV94', 320,  52,  4200, 13500, 0.31, 300,   4),
  c('sm11.5-shiny-gyarados-gx',  'Shiny Gyarados GX',            'Hidden Fates',         'SV30/SV94', 280,  45,  3500, 11500, 0.30, 260,   3),
  c('sm11.5-shiny-umbreon-gx',   'Shiny Umbreon GX',             'Hidden Fates',         'SV61/SV94', 280,  45,  3200, 10500, 0.30, 260,   3),
  c('sm11.5-shiny-espeon-gx',    'Shiny Espeon GX',              'Hidden Fates',         'SV22/SV94', 250,  40,  2800,  9000, 0.31, 230,   2),
  c('sm11.5-shiny-mewtwo-gx',    'Shiny Mewtwo GX',              'Hidden Fates',         'SV53/SV94', 320,  52,  4000, 13000, 0.31, 300,   3),

  // ══════════════════════════════════════════════════════════════════════════
  // SWORD & SHIELD ERA  (SW, 2020–2023)
  // ══════════════════════════════════════════════════════════════════════════

  // Sword & Shield Base
  c('swsh1-zacian-alt',          'Zacian V Alt Art',              'Sword & Shield',       '195/202',  700,  110,   9000,  27000, 0.33, 660,  7),
  c('swsh1-zamazenta-alt',       'Zamazenta V Alt Art',           'Sword & Shield',       '196/202',  350,   55,   5500,  17000, 0.32, 320,  4),
  c('swsh1-marnie-fa',           'Marnie Full Art',               'Sword & Shield',       '169/202',  320,   52,   7500,  23000, 0.33, 300,  5),
  c('swsh1-pikachu-v-fa',        'Pikachu V Full Art',            'Sword & Shield',       '171/202',  220,   36,   5500,  17000, 0.32, 200,  4),

  // Rebel Clash
  c('swsh2-dragapult-vmax-rrr',  'Dragapult VMAX Rainbow Rare',   'Rebel Clash',          '192/192',  380,   62,   3800,  12000, 0.32, 350,  3),
  c('swsh2-bede-fa',             'Bede Full Art',                 'Rebel Clash',          '186/192',  130,   24,   3200,  10000, 0.32, 120,  2),
  c('swsh2-marnie-fa-2',         'Marnie Full Art (Rebel Clash)',  'Rebel Clash',          '200/192',  250,   40,   4000,  13000, 0.31, 230,  3),

  // Darkness Ablaze
  c('swsh3-eternatus-vmax-rrr',  'Eternatus VMAX Secret Rare',    'Darkness Ablaze',      '117/189',  650,  105,   7000,  22000, 0.32, 610,  5),
  c('swsh3-galarian-slowbro-fa', 'Galarian Slowbro V Full Art',   'Darkness Ablaze',      '177/189',  120,   22,   2500,   8000, 0.31, 110,  2),

  // Champion's Path
  c('swsh3.5-charizard-vmax',    'Charizard VMAX',                "Champion's Path",      '74/73',   3200,  540,  13500,  42000, 0.32, 3000, 12),
  c('swsh3.5-charizard-v-fa',    'Charizard V Full Art',          "Champion's Path",      '79/73',   1350,  210,   9000,  28000, 0.32, 1250,  8),
  c('swsh3.5-marnie-fa-cp',      'Marnie Full Art (Champions)',   "Champion's Path",      '80/73',    500,   80,   6500,  20000, 0.33,  470,  5),

  // Vivid Voltage
  c('swsh4-pikachu-vmax-rrr',    'Pikachu VMAX Rainbow Rare',     'Vivid Voltage',        '188/185', 1600,  255,   9000,  28000, 0.32, 1500,  9),
  c('swsh4-pikachu-amazing',     'Pikachu Amazing Rare',          'Vivid Voltage',        '43/185',   420,   70,   7000,  22000, 0.32,  390,  5),
  c('swsh4-jolteon-vmax-rrr',    'Jolteon VMAX Secret Rare',      'Vivid Voltage',        '179/185',  650,  105,   5500,  17000, 0.32,  610,  4),
  c('swsh4-togekiss-vmax-rrr',   'Togekiss VMAX Secret Rare',     'Vivid Voltage',        '185/185',  320,   52,   3500,  11000, 0.32,  300,  2),

  // Shining Fates
  c('swsh4.5-shiny-charizard-vmax','Shiny Charizard VMAX',        'Shining Fates',        'SV107/SV122', 2700, 440, 16000, 50000, 0.32, 2500, 14),
  c('swsh4.5-pikachu-v-sky',     'Pikachu V (Sky Form)',          'Shining Fates',        '006/072',   700,  110,   8000,  25000, 0.32,  650,  7),
  c('swsh4.5-shiny-crobat-v',    'Shiny Crobat V',               'Shining Fates',        'SV60/SV122', 320,   52,   5500,  17000, 0.32,  300,  4),
  c('swsh4.5-shiny-eevee',       'Shiny Eevee',                   'Shining Fates',        '022/072',   230,   38,   4500,  14000, 0.32,  210,  3),

  // Battle Styles
  c('swsh5-urshifu-ss-vmax-rrr', 'Urshifu VMAX Single Strike SR', 'Battle Styles',        '168/163',   550,   88,   5500,  17000, 0.32,  510,  4),
  c('swsh5-urshifu-rs-vmax-rrr', 'Urshifu VMAX Rapid Strike SR',  'Battle Styles',        '170/163',   650,  105,   6500,  20000, 0.33,  610,  5),
  c('swsh5-houndoom-vmax-rrr',   'Houndoom VMAX Secret Rare',     'Battle Styles',        '161/163',   280,   45,   3200,  10000, 0.32,  260,  2),

  // Chilling Reign
  c('swsh6-shadow-calyrex-alt',  'Shadow Rider Calyrex VMAX Alt', 'Chilling Reign',       '205/198',  1300,  205,   7500,  23500, 0.32, 1200,  8),
  c('swsh6-ice-calyrex-alt',     'Ice Rider Calyrex VMAX Alt',    'Chilling Reign',       '203/198',   850,  135,   5800,  18000, 0.32,  800,  6),
  c('swsh6-galarian-moltres-alt','Galarian Moltres V Alt Art',    'Chilling Reign',       '183/198',   750,  120,   5500,  17000, 0.32,  700,  5),
  c('swsh6-galarian-zapdos-alt', 'Galarian Zapdos V Alt Art',     'Chilling Reign',       '184/198',   420,   70,   3800,  12000, 0.32,  390,  3),
  c('swsh6-galarian-articuno-alt','Galarian Articuno V Alt Art',  'Chilling Reign',       '185/198',   350,   55,   3200,  10000, 0.32,  320,  2),

  // Evolving Skies
  c('swsh7-rayquaza-vmax-alt',   'Rayquaza VMAX Alt Art',         'Evolving Skies',       '218/203',  2900,  420,  10000,  31000, 0.32, 2700, 12),
  c('swsh7-umbreon-vmax-alt',    'Umbreon VMAX Alt Art',          'Evolving Skies',       '214/203',  2000,  280,   8000,  25000, 0.32, 1850,  9),
  c('swsh7-sylveon-vmax-alt',    'Sylveon VMAX Alt Art',          'Evolving Skies',       '212/203',   750,  120,   5500,  17000, 0.32,  700,  5),
  c('swsh7-espeon-vmax-alt',     'Espeon VMAX Alt Art',           'Evolving Skies',       '211/203',   700,  110,   5200,  16000, 0.33,  650,  4),
  c('swsh7-glaceon-vmax-alt',    'Glaceon VMAX Alt Art',          'Evolving Skies',       '209/203',   650,  105,   4800,  15000, 0.32,  610,  4),
  c('swsh7-leafeon-vmax-alt',    'Leafeon VMAX Alt Art',          'Evolving Skies',       '210/203',   550,   88,   4200,  13000, 0.32,  510,  3),
  c('swsh7-rayquaza-v-alt',      'Rayquaza V Alt Art',            'Evolving Skies',       '194/203',   450,   72,   5500,  17000, 0.32,  420,  4),
  c('swsh7-dragonite-v-alt',     'Dragonite V Alt Art',           'Evolving Skies',       '192/203',   320,   52,   3800,  12000, 0.32,  300,  3),
  c('swsh7-vaporeon-v-alt',      'Vaporeon V Alt Art',            'Evolving Skies',       '184/203',   270,   44,   3200,  10000, 0.32,  250,  2),

  // Celebrations (25th Anniversary)
  c('swsh7.5-pikachu-v-fa',      'Pikachu V Full Art',            'Celebrations',         '044/025',   850,  135,   6500,  20000, 0.33,  800,  6),
  c('swsh7.5-charizard-v',       'Charizard V (Classic Coll.)',   'Celebrations',         '004/025',   650,  105,   5500,  17000, 0.32,  610,  5),

  // Fusion Strike
  c('swsh8-mew-vmax-alt',        'Mew VMAX Alt Art',              'Fusion Strike',        '269/264',  1000,  160,  15000,  46000, 0.33,  950, 12),
  c('swsh8-mew-vmax-gold',       'Mew VMAX Gold Secret',          'Fusion Strike',        '271/264',   650,  105,   9000,  28000, 0.32,  610,  7),
  c('swsh8-espeon-vmax-alt',     'Espeon VMAX Alt Art',           'Fusion Strike',        '267/264',   550,   88,   7500,  23000, 0.33,  510,  5),
  c('swsh8-mew-v-alt',           'Mew V Alt Art',                 'Fusion Strike',        '250/264',   320,   52,   7500,  23000, 0.33,  300,  4),
  c('swsh8-deoxys-vmax-alt',     'Deoxys VMAX Alt Art',           'Fusion Strike',        '268/264',   420,   68,   5000,  16000, 0.31,  390,  3),

  // Brilliant Stars
  c('swsh9-charizard-v-alt',     'Charizard V Alt Art',           'Brilliant Stars',      '176/172',  1750,  275,  10000,  31000, 0.32, 1650, 10),
  c('swsh9-arceus-vstar-rrr',    'Arceus VSTAR Rainbow Rare',     'Brilliant Stars',      '184/172',   650,  105,  11000,  34000, 0.32,  610,  8),
  c('swsh9-charizard-vstar-rrr', 'Charizard VSTAR Rainbow Rare',  'Brilliant Stars',      '174/172',   850,  135,   9000,  28000, 0.32,  800,  7),
  c('swsh9-arceus-v-alt',        'Arceus V Alt Art',              'Brilliant Stars',      '166/172',   850,  135,   9000,  28000, 0.32,  800,  7),

  // Astral Radiance
  c('swsh10-palkia-vstar-alt',   'Origin Forme Palkia VSTAR Alt', 'Astral Radiance',      '204/189',  1100,  175,   5500,  17000, 0.32, 1000,  7),
  c('swsh10-dialga-vstar-alt',   'Origin Forme Dialga VSTAR Alt', 'Astral Radiance',      '210/189',   850,  135,   5000,  16000, 0.31,  800,  5),
  c('swsh10-arcanine-vstar-alt', 'Hisuian Arcanine VSTAR Alt',   'Astral Radiance',      '197/189',   420,   68,   3200,  10500, 0.30,  390,  3),
  c('swsh10-sneasler-v-alt',     'Hisuian Sneasler V Alt Art',   'Astral Radiance',      '200/189',   320,   52,   2800,   9000, 0.31,  300,  2),

  // Pokémon GO
  c('swsh10.5-mewtwo-v-alt',     'Mewtwo V Alt Art',              'Pokémon GO',           '031/078',  1050,  168,   6500,  20000, 0.33,  980,  6),
  c('swsh10.5-radiant-charizard','Radiant Charizard',             'Pokémon GO',           '011/078',   750,  120,   9000,  28000, 0.32,  700,  7),
  c('swsh10.5-blissey-v-alt',    'Blissey V Alt Art',             'Pokémon GO',           '057/078',   220,   36,   3200,  10000, 0.32,  200,  2),

  // Lost Origin
  c('swsh11-giratina-vstar-alt', 'Giratina VSTAR Alt Art',        'Lost Origin',          '220/196',  2400,  370,   7500,  23500, 0.32, 2200, 10),
  c('swsh11-giratina-v-alt',     'Giratina V Alt Art',            'Lost Origin',          '186/196',   850,  135,   5500,  17000, 0.32,  800,  6),
  c('swsh11-aerodactyl-vstar-alt','Aerodactyl VSTAR Alt Art',     'Lost Origin',          '213/196',   320,   52,   3200,  10000, 0.32,  300,  2),
  c('swsh11-pikachu-v-lo',       'Pikachu V (Lost Origin)',       'Lost Origin',          '078/196',   280,   45,   4500,  14000, 0.32,  260,  3),

  // Silver Tempest
  c('swsh12-lugia-vstar-alt',    'Lugia VSTAR Alt Art',           'Silver Tempest',       '211/195',  2700,  415,   7800,  24500, 0.32, 2500, 10),
  c('swsh12-lugia-v-alt',        'Lugia V Alt Art',               'Silver Tempest',       '186/195',   850,  135,   5000,  16000, 0.31,  800,  5),
  c('swsh12-alolan-vulpix-vstar-alt','Alolan Vulpix VSTAR Alt',   'Silver Tempest',       '191/195',   420,   68,   3500,  11000, 0.32,  390,  3),
  c('swsh12-regidrago-vstar-alt','Regidrago VSTAR Alt Art',       'Silver Tempest',       '195/195',   350,   58,   3200,  10000, 0.32,  320,  2),

  // Crown Zenith
  c('swsh12.5-radiant-charizard','Radiant Charizard (CZ)',        'Crown Zenith',         '020/159',   550,   88,   6500,  20000, 0.33,  510,  5),
  c('swsh12.5-pikachu-vmax-gg',  'Pikachu VMAX (Galarian Gallery)','Crown Zenith',        'GG43/GG70', 750, 120,   5500,  17000, 0.32,  700,  5),
  c('swsh12.5-regieleki-vmax-gg','Regieleki VMAX (Gal. Gallery)', 'Crown Zenith',         'GG51/GG70', 320,   52,   2800,   9000, 0.31,  300,  2),
  c('swsh12.5-mewtwo-v-gg',      'Mewtwo V (Galarian Gallery)',   'Crown Zenith',         'GG44/GG70', 450,   72,   3500,  11000, 0.32,  420,  3),

  // ══════════════════════════════════════════════════════════════════════════
  // SCARLET & VIOLET ERA  (SV, 2023–2025)
  // ══════════════════════════════════════════════════════════════════════════

  // Scarlet & Violet Base
  c('sv1-miraidon-ex-sir',       'Miraidon ex SIR',               'Scarlet & Violet',     '244/198',  1650,  255,   5000,  16000, 0.31, 1500,  9),
  c('sv1-koraidon-ex-sir',       'Koraidon ex SIR',               'Scarlet & Violet',     '254/198',  1650,  255,   4800,  15500, 0.31, 1500,  8),
  c('sv1-gardevoir-ex-sir',      'Gardevoir ex SIR',              'Scarlet & Violet',     '245/198',  1300,  200,   4500,  14500, 0.31, 1200,  7),
  c('sv1-iono-sir',              'Iono SIR',                      'Scarlet & Violet',     '262/198',  2200,  340,   6500,  21000, 0.31, 2000, 10),
  c('sv1-pikachu-ex-sir',        'Pikachu ex SIR',                'Scarlet & Violet',     '235/198',   700,  110,   5500,  17500, 0.31,  650,  6),
  c('sv1-arcanine-ex-sir',       'Arcanine ex SIR',               'Scarlet & Violet',     '247/198',   650,  105,   3800,  12000, 0.32,  610,  4),

  // Paldea Evolved
  c('sv2-chien-pao-ex-sir',      'Chien-Pao ex SIR',              'Paldea Evolved',       '261/193',  1050,  168,   3800,  12000, 0.32,  980,  6),
  c('sv2-tinkaton-ex-sir',       'Tinkaton ex SIR',               'Paldea Evolved',       '257/193',   850,  135,   3200,  10000, 0.32,  800,  4),
  c('sv2-skeledirge-ex-sir',     'Skeledirge ex SIR',             'Paldea Evolved',       '262/193',   550,   88,   3000,   9500, 0.32,  510,  3),
  c('sv2-nurse-joy-sir',         'Nurse Joy SIR',                 'Paldea Evolved',       '258/193',   450,   72,   3000,   9500, 0.32,  420,  3),

  // Obsidian Flames
  c('sv3-charizard-ex-sir',      'Charizard ex SIR (Alt Art)',    'Obsidian Flames',      '228/197',  2400,  370,   8000,  25000, 0.32, 2200, 12),
  c('sv3-charizard-ex-gold',     'Charizard ex Gold Tera',        'Obsidian Flames',      '215/197',  3000,  460,   4500,  14500, 0.31, 2800, 10),
  c('sv3-garchomp-ex-sir',       'Garchomp ex SIR',               'Obsidian Flames',      '222/197',   650,  105,   3800,  12000, 0.32,  610,  4),
  c('sv3-tyranitar-ex-sir',      'Tyranitar ex SIR',              'Obsidian Flames',      '219/197',   550,   88,   3200,  10000, 0.32,  510,  3),
  c('sv3-pidgeot-ex-sir',        'Pidgeot ex SIR',                'Obsidian Flames',      '225/197',   420,   68,   2800,   9000, 0.31,  390,  2),

  // 151
  c('sv3.5-charizard-ex-sir',    'Charizard ex SIR (151)',        '151',                  '199/165',  1750,  270,  10000,  31500, 0.32, 1650, 12),
  c('sv3.5-mew-ex-gold',         'Mew ex Gold',                   '151',                  '205/165',  1300,  200,   5500,  17500, 0.31, 1200,  8),
  c('sv3.5-blastoise-ex-sir',    'Blastoise ex SIR',              '151',                  '201/165',   850,  135,   5500,  17500, 0.31,  800,  6),
  c('sv3.5-venusaur-ex-sir',     'Venusaur ex SIR',               '151',                  '198/165',   750,  120,   5000,  16000, 0.31,  700,  5),
  c('sv3.5-mewtwo-ex-sir',       'Mewtwo ex SIR',                 '151',                  '205/165',  1050,  168,   5500,  17500, 0.31,  980,  7),
  c('sv3.5-pikachu-ex-sir',      'Pikachu ex SIR (151)',          '151',                  '086/165',   850,  135,   7500,  24000, 0.31,  800,  7),
  c('sv3.5-alakazam-ex-sir',     'Alakazam ex SIR',               '151',                  '096/165',   450,   72,   3200,  10000, 0.32,  420,  3),

  // Paradox Rift
  c('sv4-iron-valiant-ex-sir',   'Iron Valiant ex SIR',           'Paradox Rift',         '182/182',   950,  150,   4200,  13500, 0.31,  900,  5),
  c('sv4-roaring-moon-ex-sir',   'Roaring Moon ex SIR',           'Paradox Rift',         '181/182',  1050,  168,   4500,  14500, 0.31,  980,  6),
  c('sv4-flutter-mane-ex-sir',   'Flutter Mane ex SIR',           'Paradox Rift',         '179/182',   450,   72,   2800,   9000, 0.31,  420,  3),
  c('sv4-garchomp-ex-sir-pr',    'Garchomp ex SIR (Paradox)',     'Paradox Rift',         '180/182',   380,   60,   2500,   8000, 0.31,  350,  2),

  // Paldean Fates
  c('sv4.5-charizard-ex-shiny',  'Shiny Charizard ex SIR',        'Paldean Fates',        '091/091',  2700,  415,   5500,  18000, 0.31, 2500, 10),
  c('sv4.5-umbreon-ex-shiny',    'Shiny Umbreon ex SIR',          'Paldean Fates',        '095/091',  2400,  370,   4500,  14500, 0.31, 2200,  8),
  c('sv4.5-iono-shiny',          'Shiny Iono SAR',                'Paldean Fates',        '093/091',  1650,  255,   3800,  12000, 0.32, 1500,  6),
  c('sv4.5-espeon-ex-shiny',     'Shiny Espeon ex SIR',           'Paldean Fates',        '096/091',   850,  135,   3200,  10000, 0.32,  800,  4),
  c('sv4.5-pikachu-ex-shiny',    'Shiny Pikachu ex',              'Paldean Fates',        '081/091',   850,  135,   3800,  12000, 0.32,  800,  5),
  c('sv4.5-mewtwo-ex-shiny',     'Shiny Mewtwo ex SIR',           'Paldean Fates',        '090/091',  1050,  168,   3500,  11000, 0.32,  980,  5),

  // Temporal Forces
  c('sv5-raging-bolt-ex-sir',    'Raging Bolt ex SIR',            'Temporal Forces',      '183/162',   750,  120,   2800,   9000, 0.31,  700,  4),
  c('sv5-iron-crown-ex-sir',     'Iron Crown ex SIR',             'Temporal Forces',      '180/162',   450,   72,   2200,   7000, 0.31,  420,  2),
  c('sv5-walking-wake-ex-sir',   'Walking Wake ex SIR',           'Temporal Forces',      '182/162',   550,   88,   2500,   8000, 0.31,  510,  3),

  // Twilight Masquerade
  c('sv6-ogerpon-ex-sir',        'Ogerpon ex SIR (Teal)',         'Twilight Masquerade',  '167/167',   650,  105,   2200,   7000, 0.31,  610,  3),
  c('sv6-bloodmoon-ursaluna-sir','Bloodmoon Ursaluna ex SIR',     'Twilight Masquerade',  '168/167',   550,   88,   2000,   6500, 0.31,  510,  2),
  c('sv6-kieran-sir',            'Kieran SIR',                    'Twilight Masquerade',  '171/167',   420,   68,   2000,   6500, 0.31,  390,  2),

  // Shrouded Fable
  c('sv6.5-pecharunt-ex-sir',    'Pecharunt ex SIR',              'Shrouded Fable',       '065/064',   450,   72,   1800,   6000, 0.30,  420,  2),
  c('sv6.5-darkrai-ex-sir',      'Darkrai ex SIR',                'Shrouded Fable',       '066/064',   550,   88,   2000,   6500, 0.31,  510,  2),

  // Stellar Crown
  c('sv7-terapagos-ex-sir',      'Terapagos ex SIR',              'Stellar Crown',        '166/142',   650,  105,   2200,   7000, 0.31,  610,  3),
  c('sv7-dragapult-ex-sir',      'Dragapult ex SIR',              'Stellar Crown',        '165/142',   550,   88,   2000,   6500, 0.31,  510,  2),
  c('sv7-drayton-sir',           'Drayton SIR',                   'Stellar Crown',        '167/142',   420,   68,   1800,   6000, 0.30,  390,  2),

  // Surging Sparks
  c('sv8-pikachu-ex-sir',        'Pikachu ex SIR (Surging)',      'Surging Sparks',       '241/191',  1300,  200,   2500,   8000, 0.31, 1200,  5),
  c('sv8-zekrom-ex-sir',         'Zekrom ex SIR',                 'Surging Sparks',       '240/191',   550,   88,   2000,   6500, 0.31,  510,  3),
  c('sv8-reshiram-ex-sir',       'Reshiram ex SIR',               'Surging Sparks',       '239/191',   450,   72,   1800,   6000, 0.30,  420,  2),
  c('sv8-red-sir',               'Red SIR',                       'Surging Sparks',       '242/191',   750,  120,   2200,   7000, 0.31,  700,  3),

  // Prismatic Evolutions
  c('sv8.5-umbreon-ex-sir',      'Umbreon ex SIR',                'Prismatic Evolutions', '141/131',  1650,  255,   2800,   9000, 0.31, 1500,  5),
  c('sv8.5-eevee-ex-sir',        'Eevee ex SIR',                  'Prismatic Evolutions', '135/131',   700,  110,   2200,   7000, 0.31,  650,  4),
  c('sv8.5-sylveon-ex-sir',      'Sylveon ex SIR',                'Prismatic Evolutions', '140/131',   750,  120,   2000,   6500, 0.31,  700,  3),
  c('sv8.5-espeon-ex-sir',       'Espeon ex SIR',                 'Prismatic Evolutions', '137/131',   650,  105,   1800,   6000, 0.31,  610,  3),
  c('sv8.5-vaporeon-ex-sir',     'Vaporeon ex SIR',               'Prismatic Evolutions', '138/131',   550,   88,   1600,   5200, 0.31,  510,  2),
  c('sv8.5-jolteon-ex-sir',      'Jolteon ex SIR',                'Prismatic Evolutions', '136/131',   550,   88,   1600,   5200, 0.31,  510,  2),
  c('sv8.5-flareon-ex-sir',      'Flareon ex SIR',                'Prismatic Evolutions', '139/131',   450,   72,   1500,   5000, 0.30,  420,  2),
];

function seed(): void {
  const existing = localStorage.getItem(DB_KEY);
  if (!existing) {
    localStorage.setItem(DB_KEY, JSON.stringify(SEED_DATA));
  }
}

export function getCards(): StoredCard[] {
  seed();
  try {
    return JSON.parse(localStorage.getItem(DB_KEY) ?? '[]') as StoredCard[];
  } catch {
    return [];
  }
}

export function saveCards(cards: StoredCard[]): void {
  localStorage.setItem(DB_KEY, JSON.stringify(cards));
}

export function addCard(card: StoredCard): void {
  const cards = getCards();
  cards.push(card);
  saveCards(cards);
}

export function updateCard(card: StoredCard): void {
  const cards = getCards();
  const idx = cards.findIndex(c => c.id === card.id);
  if (idx >= 0) cards[idx] = card;
  else cards.push(card);
  saveCards(cards);
}

export function deleteCard(id: string): void {
  const cards = getCards().filter(c => c.id !== id);
  saveCards(cards);
}

export function resetToSeed(): void {
  localStorage.setItem(DB_KEY, JSON.stringify(SEED_DATA));
}

export { SEED_DATA };
