-- card_overview: kombinerer cards + siste price_snapshot + siste psa_population
-- med pre-beregnede metrics (gem_rate, multiplier, roi, psa10_pop)
-- Kjoer dette i Supabase SQL Editor

CREATE OR REPLACE VIEW card_overview AS
SELECT
  c.id,
  c.name,
  c.set_id,
  c.set_name,
  c.set_number,
  c.rarity,
  c.supertype,
  c.image_url,
  c.pokemon_api_id,
  c.created_at,
  -- Numerisk versjon av kortnummer for sortering (f.eks. "101" -> 101, "TG01" -> 1)
  NULLIF(regexp_replace(c.set_number, '[^0-9]', '', 'g'), '')::integer AS set_number_int,
  -- Priser fra siste snapshot
  ps.raw_usd,
  ps.psa10_usd,
  ps.psa9_usd,
  -- PSA Population
  COALESCE(pp.grade_1,  0) AS grade_1,
  COALESCE(pp.grade_2,  0) AS grade_2,
  COALESCE(pp.grade_3,  0) AS grade_3,
  COALESCE(pp.grade_4,  0) AS grade_4,
  COALESCE(pp.grade_5,  0) AS grade_5,
  COALESCE(pp.grade_6,  0) AS grade_6,
  COALESCE(pp.grade_7,  0) AS grade_7,
  COALESCE(pp.grade_8,  0) AS grade_8,
  COALESCE(pp.grade_9,  0) AS grade_9,
  COALESCE(pp.grade_10, 0) AS grade_10,
  COALESCE(pp.total,    0) AS total,
  -- Beregnet: psa10_pop og total_pop
  COALESCE(pp.grade_10, 0) AS psa10_pop,
  COALESCE(pp.total,    0) AS total_pop,
  -- Beregnet: gem_rate = grade_10 / total
  CASE
    WHEN pp.total > 0 THEN ROUND((pp.grade_10::numeric / pp.total), 4)
    ELSE NULL
  END AS gem_rate,
  -- Beregnet: multiplier = psa10_usd / raw_usd
  CASE
    WHEN ps.raw_usd > 0 AND ps.psa10_usd > 0
    THEN ROUND((ps.psa10_usd / ps.raw_usd)::numeric, 2)
    ELSE NULL
  END AS multiplier,
  -- Beregnet: roi med default batchSize=1 (gradingCost = 32.99 + 55.00 = 87.99 USD)
  -- roi = (psa10 - raw - cost) / (raw + cost)
  CASE
    WHEN ps.raw_usd > 0 AND ps.psa10_usd > 0
    THEN ROUND(((ps.psa10_usd - ps.raw_usd - 87.99) / (ps.raw_usd + 87.99))::numeric, 4)
    ELSE NULL
  END AS roi
FROM cards c
LEFT JOIN LATERAL (
  SELECT raw_usd, psa10_usd, psa9_usd
  FROM price_snapshots
  WHERE card_id = c.id
  ORDER BY date DESC
  LIMIT 1
) ps ON true
LEFT JOIN LATERAL (
  SELECT grade_1, grade_2, grade_3, grade_4, grade_5,
         grade_6, grade_7, grade_8, grade_9, grade_10, total
  FROM psa_population
  WHERE card_id = c.id
  ORDER BY fetched_at DESC
  LIMIT 1
) pp ON true;
