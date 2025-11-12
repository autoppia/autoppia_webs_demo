export interface Amenity {
  icon: string;
  title: string;
  desc: string;
}

export interface Host {
  name: string;
  since: number; // years hosting
  avatar: string;
}

export interface Hotel {
  id: number;
  image: string;
  title: string;
  location: string;
  rating: number;
  reviews: number;
  guests: number;
  maxGuests: number;
  bedrooms: number;
  beds: number;
  baths: number;
  datesFrom: string; // YYYY-MM-DD
  datesTo: string;   // YYYY-MM-DD
  price: number;
  host: Host;
  amenities: Amenity[];
}
