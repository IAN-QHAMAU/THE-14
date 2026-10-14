import type {
  Category,
  ChoiceQuestion,
  EmojiQuestion,
  PictureQuestion,
  ClosestQuestion,
  OrderQuestion,
  MostLikelyQuestion,
  BluffQuestion,
} from './schema'

// ─── True or False ─────────────────────────────────────────────────────────

function tf(id: string, category: Category, question: string, isTrue: boolean, points = 100): ChoiceQuestion {
  return { id, type: 'truefalse', category, question, options: ['True', 'False'], correct: isTrue ? 0 : 1, points, speedBonus: points / 2 }
}

export const TRUE_FALSE: ChoiceQuestion[] = [
  tf('tf1', 'general', 'The Great Wall of China is visible from the Moon with the naked eye.', false, 150),
  tf('tf2', 'animals', 'A group of crows is called a murder.', true),
  tf('tf3', 'science', 'Lightning never strikes the same place twice.', false),
  tf('tf4', 'space', 'A day on Venus is longer than its year.', true, 200),
  tf('tf5', 'facts', 'Honey can stay edible for thousands of years.', true),
  tf('tf6', 'animals', 'Ostriches bury their heads in the sand when scared.', false),
  tf('tf7', 'geography', 'Africa has more countries than any other continent.', true),
  tf('tf8', 'history', 'Napoleon was unusually short for his time.', false, 150),
  tf('tf9', 'football', 'A World Cup group stage match can end in a draw.', true),
  tf('tf10', 'kenya', 'The equator passes through Kenya.', true),
  tf('tf11', 'space', 'The Sun is a star.', true),
  tf('tf12', 'animals', 'Sharks are mammals.', false),
  tf('tf13', 'music', 'Beethoven was deaf for much of his later life.', true),
  tf('tf14', 'movies', 'The Lion King is set in Africa.', true),
  tf('tf15', 'gaming', 'Pac-Man was first released in Japan.', true, 150),
  tf('tf16', 'basketball', 'An NBA team has six players on the court.', false),
  tf('tf17', 'food', 'Botanically, a tomato is a fruit.', true),
  tf('tf18', 'science', 'Sound travels faster in water than in air.', true, 150),
  tf('tf19', 'africa', 'Lake Victoria is shared by Kenya, Uganda and Tanzania.', true),
  tf('tf20', 'olympics', 'The Olympic marathon is exactly 42 km.', false, 150),
  tf('tf21', 'brands', 'The Nike swoosh logo was designed for 35 US dollars.', true, 200),
  tf('tf22', 'history', 'The Titanic sank in 1912.', true),
  tf('tf23', 'animals', 'Penguins live at the North Pole.', false),
  tf('tf24', 'heroes', 'Batman has superpowers.', false),
  tf('tf25', 'anime', 'Pikachu is an Electric-type Pokémon.', true),
  tf('tf26', 'internet', 'The first YouTube video was uploaded in 2005.', true, 150),
  tf('tf27', 'geography', 'Mount Everest sits on the border of Nepal and China.', true),
  tf('tf28', 'logic', 'Zero is an even number.', true, 150),
  tf('tf29', 'motorsport', 'The Monaco Grand Prix is raced on public streets.', true),
  tf('tf30', 'racket', 'Wimbledon is played on grass.', true),
  tf('tf31', 'cartoons', 'SpongeBob works at the Krusty Krab.', true),
  tf('tf32', 'cars', 'Lamborghini started out making tractors.', true, 200),
]

// ─── Emoji Decode ──────────────────────────────────────────────────────────

function em(id: string, category: Category, emoji: string, options: string[], correct: number, points = 100): EmojiQuestion {
  return { id, type: 'emoji', category, question: 'What do these emojis spell out?', emoji, options, correct, points, speedBonus: points / 2 }
}

