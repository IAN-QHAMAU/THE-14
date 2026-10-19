import type { Category, ChoiceQuestion, EmojiQuestion, RawChoiceQuestion } from './schema'


// Points set the level: 100 easy, 150 medium, 200 hard.
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

export const FUN_QUESTIONS: RawChoiceQuestion[] = [
  // ── Disney & Pixar ───────────────────────────────────────────────────────
  c('fn_disney_1', 'disney', 'What is the name of the cowboy toy in Toy Story?', ['Buzz', 'Woody', 'Jessie', 'Rex'], 1),
  c('fn_disney_2', 'disney', 'What is the name of the young lion in The Lion King?', ['Simba', 'Mufasa', 'Scar', 'Nala'], 0),
  c('fn_disney_3', 'disney', 'What is the name of the friendly snowman in Frozen?', ['Sven', 'Kristoff', 'Olaf', 'Hans'], 2),
  c('fn_disney_4', 'disney', 'Which forgetful blue fish helps Marlin in Finding Nemo?', ['Gill', 'Bruce', 'Squirt', 'Dory'], 3),
  c('fn_disney_5', 'disney', 'In Monsters, Inc., what is the big blue furry monster called?', ['Mike', 'Sulley', 'Randall', 'Boo'], 1),
  c('fn_disney_6', 'disney', 'What is the name of The Little Mermaid?', ['Ariel', 'Belle', 'Jasmine', 'Aurora'], 0),
  c('fn_disney_7', 'disney', 'In Aladdin, who lives inside the magic lamp?', ['Iago', 'Abu', 'The Genie', 'Jafar'], 2),
  c('fn_disney_8', 'disney', 'What is the name of the red race car in Cars?', ['Mater', 'Doc Hudson', 'Sally', 'Lightning McQueen'], 3),
  c('fn_disney_9', 'disney', 'Which demigod joins Moana on her ocean journey?', ['Tamatoa', 'Maui', 'Te Ka', 'Heihei'], 1, 150),
  c('fn_disney_10', 'disney', 'In Up, what lifts Carl\'s house into the sky?', ['Balloons', 'Rockets', 'A blimp', 'Birds'], 0, 150),
  c('fn_disney_11', 'disney', 'What is the name of the rat who loves to cook in Ratatouille?', ['Emile', 'Linguini', 'Remy', 'Gusteau'], 2, 150),
  c('fn_disney_12', 'disney', 'The Pixar film Coco is built around which holiday?', ['Christmas', 'Carnival', 'Halloween', 'Day of the Dead'], 3, 150),
  c('fn_disney_13', 'disney', 'In Beauty and the Beast, which character is a teapot?', ['Mrs. Potts', 'Lumiere', 'Cogsworth', 'Babette'], 0, 150),
  c('fn_disney_14', 'disney', 'In The Lion King, what kind of animal is Pumbaa?', ['Meerkat', 'Warthog', 'Hyena', 'Baboon'], 1, 150),
  c('fn_disney_15', 'disney', 'Which of these is NOT one of the five main emotions in the first Inside Out film?', ['Joy', 'Sadness', 'Anxiety', 'Fear'], 2, 150),
  c('fn_disney_16', 'disney', 'Which Disney princess has very long magical hair?', ['Merida', 'Elsa', 'Mulan', 'Rapunzel'], 3, 150),
  c('fn_disney_17', 'disney', 'What was Disney\'s first full-length animated feature film?', ['Pinocchio', 'Snow White and the Seven Dwarfs', 'Fantasia', 'Bambi'], 1, 200),
  c('fn_disney_18', 'disney', 'What was the first fully computer-animated feature film?', ['Toy Story', 'A Bug\'s Life', 'Shrek', 'Antz'], 0, 200),
  c('fn_disney_19', 'disney', 'What is the name of the sleek white robot WALL-E falls for?', ['AUTO', 'M-O', 'EVE', 'HAL'], 2, 200),
  c('fn_disney_20', 'disney', 'What is the name of Mulan\'s little dragon friend?', ['Shan Yu', 'Cri-Kee', 'Khan', 'Mushu'], 3, 200),
  c('fn_disney_21', 'disney', 'In Toy Story 2, which toy store owner steals Woody?', ['Sid', 'Al', 'Stinky Pete', 'Lotso'], 1, 200),
  c('fn_disney_22', 'disney', 'In The Incredibles, who designs the superhero costumes?', ['Edna Mode', 'Evelyn Deavor', 'Mirage', 'Helen Parr'], 0, 200),
  c('fn_disney_23', 'disney', 'What is the name of the hopping desk lamp in the Pixar logo?', ['Pixie', 'Lumi', 'Luxo Jr.', 'Lampy'], 2, 200),
  c('fn_disney_24', 'disney', 'What is the name of the kingdom in Frozen?', ['Corona', 'Agrabah', 'Atlantica', 'Arendelle'], 3, 200),

  // ── Throwback ────────────────────────────────────────────────────────────
  c('fn_throwback_1', 'throwback', 'Which classic Nokia game had you steer a growing line around the screen?', ['Tetris', 'Snake', 'Pac-Man', 'Pong'], 1),
  c('fn_throwback_2', 'throwback', 'In Club Penguin, what kind of animal were the players?', ['Penguins', 'Polar bears', 'Seals', 'Puffins'], 0),
  c('fn_throwback_3', 'throwback', 'Which Apple device from 2001 promised 1,000 songs in your pocket?', ['iPhone', 'Walkman', 'iPod', 'Zune'], 2),
  c('fn_throwback_4', 'throwback', 'What was BlackBerry\'s famous messaging app called?', ['MSN', 'iMessage', 'Yahoo Chat', 'BBM'], 3),
  c('fn_throwback_5', 'throwback', 'Who sang the 2010 hit Baby featuring Ludacris?', ['Usher', 'Justin Bieber', 'Chris Brown', 'Jason Derulo'], 1),
  c('fn_throwback_6', 'throwback', 'A Tamagotchi was a tiny digital what?', ['Pet', 'Camera', 'Calculator', 'Radio'], 0),
  c('fn_throwback_7', 'throwback', 'The Kenyan show Tahidi High was mainly set in a what?', ['Hospital', 'Police station', 'High school', 'Market'], 2),
  c('fn_throwback_8', 'throwback', 'Papa Shirandula was a popular Kenyan TV show of which kind?', ['Cooking show', 'News', 'Quiz show', 'Comedy'], 3),
  c('fn_throwback_9', 'throwback', 'Who was automatically everyone\'s first friend on MySpace?', ['Mark', 'Tom', 'Steve', 'Jack'], 1, 150),
  c('fn_throwback_10', 'throwback', 'Nokia is a company from which country?', ['Finland', 'Sweden', 'Japan', 'Germany'], 0, 150),
  c('fn_throwback_11', 'throwback', 'On MSN Messenger, what feature shook your friend\'s chat window?', ['Poke', 'Buzz', 'Nudge', 'Wink'], 2, 150),
  c('fn_throwback_12', 'throwback', 'Which rapper featured on Rihanna\'s 2007 hit Umbrella?', ['Kanye West', 'Drake', 'Eminem', 'Jay-Z'], 3, 150),
  c('fn_throwback_13', 'throwback', 'Baha and Govi were child characters in which Kenyan show?', ['Tahidi High', 'Machachari', 'Papa Shirandula', 'Inspekta Mwala'], 1, 150),
  c('fn_throwback_14', 'throwback', 'Which band sang Mr. Brightside?', ['The Killers', 'Coldplay', 'Green Day', 'Linkin Park'], 0, 150),
  c('fn_throwback_15', 'throwback', 'In what year was the first iPhone released?', ['2005', '2006', '2007', '2009'], 2, 150),
  c('fn_throwback_16', 'throwback', 'Which company made the famous Razr flip phone?', ['Nokia', 'Samsung', 'Sony Ericsson', 'Motorola'], 3, 150),
  c('fn_throwback_17', 'throwback', 'The first ever YouTube video, Me at the zoo, shows which animals?', ['Lions', 'Elephants', 'Giraffes', 'Monkeys'], 1, 200),
  c('fn_throwback_18', 'throwback', 'Which Nokia model is one of the best-selling phones ever, with over 200 million sold?', ['Nokia 1100', 'Nokia 3310', 'Nokia 6600', 'Nokia N95'], 0, 200),
  c('fn_throwback_19', 'throwback', 'MSN Messenger was later renamed to what?', ['Skype', 'MSN Chat', 'Windows Live Messenger', 'Live Talk'], 2, 200),
  c('fn_throwback_20', 'throwback', 'In what year did the original Club Penguin shut down?', ['2012', '2014', '2015', '2017'], 3, 200),
  c('fn_throwback_21', 'throwback', 'Avril Lavigne\'s hit Complicated came from which 2002 album?', ['Under My Skin', 'Let Go', 'The Best Damn Thing', 'Goodbye Lullaby'], 1, 200),
  c('fn_throwback_22', 'throwback', 'The character OJ was a fan favourite in which Kenyan show?', ['Tahidi High', 'Machachari', 'Papa Shirandula', 'Inspekta Mwala'], 0, 200),
  c('fn_throwback_23', 'throwback', 'Which Nokia game had a small spaceship shooting aliens?', ['Snake II', 'Bounce', 'Space Impact', 'Bantumi'], 2, 200),
  c('fn_throwback_24', 'throwback', 'The 2000s teen drama The O.C. was set in which US state?', ['New York', 'Florida', 'Texas', 'California'], 3, 200),

  // ── Mysteries & Detectives ───────────────────────────────────────────────
  c('fn_mystery_1', 'mystery', 'On which London street does Sherlock Holmes live?', ['Oxford Street', 'Baker Street', 'Abbey Road', 'Downing Street'], 1),
  c('fn_mystery_3', 'mystery', 'Who is Sherlock Holmes\'s loyal friend and partner?', ['Moriarty', 'Lestrade', 'Dr. Watson', 'Mycroft'], 2),
  c('fn_mystery_4', 'mystery', 'What is the name of the Scooby gang\'s van?', ['Ghost Mobile', 'Clue Cruiser', 'Scooby Van', 'Mystery Machine'], 3),
  c('fn_mystery_5', 'mystery', 'The Bermuda Triangle is in which ocean?', ['Pacific', 'Atlantic', 'Indian', 'Arctic'], 1),
  c('fn_mystery_6', 'mystery', 'Agatha Christie is most famous for writing what?', ['Detective novels', 'Cookbooks', 'Poetry', 'Science textbooks'], 0),
  c('fn_mystery_7', 'mystery', 'In the board game Cluedo, players try to solve a what?', ['Treasure hunt', 'Bank robbery', 'Murder', 'Kidnapping'], 2),
  c('fn_mystery_8', 'mystery', 'Which tool is most linked with fictional detectives like Sherlock Holmes?', ['Hammer', 'Telescope', 'Compass', 'Magnifying glass'], 3),
  c('fn_mystery_9', 'mystery', 'What nationality is Agatha Christie\'s detective Hercule Poirot?', ['French', 'Belgian', 'Swiss', 'Dutch'], 1, 150),
  c('fn_mystery_10', 'mystery', 'Who is Sherlock Holmes\'s greatest enemy?', ['Professor Moriarty', 'Irene Adler', 'Mycroft Holmes', 'Inspector Lestrade'], 0, 150),
  c('fn_mystery_11', 'mystery', 'Which elderly village detective did Agatha Christie create?', ['Mrs. Hudson', 'Jessica Fletcher', 'Miss Marple', 'Nancy Drew'], 2, 150),
  c('fn_mystery_12', 'mystery', 'Who wrote the Sherlock Holmes stories?', ['Charles Dickens', 'Agatha Christie', 'Edgar Allan Poe', 'Arthur Conan Doyle'], 3, 150),
  c('fn_mystery_13', 'mystery', 'What treat will Scooby-Doo do almost anything for?', ['Bone Bites', 'Scooby Snacks', 'Doggy Donuts', 'Pup Pies'], 1, 150),
  c('fn_mystery_14', 'mystery', 'The Mary Celeste, found mysteriously empty, was a what?', ['Ship', 'Plane', 'Train', 'Lighthouse'], 0, 150),
  c('fn_mystery_15', 'mystery', 'Murder on the Orient Express takes place on a what?', ['Ship', 'Plane', 'Train', 'Bus'], 2, 150),
  c('fn_mystery_16', 'mystery', 'Which of these is a classic Cluedo suspect?', ['Captain Blue', 'Doctor Grey', 'Lady Pink', 'Colonel Mustard'], 3, 150),
  c('fn_mystery_17', 'mystery', 'What was the very first Sherlock Holmes story?', ['The Sign of Four', 'A Study in Scarlet', 'The Hound of the Baskervilles', 'A Scandal in Bohemia'], 1, 200),
  c('fn_mystery_18', 'mystery', 'Hercule Poirot credits his success to his little grey what?', ['Cells', 'Notebooks', 'Cats', 'Suits'], 0, 200),
  c('fn_mystery_19', 'mystery', 'Who is Edgar Allan Poe\'s famous detective?', ['Philip Marlowe', 'Sam Spade', 'C. Auguste Dupin', 'Father Brown'], 2, 200),
  c('fn_mystery_20', 'mystery', 'Which TV detective in a crumpled raincoat often said "Just one more thing"?', ['Kojak', 'Magnum', 'Monk', 'Columbo'], 3, 200),
  c('fn_mystery_21', 'mystery', 'Which is Agatha Christie\'s best-selling novel?', ['Murder on the Orient Express', 'And Then There Were None', 'Death on the Nile', 'The ABC Murders'], 1, 200),
  c('fn_mystery_22', 'mystery', 'In which year was the Mary Celeste found drifting with no crew?', ['1872', '1912', '1801', '1945'], 0, 200),
  c('fn_mystery_23', 'mystery', 'Which word does Velma shout in Scooby-Doo?', ['Zoinks', 'Ruh-roh', 'Jinkies', 'Jeepers'], 2, 200),
  c('fn_mystery_24', 'mystery', 'Which instrument does Sherlock Holmes play?', ['Piano', 'Flute', 'Cello', 'Violin'], 3, 200),

  // ── Wrestling ────────────────────────────────────────────────────────────
  c('fn_wrestling_1', 'wrestling', 'Finish The Rock\'s catchphrase: "Can you smell what The Rock is..."', ['eating', 'cooking', 'baking', 'making'], 1),
  c('fn_wrestling_2', 'wrestling', 'Which wrestler is famous for the line "You can\'t see me"?', ['John Cena', 'Batista', 'Randy Orton', 'Edge'], 0),
  c('fn_wrestling_3', 'wrestling', 'What is The Undertaker\'s famous nickname?', ['The Viper', 'The Animal', 'The Deadman', 'The Showoff'], 2),
  c('fn_wrestling_4', 'wrestling', 'What is WWE\'s biggest yearly event called?', ['SummerSlam', 'Royal Rumble', 'Survivor Series', 'WrestleMania'], 3),
  c('fn_wrestling_5', 'wrestling', 'Which drink did Stone Cold Steve Austin love to celebrate with?', ['Milk', 'Beer', 'Soda', 'Juice'], 1),
  c('fn_wrestling_6', 'wrestling', 'What was Stone Cold Steve Austin\'s finishing move?', ['Stone Cold Stunner', 'RKO', 'Attitude Adjustment', 'Tombstone'], 0),
  c('fn_wrestling_7', 'wrestling', 'Which finishing move belongs to Randy Orton?', ['Spear', 'F5', 'RKO', 'Pedigree'], 2),
  c('fn_wrestling_8', 'wrestling', 'What were Hulk Hogan\'s fans called?', ['Hulksters', 'Hogan Heroes', 'Hulk Squad', 'Hulkamaniacs'], 3),
  c('fn_wrestling_9', 'wrestling', 'Which of these was The Undertaker\'s famous finisher?', ['Sharpshooter', 'Tombstone Piledriver', 'People\'s Elbow', 'Stunner'], 1, 150),
  c('fn_wrestling_10', 'wrestling', 'What is Triple H\'s finishing move?', ['Pedigree', 'Spear', '619', 'Claymore'], 0, 150),
  c('fn_wrestling_11', 'wrestling', 'Rey Mysterio\'s famous finisher is named after which number?', ['450', '720', '619', '316'], 2, 150),
  c('fn_wrestling_12', 'wrestling', 'Which slogan became Stone Cold Steve Austin\'s trademark?', ['Austin 1:1', 'Austin 4:20', 'Austin 7:7', 'Austin 3:16'], 3, 150),
  c('fn_wrestling_13', 'wrestling', 'Goldberg was famous for which pair of moves?', ['Stunner and Rock Bottom', 'Spear and Jackhammer', 'RKO and Punt', 'F5 and Suplex'], 1, 150),
  c('fn_wrestling_14', 'wrestling', 'What is Brock Lesnar\'s signature finishing move?', ['F5', 'GTS', 'Sweet Chin Music', 'Batista Bomb'], 0, 150),
  c('fn_wrestling_15', 'wrestling', 'What was Shawn Michaels\'s superkick finisher called?', ['Pedigree', 'Stunner', 'Sweet Chin Music', 'Five Knuckle Shuffle'], 2, 150),
  c('fn_wrestling_16', 'wrestling', 'What was the name of Mankind\'s sock puppet?', ['Sockman', 'Mr. Sock', 'Captain Sock', 'Mr. Socko'], 3, 150),
  c('fn_wrestling_17', 'wrestling', 'In what year was the first WrestleMania held?', ['1983', '1985', '1987', '1990'], 1, 200),
  c('fn_wrestling_18', 'wrestling', 'Who ended The Undertaker\'s WrestleMania winning streak?', ['Brock Lesnar', 'Roman Reigns', 'Triple H', 'Shawn Michaels'], 0, 200),
  c('fn_wrestling_19', 'wrestling', 'What was The Undertaker\'s WrestleMania record before his streak ended?', ['18-0', '20-0', '21-0', '23-0'], 2, 200),
  c('fn_wrestling_20', 'wrestling', 'What is The Undertaker\'s real name?', ['Steve Austin', 'Glenn Jacobs', 'Paul Levesque', 'Mark Calaway'], 3, 200),
  c('fn_wrestling_21', 'wrestling', 'At WrestleMania III, Hulk Hogan famously bodyslammed which giant?', ['Big Show', 'Andre the Giant', 'Kane', 'Yokozuna'], 1, 200),
  c('fn_wrestling_22', 'wrestling', 'Which legend was known as The Heartbreak Kid?', ['Shawn Michaels', 'Bret Hart', 'Ric Flair', 'Randy Savage'], 0, 200),
  c('fn_wrestling_23', 'wrestling', 'Who is known for the line "To be the man, you gotta beat the man"?', ['Hulk Hogan', 'Bret Hart', 'Ric Flair', 'The Rock'], 2, 200),
  c('fn_wrestling_24', 'wrestling', 'Which wrestler was nicknamed The Hitman?', ['Ric Flair', 'Randy Savage', 'Edge', 'Bret Hart'], 3, 200),
]

