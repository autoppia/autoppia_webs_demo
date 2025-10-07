export type Testimonial = {
  id: string;
  name: string;
  avatar: string;
  feedback: string;
};

export const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Alex T.',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    feedback: 'Super easy to use and my food always arrives hot!'
  },
  {
    id: '2',
    name: 'Jamie W.',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    feedback: 'So many local restaurants to choose from, love it!'
  },
  {
    id: '3',
    name: 'Priya S.',
    avatar: 'https://randomuser.me/api/portraits/women/24.jpg',
    feedback: 'Checkout was fast, and delivery was on time. Would definitely recommend.'
  }
];
