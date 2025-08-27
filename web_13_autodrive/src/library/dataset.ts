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

// const rides = [
//   {
//     name: "AutoDriverX",
//     icon: "https://ext.same-assets.com/407674263/3757967630.png",
//     price: 26.6,
//   },
//   {
//     name: "Comfort",
//     icon: "https://ext.same-assets.com/407674263/2600779409.svg",
//     price: 31.5,
//   },
//   {
//     name: "AutoDriverXL",
//     icon: "https://ext.same-assets.com/407674263/2882408466.svg",
//     price: 27.37,
//   },
// ];

export const simulatedTrips: Trip[] = [
  {
    id: "1",
    status: "upcoming",
    ride: rides[1],
    pickup: "100 Van Ness - 100 Van Ness Ave, San Francisco, CA 94102, USA",
    dropoff:
      "1030 Post Street Apartments - 1030 Post St #112, San Francisco, CA 94109, USA",
    date: "2025-07-18",
    time: "13:00",
    price: 31.5,
    payment: "Visa ••••1270",
    driver: {
      name: "Alexei Ivanov",
      car: "Toyota Camry (Blue)",
      plate: "CBA 123",
      phone: "+1 416-555-1234",
      photo: "https://randomuser.me/api/portraits/men/32.jpg",
    },
  },
  {
    id: "2",
    status: "upcoming",
    ride: rides[0],
    pickup:
      "1 Hotel San Francisco - 8 Mission St, San Francisco, CA 94105, USA",
    dropoff:
      "1000 Chestnut Street Apartments - 1000 Chestnut St, San Francisco, CA 94109, USA",
    date: "2025-07-18",
    time: "13:00",
    price: 26.6,
    payment: "Visa ••••1270",
    driver: {
      name: "Maria Chen",
      car: "Honda Accord (White)",
      plate: "XYZ 789",
      phone: "+1 647-555-5678",
      photo: "https://randomuser.me/api/portraits/women/44.jpg",
    },
  },
  {
    id: "3",
    status: "upcoming",
    ride: rides[0],
    pickup:
      "1 Hotel San Francisco - 8 Mission St, San Francisco, CA 94105, USA",
    dropoff:
      "1000 Chestnut Street Apartments - 1000 Chestnut St, San Francisco, CA 94109, USA",
    date: "2025-07-18",
    time: "13:00",
    price: 26.6,
    payment: "Visa ••••1270",
    driver: {
      name: "Samir Patel",
      car: "Tesla Model 3 (Red)",
      plate: "TES 333",
      phone: "+1 416-555-9999",
      photo: "https://randomuser.me/api/portraits/men/85.jpg",
    },
  },
];