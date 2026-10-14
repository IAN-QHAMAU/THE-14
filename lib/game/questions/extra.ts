import type { Category, ChoiceQuestion, ClosestQuestion, OrderQuestion, RawChoiceQuestion } from './schema'

function c(
  id: string,
  category: Category,
  question: string,
  options: string[],
  correct: number,
  points = 100,
): RawChoiceQuestion {
  return { id, category, question, options, correct, points, speedBonus: points / 2 }
}

// Tech, Words, Mythology, Human Body, Books, African Music, Money, Fashion.
export const EXTRA_QUESTIONS: RawChoiceQuestion[] = [
  // ── Tech ─────────────────────────────────────────────────────────────────
  c('te1', 'tech', 'What does CPU stand for?', ['Central Processing Unit', 'Computer Power Unit', 'Core Program Utility', 'Central Power Unit'], 0),
  c('te2', 'tech', 'What does RAM stand for?', ['Read And Modify', 'Random Access Memory', 'Rapid Action Memory', 'Run All Memory'], 1),
  c('te3', 'tech', 'What does "www" stand for in a web address?', ['World Wide Web', 'Wide Web Window', 'Web World Wide', 'World Web Works'], 0),
  c('te4', 'tech', 'Who co-founded Microsoft with Paul Allen?', ['Steve Jobs', 'Bill Gates', 'Larry Page', 'Mark Zuckerberg'], 1),
  c('te5', 'tech', 'Who co-founded Apple with Steve Wozniak?', ['Steve Jobs', 'Tim Cook', 'Elon Musk', 'Jeff Bezos'], 0),
  c('te6', 'tech', 'What does HTML stand for?', ['High Tech Modern Language', 'HyperText Markup Language', 'Home Tool Making Language', 'Hyperlink Text Mode Language'], 1, 150),
  c('te7', 'tech', 'Which company owns the Android operating system?', ['Apple', 'Samsung', 'Google', 'Microsoft'], 2),
  c('te8', 'tech', 'In binary, how is the number 2 written?', ['01', '10', '11', '2'], 1, 150),
  c('te9', 'tech', 'What does USB stand for?', ['Universal Serial Bus', 'United System Board', 'Ultra Speed Bus', 'Universal Signal Box'], 0, 150),
  c('te10', 'tech', 'Who invented the World Wide Web?', ['Bill Gates', 'Tim Berners-Lee', 'Alan Turing', 'Steve Jobs'], 1, 200),
  c('te11', 'tech', 'Which planned city is meant to be Kenya\'s tech hub, the "Silicon Savannah"?', ['Tatu City', 'Konza Technopolis', 'Lamu Port City', 'Thika Greens'], 1, 150),
  c('te12', 'tech', 'What does PDF stand for?', ['Printed Document File', 'Portable Document Format', 'Public Data Form', 'Page Design File'], 1, 150),
  c('te13', 'tech', 'Which programming language shares its name with a snake?', ['Java', 'Ruby', 'Python', 'Swift'], 2),
  c('te14', 'tech', 'What does GPS stand for?', ['Global Positioning System', 'General Phone Signal', 'Geo Path Service', 'Ground Position Satellite'], 0),
  c('te15', 'tech', 'In computing, a "bug" is…', ['A virus', 'An error in a program', 'A small chip', 'A fast cable'], 1),
  c('te16', 'tech', 'Which company created ChatGPT?', ['Google', 'Meta', 'OpenAI', 'Apple'], 2),
  c('te17', 'tech', 'How many bits are in a byte?', ['4', '8', '16', '32'], 1),
  c('te18', 'tech', 'What does "AI" stand for?', ['Automatic Input', 'Artificial Intelligence', 'Advanced Internet', 'Applied Information'], 1),

  // ── Words & Language ─────────────────────────────────────────────────────
  c('wd1', 'words', 'A word that reads the same backwards, like "level", is a…', ['Synonym', 'Palindrome', 'Acronym', 'Anagram'], 1),
  c('wd2', 'words', 'A word with the opposite meaning of another is an…', ['Antonym', 'Homonym', 'Idiom', 'Adverb'], 0),
  c('wd3', 'words', 'How many letters are in the English alphabet?', ['24', '25', '26', '28'], 2),
  c('wd4', 'words', 'What does "Jambo" mean in Swahili?', ['Goodbye', 'Hello', 'Thank you', 'Friend'], 1),
  c('wd5', 'words', '"Bonjour" means hello in which language?', ['Spanish', 'Italian', 'French', 'Portuguese'], 2),
  c('wd6', 'words', 'What is the Swahili word for "thank you"?', ['Karibu', 'Asante', 'Pole', 'Sawa'], 1),
  c('wd7', 'words', 'Which language is mainly spoken in Brazil?', ['Spanish', 'Portuguese', 'French', 'English'], 1),
  c('wd8', 'words', 'Words that sound the same but mean different things, like pair and pear, are…', ['Homophones', 'Antonyms', 'Prefixes', 'Similes'], 0, 150),
  c('wd9', 'words', 'What does "Hakuna matata" mean?', ['Let\'s go', 'No worries', 'Good luck', 'Well done'], 1),
  c('wd10', 'words', 'What is the past tense of "run"?', ['Runned', 'Ran', 'Run', 'Running'], 1),
  c('wd11', 'words', 'What does "e.g." mean?', ['That is', 'For example', 'And so on', 'Note well'], 1, 150),
  c('wd12', 'words', 'Which spelling is correct?', ['Definately', 'Definitely', 'Definatly', 'Defenitely'], 1, 150),
  c('wd13', 'words', 'What is the Swahili word for "friend"?', ['Rafiki', 'Ndugu', 'Mzee', 'Mtoto'], 0),
  c('wd14', 'words', 'How many vowels are in the English alphabet, not counting Y?', ['4', '5', '6', '7'], 1),
  c('wd15', 'words', 'A word formed from the first letters of other words, like NASA, is an…', ['Acronym', 'Antonym', 'Alias', 'Adjective'], 0, 150),

  // ── Mythology ────────────────────────────────────────────────────────────
  c('my1', 'mythology', 'Who is the king of the Greek gods?', ['Apollo', 'Hades', 'Zeus', 'Ares'], 2),
  c('my2', 'mythology', 'In Norse mythology, Thor is the god of…', ['The sea', 'Thunder', 'Wisdom', 'The sun'], 1),
  c('my3', 'mythology', 'Which Greek hero had a famously weak heel?', ['Hercules', 'Perseus', 'Achilles', 'Odysseus'], 2),
  c('my4', 'mythology', 'Who has snakes for hair and turns people to stone?', ['Medusa', 'Athena', 'Hydra', 'Circe'], 0),
  c('my5', 'mythology', 'What is the Roman name for Zeus?', ['Mars', 'Neptune', 'Jupiter', 'Mercury'], 2, 150),
  c('my6', 'mythology', 'Which jackal-headed Egyptian god guards the dead?', ['Ra', 'Anubis', 'Horus', 'Osiris'], 1, 150),
  c('my7', 'mythology', 'What is the name of the winged horse in Greek myth?', ['Pegasus', 'Bucephalus', 'Sleipnir', 'Chiron'], 0),
  c('my8', 'mythology', 'Who flew too close to the sun on wings of wax?', ['Daedalus', 'Icarus', 'Hermes', 'Theseus'], 1),
  c('my9', 'mythology', 'What is the home of the Norse gods called?', ['Olympus', 'Asgard', 'Valhalla', 'Midgard'], 1),
  c('my10', 'mythology', 'Which Greek god rules the sea?', ['Poseidon', 'Hades', 'Apollo', 'Hermes'], 0),
  c('my11', 'mythology', 'Who opened a jar that released troubles into the world?', ['Helen', 'Pandora', 'Medusa', 'Persephone'], 1),
  c('my12', 'mythology', 'Which monster was half man, half bull?', ['Centaur', 'Cyclops', 'Minotaur', 'Satyr'], 2, 150),
  c('my13', 'mythology', 'Who is the Greek goddess of wisdom?', ['Aphrodite', 'Hera', 'Athena', 'Artemis'], 2, 150),
  c('my14', 'mythology', 'Which trickster god is Thor\'s adopted brother?', ['Odin', 'Loki', 'Baldur', 'Freyr'], 1),
  c('my15', 'mythology', 'Anansi, the clever spider of folk tales, comes from stories of…', ['West Africa', 'Scandinavia', 'Japan', 'South America'], 0, 150),

  // ── Human Body ───────────────────────────────────────────────────────────
  c('bo1', 'body', 'How many chambers does the human heart have?', ['2', '3', '4', '6'], 2),
  c('bo2', 'body', 'Which organs filter blood to make urine?', ['Lungs', 'Kidneys', 'Liver', 'Stomach'], 1),
  c('bo3', 'body', 'What is the longest bone in the body?', ['Spine', 'Femur', 'Humerus', 'Tibia'], 1, 150),
  c('bo4', 'body', 'Citrus fruits are well known for which vitamin?', ['Vitamin A', 'Vitamin C', 'Vitamin D', 'Vitamin K'], 1),
  c('bo5', 'body', 'Which blood cells fight infection?', ['Red blood cells', 'White blood cells', 'Platelets', 'Plasma'], 1),
  c('bo6', 'body', 'What is normal human body temperature, roughly?', ['33°C', '35°C', '37°C', '40°C'], 2),
  c('bo7', 'body', 'Which part of the eye gives it its colour?', ['Pupil', 'Iris', 'Retina', 'Cornea'], 1, 150),
  c('bo8', 'body', 'The smallest bone in the body is found in the…', ['Finger', 'Toe', 'Ear', 'Nose'], 2, 150),
  c('bo9', 'body', 'Which organ makes insulin?', ['Liver', 'Pancreas', 'Kidney', 'Spleen'], 1, 200),
  c('bo10', 'body', 'Which mineral is most important for strong bones?', ['Iron', 'Calcium', 'Zinc', 'Sodium'], 1),
  c('bo11', 'body', 'How many hours of sleep do most adults need?', ['3 to 4', '5 to 6', '7 to 9', '11 to 12'], 2),
  c('bo12', 'body', 'The tube that carries food from mouth to stomach is the…', ['Trachea', 'Oesophagus', 'Colon', 'Artery'], 1, 150),
  c('bo13', 'body', 'How many baby teeth do children usually have?', ['16', '20', '24', '32'], 1, 200),
  c('bo14', 'body', 'Which organ cleans toxins out of the blood?', ['Heart', 'Lungs', 'Liver', 'Bladder'], 2),
  c('bo15', 'body', 'Which gas do we breathe out as waste?', ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Helium'], 2),

  // ── Books & Literature ───────────────────────────────────────────────────
  c('bk1', 'books', 'Who wrote "Things Fall Apart"?', ['Wole Soyinka', 'Chinua Achebe', 'Ngũgĩ wa Thiong\'o', 'Ben Okri'], 1),
  c('bk2', 'books', 'Who wrote the Harry Potter books?', ['J.K. Rowling', 'Roald Dahl', 'C.S. Lewis', 'Suzanne Collins'], 0),
  c('bk3', 'books', 'Which Kenyan author wrote "Weep Not, Child"?', ['Ngũgĩ wa Thiong\'o', 'Grace Ogot', 'Meja Mwangi', 'Binyavanga Wainaina'], 0, 150),
  c('bk4', 'books', 'Which detective lives at 221B Baker Street?', ['Hercule Poirot', 'Sherlock Holmes', 'Miss Marple', 'Inspector Morse'], 1),
  c('bk5', 'books', 'Who wrote "1984"?', ['Aldous Huxley', 'George Orwell', 'Ray Bradbury', 'H.G. Wells'], 1, 150),
  c('bk6', 'books', 'What is the lion called in The Chronicles of Narnia?', ['Simba', 'Aslan', 'Mufasa', 'Leo'], 1, 150),
  c('bk7', 'books', 'Who wrote "The Lord of the Rings"?', ['C.S. Lewis', 'J.R.R. Tolkien', 'George R.R. Martin', 'Terry Pratchett'], 1),
  c('bk8', 'books', 'In Alice in Wonderland, who hosts the tea party?', ['The Queen of Hearts', 'The Mad Hatter', 'The White Rabbit', 'The Cheshire Cat'], 1),
  c('bk9', 'books', 'Which book series features Katniss Everdeen?', ['Divergent', 'The Hunger Games', 'Twilight', 'Maze Runner'], 1),
  c('bk10', 'books', 'Who wrote "Pride and Prejudice"?', ['Charlotte Brontë', 'Jane Austen', 'Emily Dickinson', 'Mary Shelley'], 1, 150),
  c('bk11', 'books', 'What is the name of Harry Potter\'s owl?', ['Errol', 'Hedwig', 'Pigwidgeon', 'Fawkes'], 1),
  c('bk12', 'books', 'Which author wrote "Matilda" and "Charlie and the Chocolate Factory"?', ['Roald Dahl', 'Dr. Seuss', 'Enid Blyton', 'Beatrix Potter'], 0),
  c('bk13', 'books', 'Who wrote "Half of a Yellow Sun"?', ['Chimamanda Ngozi Adichie', 'Buchi Emecheta', 'Ayọ̀bámi Adébáyọ̀', 'Tsitsi Dangarembga'], 0, 150),
  c('bk14', 'books', 'What kind of creature is Smaug in "The Hobbit"?', ['Troll', 'Giant spider', 'Dragon', 'Goblin'], 2),
  c('bk15', 'books', 'Who wrote "Romeo and Juliet"?', ['Charles Dickens', 'William Shakespeare', 'Mark Twain', 'Oscar Wilde'], 1),

  // ── African Music ────────────────────────────────────────────────────────
  c('am1', 'afromusic', 'Which Nigerian star sang "Essence" featuring Tems?', ['Davido', 'Wizkid', 'Burna Boy', 'Rema'], 1),
  c('am2', 'afromusic', 'Burna Boy is from which country?', ['Ghana', 'Nigeria', 'South Africa', 'Kenya'], 1),
  c('am3', 'afromusic', 'Which South African genre is known for its log drum?', ['Kwaito', 'Amapiano', 'Gqom', 'Mbaqanga'], 1, 150),
  c('am4', 'afromusic', 'Which Tanzanian star founded the label WCB Wasafi?', ['Ali Kiba', 'Harmonize', 'Diamond Platnumz', 'Rayvanny'], 2),
  c('am5', 'afromusic', 'Who made the 2019 global hit "Jerusalema"?', ['Black Coffee', 'Master KG', 'DJ Maphorisa', 'Kabza De Small'], 1, 150),
  c('am6', 'afromusic', 'Fela Kuti pioneered which genre?', ['Highlife', 'Afrobeat', 'Juju', 'Soukous'], 1),
  c('am7', 'afromusic', 'The band Sauti Sol is from which country?', ['Uganda', 'Tanzania', 'Kenya', 'Rwanda'], 2),
  c('am8', 'afromusic', 'Which Nigerian singer released "Calm Down"?', ['Rema', 'Ckay', 'Fireboy DML', 'Omah Lay'], 0),
  c('am9', 'afromusic', 'Ethic and Sailors are linked to which Kenyan genre?', ['Benga', 'Gengetone', 'Taarab', 'Ohangla'], 1, 150),
  c('am10', 'afromusic', 'Which singer was known as "Mama Africa"?', ['Angélique Kidjo', 'Miriam Makeba', 'Yvonne Chaka Chaka', 'Brenda Fassie'], 1, 150),
  c('am11', 'afromusic', 'Koffi Olomide is a music star from which country?', ['Cameroon', 'DR Congo', 'Ivory Coast', 'Senegal'], 1, 150),
  c('am12', 'afromusic', 'Which Ghanaian genre mixes highlife and hip-hop?', ['Hiplife', 'Azonto', 'Afropop', 'Gqom'], 0, 200),
  c('am13', 'afromusic', 'Which Nigerian star is nicknamed "OBO"?', ['Wizkid', 'Davido', 'Olamide', 'Kizz Daniel'], 1, 150),
  c('am14', 'afromusic', 'Musician Bobi Wine is from which country?', ['Kenya', 'Uganda', 'Tanzania', 'Zambia'], 1),
  c('am15', 'afromusic', 'What did Tems win in 2023 for "Wait for U"?', ['A BET Award only', 'A Grammy', 'An Oscar', 'A Brit Award'], 1, 150),

  // ── Money & Business ─────────────────────────────────────────────────────
  c('mo1', 'money', 'What is the currency of the United Kingdom?', ['Euro', 'Dollar', 'Pound sterling', 'Franc'], 2),
  c('mo2', 'money', 'What is the currency of Japan?', ['Yuan', 'Won', 'Yen', 'Ringgit'], 2),
  c('mo3', 'money', 'What does CEO stand for?', ['Chief Executive Officer', 'Central Economic Office', 'Company Earnings Officer', 'Chief Expense Organiser'], 0),
  c('mo4', 'money', 'Which currency do most EU countries use?', ['Pound', 'Euro', 'Mark', 'Krone'], 1),
  c('mo5', 'money', 'Prices rising over time is called…', ['Deflation', 'Inflation', 'Recession', 'Interest'], 1, 150),
  c('mo6', 'money', 'Who founded Amazon?', ['Elon Musk', 'Jeff Bezos', 'Jack Ma', 'Bill Gates'], 1),
  c('mo7', 'money', 'What does ATM stand for?', ['Automated Teller Machine', 'Any Time Money', 'Account Transfer Machine', 'Automatic Transaction Meter'], 0, 150),
  c('mo8', 'money', 'What is the currency of South Africa?', ['Rand', 'Kwacha', 'Cedi', 'Shilling'], 0),
  c('mo9', 'money', 'Money a bank pays you for saving is called…', ['Tax', 'Interest', 'Dividend', 'Fee'], 1),
  c('mo10', 'money', 'Which Nigerian businessman is often named Africa\'s richest person?', ['Mike Adenuga', 'Aliko Dangote', 'Tony Elumelu', 'Femi Otedola'], 1, 150),
  c('mo11', 'money', 'What does NSE stand for in Kenya?', ['National Savings Exchange', 'Nairobi Securities Exchange', 'New Stock Economy', 'Nairobi Shares Exchange'], 1, 150),
  c('mo12', 'money', 'What is the currency of Nigeria?', ['Cedi', 'Naira', 'Rand', 'Dinar'], 1),
  c('mo13', 'money', 'A share of ownership in a company is called a…', ['Bond', 'Stock', 'Loan', 'Invoice'], 1),
  c('mo14', 'money', 'Which digital currency was created by "Satoshi Nakamoto"?', ['Ethereum', 'Bitcoin', 'Dogecoin', 'Litecoin'], 1),
  c('mo15', 'money', 'A plan for how to spend and save money is a…', ['Budget', 'Receipt', 'Mortgage', 'Audit'], 0),

  // ── Fashion ──────────────────────────────────────────────────────────────
  c('fa1', 'fashion', 'Which Italian brand\'s logo is a double G?', ['Gucci', 'Prada', 'Versace', 'Armani'], 0),
  c('fa2', 'fashion', 'What is a kikoi?', ['A beaded necklace', 'A cotton wrap cloth', 'A leather sandal', 'A woven hat'], 1, 150),
  c('fa3', 'fashion', 'Which fashion house did Coco Chanel found?', ['Dior', 'Chanel', 'Givenchy', 'Hermès'], 1),
  c('fa4', 'fashion', 'Which brand is famous for making the first blue jeans?', ['Wrangler', 'Levi\'s', 'Diesel', 'Lee'], 1),
  c('fa5', 'fashion', 'Ankara print fabric is most associated with…', ['West Africa', 'Scandinavia', 'East Asia', 'South America'], 0, 150),
  c('fa6', 'fashion', 'What is the red checked cloth worn by Maasai people called?', ['Kitenge', 'Shúkà', 'Kanga', 'Dashiki'], 1, 150),
  c('fa7', 'fashion', 'Which city is NOT one of the "Big Four" fashion capitals?', ['Paris', 'Milan', 'London', 'Tokyo'], 3, 200),
  c('fa8', 'fashion', 'Which brand makes the Air Jordan sneakers?', ['Adidas', 'Puma', 'Nike', 'Reebok'], 2),
  c('fa9', 'fashion', 'Which designer is known for red-soled heels?', ['Christian Louboutin', 'Jimmy Choo', 'Manolo Blahnik', 'Valentino'], 0, 150),
  c('fa10', 'fashion', 'What is a kanzu?', ['A long white robe', 'A type of skirt', 'A head wrap', 'A sandal'], 0, 150),
  c('fa11', 'fashion', 'Which sportswear brand\'s logo is a leaping cat?', ['Puma', 'Fila', 'Asics', 'Umbro'], 0),
  c('fa12', 'fashion', 'Which fabric is made by silkworms?', ['Cotton', 'Wool', 'Silk', 'Linen'], 2),
  c('fa13', 'fashion', 'A fedora is a type of…', ['Shoe', 'Hat', 'Scarf', 'Jacket'], 1),
  c('fa14', 'fashion', 'Which Swedish fashion brand is known by two letters?', ['H&M', 'C&A', 'M&S', 'G&G'], 0),
  c('fa15', 'fashion', 'Kitenge fabric is especially popular in…', ['East Africa', 'Northern Europe', 'South America', 'Central Asia'], 0),
]

function tf(id: string, category: Category, question: string, isTrue: boolean, points = 100): ChoiceQuestion {
  return { id, type: 'truefalse', category, question, options: ['True', 'False'], correct: isTrue ? 0 : 1, points, speedBonus: points / 2 }
}

export const EXTRA_TRUE_FALSE: ChoiceQuestion[] = [
  tf('tf33', 'tech', 'The first computer mouse was made of wood.', true, 200),
  tf('tf34', 'tech', 'A gigabyte is bigger than a terabyte.', false),
  tf('tf35', 'body', 'Adults have more than 200 bones.', true),
  tf('tf36', 'mythology', 'In Greek myth, Hercules is a son of Zeus.', true),
  tf('tf37', 'money', 'The Kenyan shilling is the official currency of Tanzania.', false),
  tf('tf38', 'words', 'The word "Swahili" comes from an Arabic word meaning "coasts".', true, 200),
  tf('tf39', 'books', 'Wole Soyinka wrote "Things Fall Apart".', false),
  tf('tf40', 'fashion', 'Silk is made by caterpillars.', true, 150),
  tf('tf41', 'afromusic', 'Amapiano started in Nigeria.', false),
  tf('tf42', 'body', 'Your heart is on the right side of your chest.', false),
]

function cl(id: string, category: Category, question: string, answer: number, min: number, max: number, step = 1, unit?: string): ClosestQuestion {
  return { id, type: 'closest', category, question, answer, min, max, step, unit, points: 150, speedBonus: 50 }
}

export const EXTRA_CLOSEST: ClosestQuestion[] = [
  cl('cl23', 'tech', 'In what year did Tim Berners-Lee propose the World Wide Web?', 1989, 1960, 2010),
  cl('cl24', 'money', 'In what year was M-Pesa launched in Kenya?', 2007, 1995, 2020),
  cl('cl25', 'body', 'About how many litres of blood does an adult have?', 5, 1, 15, 1, 'L'),
  cl('cl26', 'tech', 'How many megabytes are in one gigabyte (binary)?', 1024, 100, 5000),
]

function or(id: string, category: Category, question: string, hint: string, items: string[]): OrderQuestion {
  return { id, type: 'order', category, question, hint, items, points: 150, speedBonus: 75 }
}

export const EXTRA_ORDER: OrderQuestion[] = [
  or('or17', 'tech', 'Order these storage sizes.', 'Smallest first', ['Byte', 'Kilobyte', 'Megabyte', 'Gigabyte']),
  or('or18', 'books', 'Order these Harry Potter books.', 'First first', ['Philosopher\'s Stone', 'Chamber of Secrets', 'Prisoner of Azkaban', 'Goblet of Fire']),
  or('or19', 'body', 'Order the path food takes.', 'First first', ['Mouth', 'Oesophagus', 'Stomach', 'Small intestine']),
]