export const EMOJI: EmojiQuestion[] = [
  em('em1', 'movies', '🦁👑', ['The Jungle Book', 'The Lion King', 'Madagascar', 'Zootopia'], 1),
  em('em2', 'movies', '🚢🧊💔', ['Titanic', 'Frozen', 'Jaws', 'Life of Pi'], 0),
  em('em3', 'heroes', '🕷️🧑', ['Ant-Man', 'Spider-Man', 'Venom', 'Batman'], 1),
  em('em4', 'movies', '🧙‍♂️⚡👓', ['Lord of the Rings', 'Doctor Strange', 'Harry Potter', 'Merlin'], 2),
  em('em5', 'movies', '🦖🏝️', ['Jurassic Park', 'King Kong', 'Moana', 'Godzilla'], 0),
  em('em6', 'cartoons', '🧽🍍🌊', ['Finding Nemo', 'SpongeBob SquarePants', 'The Little Mermaid', 'Shark Tale'], 1),
  em('em7', 'movies', '❄️👸⛄', ['Frozen', 'Tangled', 'Cinderella', 'Snow White'], 0),
  em('em8', 'movies', '👻🚫', ['Casper', 'Ghostbusters', 'Coco', 'Beetlejuice'], 1, 150),
  em('em9', 'movies', '🐟🔍', ['Shark Tale', 'Finding Nemo', 'Luca', 'Jaws'], 1),
  em('em10', 'movies', '🏴‍☠️🌊💀', ['Pirates of the Caribbean', 'Moana', 'Hook', 'Waterworld'], 0),
  em('em11', 'anime', '🍥🦊🥷', ['Bleach', 'Naruto', 'Demon Slayer', 'Boruto'], 1, 150),
  em('em12', 'anime', '👒🏴‍☠️🍖', ['One Piece', 'Black Clover', 'Fairy Tail', 'Dragon Ball'], 0),
  em('em13', 'movies', '🧸🤠🚀', ['Cars', 'Toy Story', 'Up', 'Wall-E'], 1),
  em('em14', 'heroes', '🛡️⭐🇺🇸', ['Captain America', 'Iron Man', 'Superman', 'Captain Marvel'], 0),
  em('em15', 'movies', '🐼🥋', ['Kung Fu Panda', 'Karate Kid', 'Bolt', 'Madagascar'], 0),
  em('em16', 'brands', '🍔🍟🤡', ['Burger King', 'KFC', 'McDonald\'s', 'Wendy\'s'], 2),
  em('em17', 'movies', '🐀👨‍🍳', ['Stuart Little', 'Ratatouille', 'Chef', 'Flushed Away'], 1),
  em('em18', 'movies', '🦑🎮💰', ['Squid Game', 'Alice in Borderland', 'Money Heist', 'The Hunger Games'], 0),
  em('em19', 'gaming', '🍄👨‍🔧', ['Zelda', 'Super Mario', 'Sonic', 'Minecraft'], 1),
  em('em20', 'movies', '👽📞🏠', ['Men in Black', 'E.T.', 'Lilo & Stitch', 'Arrival'], 1),
  em('em21', 'cartoons', '🐭🏰✨', ['Disney', 'Pixar', 'DreamWorks', 'Nickelodeon'], 0, 150),
  em('em22', 'football', '🐐⚽🇦🇷', ['Diego Maradona', 'Lionel Messi', 'Ángel Di María', 'Sergio Agüero'], 1),
]

// ─── Picture Round (flags from flagcdn.com) ────────────────────────────────

function flag(id: string, category: Category, code: string, options: string[], correct: number, points = 100): PictureQuestion {
  return {
    id,
    type: 'picture',
    category,
    question: 'Which country\'s flag is this?',
    image: `https://flagcdn.com/w640/${code}.png`,
    options,
    correct,
    points,
    speedBonus: points / 2,
  }
}

