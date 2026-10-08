export type Category = 'general' | 'sports' | 'cars' | 'anime' | 'music' | 'facts'

export interface Question {
  id: string
  category: Category
  question: string
  options: string[]
  correct: number // index of correct option
  points: number
  speedBonus: number
}

export const CATEGORIES: Record<Category, { label: string; emoji: string; color: string; questionCount: number }> = {
  general:  { label: 'General Knowledge', emoji: '🧠', color: 'bg-stone-800',   questionCount: 20 },
  sports:   { label: 'Sports',            emoji: '⚽', color: 'bg-emerald-800', questionCount: 15 },
  cars:     { label: 'Cars',              emoji: '🚗', color: 'bg-red-800',     questionCount: 15 },
  anime:    { label: 'Anime',             emoji: '⛩️', color: 'bg-purple-800',  questionCount: 20 },
  music:    { label: 'Music',             emoji: '🎵', color: 'bg-blue-800',    questionCount: 15 },
  facts:    { label: 'Wild Facts',        emoji: '⚡', color: 'bg-amber-800',   questionCount: 12 },
}

export const QUESTIONS: Record<Category, Question[]> = {
  general: [
    { id: 'g1',  category: 'general', question: 'What is the capital of Japan?',                                         options: ['Beijing','Seoul','Tokyo','Bangkok'],                                    correct: 2, points: 100, speedBonus: 50 },
    { id: 'g2',  category: 'general', question: 'How many continents are there on Earth?',                               options: ['5','6','7','8'],                                                        correct: 2, points: 100, speedBonus: 50 },
    { id: 'g3',  category: 'general', question: 'What is the chemical symbol for gold?',                                 options: ['Go','Gd','Au','Ag'],                                                    correct: 2, points: 150, speedBonus: 75 },
    { id: 'g4',  category: 'general', question: 'Which planet is closest to the Sun?',                                   options: ['Venus','Mercury','Earth','Mars'],                                       correct: 1, points: 100, speedBonus: 50 },
    { id: 'g5',  category: 'general', question: 'Who painted the Mona Lisa?',                                            options: ['Michelangelo','Raphael','da Vinci','Botticelli'],                       correct: 2, points: 100, speedBonus: 50 },
    { id: 'g6',  category: 'general', question: 'What is the largest ocean on Earth?',                                   options: ['Atlantic','Indian','Arctic','Pacific'],                                 correct: 3, points: 100, speedBonus: 50 },
    { id: 'g7',  category: 'general', question: 'How many sides does a hexagon have?',                                   options: ['5','6','7','8'],                                                        correct: 1, points: 100, speedBonus: 50 },
    { id: 'g8',  category: 'general', question: 'Which country has the largest population?',                             options: ['USA','India','China','Indonesia'],                                      correct: 1, points: 150, speedBonus: 75 },
    { id: 'g9',  category: 'general', question: 'What language has the most native speakers?',                           options: ['English','Spanish','Mandarin','Hindi'],                                 correct: 2, points: 150, speedBonus: 75 },
    { id: 'g10', category: 'general', question: 'What is the speed of light (approx)?',                                  options: ['300,000 km/s','150,000 km/s','500,000 km/s','1,000,000 km/s'],          correct: 0, points: 200, speedBonus: 100 },
    { id: 'g11', category: 'general', question: 'Which element has atomic number 1?',                                    options: ['Helium','Oxygen','Hydrogen','Carbon'],                                  correct: 2, points: 150, speedBonus: 75 },
    { id: 'g12', category: 'general', question: 'What is the longest river in the world?',                               options: ['Amazon','Congo','Nile','Yangtze'],                                      correct: 2, points: 150, speedBonus: 75 },
    { id: 'g13', category: 'general', question: 'In what year did World War II end?',                                    options: ['1943','1944','1945','1946'],                                            correct: 2, points: 150, speedBonus: 75 },
    { id: 'g14', category: 'general', question: 'What is the square root of 144?',                                       options: ['11','12','13','14'],                                                    correct: 1, points: 100, speedBonus: 50 },
    { id: 'g15', category: 'general', question: 'Which country invented paper?',                                         options: ['Egypt','China','Greece','India'],                                       correct: 1, points: 200, speedBonus: 100 },
    { id: 'g16', category: 'general', question: 'What is the hardest natural substance?',                                options: ['Gold','Iron','Diamond','Quartz'],                                       correct: 2, points: 100, speedBonus: 50 },
    { id: 'g17', category: 'general', question: 'How many bones are in the adult human body?',                           options: ['196','206','216','226'],                                                correct: 1, points: 200, speedBonus: 100 },
    { id: 'g18', category: 'general', question: 'What is the tallest mountain on Earth?',                                options: ['K2','Kangchenjunga','Everest','Lhotse'],                                correct: 2, points: 100, speedBonus: 50 },
    { id: 'g19', category: 'general', question: 'Which gas do plants absorb from the atmosphere?',                       options: ['Oxygen','Nitrogen','CO2','Hydrogen'],                                   correct: 2, points: 100, speedBonus: 50 },
    { id: 'g20', category: 'general', question: 'Who wrote Romeo and Juliet?',                                           options: ['Dickens','Chaucer','Shakespeare','Marlowe'],                            correct: 2, points: 100, speedBonus: 50 },
  ],

  sports: [
    { id: 's1',  category: 'sports', question: 'How many players are on a football (soccer) team?',                      options: ['9','10','11','12'],                                                     correct: 2, points: 100, speedBonus: 50 },
    { id: 's2',  category: 'sports', question: 'Which country has won the most FIFA World Cups?',                        options: ['Germany','Argentina','Brazil','Italy'],                                 correct: 2, points: 150, speedBonus: 75 },
    { id: 's3',  category: 'sports', question: 'How many rings are on the Olympic flag?',                                options: ['4','5','6','7'],                                                        correct: 1, points: 100, speedBonus: 50 },
    { id: 's4',  category: 'sports', question: 'In basketball, how many points is a free throw worth?',                  options: ['1','2','3','4'],                                                        correct: 0, points: 100, speedBonus: 50 },
    { id: 's5',  category: 'sports', question: 'Which sport uses a shuttlecock?',                                        options: ['Squash','Tennis','Badminton','Pickleball'],                             correct: 2, points: 100, speedBonus: 50 },
    { id: 's6',  category: 'sports', question: 'How long is a standard marathon in km?',                                 options: ['40km','41km','42.195km','43km'],                                        correct: 2, points: 200, speedBonus: 100 },
    { id: 's7',  category: 'sports', question: 'Which country invented basketball?',                                     options: ['USA','Canada','UK','Australia'],                                        correct: 0, points: 150, speedBonus: 75 },
    { id: 's8',  category: 'sports', question: 'How many Grand Slam tournaments are there in tennis?',                   options: ['2','3','4','5'],                                                        correct: 2, points: 150, speedBonus: 75 },
    { id: 's9',  category: 'sports', question: 'What sport is played at Wimbledon?',                                     options: ['Cricket','Golf','Tennis','Squash'],                                     correct: 2, points: 100, speedBonus: 50 },
    { id: 's10', category: 'sports', question: 'How many players are on a volleyball team (on court)?',                  options: ['5','6','7','8'],                                                        correct: 1, points: 150, speedBonus: 75 },
    { id: 's11', category: 'sports', question: 'In which sport would you perform a slam dunk?',                          options: ['Volleyball','Handball','Basketball','Water polo'],                      correct: 2, points: 100, speedBonus: 50 },
    { id: 's12', category: 'sports', question: 'Which country hosts the Tour de France?',                                options: ['Belgium','Italy','Spain','France'],                                     correct: 3, points: 100, speedBonus: 50 },
    { id: 's13', category: 'sports', question: 'How many holes are played in a standard round of golf?',                 options: ['9','12','18','24'],                                                     correct: 2, points: 100, speedBonus: 50 },
    { id: 's14', category: 'sports', question: 'What colour is the away jersey of Brazil\'s football team?',             options: ['White','Yellow','Blue','Green'],                                        correct: 2, points: 200, speedBonus: 100 },
    { id: 's15', category: 'sports', question: 'In F1, what does DRS stand for?',                                        options: ['Direct Race Speed','Drag Reduction System','Drive Ratio Switch','Dual Rear Spoiler'], correct: 1, points: 200, speedBonus: 100 },
  ],

  cars: [
    { id: 'c1',  category: 'cars', question: 'Which country is Ferrari from?',                                           options: ['Germany','France','UK','Italy'],                                        correct: 3, points: 100, speedBonus: 50 },
    { id: 'c2',  category: 'cars', question: 'What does BMW stand for (in German)?',                                     options: ['Bavarian Motor Works','Berlin Motor Works','Bavarian Machine Works','British Motor Works'], correct: 0, points: 150, speedBonus: 75 },
    { id: 'c3',  category: 'cars', question: 'Which car brand has a prancing horse logo?',                               options: ['Lamborghini','Porsche','Ferrari','Maserati'],                           correct: 2, points: 100, speedBonus: 50 },
    { id: 'c4',  category: 'cars', question: 'What is the fastest production car as of 2023 (top speed)?',               options: ['Bugatti Chiron','Koenigsegg Jesko','SSC Tuatara','Hennessey Venom F5'], correct: 1, points: 250, speedBonus: 125 },
    { id: 'c5',  category: 'cars', question: 'Which company makes the Mustang?',                                         options: ['Chevrolet','Dodge','Ford','Chrysler'],                                  correct: 2, points: 100, speedBonus: 50 },
    { id: 'c6',  category: 'cars', question: 'What does SUV stand for?',                                                 options: ['Sports Utility Vehicle','Standard Urban Vehicle','Super Utility Van','Sports Urban Van'], correct: 0, points: 100, speedBonus: 50 },
    { id: 'c7',  category: 'cars', question: 'Which car brand makes the Aventador?',                                     options: ['Ferrari','Maserati','Lamborghini','Bugatti'],                           correct: 2, points: 150, speedBonus: 75 },
    { id: 'c8',  category: 'cars', question: 'What fuel do most Formula 1 cars use?',                                    options: ['Diesel','Regular petrol','High-octane petrol','Electric'],              correct: 2, points: 150, speedBonus: 75 },
    { id: 'c9',  category: 'cars', question: 'Which country makes Volvo cars?',                                          options: ['Norway','Denmark','Finland','Sweden'],                                  correct: 3, points: 150, speedBonus: 75 },
    { id: 'c10', category: 'cars', question: 'What does the "GT" stand for in car names?',                               options: ['Grand Touring','Great Turbo','Ground Track','General Thrust'],          correct: 0, points: 150, speedBonus: 75 },
    { id: 'c11', category: 'cars', question: 'Which electric car company was founded by Elon Musk?',                     options: ['Rivian','Lucid','NIO','Tesla'],                                         correct: 3, points: 100, speedBonus: 50 },
    { id: 'c12', category: 'cars', question: 'What is the Porsche 911\'s engine position?',                              options: ['Front','Mid','Rear','All-wheel'],                                       correct: 2, points: 200, speedBonus: 100 },
    { id: 'c13', category: 'cars', question: 'Which car brand uses the slogan "The Ultimate Driving Machine"?',          options: ['Mercedes','BMW','Audi','Lexus'],                                        correct: 1, points: 150, speedBonus: 75 },
    { id: 'c14', category: 'cars', question: 'What year was the first Ford Mustang released?',                           options: ['1960','1962','1964','1966'],                                            correct: 2, points: 200, speedBonus: 100 },
    { id: 'c15', category: 'cars', question: 'Which supercar brand uses a bull as its logo?',                            options: ['Ferrari','Alfa Romeo','Lamborghini','Maserati'],                       correct: 2, points: 100, speedBonus: 50 },
  ],

  anime: [
    { id: 'a1',  category: 'anime', question: 'What is the name of the main character in Naruto?',                       options: ['Sasuke','Sakura','Naruto','Kakashi'],                                   correct: 2, points: 100, speedBonus: 50 },
    { id: 'a2',  category: 'anime', question: 'In Dragon Ball Z, what is Goku\'s home planet called?',                   options: ['Namek','Earth','Vegeta','Planet Saiyan'],                               correct: 2, points: 150, speedBonus: 75 },
    { id: 'a3',  category: 'anime', question: 'What studio produced Spirited Away?',                                     options: ['Toei Animation','Sunrise','Studio Ghibli','Madhouse'],                 correct: 2, points: 150, speedBonus: 75 },
    { id: 'a4',  category: 'anime', question: 'In One Piece, what is Luffy\'s dream?',                                   options: ['To be the strongest','To find the One Piece','To become King of Pirates','To sail every sea'], correct: 2, points: 150, speedBonus: 75 },
    { id: 'a5',  category: 'anime', question: 'Which anime features the Survey Corps?',                                  options: ['Demon Slayer','Jujutsu Kaisen','Attack on Titan','Bleach'],             correct: 2, points: 100, speedBonus: 50 },
    { id: 'a6',  category: 'anime', question: 'What is the name of the death god notebook in Death Note?',               options: ['Death Book','Shinigami Note','Death Note','Soul Record'],              correct: 2, points: 100, speedBonus: 50 },
    { id: 'a7',  category: 'anime', question: 'In Demon Slayer, what is Tanjiro\'s sister\'s name?',                     options: ['Aoi','Nezuko','Kanao','Shinobu'],                                       correct: 1, points: 100, speedBonus: 50 },
    { id: 'a8',  category: 'anime', question: 'Which anime is set in a world where people are born with "Quirks"?',      options: ['Black Clover','Fairy Tail','My Hero Academia','Sword Art Online'],     correct: 2, points: 100, speedBonus: 50 },
    { id: 'a9',  category: 'anime', question: 'Who is the author of the One Piece manga?',                               options: ['Masashi Kishimoto','Akira Toriyama','Eiichiro Oda','Tite Kubo'],       correct: 2, points: 200, speedBonus: 100 },
    { id: 'a10', category: 'anime', question: 'In Fullmetal Alchemist, what did Edward sacrifice to get his brother\'s soul back?', options: ['His memory','His right arm','His left leg','His eyesight'],  correct: 1, points: 200, speedBonus: 100 },
    { id: 'a11', category: 'anime', question: 'What is the Hollow in Bleach that Ichigo first fights?',                  options: ['Grand Fisher','Menos','Fishbone D','Shrieker'],                        correct: 2, points: 200, speedBonus: 100 },
    { id: 'a12', category: 'anime', question: 'Which anime features the Phantom Troupe?',                                options: ['Naruto','Yu Yu Hakusho','Hunter x Hunter','Fairy Tail'],               correct: 2, points: 200, speedBonus: 100 },
    { id: 'a13', category: 'anime', question: 'What power does Satoru Gojo use to repel everything?',                    options: ['Infinity','Reverse Cursed Technique','Domain Expansion','Six Eyes'],    correct: 0, points: 150, speedBonus: 75 },
    { id: 'a14', category: 'anime', question: 'In Cowboy Bebop, what is the name of the crew\'s ship?',                  options: ['Red Tail','Swordfish','Bebop','Hammerhead'],                            correct: 2, points: 200, speedBonus: 100 },
    { id: 'a15', category: 'anime', question: 'Which anime is based on a card game?',                                    options: ['Digimon','Beyblade','Yu-Gi-Oh!','Pokémon'],                            correct: 2, points: 100, speedBonus: 50 },
    { id: 'a16', category: 'anime', question: 'In Pokémon, what type is Charizard?',                                     options: ['Fire/Dragon','Fire/Flying','Fire only','Dragon/Flying'],               correct: 1, points: 150, speedBonus: 75 },
    { id: 'a17', category: 'anime', question: 'What is Zoro\'s dream in One Piece?',                                     options: ['To sail every sea','To be the greatest swordsman','To find All Blue','To surpass Luffy'], correct: 1, points: 150, speedBonus: 75 },
    { id: 'a18', category: 'anime', question: 'Which anime features Titans that eat humans?',                            options: ['Tokyo Ghoul','Kabaneri','Attack on Titan','Claymore'],                  correct: 2, points: 100, speedBonus: 50 },
    { id: 'a19', category: 'anime', question: 'In Dragon Ball, what level is Super Saiyan Blue?',                        options: ['Super Saiyan 4','Super Saiyan God Super Saiyan','Super Saiyan 5','Ultra Instinct'], correct: 1, points: 200, speedBonus: 100 },
    { id: 'a20', category: 'anime', question: 'Who trained Naruto to use Sage Mode?',                                    options: ['Jiraiya','Fukasaku','Kakashi','Minato'],                                correct: 1, points: 200, speedBonus: 100 },
  ],

  music: [
    { id: 'm1',  category: 'music', question: 'Which artist released the album "Thriller"?',                             options: ['Prince','Whitney Houston','Michael Jackson','Stevie Wonder'],          correct: 2, points: 100, speedBonus: 50 },
    { id: 'm2',  category: 'music', question: 'How many strings does a standard guitar have?',                           options: ['4','5','6','7'],                                                        correct: 2, points: 100, speedBonus: 50 },
    { id: 'm3',  category: 'music', question: 'Which band performed "Bohemian Rhapsody"?',                               options: ['The Beatles','Led Zeppelin','Queen','The Rolling Stones'],             correct: 2, points: 100, speedBonus: 50 },
    { id: 'm4',  category: 'music', question: 'What does BPM stand for in music?',                                       options: ['Beats Per Minute','Bass Per Mix','Beat Pattern Meter','Base Pulse Mode'], correct: 0, points: 100, speedBonus: 50 },
    { id: 'm5',  category: 'music', question: 'Which country does reggae music originate from?',                         options: ['Cuba','Brazil','Trinidad','Jamaica'],                                   correct: 3, points: 150, speedBonus: 75 },
    { id: 'm6',  category: 'music', question: 'How many notes are in a standard musical scale?',                         options: ['5','6','7','8'],                                                        correct: 2, points: 100, speedBonus: 50 },
    { id: 'm7',  category: 'music', question: 'Which rapper released "God\'s Plan"?',                                    options: ['Kendrick Lamar','J. Cole','Travis Scott','Drake'],                     correct: 3, points: 100, speedBonus: 50 },
    { id: 'm8',  category: 'music', question: 'What instrument does a pianist play?',                                    options: ['Violin','Piano','Cello','Harp'],                                        correct: 1, points: 100, speedBonus: 50 },
    { id: 'm9',  category: 'music', question: 'Which artist is known as the "Queen of Pop"?',                            options: ['Beyoncé','Rihanna','Madonna','Lady Gaga'],                              correct: 2, points: 100, speedBonus: 50 },
    { id: 'm10', category: 'music', question: 'In what decade did hip-hop originate?',                                   options: ['1960s','1970s','1980s','1990s'],                                        correct: 1, points: 150, speedBonus: 75 },
    { id: 'm11', category: 'music', question: 'Which band is Freddie Mercury from?',                                     options: ['The Who','Aerosmith','Queen','Bon Jovi'],                               correct: 2, points: 100, speedBonus: 50 },
    { id: 'm12', category: 'music', question: 'What genre is Kendrick Lamar?',                                           options: ['R&B','Pop','Hip-Hop','Soul'],                                           correct: 2, points: 100, speedBonus: 50 },
    { id: 'm13', category: 'music', question: 'Which streaming platform pays artists the least per stream?',             options: ['Tidal','Apple Music','Spotify','Amazon Music'],                         correct: 2, points: 200, speedBonus: 100 },
    { id: 'm14', category: 'music', question: 'What is the name of Beyoncé\'s alter ego?',                               options: ['Sasha Fierce','Lemonade','Destiny','B\'Day'],                          correct: 0, points: 150, speedBonus: 75 },
    { id: 'm15', category: 'music', question: 'Which Nigerian artist is known as "Afrobeats"?',                          options: ['Wizkid','Burna Boy','Davido','All of the above'],                       correct: 3, points: 150, speedBonus: 75 },
  ],

  facts: [
    { id: 'f1',  category: 'facts', question: 'A group of flamingos is called a…',                                       options: ['Flock','Flamboyance','Flutter','Flame'],                                correct: 1, points: 150, speedBonus: 75 },
    { id: 'f2',  category: 'facts', question: 'How long is a day on Venus (in Earth days)?',                             options: ['117','243','365','500'],                                                correct: 1, points: 250, speedBonus: 125 },
    { id: 'f3',  category: 'facts', question: 'What percentage of the Earth is covered by water?',                       options: ['50%','61%','71%','81%'],                                                correct: 2, points: 150, speedBonus: 75 },
    { id: 'f4',  category: 'facts', question: 'Which animal has the highest blood pressure?',                            options: ['Elephant','Blue Whale','Giraffe','Horse'],                              correct: 2, points: 200, speedBonus: 100 },
    { id: 'f5',  category: 'facts', question: 'How many hearts does an octopus have?',                                   options: ['1','2','3','4'],                                                        correct: 2, points: 200, speedBonus: 100 },
    { id: 'f6',  category: 'facts', question: 'What is the most spoken language in Africa?',                             options: ['Swahili','Arabic','Hausa','Zulu'],                                      correct: 1, points: 200, speedBonus: 100 },
    { id: 'f7',  category: 'facts', question: 'Which fruit has its seeds on the outside?',                               options: ['Raspberry','Kiwi','Strawberry','Blackberry'],                          correct: 2, points: 150, speedBonus: 75 },
    { id: 'f8',  category: 'facts', question: 'How many times does a human heart beat per day (approx)?',                options: ['50,000','75,000','100,000','115,000'],                                  correct: 2, points: 200, speedBonus: 100 },
    { id: 'f9',  category: 'facts', question: 'What is the most common element in the universe?',                        options: ['Oxygen','Carbon','Helium','Hydrogen'],                                  correct: 3, points: 150, speedBonus: 75 },
    { id: 'f10', category: 'facts', question: 'What is the only mammal capable of true flight?',                         options: ['Flying squirrel','Sugar glider','Bat','Flying lemur'],                  correct: 2, points: 150, speedBonus: 75 },
    { id: 'f11', category: 'facts', question: 'How many teeth does an adult human have?',                                options: ['28','30','32','34'],                                                    correct: 2, points: 150, speedBonus: 75 },
    { id: 'f12', category: 'facts', question: 'What colour is the blood of an octopus?',                                 options: ['Red','Green','Blue','Purple'],                                          correct: 2, points: 200, speedBonus: 100 },
  ],
}

export function getQuestionsForCategory(category: Category, count?: number): Question[] {
  const qs = [...QUESTIONS[category]].sort(() => Math.random() - 0.5)
  return count ? qs.slice(0, count) : qs
}
