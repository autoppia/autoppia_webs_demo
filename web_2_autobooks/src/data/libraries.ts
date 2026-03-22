export interface FamousLibrary {
  id: string;
  name: string;
  city: string;
  country: string;
  founded: string;
  description: string;
  highlights: string[];
  website?: string;
  imageSrc?: string;
}

export const FAMOUS_LIBRARIES: FamousLibrary[] = [
  {
    id: "library-of-congress",
    name: "Library of Congress",
    city: "Washington, D.C.",
    country: "United States",
    founded: "1800",
    description:
      "The research library of the U.S. Congress and the de facto national library of the United States, with millions of books, recordings, photographs, maps, and manuscripts.",
    highlights: [
      "Largest library in the world by shelf space and number of items",
      "Thomas Jefferson's personal library seed collection",
      "Extensive rare book and manuscript holdings",
    ],
    website: "https://www.loc.gov",
    imageSrc: "/media/gallery/people/person1.jpg",
  },
  {
    id: "british-library",
    name: "British Library",
    city: "London",
    country: "United Kingdom",
    founded: "1973",
    description:
      "The national library of the United Kingdom; a major research library holding over 170 million items spanning every age of written civilization.",
    highlights: [
      "Magna Carta copies and Beatles manuscripts",
      "Reading Rooms used by researchers worldwide",
      "St Pancras flagship building",
    ],
    website: "https://www.bl.uk",
    imageSrc: "/media/gallery/people/person2.jpg",
  },
  {
    id: "new-york-public-library",
    name: "New York Public Library",
    city: "New York City",
    country: "United States",
    founded: "1895",
    description:
      "A public library system featuring the iconic Stephen A. Schwarzman Building on Fifth Avenue and branches across the Bronx, Manhattan, and Staten Island.",
    highlights: [
      "Lion statues Patience and Fortitude at the main entrance",
      "Rose Main Reading Room",
      "Free programs and exhibitions for the public",
    ],
    website: "https://www.nypl.org",
    imageSrc: "/media/gallery/people/person3.jpg",
  },
  {
    id: "bibliotheque-nationale-de-france",
    name: "Bibliothèque nationale de France",
    city: "Paris",
    country: "France",
    founded: "1368 (royal origins)",
    description:
      "The national repository of published material in France, spanning historic collections and the modern François-Mitterrand site along the Seine.",
    highlights: [
      "Gallica digital library",
      "Richelieu site restoration and museum",
      "Legal deposit archive for French publishing",
    ],
    website: "https://www.bnf.fr",
    imageSrc: "/media/gallery/people/person4.jpg",
  },
  {
    id: "trinity-college-old-library",
    name: "Trinity College Old Library",
    city: "Dublin",
    country: "Ireland",
    founded: "1592",
    description:
      "Home of the Long Room and the Book of Kells exhibition, one of the most visited literary landmarks in Europe.",
    highlights: [
      "The Long Room's barrel-vaulted chamber of research stacks",
      "Book of Kells manuscript display",
      "Brian Boru harp on exhibit",
    ],
    website: "https://www.tcd.ie/library/",
    imageSrc: "/media/gallery/people/person1.jpg",
  },
  {
    id: "vatican-apostolic-library",
    name: "Vatican Apostolic Library",
    city: "Vatican City",
    country: "Vatican City",
    founded: "1475",
    description:
      "One of the oldest libraries in the world, preserving manuscripts and codices central to European intellectual and religious history.",
    highlights: [
      "Codices and incunabula spanning centuries",
      "Digitization projects for fragile collections",
      "Scholarly access to theological and classical texts",
    ],
    website: "https://www.vaticanlibrary.va",
    imageSrc: "/media/gallery/people/person2.jpg",
  },
  {
    id: "austrian-national-library",
    name: "Austrian National Library",
    city: "Vienna",
    country: "Austria",
    founded: "1368",
    description:
      "Housed in the baroque State Hall of the Hofburg, it combines imperial splendor with major map, music, and manuscript collections.",
    highlights: [
      "Grand State Hall with frescoed ceilings",
      "Globe and papyrus museums",
      "Extensive music archives",
    ],
    website: "https://www.onb.ac.at",
    imageSrc: "/media/gallery/people/person3.jpg",
  },
  {
    id: "national-library-of-china",
    name: "National Library of China",
    city: "Beijing",
    country: "China",
    founded: "1909",
    description:
      "Asia's largest library by collection size, serving as the national bibliographic center and preserving Chinese and international publications.",
    highlights: [
      "Comprehensive modern and rare Chinese imprints",
      "National digitization initiatives",
      "Major research services for scholars",
    ],
    website: "https://www.nlc.cn",
    imageSrc: "/media/gallery/people/person4.jpg",
  },
];

export function normalizeLocationQuery(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, " ");
}

export function filterLibrariesByLocationQuery(
  libraries: FamousLibrary[],
  rawQuery: string
): FamousLibrary[] {
  const q = normalizeLocationQuery(rawQuery);
  if (!q) {
    return [...libraries];
  }
  return libraries.filter((lib) => {
    const haystack = `${lib.name} ${lib.city} ${lib.country} ${lib.description}`
      .toLowerCase()
      .normalize("NFC");
    return haystack.includes(q);
  });
}

export function getLibraryById(id: string): FamousLibrary | undefined {
  return FAMOUS_LIBRARIES.find((lib) => lib.id === id);
}