export const PICTURE: PictureQuestion[] = [
  flag('pc1', 'geography', 'jp', ['China', 'Japan', 'South Korea', 'Bangladesh'], 1),
  flag('pc2', 'geography', 'br', ['Portugal', 'Colombia', 'Brazil', 'Jamaica'], 2),
  flag('pc3', 'geography', 'ca', ['Canada', 'Peru', 'Switzerland', 'Austria'], 0),
  flag('pc4', 'africa', 'ng', ['Ireland', 'Nigeria', 'Zambia', 'Senegal'], 1),
  flag('pc5', 'africa', 'za', ['Zimbabwe', 'Namibia', 'South Africa', 'Botswana'], 2),
  flag('pc6', 'africa', 'gh', ['Ghana', 'Cameroon', 'Mali', 'Guinea'], 0, 150),
  flag('pc7', 'kenya', 'ke', ['Uganda', 'Malawi', 'South Sudan', 'Kenya'], 3),
  flag('pc8', 'geography', 'de', ['Belgium', 'Germany', 'Spain', 'Netherlands'], 1),
  flag('pc9', 'geography', 'it', ['Ireland', 'Mexico', 'Italy', 'Hungary'], 2, 150),
  flag('pc10', 'geography', 'in', ['India', 'Niger', 'Ireland', 'Sri Lanka'], 0),
  flag('pc11', 'africa', 'tz', ['Tanzania', 'Zambia', 'Gabon', 'Seychelles'], 0, 150),
  flag('pc12', 'africa', 'ug', ['Rwanda', 'Burundi', 'Uganda', 'Ethiopia'], 2),
  flag('pc13', 'africa', 'et', ['Ghana', 'Ethiopia', 'Bolivia', 'Mali'], 1, 150),
  flag('pc14', 'geography', 'kr', ['Japan', 'South Korea', 'Taiwan', 'Mongolia'], 1),
  flag('pc15', 'geography', 'mx', ['Italy', 'Mexico', 'Ireland', 'India'], 1),
  flag('pc16', 'geography', 'se', ['Norway', 'Finland', 'Sweden', 'Denmark'], 2, 150),
  flag('pc17', 'geography', 'ar', ['Uruguay', 'Argentina', 'Greece', 'Honduras'], 1),
  flag('pc18', 'africa', 'eg', ['Egypt', 'Syria', 'Iraq', 'Yemen'], 0, 150),
  flag('pc19', 'africa', 'rw', ['Rwanda', 'Gabon', 'Burundi', 'Ghana'], 0, 150),
  flag('pc20', 'geography', 'gb', ['Australia', 'New Zealand', 'United Kingdom', 'Iceland'], 2),
  flag('pc21', 'geography', 'jm', ['Jamaica', 'Tanzania', 'Brazil', 'Grenada'], 0),
  flag('pc22', 'africa', 'ma', ['Vietnam', 'Morocco', 'Tunisia', 'Turkey'], 1),
]

// ─── Closest Wins ──────────────────────────────────────────────────────────

function cl(
  id: string,
  category: Category,
  question: string,
  answer: number,
  min: number,
  max: number,
  step = 1,
  unit?: string,
  points = 150,
): ClosestQuestion {
  return { id, type: 'closest', category, question, answer, min, max, step, unit, points, speedBonus: 50 }
}

export const CLOSEST: ClosestQuestion[] = [
  cl('cl1', 'general', 'How tall is the Burj Khalifa?', 828, 300, 1500, 1, 'm'),
  cl('cl2', 'brands', 'In what year did the first iPhone come out?', 2007, 1990, 2020),
  cl('cl3', 'space', 'On average, how far is the Moon from Earth, in thousands of km?', 384, 100, 1000, 1, 'k km'),
  cl('cl4', 'kenya', 'How tall is Mount Kenya?', 5199, 3000, 8000, 1, 'm'),
  cl('cl5', 'animals', 'How long can a blue whale grow?', 30, 5, 60, 1, 'm'),
  cl('cl6', 'football', 'How many teams played at the 2026 World Cup?', 48, 16, 64),
  cl('cl7', 'africa', 'How many countries are there in Africa?', 54, 20, 80),
  cl('cl8', 'science', 'At what temperature does water freeze in Fahrenheit?', 32, -50, 100, 1, '°F'),
  cl('cl9', 'geography', 'How many countries are members of the United Nations?', 193, 100, 300),
  cl('cl10', 'space', 'How many Earth days does Mars take to orbit the Sun?', 687, 200, 1000, 1, 'days'),
  cl('cl11', 'history', 'In what year did humans first land on the Moon?', 1969, 1940, 2000),
  cl('cl12', 'olympics', 'How long is an Olympic swimming pool?', 50, 10, 100, 1, 'm'),
  cl('cl13', 'animals', 'What is a cheetah\'s top speed?', 110, 30, 200, 1, 'km/h'),
  cl('cl14', 'food', 'About how many calories are in a 330ml can of Coca-Cola?', 140, 0, 400, 5, 'kcal'),
  cl('cl15', 'gaming', 'In what year was the first PlayStation released in Japan?', 1994, 1980, 2010),
  cl('cl16', 'olympics', 'In what year were the first modern Olympics held?', 1896, 1850, 1950),
  cl('cl17', 'logic', 'How many seconds are in one day?', 86400, 10000, 200000, 100, 's'),
  cl('cl18', 'brands', 'In what year was Google founded?', 1998, 1980, 2015),
  cl('cl19', 'africa', 'Roughly how long is the Nile?', 6650, 2000, 10000, 10, 'km'),
  cl('cl20', 'basketball', 'How many points did Wilt Chamberlain score in his record NBA game?', 100, 40, 150),
  cl('cl21', 'music', 'How many keys does a standard piano have?', 88, 40, 120),
  cl('cl22', 'science', 'How many bones are in the adult human body?', 206, 100, 400),
]

