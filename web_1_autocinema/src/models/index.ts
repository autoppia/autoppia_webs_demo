export interface Movie {
  id: string;
  title: string;
  synopsis: string;
  description?: string;
  year: number;
  duration: number;
  rating: number;
  director: string;
  cast: string[];
  trailerUrl?: string;
  poster: string;
  genres: string[];
  category: string;
  imagePath?: string;
}

export interface UserRecord {
  username: string;
  password: string;
  allowedMovies: string[];
}

export interface AuthUser {
  username: string;
  allowedMovies: string[];
}

export interface RegisterInput {
  username: string;
  password: string;
  allowedMovies?: string[];
}

export interface MovieEditorData {
  title: string;
  synopsis: string;
  year: string;
  duration: string;
  rating: string;
  director: string;
  genres: string;
  cast: string;
  trailerUrl: string;
}

export interface FilmPayload {
  id: number;
  name: string;
  director: string | null;
  year: number | null;
  genres: Array<{ name: string }>;
  rating: number | null;
  duration: number | null;
  cast: string | null;
}
