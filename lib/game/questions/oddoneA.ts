import type { Category } from './schema'

export interface RawOddOne {
  id: string
  category: Category
  options: string[]
  correct: number
  why: string
  points: number
}

// Points set the level: 100 easy, 150 medium, 200 hard.
function od(id: string, category: Category, options: string[], correct: number, why: string, points = 100): RawOddOne {
  return { id, category, options, correct, why, points }
}

export const ODD_ONE_A: RawOddOne[] = [
  // ── General Knowledge ──
  od('oo_general_1', 'general', ['Mercury', 'Venus', 'Moon', 'Mars'], 2, 'The Moon is not a planet.'),
  od('oo_general_2', 'general', ['June', 'Monday', 'Friday', 'Sunday'], 0, 'June is a month, the others are days of the week.'),
  od('oo_general_3', 'general', ['Guitar', 'Violin', 'Harp', 'Drum'], 3, 'The others all have strings.', 150),
  od('oo_general_4', 'general', ['Penguin', 'Eagle', 'Ostrich', 'Emu'], 1, 'The eagle is the only one of these birds that can fly.', 150),
  od('oo_general_5', 'general', ['Carrot', 'Tomato', 'Cucumber', 'Pumpkin'], 0, 'The others are botanically fruits.', 200),
  od('oo_general_6', 'general', ['Whale', 'Shark', 'Dolphin', 'Seal'], 1, 'The shark is a fish, the others are mammals.', 200),

  // ── Science ──
  od('oo_science_1', 'science', ['Iron', 'Gold', 'Copper', 'Oxygen'], 3, 'Oxygen is the only one that is not a metal.'),
  od('oo_science_2', 'science', ['Ice', 'Salt', 'Steam', 'Water'], 1, 'The others are all forms of water.'),
  od('oo_science_3', 'science', ['Neon', 'Helium', 'Nitrogen', 'Argon'], 2, 'The others are noble gases.', 150),
  od('oo_science_4', 'science', ['Sound', 'Light', 'Radio waves', 'X-rays'], 0, 'Sound is the only one that is not an electromagnetic wave.', 150),
  od('oo_science_5', 'science', ['Diamond', 'Graphite', 'Charcoal', 'Quartz'], 3, 'The others are made of carbon.', 200),
  od('oo_science_6', 'science', ['Ant', 'Spider', 'Scorpion', 'Tick'], 0, 'The ant is an insect, the others are arachnids.', 200),

  // ── History ──
  od('oo_history_1', 'history', ['Abraham Lincoln', 'George Washington', 'Barack Obama', 'Winston Churchill'], 3, 'The others were presidents of the USA.'),
  od('oo_history_2', 'history', ['Eiffel Tower', 'Colosseum', 'Pyramids of Giza', 'Stonehenge'], 0, 'The others were built over 1,500 years ago.'),
  od('oo_history_3', 'history', ['Hitler', 'Mussolini', 'Churchill', 'Hirohito'], 2, 'The others led Axis powers in World War II.', 150),
  od('oo_history_4', 'history', ['Nelson Mandela', 'Martin Luther King Jr.', 'Jomo Kenyatta', 'Kwame Nkrumah'], 1, 'The others led African countries.', 150),
  od('oo_history_5', 'history', ['Augustus', 'Nero', 'Alexander the Great', 'Caligula'], 2, 'The others were Roman emperors.', 200),
  od('oo_history_6', 'history', ['Hanging Gardens of Babylon', 'Colossus of Rhodes', 'Lighthouse of Alexandria', 'Great Wall of China'], 3, 'The others are among the Seven Wonders of the Ancient World.', 200),

  // ── Geography ──
  od('oo_geography_1', 'geography', ['Sahara', 'Nile', 'Amazon', 'Congo'], 0, 'The Sahara is a desert, the others are rivers.'),
  od('oo_geography_2', 'geography', ['France', 'Germany', 'Brazil', 'Italy'], 2, 'The others are in Europe.'),
  od('oo_geography_3', 'geography', ['Australia', 'Japan', 'Madagascar', 'Chad'], 3, 'Chad is landlocked, the others are island countries.', 150),
  od('oo_geography_4', 'geography', ['Lake Victoria', 'Lake Superior', 'Lake Tanganyika', 'Lake Malawi'], 1, 'The others are in Africa.', 150),
  od('oo_geography_5', 'geography', ['Kenya', 'Ecuador', 'Egypt', 'Indonesia'], 2, 'The equator passes through the others.', 200),
  od('oo_geography_6', 'geography', ['Portugal', 'Spain', 'Brazil', 'Angola'], 1, 'The others have Portuguese as an official language.', 200),

  // ── Space ──
  od('oo_space_1', 'space', ['Sun', 'Sirius', 'Polaris', 'Moon'], 3, 'The Moon is not a star.'),
  od('oo_space_2', 'space', ['Jupiter', 'Saturn', 'Earth', 'Neptune'], 2, 'Earth is the only rocky planet, the others are giants.'),
  od('oo_space_3', 'space', ['Ceres', 'Titan', 'Europa', 'Phobos'], 0, 'Ceres is a dwarf planet, the others are moons.', 150),
  od('oo_space_4', 'space', ['Hubble', 'Voyager 1', 'James Webb', 'Kepler'], 1, 'The others are space telescopes.', 150),
  od('oo_space_5', 'space', ['Io', 'Europa', 'Titan', 'Ganymede'], 2, 'Titan orbits Saturn, the others orbit Jupiter.', 200),
  od('oo_space_6', 'space', ['Orion', 'Andromeda', 'Milky Way', 'Triangulum'], 0, 'Orion is a constellation, the others are galaxies.', 200),

  // ── Logic ──
  od('oo_logic_1', 'logic', ['2', '4', '7', '8'], 2, '7 is the only odd number.'),
  od('oo_logic_2', 'logic', ['Circle', 'Square', 'Triangle', 'Cube'], 3, 'A cube is 3D, the others are flat shapes.'),
  od('oo_logic_3', 'logic', ['16', '20', '9', '25'], 1, 'The others are square numbers.', 150),
  od('oo_logic_4', 'logic', ['9', '3', '5', '7'], 0, 'The others are prime numbers.', 150),
  od('oo_logic_5', 'logic', ['121', '125', '484', '676'], 1, 'The others are square numbers that read the same backwards.', 200),
  od('oo_logic_6', 'logic', ['8', '27', '64', '100'], 3, 'The others are cube numbers.', 200),

  // ── Fun Facts ──
  od('oo_facts_1', 'facts', ['Cow', 'Goat', 'Chicken', 'Sheep'], 2, 'The chicken is a bird, the others are mammals.'),
  od('oo_facts_2', 'facts', ['Potato', 'Mango', 'Banana', 'Pineapple'], 0, 'The others are fruits.'),
  od('oo_facts_3', 'facts', ['Spider', 'Octopus', 'Scorpion', 'Ant'], 3, 'The others have eight limbs.', 150),
  od('oo_facts_4', 'facts', ['Snake', 'Frog', 'Lizard', 'Crocodile'], 1, 'The frog is an amphibian, the others are reptiles.', 150),
  od('oo_facts_5', 'facts', ['Koala', 'Kangaroo', 'Panda', 'Wombat'], 2, 'The others are marsupials that carry babies in a pouch.', 200),
  od('oo_facts_6', 'facts', ['Strawberry', 'Banana', 'Grape', 'Blueberry'], 0, 'The others are botanically berries.', 200),

  // ── Tech ──
  od('oo_tech_1', 'tech', ['Mouse', 'Keyboard', 'Printer', 'Microphone'], 2, 'The others are input devices.'),
  od('oo_tech_2', 'tech', ['Chrome', 'Firefox', 'Safari', 'Word'], 3, 'The others are web browsers.'),
  od('oo_tech_3', 'tech', ['HTML', 'Python', 'Java', 'C++'], 0, 'HTML is a markup language, the others are programming languages.', 150),
  od('oo_tech_4', 'tech', ['Windows', 'Intel', 'Android', 'Linux'], 1, 'The others are operating systems.', 150),
  od('oo_tech_5', 'tech', ['Byte', 'Kilobyte', 'Megahertz', 'Gigabyte'], 2, 'Megahertz measures frequency, the others measure data.', 200),
  od('oo_tech_6', 'tech', ['HTTP', 'FTP', 'SMTP', 'HTML'], 3, 'The others are network protocols.', 200),

  // ── Words ──
  od('oo_words_1', 'words', ['Sad', 'Happy', 'Glad', 'Joyful'], 0, 'The others all mean the same thing.'),
  od('oo_words_2', 'words', ['Run', 'Jump', 'Apple', 'Swim'], 2, 'The others are action words.'),
  od('oo_words_3', 'words', ['Listen', 'Silent', 'Enlist', 'Lesson'], 3, 'The others use exactly the same letters.', 150),
  od('oo_words_4', 'words', ['Mice', 'Dogs', 'Geese', 'Children'], 1, 'The others are irregular plurals.', 150),
  od('oo_words_5', 'words', ['Level', 'Radar', 'Robot', 'Civic'], 2, 'The others read the same backwards.', 200),
  od('oo_words_6', 'words', ['Kite', 'Knee', 'Knot', 'Knife'], 0, 'The others start with a silent K.', 200),

  // ── Mythology ──
  od('oo_mythology_1', 'mythology', ['Zeus', 'Poseidon', 'Hades', 'Thor'], 3, 'Thor is a Norse god, the others are Greek.'),
  od('oo_mythology_2', 'mythology', ['Dragon', 'Horse', 'Unicorn', 'Phoenix'], 1, 'The others are mythical creatures.'),
  od('oo_mythology_3', 'mythology', ['Odin', 'Loki', 'Ra', 'Freya'], 2, 'Ra is an Egyptian god, the others are Norse.', 150),
  od('oo_mythology_4', 'mythology', ['Apollo', 'Anubis', 'Osiris', 'Isis'], 0, 'Apollo is a Greek god, the others are Egyptian.', 150),
  od('oo_mythology_5', 'mythology', ['Jupiter', 'Mars', 'Venus', 'Athena'], 3, 'Athena is a Greek name, the others are Roman gods.', 200),
  od('oo_mythology_6', 'mythology', ['Medusa', 'Valkyrie', 'Cyclops', 'Minotaur'], 1, 'The Valkyrie is from Norse myth, the others are Greek.', 200),

  // ── Human Body ──
  od('oo_body_1', 'body', ['Heart', 'Elbow', 'Lungs', 'Liver'], 1, 'The elbow is a joint, the others are organs.'),
  od('oo_body_2', 'body', ['Eyes', 'Ears', 'Nose', 'Knees'], 3, 'The others are sense organs on the head.'),
  od('oo_body_3', 'body', ['Biceps', 'Femur', 'Skull', 'Tibia'], 0, 'The biceps is a muscle, the others are bones.', 150),
  od('oo_body_4', 'body', ['O', 'A', 'C', 'B'], 2, 'There is no blood group C.', 150),
  od('oo_body_5', 'body', ['Hammer', 'Cochlea', 'Anvil', 'Stirrup'], 1, 'The others are tiny bones in the ear.', 200),
  od('oo_body_6', 'body', ['Insulin', 'Adrenaline', 'Melatonin', 'Haemoglobin'], 3, 'The others are hormones.', 200),

  // ── Records ──
  od('oo_records_1', 'records', ['Mount Everest', 'Pacific Ocean', 'Blue whale', 'Lake Naivasha'], 3, 'The others are the biggest or tallest of their kind on Earth.'),
  od('oo_records_2', 'records', ['Goat', 'Cheetah', 'Giraffe', 'Blue whale'], 0, 'The others hold animal records: fastest, tallest and largest.'),
  od('oo_records_3', 'records', ['Russia', 'Canada', 'Vatican City', 'China'], 2, 'The others are among the largest countries in the world.', 150),
  od('oo_records_4', 'records', ['Ostrich', 'Pigeon', 'Hummingbird', 'Peregrine falcon'], 1, 'The others hold bird records: largest, smallest and fastest.', 150),
  od('oo_records_5', 'records', ['Lake Nakuru', 'Mariana Trench', 'Lake Baikal', 'Angel Falls'], 0, 'The others are world record holders for depth or height.', 200),
  od('oo_records_6', 'records', ['Greenland', 'Sahara', 'Amazon rainforest', 'Madagascar'], 3, 'The others are the largest island, hot desert and rainforest.', 200),

  // ── Inventions ──
  od('oo_inventions_1', 'inventions', ['Car', 'Television', 'Bicycle', 'Aeroplane'], 1, 'The others are means of transport.'),
  od('oo_inventions_2', 'inventions', ['Radio', 'Television', 'Telephone', 'Wheel'], 3, 'The others need electricity to work.'),
  od('oo_inventions_3', 'inventions', ['Galileo', 'Wright brothers', 'Karl Benz', 'George Stephenson'], 0, 'The others are famous for transport inventions.', 150),
  od('oo_inventions_4', 'inventions', ['Paper', 'Gunpowder', 'Telephone', 'Compass'], 2, 'The others were invented in ancient China.', 150),
  od('oo_inventions_5', 'inventions', ['Internet', 'Telephone', 'Smartphone', 'Television'], 1, 'The telephone is the only one invented before 1900.', 200),
  od('oo_inventions_6', 'inventions', ['Penicillin', 'X-rays', 'Microwave oven', 'Light bulb'], 3, 'The others were discovered by accident.', 200),

  // ── Dinosaurs ──
  od('oo_dinosaurs_1', 'dinosaurs', ['T. rex', 'Triceratops', 'Woolly mammoth', 'Velociraptor'], 2, 'The woolly mammoth is a mammal, not a dinosaur.'),
  od('oo_dinosaurs_2', 'dinosaurs', ['Brachiosaurus', 'Triceratops', 'Stegosaurus', 'T. rex'], 3, 'The others were plant eaters.'),
  od('oo_dinosaurs_3', 'dinosaurs', ['Pterodactyl', 'Stegosaurus', 'Diplodocus', 'Iguanodon'], 0, 'The pterodactyl was a flying reptile, not a dinosaur.', 150),
  od('oo_dinosaurs_4', 'dinosaurs', ['Spinosaurus', 'Diplodocus', 'Allosaurus', 'Velociraptor'], 1, 'The others were meat eaters.', 150),
  od('oo_dinosaurs_5', 'dinosaurs', ['Mosasaurus', 'Plesiosaurus', 'Spinosaurus', 'Ichthyosaurus'], 2, 'Spinosaurus is the only true dinosaur, the others were marine reptiles.', 200),
  od('oo_dinosaurs_6', 'dinosaurs', ['Triassic', 'Jurassic', 'Cretaceous', 'Cambrian'], 3, 'The others are the periods when dinosaurs lived.', 200),

  // ── Kenya ──
  od('oo_kenya_1', 'kenya', ['Kampala', 'Nairobi', 'Mombasa', 'Kisumu'], 0, 'Kampala is in Uganda, the others are Kenyan cities.'),
  od('oo_kenya_2', 'kenya', ['Black', 'Red', 'Green', 'Yellow'], 3, 'The others are colours on the Kenyan flag.'),
  od('oo_kenya_3', 'kenya', ['Mombasa', 'Malindi', 'Nakuru', 'Lamu'], 2, 'Nakuru is the only one not on the coast.', 150),
  od('oo_kenya_4', 'kenya', ['Jomo Kenyatta', 'Tom Mboya', 'Daniel arap Moi', 'Mwai Kibaki'], 1, 'The others were presidents of Kenya.', 150),
  od('oo_kenya_5', 'kenya', ['Tsavo', 'Amboseli', 'Meru', 'Serengeti'], 3, 'The Serengeti is in Tanzania, the others are Kenyan national parks.', 200),
  od('oo_kenya_6', 'kenya', ['Lake Victoria', 'Lake Nakuru', 'Lake Naivasha', 'Lake Bogoria'], 0, 'The others are in the Rift Valley.', 200),

  // ── Africa ──
  od('oo_africa_1', 'africa', ['Lion', 'Elephant', 'Kangaroo', 'Giraffe'], 2, 'The kangaroo does not live wild in Africa.'),
  od('oo_africa_2', 'africa', ['Egypt', 'Nigeria', 'Ghana', 'India'], 3, 'The others are African countries.'),
  od('oo_africa_3', 'africa', ['Tanzania', 'Uganda', 'Rwanda', 'Ethiopia'], 0, 'Tanzania has a coast, the others are landlocked.', 150),
  od('oo_africa_4', 'africa', ['Abuja', 'Lagos', 'Accra', 'Addis Ababa'], 1, 'The others are capital cities.', 150),
  od('oo_africa_5', 'africa', ['Kenya', 'Uganda', 'Tanzania', 'Rwanda'], 3, 'Rwanda uses the franc, the others use the shilling.', 200),
  od('oo_africa_6', 'africa', ['Senegal', 'Ghana', 'Ivory Coast', 'Cameroon'], 1, 'The others have French as an official language.', 200),
]