// ─── Put in Order ──────────────────────────────────────────────────────────

function or(id: string, category: Category, question: string, hint: string, items: string[], points = 150): OrderQuestion {
  return { id, type: 'order', category, question, hint, items, points, speedBonus: 75 }
}

export const ORDER: OrderQuestion[] = [
  or('or1', 'space', 'Order these planets by distance from the Sun.', 'Closest first', ['Mercury', 'Venus', 'Earth', 'Mars']),
  or('or2', 'history', 'Order these inventions by when they appeared.', 'Oldest first', ['Printing press', 'Telephone', 'Television', 'Internet']),
  or('or3', 'animals', 'Order these animals by size.', 'Smallest first', ['Mouse', 'Cat', 'Horse', 'Elephant']),
  or('or4', 'geography', 'Order these countries by population.', 'Largest first', ['India', 'USA', 'Nigeria', 'Kenya']),
  or('or5', 'movies', 'Order these Star Wars films by release.', 'Earliest first', ['A New Hope', 'The Empire Strikes Back', 'The Phantom Menace', 'The Force Awakens']),
  or('or6', 'logic', 'Order these numbers.', 'Smallest first', ['1/2', '0.7', '3/4', '0.8']),
  or('or7', 'kenya', 'Order Kenya\'s presidents.', 'Earliest first', ['Jomo Kenyatta', 'Daniel arap Moi', 'Mwai Kibaki', 'Uhuru Kenyatta']),
  or('or8', 'gaming', 'Order these consoles by release.', 'Earliest first', ['NES', 'PlayStation', 'Xbox 360', 'Nintendo Switch']),
  or('or9', 'geography', 'Order these mountains by height.', 'Tallest first', ['Everest', 'Kilimanjaro', 'Mount Kenya', 'Mount Elgon']),
  or('or10', 'science', 'Order these by size.', 'Smallest first', ['Atom', 'Cell', 'Ant', 'Human']),
  or('or11', 'history', 'Order these events.', 'Earliest first', ['Pyramids of Giza built', 'Fall of Rome', 'Columbus reaches the Americas', 'First Moon landing']),
  or('or12', 'football', 'Order these World Cup hosts.', 'Earliest first', ['USA', 'France', 'South Africa', 'Qatar']),
  or('or13', 'internet', 'Order these apps by launch.', 'Earliest first', ['Facebook', 'YouTube', 'Instagram', 'TikTok']),
  or('or14', 'music', 'Order these music formats by invention.', 'Earliest first', ['Vinyl record', 'Cassette tape', 'CD', 'MP3']),
  or('or15', 'africa', 'Order these countries by area.', 'Largest first', ['Algeria', 'Nigeria', 'Kenya', 'Rwanda']),
  or('or16', 'heroes', 'Order these Marvel films by release.', 'Earliest first', ['Iron Man', 'The Avengers', 'Black Panther', 'Avengers: Endgame']),
]

// ─── Most Likely To ────────────────────────────────────────────────────────

