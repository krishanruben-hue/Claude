import 'dotenv/config';
import { supabase } from './supabase.js';

const cards = [
  // ═══════════════════════════════════════════════════════
  // SWORD & SHIELD ERA
  // ═══════════════════════════════════════════════════════

  // ── Sword & Shield Base ───────────────────────────────
  { name: 'Zacian V Alt Art', set_name: 'Sword & Shield', set_number: '211' },
  { name: 'Zamazenta V Alt Art', set_name: 'Sword & Shield', set_number: '202' },
  { name: 'Professor\'s Research Alt Art', set_name: 'Sword & Shield', set_number: '209' },
  { name: 'Marnie Alt Art', set_name: 'Sword & Shield', set_number: '200' },
  { name: 'Zacian V Rainbow', set_name: 'Sword & Shield', set_number: '214' },
  { name: 'Zamazenta V Rainbow', set_name: 'Sword & Shield', set_number: '215' },

  // ── Rebel Clash ───────────────────────────────────────
  { name: 'Dragapult VMAX Rainbow', set_name: 'Rebel Clash', set_number: '192' },
  { name: 'Centiskorch VMAX Rainbow', set_name: 'Rebel Clash', set_number: '189' },
  { name: 'Toxtricity VMAX Rainbow', set_name: 'Rebel Clash', set_number: '193' },
  { name: 'Dragapult V Alt Art', set_name: 'Rebel Clash', set_number: '170' },
  { name: 'Boltund V Alt Art', set_name: 'Rebel Clash', set_number: '155' },

  // ── Darkness Ablaze ───────────────────────────────────
  { name: 'Charizard VMAX Rainbow', set_name: 'Darkness Ablaze', set_number: '74' },
  { name: 'Eternatus VMAX Rainbow', set_name: 'Darkness Ablaze', set_number: '192' },
  { name: 'Crobat V Alt Art', set_name: 'Darkness Ablaze', set_number: '182' },
  { name: 'Eternatus VMAX Alt Art', set_name: 'Darkness Ablaze', set_number: '189' },

  // ── Champion's Path ───────────────────────────────────
  { name: 'Charizard V Alt Art', set_name: 'Champion\'s Path', set_number: '79' },
  { name: 'Charizard VMAX', set_name: 'Champion\'s Path', set_number: '74' },
  { name: 'Marnie Alt Art', set_name: 'Champion\'s Path', set_number: '87' },
  { name: 'Hop Alt Art', set_name: 'Champion\'s Path', set_number: '88' },

  // ── Vivid Voltage ─────────────────────────────────────
  { name: 'Pikachu V Alt Art', set_name: 'Vivid Voltage', set_number: '170' },
  { name: 'Pikachu VMAX Rainbow', set_name: 'Vivid Voltage', set_number: '188' },
  { name: 'Togekiss V Alt Art', set_name: 'Vivid Voltage', set_number: '172' },
  { name: 'Ampharos V Alt Art', set_name: 'Vivid Voltage', set_number: '167' },

  // ── Shining Fates ─────────────────────────────────────
  { name: 'Charizard VMAX Shiny', set_name: 'Shining Fates', set_number: 'SV107' },
  { name: 'Charizard V Shiny', set_name: 'Shining Fates', set_number: 'SV89' },
  { name: 'Dragapult VMAX Shiny', set_name: 'Shining Fates', set_number: 'SV110' },
  { name: 'Eevee VMAX Shiny', set_name: 'Shining Fates', set_number: 'SV122' },
  { name: 'Pikachu V Shiny', set_name: 'Shining Fates', set_number: 'SV96' },

  // ── Battle Styles ─────────────────────────────────────
  { name: 'Rapid Strike Urshifu VMAX Alt Art', set_name: 'Battle Styles', set_number: '169' },
  { name: 'Single Strike Urshifu VMAX Alt Art', set_name: 'Battle Styles', set_number: '168' },
  { name: 'Tapu Koko V Alt Art', set_name: 'Battle Styles', set_number: '153' },
  { name: 'Rapid Strike Urshifu VMAX Rainbow', set_name: 'Battle Styles', set_number: '186' },
  { name: 'Single Strike Urshifu VMAX Rainbow', set_name: 'Battle Styles', set_number: '185' },

  // ── Chilling Reign ────────────────────────────────────
  { name: 'Ice Rider Calyrex VMAX Alt Art', set_name: 'Chilling Reign', set_number: '205' },
  { name: 'Shadow Rider Calyrex VMAX Alt Art', set_name: 'Chilling Reign', set_number: '206' },
  { name: 'Blaziken VMAX Alt Art', set_name: 'Chilling Reign', set_number: '198' },
  { name: 'Jolteon V Alt Art', set_name: 'Chilling Reign', set_number: '193' },
  { name: 'Flareon V Alt Art', set_name: 'Chilling Reign', set_number: '191' },
  { name: 'Vaporeon V Alt Art', set_name: 'Chilling Reign', set_number: '195' },
  { name: 'Ice Rider Calyrex VMAX Rainbow', set_name: 'Chilling Reign', set_number: '209' },
  { name: 'Shadow Rider Calyrex VMAX Rainbow', set_name: 'Chilling Reign', set_number: '210' },

  // ── Evolving Skies ────────────────────────────────────
  { name: 'Umbreon VMAX Alt Art', set_name: 'Evolving Skies', set_number: '215' },
  { name: 'Rayquaza VMAX Alt Art', set_name: 'Evolving Skies', set_number: '218' },
  { name: 'Glaceon VMAX Alt Art', set_name: 'Evolving Skies', set_number: '209' },
  { name: 'Espeon VMAX Alt Art', set_name: 'Evolving Skies', set_number: '208' },
  { name: 'Leafeon VMAX Alt Art', set_name: 'Evolving Skies', set_number: '210' },
  { name: 'Flareon VMAX Alt Art', set_name: 'Evolving Skies', set_number: '211' },
  { name: 'Vaporeon VMAX Alt Art', set_name: 'Evolving Skies', set_number: '212' },
  { name: 'Jolteon VMAX Alt Art', set_name: 'Evolving Skies', set_number: '213' },
  { name: 'Ditto VMAX Alt Art', set_name: 'Evolving Skies', set_number: '217' },
  { name: 'Dragonite V Alt Art', set_name: 'Evolving Skies', set_number: '192' },
  { name: 'Umbreon V Alt Art', set_name: 'Evolving Skies', set_number: '188' },
  { name: 'Rayquaza V Alt Art', set_name: 'Evolving Skies', set_number: '194' },
  { name: 'Umbreon VMAX Rainbow', set_name: 'Evolving Skies', set_number: '222' },
  { name: 'Rayquaza VMAX Rainbow', set_name: 'Evolving Skies', set_number: '225' },

  // ── Celebrations ──────────────────────────────────────
  { name: 'Charizard V', set_name: 'Celebrations', set_number: '4' },
  { name: 'Pikachu V-UNION', set_name: 'Celebrations', set_number: '27' },
  { name: 'Lance\'s Charizard V', set_name: 'Celebrations', set_number: '18' },

  // ── Fusion Strike ─────────────────────────────────────
  { name: 'Gengar VMAX Alt Art', set_name: 'Fusion Strike', set_number: '271' },
  { name: 'Mew VMAX Alt Art', set_name: 'Fusion Strike', set_number: '269' },
  { name: 'Espeon VMAX Alt Art', set_name: 'Fusion Strike', set_number: '270' },
  { name: 'Beedrill V Alt Art', set_name: 'Fusion Strike', set_number: '261' },
  { name: 'Genesect V Alt Art', set_name: 'Fusion Strike', set_number: '263' },
  { name: 'Mew VMAX Rainbow', set_name: 'Fusion Strike', set_number: '284' },
  { name: 'Gengar VMAX Rainbow', set_name: 'Fusion Strike', set_number: '282' },

  // ── Brilliant Stars ───────────────────────────────────
  { name: 'Charizard VSTAR Rainbow', set_name: 'Brilliant Stars', set_number: '174' },
  { name: 'Arceus VSTAR Rainbow', set_name: 'Brilliant Stars', set_number: '176' },
  { name: 'Arceus V Alt Art', set_name: 'Brilliant Stars', set_number: '166' },
  { name: 'Charizard V Alt Art', set_name: 'Brilliant Stars', set_number: '153' },
  { name: 'Lumineon V Alt Art', set_name: 'Brilliant Stars', set_number: '156' },
  { name: 'Marnie\'s Pride Alt Art', set_name: 'Brilliant Stars', set_number: '164' },

  // ── Astral Radiance ───────────────────────────────────
  { name: 'Origin Forme Palkia VSTAR Alt Art', set_name: 'Astral Radiance', set_number: '202' },
  { name: 'Origin Forme Dialga VSTAR Alt Art', set_name: 'Astral Radiance', set_number: '200' },
  { name: 'Hisuian Zoroark VSTAR Alt Art', set_name: 'Astral Radiance', set_number: '207' },
  { name: 'Machamp V Alt Art', set_name: 'Astral Radiance', set_number: '187' },
  { name: 'Palkia VSTAR Rainbow', set_name: 'Astral Radiance', set_number: '209' },
  { name: 'Dialga VSTAR Rainbow', set_name: 'Astral Radiance', set_number: '208' },

  // ── Pokémon GO ────────────────────────────────────────
  { name: 'Mewtwo V Alt Art', set_name: 'Pokémon GO', set_number: '78' },
  { name: 'Radiant Charizard', set_name: 'Pokémon GO', set_number: '11' },
  { name: 'Mewtwo VSTAR Rainbow', set_name: 'Pokémon GO', set_number: '83' },

  // ── Lost Origin ───────────────────────────────────────
  { name: 'Giratina VSTAR Alt Art', set_name: 'Lost Origin', set_number: '214' },
  { name: 'Aerodactyl VSTAR Alt Art', set_name: 'Lost Origin', set_number: '211' },
  { name: 'Comfey Alt Art', set_name: 'Lost Origin', set_number: '207' },
  { name: 'Pikachu VMAX Rainbow', set_name: 'Lost Origin', set_number: '217' },
  { name: 'Giratina V Alt Art', set_name: 'Lost Origin', set_number: '186' },
  { name: 'Rotom V Alt Art', set_name: 'Lost Origin', set_number: '183' },
  { name: 'Giratina VSTAR Rainbow', set_name: 'Lost Origin', set_number: '219' },

  // ── Silver Tempest ────────────────────────────────────
  { name: 'Lugia VSTAR Alt Art', set_name: 'Silver Tempest', set_number: '211' },
  { name: 'Serperior VSTAR Alt Art', set_name: 'Silver Tempest', set_number: '209' },
  { name: 'Alolan Vulpix VSTAR Alt Art', set_name: 'Silver Tempest', set_number: '208' },
  { name: 'Unown VSTAR Alt Art', set_name: 'Silver Tempest', set_number: '214' },
  { name: 'Lugia VSTAR Rainbow', set_name: 'Silver Tempest', set_number: '217' },
  { name: 'Lugia V Alt Art', set_name: 'Silver Tempest', set_number: '186' },

  // ── Crown Zenith ──────────────────────────────────────
  { name: 'Regieleki VMAX Alt Art', set_name: 'Crown Zenith', set_number: '167' },
  { name: 'Regidrago VSTAR Alt Art', set_name: 'Crown Zenith', set_number: '165' },
  { name: 'Glaceon VSTAR Alt Art', set_name: 'Crown Zenith', set_number: '164' },
  { name: 'Galarian Articuno V Alt Art', set_name: 'Crown Zenith', set_number: '174' },
  { name: 'Galarian Zapdos V Alt Art', set_name: 'Crown Zenith', set_number: '175' },
  { name: 'Galarian Moltres V Alt Art', set_name: 'Crown Zenith', set_number: '176' },
  { name: 'Pikachu VMAX Alt Art', set_name: 'Crown Zenith', set_number: '160' },
  { name: 'Mewtwo VSTAR Rainbow', set_name: 'Crown Zenith', set_number: '184' },

  // ═══════════════════════════════════════════════════════
  // SCARLET & VIOLET ERA
  // ═══════════════════════════════════════════════════════

  // ── Scarlet & Violet Base ─────────────────────────────
  { name: 'Charizard ex SIR', set_name: 'Scarlet & Violet', set_number: '234' },
  { name: 'Arcanine ex SIR', set_name: 'Scarlet & Violet', set_number: '232' },
  { name: 'Gyarados ex SIR', set_name: 'Scarlet & Violet', set_number: '235' },
  { name: 'Miraidon ex SIR', set_name: 'Scarlet & Violet', set_number: '243' },
  { name: 'Koraidon ex SIR', set_name: 'Scarlet & Violet', set_number: '247' },
  { name: 'Charizard ex IR', set_name: 'Scarlet & Violet', set_number: '223' },
  { name: 'Miraidon ex IR', set_name: 'Scarlet & Violet', set_number: '240' },
  { name: 'Koraidon ex IR', set_name: 'Scarlet & Violet', set_number: '244' },
  { name: 'Nemona SIR', set_name: 'Scarlet & Violet', set_number: '254' },
  { name: 'Professor Sada\'s Vitality SIR', set_name: 'Scarlet & Violet', set_number: '258' },
  { name: 'Professor Turo\'s Scenario SIR', set_name: 'Scarlet & Violet', set_number: '259' },

  // ── Paldea Evolved ────────────────────────────────────
  { name: 'Iono SIR', set_name: 'Paldea Evolved', set_number: '269' },
  { name: 'Gardevoir ex SIR', set_name: 'Paldea Evolved', set_number: '266' },
  { name: 'Forretress ex SIR', set_name: 'Paldea Evolved', set_number: '264' },
  { name: 'Iono IR', set_name: 'Paldea Evolved', set_number: '254' },
  { name: 'Gardevoir ex IR', set_name: 'Paldea Evolved', set_number: '245' },
  { name: 'Maushold ex SIR', set_name: 'Paldea Evolved', set_number: '267' },

  // ── Obsidian Flames ───────────────────────────────────
  { name: 'Charizard ex SIR', set_name: 'Obsidian Flames', set_number: '234' },
  { name: 'Tyranitar ex SIR', set_name: 'Obsidian Flames', set_number: '235' },
  { name: 'Revavroom ex SIR', set_name: 'Obsidian Flames', set_number: '236' },
  { name: 'Charizard ex IR', set_name: 'Obsidian Flames', set_number: '228' },
  { name: 'Pidgeot ex IR', set_name: 'Obsidian Flames', set_number: '226' },
  { name: 'Dragonite ex IR', set_name: 'Obsidian Flames', set_number: '225' },
  { name: 'Aroma Lady SIR', set_name: 'Obsidian Flames', set_number: '237' },

  // ── Scarlet & Violet 151 ──────────────────────────────
  { name: 'Mew ex SIR', set_name: 'Scarlet & Violet 151', set_number: '205' },
  { name: 'Charizard ex SIR', set_name: 'Scarlet & Violet 151', set_number: '204' },
  { name: 'Blastoise ex SIR', set_name: 'Scarlet & Violet 151', set_number: '202' },
  { name: 'Venusaur ex SIR', set_name: 'Scarlet & Violet 151', set_number: '198' },
  { name: 'Alakazam ex SIR', set_name: 'Scarlet & Violet 151', set_number: '201' },
  { name: 'Mewtwo ex SIR', set_name: 'Scarlet & Violet 151', set_number: '206' },
  { name: 'Pikachu ex SIR', set_name: 'Scarlet & Violet 151', set_number: '207' },
  { name: 'Mew ex IR', set_name: 'Scarlet & Violet 151', set_number: '193' },
  { name: 'Charizard ex IR', set_name: 'Scarlet & Violet 151', set_number: '182' },
  { name: 'Blastoise ex IR', set_name: 'Scarlet & Violet 151', set_number: '176' },
  { name: 'Venusaur ex IR', set_name: 'Scarlet & Violet 151', set_number: '170' },
  { name: 'Mewtwo ex IR', set_name: 'Scarlet & Violet 151', set_number: '194' },
  { name: 'Giovanni\'s Charisma SIR', set_name: 'Scarlet & Violet 151', set_number: '209' },

  // ── Paradox Rift ──────────────────────────────────────
  { name: 'Roaring Moon ex SIR', set_name: 'Paradox Rift', set_number: '254' },
  { name: 'Iron Valiant ex SIR', set_name: 'Paradox Rift', set_number: '255' },
  { name: 'Garchomp ex SIR', set_name: 'Paradox Rift', set_number: '253' },
  { name: 'Roaring Moon ex IR', set_name: 'Paradox Rift', set_number: '245' },
  { name: 'Iron Valiant ex IR', set_name: 'Paradox Rift', set_number: '246' },
  { name: 'Walking Wake ex IR', set_name: 'Paradox Rift', set_number: '247' },
  { name: 'Ancient Booster Energy Capsule SIR', set_name: 'Paradox Rift', set_number: '261' },
  { name: 'Future Booster Energy Capsule SIR', set_name: 'Paradox Rift', set_number: '262' },

  // ── Paldean Fates ─────────────────────────────────────
  { name: 'Charizard ex SIR', set_name: 'Paldean Fates', set_number: '90' },
  { name: 'Meowscarada ex SIR', set_name: 'Paldean Fates', set_number: '91' },
  { name: 'Skeledirge ex SIR', set_name: 'Paldean Fates', set_number: '92' },
  { name: 'Quaquaval ex SIR', set_name: 'Paldean Fates', set_number: '93' },
  { name: 'Iono SIR', set_name: 'Paldean Fates', set_number: '94' },
  { name: 'Charizard ex Shiny', set_name: 'Paldean Fates', set_number: 'SV38' },
  { name: 'Gardevoir ex Shiny', set_name: 'Paldean Fates', set_number: 'SV64' },

  // ── Temporal Forces ───────────────────────────────────
  { name: 'Walking Wake ex SIR', set_name: 'Temporal Forces', set_number: '202' },
  { name: 'Iron Leaves ex SIR', set_name: 'Temporal Forces', set_number: '203' },
  { name: 'Raging Bolt ex SIR', set_name: 'Temporal Forces', set_number: '204' },
  { name: 'Iron Crown ex SIR', set_name: 'Temporal Forces', set_number: '205' },
  { name: 'Ursaluna ex IR', set_name: 'Temporal Forces', set_number: '193' },
  { name: 'Raging Bolt ex IR', set_name: 'Temporal Forces', set_number: '195' },
  { name: 'Iron Crown ex IR', set_name: 'Temporal Forces', set_number: '196' },
  { name: 'Kieran SIR', set_name: 'Temporal Forces', set_number: '208' },

  // ── Twilight Masquerade ───────────────────────────────
  { name: 'Bloodmoon Ursaluna ex SIR', set_name: 'Twilight Masquerade', set_number: '221' },
  { name: 'Teal Mask Ogerpon ex SIR', set_name: 'Twilight Masquerade', set_number: '218' },
  { name: 'Kieran SIR', set_name: 'Twilight Masquerade', set_number: '223' },
  { name: 'Perrin SIR', set_name: 'Twilight Masquerade', set_number: '222' },
  { name: 'Bloodmoon Ursaluna ex IR', set_name: 'Twilight Masquerade', set_number: '210' },
  { name: 'Teal Mask Ogerpon ex IR', set_name: 'Twilight Masquerade', set_number: '207' },
  { name: 'Wellspring Mask Ogerpon ex IR', set_name: 'Twilight Masquerade', set_number: '208' },
  { name: 'Hearthflame Mask Ogerpon ex IR', set_name: 'Twilight Masquerade', set_number: '209' },
  { name: 'Cornerstone Mask Ogerpon ex IR', set_name: 'Twilight Masquerade', set_number: '211' },

  // ── Shrouded Fable ────────────────────────────────────
  { name: 'Pecharunt ex SIR', set_name: 'Shrouded Fable', set_number: '100' },
  { name: 'Darkrai ex SIR', set_name: 'Shrouded Fable', set_number: '98' },
  { name: 'Fezandipiti ex SIR', set_name: 'Shrouded Fable', set_number: '99' },
  { name: 'Pecharunt ex IR', set_name: 'Shrouded Fable', set_number: '91' },
  { name: 'Darkrai ex IR', set_name: 'Shrouded Fable', set_number: '85' },
  { name: 'Carmine SIR', set_name: 'Shrouded Fable', set_number: '103' },

  // ── Stellar Crown ─────────────────────────────────────
  { name: 'Terapagos ex SIR', set_name: 'Stellar Crown', set_number: '182' },
  { name: 'Scizor ex SIR', set_name: 'Stellar Crown', set_number: '183' },
  { name: 'Ceruledge ex SIR', set_name: 'Stellar Crown', set_number: '184' },
  { name: 'Drayton SIR', set_name: 'Stellar Crown', set_number: '186' },
  { name: 'Terapagos ex IR', set_name: 'Stellar Crown', set_number: '173' },
  { name: 'Scizor ex IR', set_name: 'Stellar Crown', set_number: '174' },
  { name: 'Ceruledge ex IR', set_name: 'Stellar Crown', set_number: '171' },
  { name: 'Carmine SIR', set_name: 'Stellar Crown', set_number: '185' },

  // ── Surging Sparks ────────────────────────────────────
  { name: 'Pikachu ex SIR', set_name: 'Surging Sparks', set_number: '261' },
  { name: 'Raichu ex SIR', set_name: 'Surging Sparks', set_number: '262' },
  { name: 'Zekrom ex SIR', set_name: 'Surging Sparks', set_number: '263' },
  { name: 'Pikachu ex IR', set_name: 'Surging Sparks', set_number: '252' },
  { name: 'Raichu ex IR', set_name: 'Surging Sparks', set_number: '253' },
  { name: 'Zekrom ex IR', set_name: 'Surging Sparks', set_number: '254' },
  { name: 'Iono SIR', set_name: 'Surging Sparks', set_number: '270' },
  { name: 'Crispin SIR', set_name: 'Surging Sparks', set_number: '268' },
  { name: 'Sada SIR', set_name: 'Surging Sparks', set_number: '271' },

  // ── Prismatic Evolutions ──────────────────────────────
  { name: 'Umbreon ex SIR', set_name: 'Prismatic Evolutions', set_number: '161' },
  { name: 'Espeon ex SIR', set_name: 'Prismatic Evolutions', set_number: '162' },
  { name: 'Sylveon ex SIR', set_name: 'Prismatic Evolutions', set_number: '163' },
  { name: 'Flareon ex SIR', set_name: 'Prismatic Evolutions', set_number: '159' },
  { name: 'Vaporeon ex SIR', set_name: 'Prismatic Evolutions', set_number: '160' },
  { name: 'Jolteon ex SIR', set_name: 'Prismatic Evolutions', set_number: '157' },
  { name: 'Leafeon ex SIR', set_name: 'Prismatic Evolutions', set_number: '158' },
  { name: 'Glaceon ex SIR', set_name: 'Prismatic Evolutions', set_number: '156' },
  { name: 'Eevee ex SIR', set_name: 'Prismatic Evolutions', set_number: '155' },
  { name: 'Umbreon ex IR', set_name: 'Prismatic Evolutions', set_number: '131' },
  { name: 'Espeon ex IR', set_name: 'Prismatic Evolutions', set_number: '132' },
  { name: 'Sylveon ex IR', set_name: 'Prismatic Evolutions', set_number: '133' },
  { name: 'Eevee ex IR', set_name: 'Prismatic Evolutions', set_number: '130' },
  { name: 'Penny SIR', set_name: 'Prismatic Evolutions', set_number: '165' },
  { name: 'Lacey SIR', set_name: 'Prismatic Evolutions', set_number: '164' },

  // ── Journey Together ──────────────────────────────────
  { name: 'Leavanny ex SIR', set_name: 'Journey Together', set_number: '180' },
  { name: 'Decidueye ex SIR', set_name: 'Journey Together', set_number: '181' },
  { name: 'Red SIR', set_name: 'Journey Together', set_number: '184' },
  { name: 'Blue SIR', set_name: 'Journey Together', set_number: '185' },
  { name: 'Leavanny ex IR', set_name: 'Journey Together', set_number: '172' },
  { name: 'Decidueye ex IR', set_name: 'Journey Together', set_number: '173' },

  // ── Destined Rivals ───────────────────────────────────
  { name: 'Mewtwo ex SIR', set_name: 'Destined Rivals', set_number: '180' },
  { name: 'Darkrai ex SIR', set_name: 'Destined Rivals', set_number: '181' },
  { name: 'Giovanni SIR', set_name: 'Destined Rivals', set_number: '185' },

  // ═══════════════════════════════════════════════════════
  // MEGA EVOLUTION (japanske sett)
  // ═══════════════════════════════════════════════════════

  { name: 'M Charizard EX (Fire)', set_name: 'Mega Evolution', set_number: '14' },
  { name: 'M Charizard EX (Dragon)', set_name: 'Mega Evolution', set_number: '17' },
  { name: 'M Venusaur EX', set_name: 'Mega Evolution', set_number: '1' },
  { name: 'M Blastoise EX', set_name: 'Mega Evolution', set_number: '21' },
  { name: 'M Mewtwo EX', set_name: 'Phantasmal Flames', set_number: '25' },
  { name: 'M Gengar EX', set_name: 'Phantasmal Flames', set_number: '5' },
  { name: 'M Rayquaza EX', set_name: 'Mega Evolution—Chaos Rising', set_number: '76' },
];

if (!supabase) {
  console.error('Supabase ikke konfigurert.');
  process.exit(1);
}

// Slett alle eksisterende kort og sett inn hele listen
const { error: delErr } = await supabase
  .from('cards')
  .delete()
  .neq('id', '00000000-0000-0000-0000-000000000000');

if (delErr) {
  console.error('Feil ved sletting:', delErr.message);
  process.exit(1);
}

const BATCH = 50;
let total = 0;
for (let i = 0; i < cards.length; i += BATCH) {
  const batch = cards.slice(i, i + BATCH);
  const { error } = await supabase.from('cards').insert(batch);
  if (error) {
    console.error(`Batch-feil (${i}–${i + BATCH}):`, error.message);
  } else {
    total += batch.length;
  }
}

console.log(`Seeded ${total} kort i Supabase.`);
