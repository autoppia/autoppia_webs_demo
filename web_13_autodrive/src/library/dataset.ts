// Driver type for extensibility
export interface DriverType {
  name: string;
  car: string;
  plate: string;
  phone: string;
  photo: string;
}

// Trip type for extensibility
export interface Trip {
  id: string;
  status: "upcoming" | "completed" | "cancelled";
  ride: RideType;
  pickup: string;
  dropoff: string;
  date: string;
  time: string;
  price: number;
  payment: string;
  driver: DriverType;
}

// Ride type for extensibility
export interface RideType {
  name: string;
  icon: string;
  image: string;
  price: number;
}

export const rides: RideType[] = [
  {
    name: "AutoDriverX",
    image: "/car1.jpg",
    icon: "https://ext.same-assets.com/407674263/3757967630.png",
    price: 26.6,
  },
  {
    name: "Comfort",
    image: "/car2.jpg",
    icon: "https://ext.same-assets.com/407674263/2600779409.svg",
    price: 31.5,
  },
  {
    name: "AutoDriverXL",
    image: "/car3.jpg",
    icon: "https://ext.same-assets.com/407674263/2882408466.svg",
    price: 27.37,
  },
];