function ml(id: string, question: string): MostLikelyQuestion {
  return { id, type: 'mostlikely', category: 'party', question, points: 100, speedBonus: 0 }
}

export const MOST_LIKELY: MostLikelyQuestion[] = [
  ml('ml1', 'Who is most likely to become famous?'),
  ml('ml2', 'Who is most likely to survive a zombie apocalypse?'),
  ml('ml3', 'Who is most likely to forget their own birthday?'),
  ml('ml4', 'Who is most likely to become a millionaire?'),
  ml('ml5', 'Who is most likely to talk their way out of trouble?'),
  ml('ml6', 'Who is most likely to win a dance-off?'),
  ml('ml7', 'Who is most likely to cry at a movie?'),
  ml('ml8', 'Who is most likely to get lost with Google Maps open?'),
  ml('ml9', 'Who is most likely to eat the last slice without asking?'),
  ml('ml10', 'Who is most likely to start their own business?'),
  ml('ml11', 'Who is most likely to reply to a text three days later?'),
  ml('ml12', 'Who is most likely to laugh at their own joke?'),
  ml('ml13', 'Who is most likely to win a cooking show?'),
  ml('ml14', 'Who is most likely to sleep through their alarm?'),
  ml('ml15', 'Who is most likely to adopt ten pets?'),
  ml('ml16', 'Who is most likely to go viral online?'),
  ml('ml17', 'Who is most likely to be late to their own wedding?'),
  ml('ml18', 'Who is most likely to win this game?'),
  ml('ml19', 'Who is most likely to give the best advice?'),
  ml('ml20', 'Who is most likely to plan the perfect trip?'),
]

// ─── Bluff ─────────────────────────────────────────────────────────────────

function bl(id: string, question: string, answer: string, decoys: string[]): BluffQuestion {
  return { id, type: 'bluff', category: 'party', question, answer, decoys, points: 150, speedBonus: 0 }
}

export const BLUFF: BluffQuestion[] = [
  bl('bl1', 'A group of owls is called a ___.', 'parliament', ['council', 'hoot', 'senate']),
  bl('bl2', 'The dot over a lowercase "i" is called a ___.', 'tittle', ['jot', 'pip', 'speck']),
  bl('bl3', 'The plastic tip on the end of a shoelace is called an ___.', 'aglet', ['eyelet', 'nib', 'endcap']),
  bl('bl4', 'Botanically, bananas are classified as ___.', 'berries', ['herbs', 'grasses', 'nuts']),
  bl('bl5', 'The national animal of Scotland is the ___.', 'unicorn', ['stag', 'golden eagle', 'red deer']),
  bl('bl6', 'A baby hedgehog is called a ___.', 'hoglet', ['spikelet', 'pricklet', 'nibbler']),
  bl('bl7', 'Google was originally called ___.', 'BackRub', ['SearchMe', 'LinkLink', 'Googol']),
  bl('bl8', 'Before it was Pepsi, the drink was called ___.', 'Brad\'s Drink', ['Pep Tonic', 'Cola Royale', 'Carolina Fizz']),
  bl('bl9', 'In Switzerland it is illegal to own just one ___.', 'guinea pig', ['goldfish', 'cat', 'rabbit']),
  bl('bl10', 'A group of pugs is called a ___.', 'grumble', ['snort', 'pile', 'wrinkle']),
  bl('bl11', 'The man who designed the Pringles can was buried in ___.', 'a Pringles can', ['a cereal box', 'a pizza box', 'a guitar case']),
  bl('bl12', 'Sea otters hold ___ while they sleep.', 'hands', ['seaweed', 'their breath', 'rocks']),
  bl('bl13', 'The first item ever sold on eBay was a broken ___.', 'laser pointer', ['calculator', 'toaster', 'Game Boy']),
  bl('bl14', 'Wombat poop is shaped like ___.', 'cubes', ['stars', 'spirals', 'pyramids']),
  bl('bl15', 'The # symbol is also called an ___.', 'octothorpe', ['hashmark', 'crossbar', 'quadrigram']),
  bl('bl16', 'A group of flamingos is called a ___.', 'flamboyance', ['fiesta', 'blush', 'parade']),
]
