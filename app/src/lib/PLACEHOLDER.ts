import {
  EventStateFlags,
  ParsedEvent,
  ParsedTicket,
  ParsedUser,
} from '@/types/accounts';

const users: ParsedUser[] = [
  {
    authority: 'RUMAueLSpeHfpUFDoaRfeZZVdYPV28HrN7xkThRBAww',
    publicKey: 'F1TrBwKkc8Xsookgtu47ArFoKQKzjfripZAP87gPQjst',
    image:
      'https://peach-defeated-unicorn-591.mypinata.cloud/ipfs/bafkreicje33ykoisj2i4or2ntrfcuj6wb2uaggltwsrcnln66acbovlqey',
    name: 'Ruma Admin',
  },
];

const events: ParsedEvent[] = [
  // started
  {
    about:
      'Join us for an unforgettable evening of jazz music, delicious food, and great company at the Downtown Jazz Night!',
    badge: '4b2iEFTVyMRFWJ3c2JTwEK3q6bmoPWwXxnHG1zXkw6qZ',
    capacity: 100,
    endTimestamp: Math.floor(Date.now() / 1000) + 60 * 60 * 3,
    image:
      'https://peach-defeated-unicorn-591.mypinata.cloud/ipfs/bafkreicje33ykoisj2i4or2ntrfcuj6wb2uaggltwsrcnln66acbovlqey',
    location: '123 Main St, Anytown, USA',
    name: 'Downtown Jazz Night',
    organizer: 'HijYAsPJrgtokMiiwJzG6isAtAZrG25pXCgFUyr4dSRV',
    publicKey: '3y7mYk1vX4nF6JZV8K5h7L9M2N3P4Q5R6S7T8U9V0W1X',
    registrations: 5,
    startTimestamp: Math.floor(Date.now() / 1000) + 60 * 60,
    stateFlags: new EventStateFlags(0b0000_0011),
  },
  // starts in 2 hours
  {
    about:
      'Experience the magic of live jazz music at our annual Jazz Festival, featuring top artists from around the world.',
    badge: '5c3jFHTVzNSGXK4d3KTwFL4r7cnqQXxYynHG2zYx7rZb',
    capacity: 300,
    endTimestamp: Math.floor(Date.now() / 1000) + 60 * 60 * 5,
    image:
      'https://peach-defeated-unicorn-591.mypinata.cloud/ipfs/bafkreicje33ykoisj2i4or2ntrfcuj6wb2uaggltwsrcnln66acbovlqey',
    location: '456 Elm St, Othertown, USA',
    name: 'Annual Jazz Festival',
    organizer: 'HijYAsPJrgtokMiiwJzG6isAtAZrG25pXCgFUyr4dSRV',
    publicKey: '4z8nZl2wY5oG7LJX9L6m8N3P5Q6R7S8T9U0V1W2X3Y4Z',
    registrations: 10,
    startTimestamp: Math.floor(Date.now() / 1000) + 60 * 60 * 2,
    stateFlags: new EventStateFlags(0b0000_0000),
  },
  // ended 3 hours ago
  {
    about:
      'Join us for an unforgettable evening of jazz music, delicious food, and great company at the Downtown Jazz Night!',
    badge: '4b2iEFTVyMRFWJ3c2JTwEK3q6bmoPWwXxnHG1zXkw6qZ',
    capacity: 100,
    endTimestamp: Math.floor(Date.now() / 1000) - 60 * 60 * 3,
    image:
      'https://peach-defeated-unicorn-591.mypinata.cloud/ipfs/bafkreicje33ykoisj2i4or2ntrfcuj6wb2uaggltwsrcnln66acbovlqey',
    location: '123 Main St, Anytown, USA',
    name: 'Downtown Jazz Night',
    organizer: 'HijYAsPJrgtokMiiwJzG6isAtAZrG25pXCgFUyr4dSRV',
    publicKey: '7y9oZk3xZ6pH8MKY0M7n9O4R7S8T9U0V1W2X3Y4Z5A6B',
    registrations: 50,
    startTimestamp: Math.floor(Date.now() / 1000) - 60 * 60 * 5,
    stateFlags: new EventStateFlags(0b0000_0010),
  },
];

const tickets: ParsedTicket[] = [
  {
    event: '3y7mYk1vX4nF6JZV8K5h7L9M2N3P4Q5R6S7T8U9V0W1X',
    user: 'F1TrBwKkc8Xsookgtu47ArFoKQKzjfripZAP87gPQjst',
    publicKey: '5A6B7C8D9E0F1G2H3I4J5K6L7M8N9O0P1Q2R3S4T5U6V',
    status: 'approved',
  },
  {
    event: '4z8nZl2wY5oG7LJX9L6m8N3P5Q6R7S8T9U0V1W2X3Y4Z',
    user: 'F1TrBwKkc8Xsookgtu47ArFoKQKzjfripZAP87gPQjst',
    publicKey: '6B7C8D9E0F1G2H3I4J5K6L7M8N9O0P1Q2R3S4T5U6V7W',
    status: 'pending',
  },
  {
    event: '7y9oZk3xZ6pH8MKY0M7n9O4R7S8T9U0V1W2X3Y4Z5A6B',
    user: 'F1TrBwKkc8Xsookgtu47ArFoKQKzjfripZAP87gPQjst',
    publicKey: '7C8D9E0F1G2H3I4J5K6L7M8N9O0P1Q2R3S4T5U6V7W8X',
    status: 'checkedIn',
  },
];

export const PLACEHOLDER = {
  users,
  events,
  tickets,
};
