import type {
  Category,
  ChoiceQuestion,
  EmojiQuestion,
  ClosestQuestion,
  OrderQuestion,
} from './schema'

// Hard versions of the non-classic types, all worth 200 points.

function tf(id: string, category: Category, question: string, isTrue: boolean): ChoiceQuestion {
  return { id, type: 'truefalse', category, question, options: ['True', 'False'], correct: isTrue ? 0 : 1, points: 200, speedBonus: 100, difficulty: 'hard' }
}

function em(id: string, category: Category, emoji: string, options: string[], correct: number): EmojiQuestion {
  return { id, type: 'emoji', category, question: 'What do these emojis spell out?', emoji, options, correct, points: 200, speedBonus: 100, difficulty: 'hard' }
}

function cl(id: string, category: Category, question: string, answer: number, min: number, max: number, step = 1, unit?: string): ClosestQuestion {
  return { id, type: 'closest', category, question, answer, min, max, step, unit, points: 200, speedBonus: 75, difficulty: 'hard' }
}

function or(id: string, category: Category, question: string, hint: string, items: string[]): OrderQuestion {
  return { id, type: 'order', category, question, hint, items, points: 200, speedBonus: 100, difficulty: 'hard' }
}

// ─── True or False ─────────────────────────────────────────────────────────

export const HARD_TRUE_FALSE: ChoiceQuestion[] = [
  tf('hT_tf_1', 'science', 'Old windows are thicker at the bottom because glass slowly flows like a liquid.', false),
  tf('hT_tf_2', 'science', 'Diamond and pencil graphite are made of the same element.', true),
  tf('hT_tf_3', 'history', 'Cleopatra lived closer in time to the Moon landing than to the building of the Great Pyramid of Giza.', true),
  tf('hT_tf_4', 'history', 'Oxford University is older than the Aztec Empire.', true),
  tf('hT_tf_5', 'geography', 'Australia is wider from east to west than the Moon is across.', true),
  tf('hT_tf_6', 'geography', 'At their closest point, Russia and the USA are less than 5 km apart.', true),
  tf('hT_tf_7', 'space', 'Mercury is the hottest planet in the Solar System.', false),
  tf('hT_tf_8', 'space', 'Saturn is less dense than water.', true),
  tf('hT_tf_9', 'body', 'The blood in your veins is blue until it touches air.', false),
  tf('hT_tf_10', 'body', 'Adults have more bones than newborn babies.', false),
  tf('hT_tf_11', 'animals', 'Under its white fur, a polar bear has black skin.', true),
  tf('hT_tf_12', 'animals', 'Goldfish can only remember things for about three seconds.', false),
  tf('hT_tf_13', 'football', 'A player cannot be offside directly from a goal kick.', true),
  tf('hT_tf_14', 'football', 'Pelé never played for a European club.', true),
  tf('hT_tf_15', 'kenya', 'Nairobi began as a depot on the Uganda Railway.', true),
  tf('hT_tf_16', 'kenya', 'Mombasa was Kenya\'s capital city when the country became independent.', false),
  tf('hT_tf_18', 'africa', 'Ethiopia\'s calendar runs about seven to eight years behind the one most of the world uses.', true),
  tf('hT_tf_19', 'movies', 'In The Empire Strikes Back, Darth Vader says "Luke, I am your father".', false),
  tf('hT_tf_20', 'movies', 'The Wizard of Oz (1939) was the first film ever made in colour.', false),
  tf('hT_tf_21', 'music', 'Mozart wrote the tune of "Twinkle, Twinkle, Little Star".', false),
  tf('hT_tf_22', 'music', 'The Beatles once had a drummer called Pete Best.', true),
  tf('hT_tf_23', 'tech', 'Email is older than the World Wide Web.', true),
  tf('hT_tf_24', 'tech', 'The first text message ever sent said "Merry Christmas".', true),
  tf('hT_tf_25', 'food', 'Peanuts are nuts that grow on trees.', false),
  tf('hT_tf_26', 'food', 'A cashew nut grows outside its fruit, hanging from the bottom of it.', true),
  tf('hT_tf_27', 'dinosaurs', 'Tyrannosaurus rex lived closer in time to humans than to Stegosaurus.', true),
  tf('hT_tf_28', 'words', 'The word "bookkeeper" has three double letters in a row.', true),
  tf('hT_tf_29', 'olympics', 'Women have run the Olympic marathon since the first modern Games in 1896.', false),
  tf('hT_tf_30', 'mythology', 'In Norse myth, Loki is the mother of the eight-legged horse Sleipnir.', true),
]

// ─── Emoji Decode ──────────────────────────────────────────────────────────

