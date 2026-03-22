import type { Book } from "@/data/books";

export interface AuthorProfile {
  id: string;
  displayName: string;
  /** Values compared to `book.director` after normalization (Unicode NFC, trim, lower case). */
  directorAliases: string[];
  biography: string;
  awards: string[];
  portraitSrc?: string;
}

export function normalizeDirectorLabel(value: string): string {
  return value.trim().normalize("NFC").toLowerCase().replace(/\s+/g, " ");
}

export function directorMatchesAuthor(director: string, author: AuthorProfile): boolean {
  const d = normalizeDirectorLabel(director);
  return author.directorAliases.some((alias) => normalizeDirectorLabel(alias) === d);
}

export function booksForAuthor(books: Book[], author: AuthorProfile): Book[] {
  return books.filter((book) => directorMatchesAuthor(book.director, author));
}

export const AUTHOR_PROFILES: AuthorProfile[] = [
  {
    id: "homer",
    displayName: "Homer",
    directorAliases: ["Homer"],
    biography:
      "Ancient Greek poet credited with the epic foundations of Western literature. The Iliad and the Odyssey shaped narrative, heroism, and oral tradition for millennia.",
    awards: [
      "Cornerstone of classical canon (traditional attribution)",
      "Enduring influence on epic poetry worldwide",
    ],
    portraitSrc: "/media/gallery/people/person1.jpg",
  },
  {
    id: "william-shakespeare",
    displayName: "William Shakespeare",
    directorAliases: ["William Shakespeare"],
    biography:
      "English playwright and poet whose tragedies, comedies, and histories redefined drama and the English language itself.",
    awards: [
      "Folger Shakespeare Library global readership",
      "Definitive editions studied in theatre and literature programs worldwide",
    ],
    portraitSrc: "/media/gallery/people/person2.jpg",
  },
  {
    id: "jane-austen",
    displayName: "Jane Austen",
    directorAliases: ["Jane Austen"],
    biography:
      "Novelist whose sharp social observation and marriage plots remain touchstones of realist fiction and modern adaptations.",
    awards: [
      "Critical revival in the 20th century cemented canonical status",
      "Continued film and television adaptations",
    ],
    portraitSrc: "/media/gallery/people/person3.jpg",
  },
  {
    id: "charles-dickens",
    displayName: "Charles Dickens",
    directorAliases: ["Charles Dickens"],
    biography:
      "Victorian novelist and social critic whose serialized novels brought industrial-era London to life for mass audiences.",
    awards: [
      "Public reading tours across Britain and America",
      "Founding editor and social reform advocacy through fiction",
    ],
    portraitSrc: "/media/gallery/people/person4.jpg",
  },
  {
    id: "mark-twain",
    displayName: "Mark Twain",
    directorAliases: ["Mark Twain"],
    biography:
      "American writer and humorist whose river narratives captured American vernacular and the contradictions of the 19th century.",
    awards: [
      "Honorary degrees and acclaim as America's foremost humorist",
      "Works remain staples of American literature curricula",
    ],
    portraitSrc: "/media/gallery/people/person1.jpg",
  },
  {
    id: "leo-tolstoy",
    displayName: "Leo Tolstoy",
    directorAliases: ["Leo Tolstoy"],
    biography:
      "Russian novelist and moral philosopher whose panoramic novels examined war, peace, and the search for a meaningful life.",
    awards: [
      "Nominated for the first Nobel Prize in Literature (1901)",
      "Global influence on pacifist and Christian anarchist thought",
    ],
    portraitSrc: "/media/gallery/people/person2.jpg",
  },
  {
    id: "mary-shelley",
    displayName: "Mary Shelley",
    directorAliases: ["Mary Shelley"],
    biography:
      "English novelist best known for Frankenstein, a foundational work of science fiction and Gothic literature.",
    awards: [
      "Critical recognition grew substantially in feminist literary scholarship",
      "Frankenstein endlessly adapted across media",
    ],
    portraitSrc: "/media/gallery/people/person3.jpg",
  },
  {
    id: "gabriel-garcia-marquez",
    displayName: "Gabriel García Márquez",
    directorAliases: ["Gabriel García Márquez", "Gabriel Garcia Marquez"],
    biography:
      "Colombian novelist and Nobel laureate who popularized magical realism and chronicled Latin American history with lyrical power.",
    awards: [
      "Nobel Prize in Literature (1982)",
      "Neustadt International Prize for Literature",
    ],
    portraitSrc: "/media/gallery/people/person4.jpg",
  },
  {
    id: "james-joyce",
    displayName: "James Joyce",
    directorAliases: ["James Joyce"],
    biography:
      "Irish modernist whose experiments with stream of consciousness reshaped the novel in the 20th century.",
    awards: [
      "James Tait Black Memorial Prize (for fiction)",
      "Enduring academic and cultural industry around Ulysses and Finnegans Wake",
    ],
    portraitSrc: "/media/gallery/people/person1.jpg",
  },
  {
    id: "george-orwell",
    displayName: "George Orwell",
    directorAliases: ["George Orwell"],
    biography:
      "English essayist and novelist whose dystopian and political works entered everyday language and debate.",
    awards: [
      "Prometheus Hall of Fame Award (1984)",
      "Modern Library recognition among best English-language novels",
    ],
    portraitSrc: "/media/gallery/people/person2.jpg",
  },
];

export function getAuthorById(id: string): AuthorProfile | undefined {
  return AUTHOR_PROFILES.find((a) => a.id === id);
}

export function listAuthors(): AuthorProfile[] {
  return [...AUTHOR_PROFILES];
}