// ─── True or False ─────────────────────────────────────────────────────────

function tf(id: string, category: Category, question: string, isTrue: boolean, points = 100): ChoiceQuestion {
  return { id, type: 'truefalse', category, question, options: ['True', 'False'], correct: isTrue ? 0 : 1, points, speedBonus: points / 2 }
}

export const FUN_TRUE_FALSE: ChoiceQuestion[] = [
  tf('fn_tf_1', 'disney', 'In Toy Story, Buzz Lightyear is a space ranger toy.', true),
  tf('fn_tf_2', 'disney', 'Mickey Mouse first appeared in Steamboat Willie in 1928.', true, 150),
  tf('fn_tf_3', 'disney', 'In The Lion King, Scar is Simba\'s grandfather.', false),
  tf('fn_tf_4', 'throwback', 'The Nokia 3310 had a colour screen.', false),
  tf('fn_tf_5', 'throwback', 'YouTube was launched before Facebook.', false, 150),
  tf('fn_tf_6', 'throwback', 'Tusker Project Fame was a singing competition.', true),
  tf('fn_tf_7', 'mystery', 'Sherlock Holmes was a real detective.', false),
  tf('fn_tf_8', 'mystery', 'Agatha Christie created Hercule Poirot.', true),
  tf('fn_tf_9', 'mystery', 'The Mary Celeste was found with no one on board.', true, 150),
  tf('fn_tf_10', 'wrestling', 'The Rock has starred in Hollywood movies.', true),
  tf('fn_tf_11', 'wrestling', 'Stone Cold Steve Austin\'s finisher was the RKO.', false),
  tf('fn_tf_12', 'wrestling', 'The Undertaker\'s WrestleMania streak ended at WrestleMania 30.', true, 200),
  tf('fn_tf_13', 'wrestling', 'Andre the Giant was famous for being very short.', false),
  tf('fn_tf_14', 'wrestling', 'WrestleMania is held once a year.', true),
]