export const HARD_EMOJI: EmojiQuestion[] = [
  em('hT_em_1', 'movies', '🐑🤫', ['Shaun the Sheep', 'The Silence of the Lambs', 'Babe', 'A Quiet Place'], 1),
  em('hT_em_2', 'movies', '🌧️🍝', ['Ratatouille', 'Lady and the Tramp', 'Cloudy with a Chance of Meatballs', 'Hotel Transylvania'], 2),
  em('hT_em_3', 'movies', '🐿️📅🔁', ['Edge of Tomorrow', 'Click', 'Happy Death Day', 'Groundhog Day'], 3),
  em('hT_em_4', 'movies', '🐔🏃‍♂️🚧', ['Chicken Run', 'Flushed Away', 'Rio', 'Hop'], 0),
  em('hT_em_5', 'series', '🧪👨‍🏫💰🏜️', ['Ozark', 'Narcos', 'Breaking Bad', 'Better Call Saul'], 2),
  em('hT_em_6', 'series', '🐉🏠', ['Game of Thrones', 'House of the Dragon', 'The Witcher', 'How to Train Your Dragon'], 1),
  em('hT_em_7', 'series', '🙃🔦🚲👧', ['Stranger Things', 'Dark', 'Wednesday', 'The OA'], 0),
  em('hT_em_8', 'music', '💜🌧️', ['Umbrella', 'November Rain', 'Purple Rain', 'Singin\' in the Rain'], 2),
  em('hT_em_9', 'music', '🏨🌴🐻', ['Heartbreak Hotel', 'Hotel California', 'California Gurls', 'Californication'], 1),
  em('hT_em_10', 'books', '🐋⚓📖', ['The Old Man and the Sea', 'Treasure Island', 'Twenty Thousand Leagues Under the Seas', 'Moby-Dick'], 3),
  em('hT_em_11', 'books', '🐷🕷️🕸️', ['Animal Farm', 'Charlotte\'s Web', 'James and the Giant Peach', 'Fantastic Mr Fox'], 1),
  em('hT_em_12', 'books', '🔫🐦', ['To Kill a Mockingbird', 'One Flew Over the Cuckoo\'s Nest', 'The Kite Runner', 'Birdsong'], 0),
]

// ─── Closest Wins ──────────────────────────────────────────────────────────

export const HARD_CLOSEST: ClosestQuestion[] = [
  cl('hT_cl_1', 'history', 'In what year was the Magna Carta sealed?', 1215, 1000, 1500),
  cl('hT_cl_2', 'science', 'At what temperature do the Celsius and Fahrenheit scales show the same number?', -40, -100, 100, 1, '°'),
  cl('hT_cl_3', 'space', 'How high above Earth is the Kármán line, often used as the edge of space?', 100, 10, 500, 1, 'km'),
  cl('hT_cl_4', 'body', 'How many bones are in one human hand, including the wrist?', 27, 5, 60),
  cl('hT_cl_5', 'geography', 'How long is the equator, in kilometres?', 40075, 10000, 80000, 25, 'km'),
  cl('hT_cl_7', 'africa', 'How tall is Mount Kilimanjaro?', 5895, 3000, 8000, 5, 'm'),
  cl('hT_cl_8', 'football', 'In what year was England\'s Football Association founded?', 1863, 1800, 1950),
  cl('hT_cl_10', 'science', 'At what temperature does pure iron melt?', 1538, 500, 3000, 1, '°C'),
  cl('hT_cl_11', 'music', 'In what year did Bob Marley die?', 1981, 1960, 2000),
  cl('hT_cl_14', 'space', 'About how many Earths would fit side by side across the Sun?', 109, 10, 500),
]

// ─── Put in Order ──────────────────────────────────────────────────────────

export const HARD_ORDER: OrderQuestion[] = [
  or('hT_or_1', 'history', 'Order these events.', 'Oldest first', ['Battle of Hastings', 'Black Death reaches Europe', 'US Declaration of Independence', 'Battle of Waterloo']),
  or('hT_or_2', 'space', 'Order these planets by size.', 'Largest first', ['Jupiter', 'Saturn', 'Uranus', 'Neptune']),
  or('hT_or_3', 'science', 'Order these by wavelength.', 'Longest first', ['Radio waves', 'Microwaves', 'Visible light', 'X-rays']),
  or('hT_or_4', 'geography', 'Order these lakes by area.', 'Largest first', ['Caspian Sea', 'Lake Superior', 'Lake Victoria', 'Lake Tanganyika']),
  or('hT_or_5', 'kenya', 'Order these moments in Kenyan history.', 'Earliest first', ['Uganda Railway reaches Nairobi', 'Mau Mau State of Emergency declared', 'Independence', 'New constitution adopted']),
  or('hT_or_6', 'africa', 'Order these countries by when they gained independence.', 'Earliest first', ['Ghana', 'Nigeria', 'Kenya', 'Namibia']),
  or('hT_or_7', 'animals', 'Order these by top speed.', 'Fastest first', ['Peregrine falcon', 'Cheetah', 'Ostrich', 'Elephant']),
  or('hT_or_8', 'movies', 'Order these Steven Spielberg films by release.', 'Earliest first', ['Jaws', 'E.T.', 'Jurassic Park', 'Saving Private Ryan']),
  or('hT_or_9', 'music', 'Order these Beatles albums by release.', 'Earliest first', ['Please Please Me', 'Revolver', 'Sgt. Pepper\'s Lonely Hearts Club Band', 'Abbey Road']),
  or('hT_or_10', 'tech', 'Order these companies by when they were founded.', 'Oldest first', ['IBM', 'Microsoft', 'Apple', 'Amazon']),
  or('hT_or_11', 'football', 'Order these countries by their first World Cup win.', 'Earliest first', ['Uruguay', 'Italy', 'Germany', 'Brazil']),
  or('hT_or_12', 'dinosaurs', 'Order these geological periods.', 'Oldest first', ['Cambrian', 'Triassic', 'Jurassic', 'Cretaceous']),
]
