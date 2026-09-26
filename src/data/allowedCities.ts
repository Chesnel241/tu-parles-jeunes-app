/**
 * Liste officielle des villes qu'un joueur peut ouvrir, par pays.
 * Elle empêche les noms inventés ou insultants. La même liste est chargée dans
 * Supabase (table allowed_cities) via `npm run seed:generate`.
 * Pour l'étendre : voir docs/COMMUNAUTE.md (import GeoNames recommandé).
 */
export const ALLOWED_CITIES: Readonly<Record<string, readonly string[]>> = {
  'Algérie': ['Alger', 'Oran', 'Constantine', 'Annaba', 'Blida'],
  Belgique: ['Bruxelles', 'Liège', 'Charleroi', 'Namur', 'Mons', 'Anvers', 'Gand'],
  'Bénin': ['Cotonou', 'Porto-Novo', 'Parakou', 'Abomey-Calavi', 'Djougou'],
  'Burkina Faso': ['Ouagadougou', 'Bobo-Dioulasso', 'Koudougou', 'Banfora'],
  Burundi: ['Bujumbura', 'Gitega'],
  Cameroun: ['Douala', 'Yaoundé', 'Bafoussam', 'Garoua', 'Bamenda', 'Maroua', 'Ngaoundéré', 'Kribi', 'Limbé'],
  Canada: ['Montréal', 'Québec', 'Gatineau', 'Laval', 'Sherbrooke', 'Ottawa', 'Moncton'],
  Centrafrique: ['Bangui', 'Bimbo', 'Berbérati', 'Carnot', 'Bambari'],
  Comores: ['Moroni', 'Mutsamudu'],
  Congo: ['Brazzaville', 'Pointe-Noire', 'Dolisie', 'Nkayi'],
  "Côte d'Ivoire": ['Abidjan', 'Bouaké', 'Yamoussoukro', 'San-Pédro', 'Daloa', 'Korhogo'],
  Djibouti: ['Djibouti'],
  France: [
    'Paris', 'Marseille', 'Lyon', 'Lille', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux',
    'Rennes', 'Reims', 'Le Havre', 'Saint-Étienne', 'Toulon', 'Grenoble', 'Dijon', 'Angers', 'Nîmes', 'Villeurbanne',
    'Clermont-Ferrand', 'Le Mans', 'Aix-en-Provence', 'Brest', 'Tours', 'Amiens', 'Limoges', 'Metz', 'Perpignan',
    'Besançon', 'Orléans', 'Rouen', 'Mulhouse', 'Caen', 'Nancy', 'Saint-Denis', 'Montreuil', 'Argenteuil', 'Roubaix',
    'Tourcoing', 'Créteil', 'Cergy', 'Sarcelles', 'Pointe-à-Pitre', 'Fort-de-France', 'Cayenne', 'Saint-Denis (La Réunion)',
    'Mamoudzou',
  ],
  Gabon: ['Libreville', 'Port-Gentil', 'Franceville', 'Oyem', 'Moanda', 'Lambaréné', 'Mouila'],
  'Guinée': ['Conakry', 'Nzérékoré', 'Kankan', 'Kindia', 'Labé'],
  'Guinée équatoriale': ['Malabo', 'Bata'],
  'Haïti': ['Port-au-Prince', 'Cap-Haïtien', 'Gonaïves', 'Les Cayes', 'Pétion-Ville'],
  Luxembourg: ['Luxembourg', 'Esch-sur-Alzette'],
  Madagascar: ['Antananarivo', 'Toamasina', 'Antsirabe', 'Mahajanga', 'Fianarantsoa', 'Toliara'],
  Mali: ['Bamako', 'Sikasso', 'Ségou', 'Mopti', 'Kayes'],
  Maroc: ['Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir'],
  Maurice: ['Port-Louis', 'Curepipe'],
  Mauritanie: ['Nouakchott', 'Nouadhibou'],
  Niger: ['Niamey', 'Zinder', 'Maradi', 'Agadez', 'Tahoua'],
  'RD Congo': ['Kinshasa', 'Lubumbashi', 'Mbuji-Mayi', 'Kisangani', 'Goma', 'Bukavu', 'Kananga'],
  Rwanda: ['Kigali', 'Huye'],
  'Sénégal': ['Dakar', 'Thiès', 'Saint-Louis', 'Touba', 'Ziguinchor', 'Kaolack'],
  Seychelles: ['Victoria'],
  Suisse: ['Genève', 'Lausanne', 'Fribourg', 'Neuchâtel', 'Sion'],
  Tchad: ["N'Djamena", 'Moundou', 'Sarh', 'Abéché', 'Kélo'],
  Togo: ['Lomé', 'Sokodé', 'Kara', 'Kpalimé', 'Atakpamé'],
  Tunisie: ['Tunis', 'Sfax', 'Sousse'],
};

export function allowedCitiesFor(country: string): readonly string[] {
  return ALLOWED_CITIES[country] ?? [];
}
