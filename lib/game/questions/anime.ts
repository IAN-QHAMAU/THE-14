import type { Category, RawChoiceQuestion } from './schema'

// Points set the level: 100 easy, 150 medium, 200 hard.
function c(id: string, question: string, options: string[], correct: number, points = 100): RawChoiceQuestion {
  const category: Category = 'anime'
  return { id, category, question, options, correct, points, speedBonus: points / 2 }
}

export const ANIME_PACKS: RawChoiceQuestion[] = [
  // ── Death Note ───────────────────────────────────────────────────────────
  c('dnt1', 'In Death Note, who finds the notebook and starts using it?', ['L', 'Light Yagami', 'Near', 'Mello'], 1),
  c('dnt2', 'What food does the Shinigami Ryuk love?', ['Grapes', 'Bananas', 'Apples', 'Oranges'], 2),
  c('dnt3', 'What name does the public give to the mystery killer in Death Note?', ['Kira', 'Zero', 'Shinigami', 'Justice'], 0),
  c('dnt4', 'What kind of being is Ryuk?', ['A demon', 'A ghost', 'An angel', 'A Shinigami'], 3, 150),
  c('dnt5', 'Which pop idol becomes the Second Kira?', ['Kiyomi Takada', 'Misa Amane', 'Naomi Misora', 'Sayu Yagami'], 1, 150),
  c('dnt6', 'If no cause is written, how many seconds after a name is written does the victim die?', ['10', '25', '40', '60'], 2, 150),
  c('dnt7', 'What does L almost always snack on?', ['Potato chips', 'Ramen', 'Rice balls', 'Sweets and cake'], 3, 150),
  c('dnt8', 'Who actually kills Light at the end of the anime?', ['Ryuk', 'Near', 'Matsuda', 'Mikami'], 0, 150),
  c('dnt9', 'Who takes over the Kira case after L dies?', ['Mello', 'Matt', 'Near', 'Watari'], 2, 200),
  c('dnt10', 'What is the name of L\'s old assistant who handles his affairs?', ['Roger', 'Aizawa', 'Mogi', 'Watari'], 3, 200),
  c('dnt11', 'Which Shinigami gives up its life to protect Misa by killing L?', ['Rem', 'Ryuk', 'Sidoh', 'Gelus'], 0, 200),
  c('dnt12', 'What must a human give up to get the Shinigami Eyes?', ['Their memories', 'Half their remaining life', 'Their voice', 'Their soul'], 1, 200),
  c('dnt13', 'Who drew the Death Note manga?', ['Eiichiro Oda', 'Tite Kubo', 'Takeshi Obata', 'Hajime Isayama'], 2, 200),
  c('dnt14', 'Which news anchor becomes Kira\'s spokesperson near the end?', ['Naomi Misora', 'Kiyomi Takada', 'Halle Lidner', 'Misa Amane'], 1, 200),
  c('dnt15', 'In the famous potato chip scene, what is hidden inside the chip bag?', ['A phone', 'A camera', 'A key', 'A tiny TV and a piece of the Death Note'], 3, 200),
  c('dnt16', 'What word does Teru Mikami shout while writing names?', ['Delete', 'Justice', 'Erase', 'Judgment'], 0, 200),

  // ── Avatar: The Last Airbender and The Legend of Korra ───────────────────
  c('av1', 'Aang is the last of which nation?', ['Fire Nation', 'Water Tribe', 'Air Nomads', 'Earth Kingdom'], 2),
  c('av2', 'What is the name of Aang\'s flying bison?', ['Momo', 'Appa', 'Naga', 'Pabu'], 1),
  c('av3', 'What kind of animal is Momo?', ['A flying lemur', 'A bat', 'A fox', 'A monkey'], 0),
  c('av4', 'Who is Zuko\'s tea loving uncle?', ['Ozai', 'Zhao', 'Iroh', 'Roku'], 2),
  c('av5', 'What is the name of Zuko\'s sister?', ['Mai', 'Ty Lee', 'Ursa', 'Azula'], 3, 150),
  c('av6', 'Which kind of bending did Toph invent?', ['Bloodbending', 'Lavabending', 'Metalbending', 'Lightning bending'], 2, 150),
  c('av7', 'What is the name of Korra\'s polar bear dog?', ['Naga', 'Appa', 'Pabu', 'Oogi'], 0, 150),
  c('av8', 'Which tribe is Korra from?', ['Northern Water Tribe', 'Southern Water Tribe', 'Foggy Swamp Tribe', 'Sun Warriors'], 1, 150),
  c('av9', 'Which of Aang and Katara\'s children was born an airbender?', ['Bumi', 'Kya', 'Iroh', 'Tenzin'], 3, 150),
  c('av10', 'What city is the main setting of The Legend of Korra?', ['Ba Sing Se', 'Republic City', 'Omashu', 'Zaofu'], 1, 150),
  c('av11', 'What is the name of the secret police of Ba Sing Se?', ['Kyoshi Warriors', 'Yuyan Archers', 'Dai Li', 'Rough Rhinos'], 2, 150),
  c('av12', 'Which comet gives firebenders huge power?', ['Sozin\'s Comet', 'Ozai\'s Comet', 'Roku\'s Comet', 'Agni\'s Comet'], 0, 200),
  c('av13', 'Who was the Avatar just before Aang?', ['Kyoshi', 'Kuruk', 'Yangchen', 'Roku'], 3, 200),
  c('av14', 'Which Legend of Korra villain could take people\'s bending away?', ['Zaheer', 'Amon', 'Unalaq', 'Kuvira'], 1, 200),
  c('av15', 'What is the name of the light spirit joined with the Avatar?', ['Vaatu', 'Koh', 'Raava', 'Wan Shi Tong'], 2, 200),
  c('av16', 'Who was the very first Avatar?', ['Wan', 'Kyoshi', 'Yangchen', 'Szeto'], 0, 200),
  c('av17', 'Sokka\'s sword was forged from what?', ['Dragon bone', 'A meteorite', 'Platinum', 'Volcanic glass'], 1, 200),
  c('av18', 'What are the names of the two dragons Aang and Zuko meet?', ['Druk and Fang', 'Ran and Druk', 'Shaw and Fang', 'Ran and Shaw'], 3, 200),
  c('av19', 'Which Red Lotus member learns to fly in The Legend of Korra?', ['Zaheer', 'Ghazan', 'P\'Li', 'Ming-Hua'], 0, 200),

  // ── Attack on Titan ──────────────────────────────────────────────────────
  c('aot1', 'Who is the main character of Attack on Titan?', ['Levi Ackerman', 'Eren Yeager', 'Armin Arlert', 'Reiner Braun'], 1),
  c('aot2', 'What is Mikasa\'s family name?', ['Yeager', 'Arlert', 'Ackerman', 'Kirstein'], 2),
  c('aot3', 'What do soldiers use to swing between buildings and trees?', ['Jetpacks', 'Grappling horses', 'Wings', 'ODM gear'], 3),
  c('aot4', 'Which captain is called humanity\'s strongest soldier?', ['Levi', 'Erwin', 'Hange', 'Mike'], 0),
  c('aot5', 'What is the outermost of the three walls?', ['Wall Sina', 'Wall Maria', 'Wall Rose', 'Wall Shiganshina'], 1, 150),
  c('aot6', 'Who is the Armored Titan?', ['Bertholdt Hoover', 'Annie Leonhart', 'Zeke Yeager', 'Reiner Braun'], 3, 150),
  c('aot7', 'Who is the Female Titan?', ['Historia Reiss', 'Annie Leonhart', 'Ymir', 'Pieck'], 1, 150),
  c('aot8', 'Who is the Colossal Titan that first breaks the wall?', ['Bertholdt Hoover', 'Reiner Braun', 'Porco Galliard', 'Zeke Yeager'], 0, 150),
  c('aot9', 'Which Titan power does Armin inherit?', ['Armored', 'Cart', 'Colossal', 'Jaw'], 2, 150),
  c('aot10', 'Who is the Beast Titan?', ['Grisha Yeager', 'Erwin Smith', 'Porco Galliard', 'Zeke Yeager'], 3, 200),
  c('aot11', 'Who created the Attack on Titan manga?', ['Kohei Horikoshi', 'Hajime Isayama', 'Gege Akutami', 'Koyoharu Gotouge'], 1, 200),
  c('aot12', 'What is the event called when the wall Titans march across the world?', ['The Rumbling', 'The Awakening', 'The Purge', 'The Founding'], 0, 200),
  c('aot13', 'On which island are the walls?', ['Marley', 'Hizuru', 'Paradis', 'Liberio'], 2, 200),
  c('aot14', 'Who was the first Titan, the source of all Titan powers?', ['Frieda Reiss', 'Ymir Fritz', 'Historia Reiss', 'Carla Yeager'], 1, 200),
  c('aot15', 'What did Sasha eat in front of the instructor on her first day of training?', ['Bread', 'Meat', 'An apple', 'A potato'], 3, 200),
  c('aot16', 'How many Titan shifter powers are there?', ['Seven', 'Nine', 'Twelve', 'Five'], 1, 200),
  c('aot17', 'Which commander leads the famous suicide charge in Shiganshina?', ['Keith Shadis', 'Dot Pixis', 'Erwin Smith', 'Hange Zoe'], 2, 200),

  // ── Castlevania (Netflix) ────────────────────────────────────────────────
  c('cv1', 'Which famous vampire is the big villain of Castlevania?', ['Nosferatu', 'Dracula', 'Lestat', 'Alucard'], 1),
  c('cv2', 'Trevor comes from which family of monster hunters?', ['Belmont', 'Morris', 'Van Helsing', 'Valentine'], 0),
  c('cv3', 'Alucard is the son of which character?', ['Isaac', 'Hector', 'Trevor', 'Dracula'], 3, 150),
  c('cv4', 'What is Trevor Belmont\'s signature weapon?', ['A sword', 'An axe', 'A whip', 'A bow'], 2, 150),
  c('cv5', 'Sypha Belnades belongs to which group?', ['The Forgemasters', 'The Speakers', 'The Night Creatures', 'The Church'], 1, 150),
  c('cv6', 'Why does Dracula declare war on humans?', ['His castle was stolen', 'His son betrayed him', 'His wife was burned as a witch', 'The sun burned him'], 2, 150),
  c('cv7', 'What kind of magic does Sypha mostly use?', ['Elemental magic', 'Necromancy', 'Holy swords', 'Time travel'], 0, 150),
  c('cv8', 'What is the name of Dracula\'s human wife?', ['Carmilla', 'Lenore', 'Maria', 'Lisa'], 3, 200),
  c('cv9', 'Which two humans become Dracula\'s Forgemasters?', ['Trevor and Alucard', 'Hector and Isaac', 'Godbrand and Carmilla', 'Saint Germain and Varney'], 1, 200),
  c('cv10', 'Which vampire leads the council of sisters in Styria?', ['Lenore', 'Striga', 'Carmilla', 'Morana'], 2, 200),
  c('cv11', 'The show is based on games made by which company?', ['Konami', 'Capcom', 'Sega', 'Square Enix'], 0, 200),
  c('cv12', 'Who wrote the Netflix Castlevania series?', ['Neil Gaiman', 'Alan Moore', 'Frank Miller', 'Warren Ellis'], 3, 200),
  c('cv13', 'What is the spin-off set during the French Revolution called?', ['Castlevania: Symphony', 'Castlevania: Nocturne', 'Castlevania: Requiem', 'Castlevania: Lament'], 1, 200),
  c('cv14', 'In which city is Dracula\'s wife burned at the stake?', ['Gresit', 'Braila', 'Targoviste', 'Lindenfeld'], 2, 200),
  c('cv15', 'In which town does Trevor first meet the Speakers?', ['Gresit', 'Targoviste', 'Braila', 'Styria'], 0, 200),
]
