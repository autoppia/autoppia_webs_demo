// Example dummy data for restaurants and menu

export type MenuItemSize = {
    name: string;
    cal: number;
    priceMod: number; // additive
};

export type MenuItemOption = {
    label: string;
};

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  sizes?: MenuItemSize[];
  options?: MenuItemOption[];
  restaurantId?: string;
  restaurantName?: string;
};
export type Review = {
    author: string;
    rating: number;
    comment: string;
    date: string; // yyyy-mm-dd
    avatar: string;
};

export type Restaurant = {
    id: string;
    name: string;
    description: string;
    image: string;
    cuisine: string;
    rating: number;
    featured?: boolean;
    menu: MenuItem[];
    reviews: Review[];
    deliveryTime: string;
    pickupTime: string;
};

const DEFAULT_SIZES: MenuItemSize[] = [
    {name: "Small", cal: 230, priceMod: 0},
    {name: "Medium", cal: 320, priceMod: 0.9},
    {name: "Large", cal: 480, priceMod: 1.6},
];

const baseRestaurants: Restaurant[] = [
    {
        id: "1",
        name: "Pizza Palace",
        description: "Best wood-fired pizzas in town!",
        image: "/images/pizza-palace.jpg",
        cuisine: "Italian",
        rating: 4.7,
        featured: true,
        menu: [
            {
                id: "1-1",
                name: "Margherita Pizza",
                description: "Classic pizza with tomato, mozzarella, and basil.",
                price: 10.99,
                image: "/images/margherita.jpg",
                sizes: [
                    {name: "Small", cal: 230, priceMod: 0},
                    {name: "Medium", cal: 320, priceMod: 0.9},
                    {name: "Large", cal: 480, priceMod: 1.6},
                ],
                options: [{label: "No Basil"}, {label: "No Cheese"}],
            },
            {
                id: "1-2",
                name: "Pepperoni Pizza",
                description: "Topped with spicy pepperoni and mozzarella.",
                price: 12.99,
                image: "/images/pepperoni.jpg",
                sizes: [
                    {name: "Small", cal: 260, priceMod: 0},
                    {name: "Medium", cal: 355, priceMod: 1.2},
                    {name: "Large", cal: 530, priceMod: 2.1},
                ],
                options: [{label: "No Pepperoni"}, {label: "No Sauce"}],
            },
        ],
        reviews: [
            {
                author: "Marco R.",
                rating: 5,
                comment: "Pizza was amazing! Will order again.",
                date: "2025-06-02",
                avatar: "https://randomuser.me/api/portraits/men/32.jpg",
            },
            {
                author: "Lina A.",
                rating: 5,
                comment: "Hot, fresh, delicious, super fast delivery.",
                date: "2025-05-30",
                avatar: "https://randomuser.me/api/portraits/women/44.jpg",
            },
        ],
        deliveryTime: "40-55 min",
        pickupTime: "15 min",
    },
    {
        id: "2",
        name: "Sushi World",
        description: "Delicious and fresh sushi delivered fast.",
        image: "/images/sushi-world.jpg",
        cuisine: "Japanese",
        rating: 4.5,
        featured: true,
        menu: [
            {
                id: "2-1",
                name: "Salmon Nigiri",
                description: "Fresh salmon on rice.",
                price: 8.99,
                image: "/images/nigiri.jpg",
            },
            {
                id: "2-2",
                name: "California Roll",
                description: "Crab, avocado, and cucumber roll.",
                price: 9.99,
                image: "/images/cali-roll.jpg",
            },
        ],
        reviews: [
            {
                author: "Sakura M.",
                rating: 5,
                comment: "Sushi was fresh and delicious!",
                date: "2025-06-01",
                avatar: "https://randomuser.me/api/portraits/women/24.jpg",
            },
            {
                author: "Tom K.",
                rating: 4,
                comment: "Tasty rolls, great service.",
                date: "2025-05-27",
                avatar: "https://randomuser.me/api/portraits/men/54.jpg",
            },
        ],
        deliveryTime: "50-60 min",
        pickupTime: "20 min",
    },
    {
        id: "3",
        name: "Curry House",
        description: "Authentic Indian curries and sides.",
        image: "/images/curry-house.jpg",
        cuisine: "Indian",
        rating: 4.3,
        menu: [
            {
                id: "3-1",
                name: "Chicken Tikka Masala",
                description: "Creamy tomato-based chicken curry.",
                price: 13.99,
                image: "/images/tikka.jpg",
            },
            {
                id: "3-2",
                name: "Saag Paneer",
                description: "Spinach and indian cheese curry.",
                price: 11.5,
                image: "/images/paneer.jpg",
            },
        ],
        reviews: [
            {
                author: "Priya S.",
                rating: 5,
                comment: "Curry was top notch! Very authentic.",
                date: "2025-06-03",
                avatar: "https://randomuser.me/api/portraits/women/65.jpg",
            },
            {
                author: "Arjun V.",
                rating: 4,
                comment: "Loved the saag paneer.",
                date: "2025-05-21",
                avatar: "https://randomuser.me/api/portraits/men/43.jpg",
            },
        ],
        deliveryTime: "35-45 min",
        pickupTime: "18 min",
    },
    {
        id: "4",
        name: "Taco Fiesta",
        description: "Mexican street food classics. Tacos, burritos, and more!",
        image: "/images/taco-fiesta.jpg",
        cuisine: "Mexican",
        rating: 4.2,
        featured: true,
        menu: [
            {
                id: "4-1",
                name: "Carne Asada Taco",
                description: "Grilled steak taco with onions & cilantro.",
                price: 3.5,
                image: "/images/asada-taco.jpg",
            },
            {
                id: "4-2",
                name: "Chicken Burrito",
                description: "Tender chicken, beans, rice, salsa, cheese.",
                price: 9.5,
                image: "/images/chicken-burrito.jpg",
            },
        ],
        reviews: [
            {
                author: "Juan P.",
                rating: 5,
                comment: "Real authentic tacos!",
                date: "2025-05-25",
                avatar: "https://randomuser.me/api/portraits/men/11.jpg",
            },
            {
                author: "Mia R.",
                rating: 4,
                comment: "Loved the chicken burrito!",
                date: "2025-05-19",
                avatar: "https://randomuser.me/api/portraits/women/36.jpg",
            },
        ],
        deliveryTime: "25-35 min",
        pickupTime: "10 min",
    },
    {
        id: "5",
        name: "Burger Joint",
        description: "Juicy burgers, crispy fries, and shakes.",
        image: "/images/burger-joint.jpg",
        cuisine: "American",
        rating: 4.1,
        menu: [
            {
                id: "5-1",
                name: "Classic Cheeseburger",
                description: "Beef patty, cheddar, lettuce, tomato, onion.",
                price: 8.99,
                image: "/images/cheeseburger.jpg",
                sizes: [
                    {name: "Single", cal: 290, priceMod: 0},
                    {name: "Double", cal: 490, priceMod: 2.2},
                ],
                options: [
                    {label: "No Onion"},
                    {label: "No Tomato"},
                    {label: "Extra Cheese"},
                ],
            },
            {
                id: "5-2",
                name: "Spicy Chicken Sandwich",
                description: "Spicy breaded chicken, pickles, mayo.",
                price: 7.5,
                image: "/images/chicken-sandwich.jpg",
            },
        ],
        reviews: [
            {
                author: "Dan S.",
                rating: 4,
                comment: "Burger was juicy and perfectly cooked.",
                date: "2025-06-02",
                avatar: "https://randomuser.me/api/portraits/men/22.jpg",
            },
            {
                author: "Carla H.",
                rating: 5,
                comment: "Best fast food burger in the city!",
                date: "2025-05-30",
                avatar: "https://randomuser.me/api/portraits/women/61.jpg",
            },
        ],
        deliveryTime: "30-45 min",
        pickupTime: "14 min",
    },
    {
        id: "6",
        name: "Green Bowl",
        description: "Healthy salads & vegan-friendly bowls.",
        image: "/images/green-bowl.jpg",
        cuisine: "Vegan",
        rating: 4.8,
        featured: true,
        menu: [
            {
                id: "6-1",
                name: "Quinoa Power Bowl",
                description: "Quinoa, kale, chickpeas, lemon tahini.",
                price: 10.0,
                image: "/images/quinoa-bowl.jpg",
            },
            {
                id: "6-2",
                name: "Berry Spinach Salad",
                description: "Baby spinach, berries, almonds, vinaigrette.",
                price: 9.0,
                image: "/images/berry-salad.jpg",
            },
        ],
        reviews: [
            {
                author: "Zoe T.",
                rating: 5,
                comment: "Nutritious and yummy!",
                date: "2025-06-01",
                avatar: "https://randomuser.me/api/portraits/women/11.jpg",
            },
            {
                author: "Tyler F.",
                rating: 4,
                comment: "Ate healthy and still full!",
                date: "2025-05-29",
                avatar: "https://randomuser.me/api/portraits/men/41.jpg",
            },
        ],
        deliveryTime: "20-30 min",
        pickupTime: "9 min",
    },
    {
        id: "7",
        name: "Dragon Wok",
        description: "Chinese favorites with a modern twist.",
        image: "/images/dragon-wok.jpg",
        cuisine: "Chinese",
        rating: 4.4,
        menu: [
            {
                id: "7-1",
                name: "General Tso's Chicken",
                description: "Crispy chicken, spicy-sweet sauce.",
                price: 11.99,
                image: "/images/asada-taco.jpg",
            },
            {
                id: "7-2",
                name: "Vegetable Lo Mein",
                description: "Savory noodles with mixed vegetables.",
                price: 9.5,
                image: "/images/chicken-burrito.jpg",
            },
        ],
        reviews: [
            {
                author: "Wei L.",
                rating: 5,
                comment: "Loved the General Tso's! Will order again.",
                date: "2025-06-04",
                avatar: "https://randomuser.me/api/portraits/men/18.jpg",
            },
            {
                author: "Emily C.",
                rating: 4,
                comment: "Lo mein was flavorful and fresh.",
                date: "2025-05-28",
                avatar: "https://randomuser.me/api/portraits/women/53.jpg",
            },
        ],
        deliveryTime: "45-55 min",
        pickupTime: "22 min",
    },
    {
        id: "8",
        name: "Pasta Fresca",
        description: "Handmade pasta and sauces from scratch.",
        image: "/images/pasta-fresca.jpg",
        cuisine: "Italian",
        rating: 4.6,
        menu: [
            {
                id: "8-1",
                name: "Penne Arrabbiata",
                description: "Spicy tomato sauce, garlic, olive oil.",
                price: 11.0,
                image: "/images/penne.jpg",
            },
            {
                id: "8-2",
                name: "Lasagna",
                description: "Layered pasta, cheese, beef ragu.",
                price: 13.5,
                image: "/images/lasagna.jpg",
            },
        ],
        reviews: [
            {
                author: "Giulia F.",
                rating: 5,
                comment: "Best lasagna outside of Italy!",
                date: "2025-06-03",
                avatar: "https://randomuser.me/api/portraits/women/29.jpg",
            },
            {
                author: "Sam D.",
                rating: 4,
                comment: "Arrabbiata was spicy and delicious.",
                date: "2025-05-31",
                avatar: "https://randomuser.me/api/portraits/men/37.jpg",
            },
        ],
        deliveryTime: "30-45 min",
        pickupTime: "17 min",
    },
    {
        id: "9",
        name: "Sweet Corner",
        description: "Desserts, cakes, and pastries baked daily.",
        image: "/images/sweet-corner.jpg",
        cuisine: "Desserts",
        rating: 4.9,
        menu: [
            {
                id: "9-1",
                name: "Chocolate Lava Cake",
                description: "Warm molten chocolate cake.",
                price: 5.5,
                image: "/images/lava-cake.jpg",
            },
            {
                id: "9-2",
                name: "Strawberry Tart",
                description: "Fresh strawberries, pastry cream.",
                price: 4.75,
                image: "/images/tart.jpg",
            },
        ],
        reviews: [
            {
                author: "Nina S.",
                rating: 5,
                comment: "The lava cake is to die for!",
                date: "2025-06-02",
                avatar: "https://randomuser.me/api/portraits/women/77.jpg",
            },
            {
                author: "Omar B.",
                rating: 5,
                comment: "Freshest pastries in town.",
                date: "2025-05-29",
                avatar: "https://randomuser.me/api/portraits/men/25.jpg",
            },
        ],
        deliveryTime: "20-25 min",
        pickupTime: "6 min",
    },
    {
        id: "10",
        name: "Pho Express",
        description: "Vietnamese noodle soups and street eats.",
        image: "/images/pho-express.jpg",
        cuisine: "Vietnamese",
        rating: 4.5,
        menu: [
            {
                id: "10-1",
                name: "Beef Pho",
                description: "Classic beef noodle soup with herbs.",
                price: 12.0,
                image: "/images/quinoa-bowl.jpg",
            },
            {
                id: "10-2",
                name: "Spring Rolls",
                description: "Fresh rice paper rolls with shrimp.",
                price: 6.5,
                image: "/images/berry-salad.jpg",
            },
        ],
        reviews: [
            {
                author: "Minh T.",
                rating: 5,
                comment: "Pho broth was rich and flavorful.",
                date: "2025-06-01",
                avatar: "https://randomuser.me/api/portraits/men/12.jpg",
            },
            {
                author: "Anna L.",
                rating: 4,
                comment: "Spring rolls were super fresh.",
                date: "2025-05-30",
                avatar: "https://randomuser.me/api/portraits/women/19.jpg",
            },
        ],
        deliveryTime: "28-38 min",
        pickupTime: "12 min",
    },
    {
        id: "11",
        name: "Bagel Bros",
        description: "NY-style bagels, sandwiches, and coffee.",
        image: "/images/bagel-bros.jpg",
        cuisine: "Breakfast",
        rating: 4.3,
        menu: [
            {
                id: "11-1",
                name: "Everything Bagel",
                description: "Toasted with cream cheese.",
                price: 3.0,
                image: "/images/everything-bagel.jpg",
            },
            {
                id: "11-2",
                name: "Egg & Cheese Sandwich",
                description: "Egg, cheddar, on a fresh bagel.",
                price: 5.0,
                image: "/images/egg-cheese.jpg",
            },
        ],
        reviews: [
            {
                author: "Mike J.",
                rating: 5,
                comment: "Best bagels in town!",
                date: "2025-06-02",
                avatar: "https://randomuser.me/api/portraits/men/45.jpg",
            },
            {
                author: "Sara P.",
                rating: 4,
                comment: "Great coffee and quick service.",
                date: "2025-05-28",
                avatar: "https://randomuser.me/api/portraits/women/23.jpg",
            },
        ],
        deliveryTime: "18-25 min",
        pickupTime: "7 min",
    },
    {
        id: "12",
        name: "Falafel King",
        description: "Middle Eastern wraps, bowls, and salads.",
        image: "/images/falafel-king.jpg",
        cuisine: "Middle Eastern",
        rating: 4.7,
        featured: true,
        menu: [
            {
                id: "12-1",
                name: "Falafel Wrap",
                description: "Crispy falafel, veggies, tahini.",
                price: 7.5,
                image: "/images/penne.jpg",
            },
            {
                id: "12-2",
                name: "Shawarma Plate",
                description: "Chicken shawarma, rice, salad.",
                price: 10.0,
                image: "/images/lasagna.jpg",
            },
        ],
        reviews: [
            {
                author: "Layla H.",
                rating: 5,
                comment: "Falafel was crispy and flavorful.",
                date: "2025-06-03",
                avatar: "https://randomuser.me/api/portraits/women/41.jpg",
            },
            {
                author: "Omar S.",
                rating: 5,
                comment: "Loved the shawarma plate!",
                date: "2025-05-31",
                avatar: "https://randomuser.me/api/portraits/men/33.jpg",
            },
        ],
        deliveryTime: "22-32 min",
        pickupTime: "11 min",
    },
    {
        id: "13",
        name: "Steakhouse Prime",
        description: "Premium steaks and classic sides.",
        image: "/images/steakhouse-prime.jpg",
        cuisine: "Steakhouse",
        rating: 4.6,
        menu: [
            {
                id: "13-1",
                name: "Ribeye Steak",
                description: "Juicy ribeye cooked to perfection.",
                price: 24.99,
                image: "/images/ribeye.jpg",
            },
            {
                id: "13-2",
                name: "Garlic Mashed Potatoes",
                description: "Creamy potatoes with roasted garlic.",
                price: 5.5,
                image: "/images/mashed-potatoes.jpg",
            },
        ],
        reviews: [
            {
                author: "Alex G.",
                rating: 5,
                comment: "Best steak I've had in years.",
                date: "2025-06-05",
                avatar: "https://randomuser.me/api/portraits/men/13.jpg",
            },
            {
                author: "Linda W.",
                rating: 4,
                comment: "Sides were delicious and service was great.",
                date: "2025-06-04",
                avatar: "https://randomuser.me/api/portraits/women/14.jpg",
            },
        ],
        deliveryTime: "50-65 min",
        pickupTime: "25 min",
    },
    {
        id: "14",
        name: "Ramen House",
        description: "Hearty Japanese ramen and small plates.",
        image: "/images/ramen-house.jpg",
        cuisine: "Japanese",
        rating: 4.4,
        menu: [
            {
                id: "14-1",
                name: "Tonkotsu Ramen",
                description: "Rich pork broth, noodles, chashu.",
                price: 13.0,
                image: "/images/tonkotsu.jpg",
            },
            {
                id: "14-2",
                name: "Gyoza",
                description: "Pan-fried pork dumplings.",
                price: 6.0,
                image: "/images/gyoza.jpg",
            },
        ],
        reviews: [
            {
                author: "Kenji S.",
                rating: 5,
                comment: "Broth was so flavorful!",
                date: "2025-06-03",
                avatar: "https://randomuser.me/api/portraits/men/21.jpg",
            },
            {
                author: "Maya T.",
                rating: 4,
                comment: "Loved the gyoza.",
                date: "2025-06-02",
                avatar: "https://randomuser.me/api/portraits/women/31.jpg",
            },
        ],
        deliveryTime: "35-45 min",
        pickupTime: "15 min",
    },
    {
        id: "15",
        name: "Greek Taverna",
        description: "Traditional Greek cuisine and meze.",
        image: "/images/greek-taverna.jpg",
        cuisine: "Greek",
        rating: 4.5,
        menu: [
            {
                id: "15-1",
                name: "Gyro Plate",
                description: "Lamb gyro, pita, tzatziki, salad.",
                price: 12.5,
                image: "/images/gyro.jpg",
            },
            {
                id: "15-2",
                name: "Spanakopita",
                description: "Spinach and feta in flaky pastry.",
                price: 7.0,
                image: "/images/spanakopita.jpg",
            },
        ],
        reviews: [
            {
                author: "Nikos P.",
                rating: 5,
                comment: "Reminds me of home!",
                date: "2025-06-01",
                avatar: "https://randomuser.me/api/portraits/men/61.jpg",
            },
            {
                author: "Elena K.",
                rating: 4,
                comment: "Spanakopita was perfect.",
                date: "2025-05-30",
                avatar: "https://randomuser.me/api/portraits/women/62.jpg",
            },
        ],
        deliveryTime: "30-40 min",
        pickupTime: "12 min",
    },
    {
        id: "16",
        name: "BBQ Pit",
        description: "Slow-smoked barbecue and southern sides.",
        image: "/images/bbq-pit.jpg",
        cuisine: "Barbecue",
        rating: 4.3,
        menu: [
            {
                id: "16-1",
                name: "Pulled Pork Sandwich",
                description: "Smoked pork, BBQ sauce, slaw.",
                price: 9.5,
                image: "/images/pulled-pork.jpg",
            },
            {
                id: "16-2",
                name: "Mac & Cheese",
                description: "Creamy, cheesy, and baked.",
                price: 4.5,
                image: "/images/mac-cheese.jpg",
            },
        ],
        reviews: [
            {
                author: "Rick D.",
                rating: 5,
                comment: "Best BBQ in town.",
                date: "2025-06-04",
                avatar: "https://randomuser.me/api/portraits/men/71.jpg",
            },
            {
                author: "Tina S.",
                rating: 4,
                comment: "Loved the sides!",
                date: "2025-06-03",
                avatar: "https://randomuser.me/api/portraits/women/72.jpg",
            },
        ],
        deliveryTime: "40-55 min",
        pickupTime: "18 min",
    },
    {
        id: "17",
        name: "Tapas Bar",
        description: "Spanish tapas and sangria.",
        image: "/images/tapas-bar.jpg",
        cuisine: "Spanish",
        rating: 4.7,
        menu: [
            {
                id: "17-1",
                name: "Patatas Bravas",
                description: "Crispy potatoes, spicy sauce.",
                price: 6.0,
                image: "/images/patatas-bravas.jpg",
            },
            {
                id: "17-2",
                name: "Chorizo al Vino",
                description: "Chorizo sausage in red wine.",
                price: 8.0,
                image: "/images/chorizo.jpg",
            },
        ],
        reviews: [
            {
                author: "Carlos M.",
                rating: 5,
                comment: "Tapas were authentic and delicious.",
                date: "2025-06-02",
                avatar: "https://randomuser.me/api/portraits/men/81.jpg",
            },
            {
                author: "Lucia F.",
                rating: 4,
                comment: "Loved the sangria!",
                date: "2025-06-01",
                avatar: "https://randomuser.me/api/portraits/women/82.jpg",
            },
        ],
        deliveryTime: "25-35 min",
        pickupTime: "10 min",
    },
    {
        id: "18",
        name: "Bistro Belle",
        description: "French bistro classics and fine wines.",
        image: "/images/bistro-belle.jpg",
        cuisine: "French",
        rating: 4.6,
        menu: [
            {
                id: "18-1",
                name: "Coq au Vin",
                description: "Chicken braised in red wine.",
                price: 18.0,
                image: "/images/coq-au-vin.jpg",
            },
            {
                id: "18-2",
                name: "French Onion Soup",
                description: "Caramelized onions, beef broth, cheese.",
                price: 7.5,
                image: "/images/onion-soup.jpg",
            },
        ],
        reviews: [
            {
                author: "Marie L.",
                rating: 5,
                comment: "Felt like Paris for a night.",
                date: "2025-06-06",
                avatar: "https://randomuser.me/api/portraits/women/85.jpg",
            },
            {
                author: "Jean P.",
                rating: 4,
                comment: "Soup was rich and flavorful.",
                date: "2025-06-05",
                avatar: "https://randomuser.me/api/portraits/men/86.jpg",
            },
        ],
        deliveryTime: "35-50 min",
        pickupTime: "16 min",
    },
    {
        id: "19",
        name: "Kebab Express",
        description: "Turkish kebabs and Mediterranean sides.",
        image: "/images/kebab-express.jpg",
        cuisine: "Turkish",
        rating: 4.4,
        menu: [
            {
                id: "19-1",
                name: "Lamb Kebab",
                description: "Grilled lamb, spices, pita.",
                price: 13.0,
                image: "/images/lamb-kebab.jpg",
            },
            {
                id: "19-2",
                name: "Hummus Plate",
                description: "Creamy hummus, olive oil, pita.",
                price: 6.0,
                image: "/images/hummus.jpg",
            },
        ],
        reviews: [
            {
                author: "Selim D.",
                rating: 5,
                comment: "Kebabs were juicy and authentic.",
                date: "2025-06-07",
                avatar: "https://randomuser.me/api/portraits/men/87.jpg",
            },
            {
                author: "Ayla K.",
                rating: 4,
                comment: "Loved the hummus.",
                date: "2025-06-06",
                avatar: "https://randomuser.me/api/portraits/women/88.jpg",
            },
        ],
        deliveryTime: "30-40 min",
        pickupTime: "13 min",
    },
    {
        id: "20",
        name: "Deli Central",
        description: "Classic deli sandwiches and soups.",
        image: "/images/deli-central.jpg",
        cuisine: "Deli",
        rating: 4.2,
        menu: [
            {
                id: "20-1",
                name: "Pastrami on Rye",
                description: "Hot pastrami, mustard, rye bread.",
                price: 9.5,
                image: "/images/pastrami.jpg",
            },
            {
                id: "20-2",
                name: "Matzo Ball Soup",
                description: "Traditional chicken soup with matzo balls.",
                price: 6.5,
                image: "/images/matzo-soup.jpg",
            },
        ],
        reviews: [
            {
                author: "Ben S.",
                rating: 5,
                comment: "Best deli in the city.",
                date: "2025-06-08",
                avatar: "https://randomuser.me/api/portraits/men/89.jpg",
            },
            {
                author: "Rachel M.",
                rating: 4,
                comment: "Soup was comforting and tasty.",
                date: "2025-06-07",
                avatar: "https://randomuser.me/api/portraits/women/90.jpg",
            },
        ],
        deliveryTime: "20-30 min",
        pickupTime: "8 min",
    },
    {
        id: "21",
        name: "Tandoori Nights",
        description: "North Indian tandoori and curries.",
        image: "/images/tandoori-nights.jpg",
        cuisine: "Indian",
        rating: 4.5,
        menu: [
            {
                id: "21-1",
                name: "Tandoori Chicken",
                description: "Spiced chicken cooked in clay oven.",
                price: 14.0,
                image: "/images/tandoori-chicken.jpg",
            },
            {
                id: "21-2",
                name: "Naan Bread",
                description: "Soft, fluffy Indian bread.",
                price: 3.0,
                image: "/images/naan.jpg",
            },
        ],
        reviews: [
            {
                author: "Ravi K.",
                rating: 5,
                comment: "Tandoori was smoky and delicious.",
                date: "2025-06-09",
                avatar: "https://randomuser.me/api/portraits/men/91.jpg",
            },
            {
                author: "Anjali S.",
                rating: 4,
                comment: "Loved the naan.",
                date: "2025-06-08",
                avatar: "https://randomuser.me/api/portraits/women/92.jpg",
            },
        ],
        deliveryTime: "40-55 min",
        pickupTime: "20 min",
    },
    {
        id: "22",
        name: "Poke Bowl Co.",
        description: "Fresh Hawaiian poke bowls.",
        image: "/images/poke-bowl-co.jpg",
        cuisine: "Hawaiian",
        rating: 4.7,
        menu: [
            {
                id: "22-1",
                name: "Ahi Tuna Bowl",
                description: "Tuna, rice, seaweed, avocado.",
                price: 13.5,
                image: "/images/ahi-tuna.jpg",
            },
            {
                id: "22-2",
                name: "Salmon Poke Bowl",
                description: "Salmon, edamame, cucumber, rice.",
                price: 12.5,
                image: "/images/salmon-poke.jpg",
            },
        ],
        reviews: [
            {
                author: "Kai L.",
                rating: 5,
                comment: "So fresh and tasty!",
                date: "2025-06-10",
                avatar: "https://randomuser.me/api/portraits/men/93.jpg",
            },
            {
                author: "Leilani M.",
                rating: 4,
                comment: "Loved the toppings.",
                date: "2025-06-09",
                avatar: "https://randomuser.me/api/portraits/women/94.jpg",
            },
        ],
        deliveryTime: "25-35 min",
        pickupTime: "10 min",
    },
    {
        id: "23",
        name: "Waffle Works",
        description: "Sweet and savory waffles all day.",
        image: "/images/waffle-works.jpg",
        cuisine: "Breakfast",
        rating: 4.3,
        menu: [
            {
                id: "23-1",
                name: "Belgian Waffle",
                description: "Crispy waffle, whipped cream, berries.",
                price: 7.0,
                image: "/images/belgian-waffle.jpg",
            },
            {
                id: "23-2",
                name: "Chicken & Waffles",
                description: "Fried chicken, maple syrup, waffle.",
                price: 11.0,
                image: "/images/chicken-waffle.jpg",
            },
        ],
        reviews: [
            {
                author: "Jenna T.",
                rating: 5,
                comment: "Best breakfast treat!",
                date: "2025-06-11",
                avatar: "https://randomuser.me/api/portraits/women/95.jpg",
            },
            {
                author: "Chris F.",
                rating: 4,
                comment: "Savory and sweet, perfect combo.",
                date: "2025-06-10",
                avatar: "https://randomuser.me/api/portraits/men/96.jpg",
            },
        ],
        deliveryTime: "18-28 min",
        pickupTime: "7 min",
    },
    {
        id: "24",
        name: "Souvlaki Stop",
        description: "Greek souvlaki and street food.",
        image: "/images/souvlaki-stop.jpg",
        cuisine: "Greek",
        rating: 4.4,
        menu: [
            {
                id: "24-1",
                name: "Chicken Souvlaki",
                description: "Grilled chicken, pita, tzatziki.",
                price: 9.0,
                image: "/images/chicken-souvlaki.jpg",
            },
            {
                id: "24-2",
                name: "Greek Salad",
                description: "Tomato, cucumber, feta, olives.",
                price: 6.5,
                image: "/images/greek-salad.jpg",
            },
        ],
        reviews: [
            {
                author: "Dimitri S.",
                rating: 5,
                comment: "Tastes just like Athens.",
                date: "2025-06-12",
                avatar: "https://randomuser.me/api/portraits/men/97.jpg",
            },
            {
                author: "Maria P.",
                rating: 4,
                comment: "Fresh and flavorful.",
                date: "2025-06-11",
                avatar: "https://randomuser.me/api/portraits/women/98.jpg",
            },
        ],
        deliveryTime: "22-32 min",
        pickupTime: "11 min",
    },
    {
        id: "25",
        name: "Pho 88",
        description: "Vietnamese pho and street eats.",
        image: "/images/pho-88.jpg",
        cuisine: "Vietnamese",
        rating: 4.5,
        menu: [
            {
                id: "25-1",
                name: "Chicken Pho",
                description: "Chicken noodle soup, herbs, lime.",
                price: 11.0,
                image: "/images/chicken-pho.jpg",
            },
            {
                id: "25-2",
                name: "Banh Mi",
                description: "Vietnamese sandwich, pork, pickled veggies.",
                price: 8.0,
                image: "/images/banh-mi.jpg",
            },
        ],
        reviews: [
            {
                author: "Linh N.",
                rating: 5,
                comment: "Pho was so comforting.",
                date: "2025-06-13",
                avatar: "https://randomuser.me/api/portraits/women/99.jpg",
            },
            {
                author: "Huy T.",
                rating: 4,
                comment: "Banh mi was crunchy and tasty.",
                date: "2025-06-12",
                avatar: "https://randomuser.me/api/portraits/men/100.jpg",
            },
        ],
        deliveryTime: "28-38 min",
        pickupTime: "12 min",
    },
];

export const restaurants: Restaurant[] = baseRestaurants.map((rest) => ({
    ...rest,
    menu: rest.menu.map((item) => ({
        ...item,
        sizes: item.sizes && item.sizes.length > 0 ? item.sizes : DEFAULT_SIZES,
    })),
}));