// ─── Emoji Decode ──────────────────────────────────────────────────────────

function em(id: string, category: Category, emoji: string, options: string[], correct: number, points = 100): EmojiQuestion {
  return { id, type: 'emoji', category, question: 'What do these emojis spell out?', emoji, options, correct, points, speedBonus: points / 2 }
}

export const FUN_EMOJI: EmojiQuestion[] = [
  em('fn_em_1', 'disney', '🎈🏠👴', ['Up', 'Coco', 'Cars', 'Brave'], 0),
  em('fn_em_2', 'disney', '🧞‍♂️🪔', ['Hercules', 'Aladdin', 'Mulan', 'Moana'], 1),
  em('fn_em_3', 'throwback', '🐴💃🇰🇷', ['Macarena', 'Harlem Shake', 'Gangnam Style', 'Cha Cha Slide'], 2, 150),
  em('fn_em_4', 'throwback', '🏫🎵🏀', ['Glee', 'Hannah Montana', 'Camp Rock', 'High School Musical'], 3),
  em('fn_em_5', 'mystery', '🐶👻🚐', ['Scooby-Doo', 'Ghostbusters', 'Casper', 'Clifford'], 0),
  em('fn_em_6', 'mystery', '🚂🔪❄️', ['Snowpiercer', 'Murder on the Orient Express', 'Death on the Nile', 'The Polar Express'], 1, 150),
]
