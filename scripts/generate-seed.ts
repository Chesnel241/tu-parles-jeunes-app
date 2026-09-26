/**
 * Génère supabase/seed.sql à partir des données de l'app (une seule source de vérité).
 * Usage : npm run seed:generate
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ALLOWED_CITIES } from '../src/data/allowedCities';
import { EXPRESSIONS } from '../src/data/expressions';
import { CITIES, COUNTRIES } from '../src/data/places';
import { QUESTIONS } from '../src/data/questions';

const q = (v: string) => `'${v.replace(/'/g, "''")}'`;
const arr = (items: readonly string[]) => `array[${items.map(q).join(', ')}]::text[]`;

const countries = Array.from(new Set([...COUNTRIES, ...Object.keys(ALLOWED_CITIES), ...CITIES.map((c) => c.country)])).sort();

const lines: string[] = [
  '-- Généré par scripts/generate-seed.ts : ne pas modifier à la main.',
  'begin;',
  '',
  '-- Pays',
  ...countries.map((c) => `insert into public.countries (name) values (${q(c)}) on conflict do nothing;`),
  '',
  '-- Villes autorisées (liste officielle)',
  ...Object.entries(ALLOWED_CITIES).flatMap(([country, cities]) =>
    cities.map((city) => `insert into public.allowed_cities (name, country) values (${q(city)}, ${q(country)}) on conflict do nothing;`),
  ),
  ...CITIES.map((c) => `insert into public.allowed_cities (name, country) values (${q(c.name)}, ${q(c.country)}) on conflict do nothing;`),
  '',
  '-- Villes ouvertes au lancement',
  ...CITIES.map(
    (c) =>
      `insert into public.cities (name, country, status, pioneer, color, opened_at) values (${q(c.name)}, ${q(c.country)}, 'open', false, ${q(c.color)}, now()) on conflict (name, country) do update set status = 'open', color = excluded.color;`,
  ),
  '',
  '-- Expressions',
  ...EXPRESSIONS.map(
    (e) =>
      `insert into public.expressions (key, word, place, lang, region, mean, def, ex, author_label) values (${[e.key, e.word, e.place, e.lang, e.region, e.mean, e.def, e.ex, e.by].map(q).join(', ')}) on conflict (key) do update set word = excluded.word, def = excluded.def, ex = excluded.ex, mean = excluded.mean;`,
  ),
  '',
  '-- Questions',
  ...QUESTIONS.map(
    (x) =>
      `insert into public.questions (id, lex, expr, answers, good, hint) values (${q(x.id)}, ${q(x.lex)}, ${q(x.expr)}, ${arr(x.answers)}, ${x.good}, ${q(x.hint)}) on conflict (id) do update set expr = excluded.expr, answers = excluded.answers, good = excluded.good, hint = excluded.hint;`,
  ),
  '',
  'commit;',
  '',
];

const out = join(__dirname, '..', 'supabase', 'seed.sql');
writeFileSync(out, lines.join('\n'), 'utf8');
console.log(`seed.sql écrit (${countries.length} pays, ${EXPRESSIONS.length} expressions, ${QUESTIONS.length} questions).`);
