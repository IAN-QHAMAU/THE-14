import type { Category } from './schema'
import type { RawOddOne } from './oddoneA'

// Points set the level: 100 easy, 150 medium, 200 hard.
function od(id: string, category: Category, options: string[], correct: number, why: string, points = 100): RawOddOne {
  return { id, category, options, correct, why, points }
}

export const ODD_ONE_B: RawOddOne[] = [
  // ── Anime ──
  od('oo_anime_1', 'anime', ['Goku', 'Vegeta', 'Naruto', 'Gohan'], 2, 'Naruto is from Naruto. The others are from Dragon Ball.'),
  od('oo_anime_2', 'anime', ['Light Yagami', 'Ryuk', 'L', 'Levi'], 3, 'Levi is from Attack on Titan. The others are from Death Note.', 150),
  od('oo_anime_3', 'anime', ['Gon', 'Tanjiro', 'Zenitsu', 'Inosuke'], 0, 'Gon is from Hunter x Hunter. The others are from Demon Slayer.', 150),
  od('oo_anime_4', 'anime', ['Spirited Away', 'Akira', 'Princess Mononoke', 'My Neighbor Totoro'], 1, 'Akira is not a Studio Ghibli film. The others are.', 200),

  // ── Movies ──
  od('oo_movies_1', 'movies', ['Titanic', 'Jaws', 'Avatar', 'Aliens'], 1, 'Jaws was directed by Steven Spielberg. The others were directed by James Cameron.'),
  od('oo_movies_2', 'movies', ['Inception', 'Interstellar', 'Gravity', 'Dunkirk'], 2, 'Gravity was directed by Alfonso Cuaron. The others are Christopher Nolan films.', 150),
  od('oo_movies_3', 'movies', ['Christian Bale', 'Ben Affleck', 'Robert Pattinson', 'Henry Cavill'], 3, 'Henry Cavill played Superman. The others played Batman.', 150),
  od('oo_movies_4', 'movies', ['Snatch', 'Pulp Fiction', 'Reservoir Dogs', 'Jackie Brown'], 0, 'Snatch is a Guy Ritchie film. The others are Quentin Tarantino films.', 200),

  // ── Music ──
  od('oo_music_1', 'music', ['John Lennon', 'Paul McCartney', 'Mick Jagger', 'Ringo Starr'], 2, 'Mick Jagger is in the Rolling Stones. The others were Beatles.'),
  od('oo_music_2', 'music', ['Freddie Mercury', 'Brian May', 'John Deacon', 'Keith Richards'], 3, 'Keith Richards is in the Rolling Stones. The others were in Queen.', 150),
  od('oo_music_3', 'music', ['Ed Sheeran', 'Drake', 'The Weeknd', 'Justin Bieber'], 0, 'Ed Sheeran is English. The others are Canadian.', 150),
  od('oo_music_4', 'music', ['Trumpet', 'Saxophone', 'Trombone', 'Tuba'], 1, 'The saxophone is a woodwind instrument. The others are brass.', 200),

  // ── Gaming ──
  od('oo_gaming_1', 'gaming', ['Mario', 'Link', 'Sonic', 'Kirby'], 2, 'Sonic is a Sega character. The others are Nintendo characters.'),
  od('oo_gaming_2', 'gaming', ['Charmander', 'Cyndaquil', 'Torchic', 'Squirtle'], 3, 'Squirtle is a Water type. The others are Fire type starters.', 150),
  od('oo_gaming_3', 'gaming', ['Halo', 'GTA V', 'Red Dead Redemption', 'Bully'], 0, 'Halo was made by Bungie. The others are Rockstar games.', 150),
  od('oo_gaming_4', 'gaming', ['Dark Souls', 'Hollow Knight', 'Elden Ring', 'Bloodborne'], 1, 'Hollow Knight was made by Team Cherry. The others are FromSoftware games.', 200),

  // ── Internet ──
  od('oo_internet_1', 'internet', ['Instagram', 'WhatsApp', 'Facebook', 'TikTok'], 3, 'TikTok was made by ByteDance. The others belong to Meta.'),
  od('oo_internet_2', 'internet', ['YouTube', 'Twitch', 'Gmail', 'Android'], 1, 'Twitch was bought by Amazon. The others belong to Google.', 150),
  od('oo_internet_3', 'internet', ['Grumpy Cat', 'Nyan Cat', 'Doge', 'Keyboard Cat'], 2, 'Doge is a dog. The others are cat memes.', 150),
  od('oo_internet_4', 'internet', ['Evan Spiegel', 'Chad Hurley', 'Steve Chen', 'Jawed Karim'], 0, 'Evan Spiegel co-founded Snapchat. The others co-founded YouTube.', 200),

  // ── Heroes ──
  od('oo_heroes_1', 'heroes', ['Batman', 'Superman', 'Spider-Man', 'Wonder Woman'], 2, 'Spider-Man is from Marvel. The others are DC heroes.'),
  od('oo_heroes_2', 'heroes', ['Wolverine', 'Storm', 'Cyclops', 'Hawkeye'], 3, 'Hawkeye is not a mutant. The others are X-Men.', 150),
  od('oo_heroes_4', 'heroes', ['Steve Rogers', 'Barry Allen', 'Tony Stark', 'Bruce Banner'], 1, 'Barry Allen is the Flash from DC. The others are Marvel Avengers.', 200),

  // ── Cartoons ──
  od('oo_cartoons_1', 'cartoons', ['Homer', 'Bart', 'Peter', 'Lisa'], 2, 'Peter is from Family Guy. The others are Simpsons.'),
  od('oo_cartoons_2', 'cartoons', ['Patrick', 'Sandy', 'Squidward', 'Perry'], 3, 'Perry is from Phineas and Ferb. The others are from SpongeBob SquarePants.', 150),
  od('oo_cartoons_3', 'cartoons', ['Botticelli', 'Leonardo', 'Raphael', 'Donatello'], 0, 'Botticelli is not a Ninja Turtle. The others are.', 150),
  od('oo_cartoons_4', 'cartoons', ['Dexter\'s Laboratory', 'Hey Arnold!', 'Johnny Bravo', 'Courage the Cowardly Dog'], 1, 'Hey Arnold! is a Nickelodeon show. The others are Cartoon Network originals.', 200),

  // ── Books ──
  od('oo_books_1', 'books', ['Gryffindor', 'Slytherin', 'Hogsmeade', 'Hufflepuff'], 2, 'Hogsmeade is a village. The others are Hogwarts houses.'),
  od('oo_books_2', 'books', ['Hamlet', 'Macbeth', 'Othello', 'Faust'], 3, 'Faust is by Goethe. The others are Shakespeare plays.', 150),
  od('oo_books_3', 'books', ['Legolas', 'Frodo', 'Sam', 'Pippin'], 0, 'Legolas is an elf. The others are hobbits.', 150),
  od('oo_books_4', 'books', ['1984', 'Brave New World', 'Animal Farm', 'Homage to Catalonia'], 1, 'Brave New World is by Aldous Huxley. The others are by George Orwell.', 200),

  // ── African Music ──
  od('oo_afromusic_1', 'afromusic', ['Wizkid', 'Burna Boy', 'Davido', 'Diamond Platnumz'], 3, 'Diamond Platnumz is Tanzanian. The others are Nigerian.'),
  od('oo_afromusic_2', 'afromusic', ['Sauti Sol', 'Ethic Entertainment', 'Sailors Gang', 'Boondocks Gang'], 0, 'Sauti Sol is an Afro-pop band. The others are Gengetone groups.', 150),
  od('oo_afromusic_3', 'afromusic', ['Kabza De Small', 'Ali Kiba', 'DJ Maphorisa', 'Focalistic'], 1, 'Ali Kiba is a Tanzanian Bongo Flava star. The others are South African Amapiano artists.', 150),
  od('oo_afromusic_4', 'afromusic', ['Franco', 'Papa Wemba', 'Oliver Mtukudzi', 'Koffi Olomide'], 2, 'Oliver Mtukudzi was Zimbabwean. The others are Congolese rumba stars.', 200),

  // ── Hip Hop ──
  od('oo_hiphop_1', 'hiphop', ['Ice Cube', 'The Notorious B.I.G.', 'Snoop Dogg', 'Dr. Dre'], 1, 'The Notorious B.I.G. was from Brooklyn. The others are West Coast rappers.'),
  od('oo_hiphop_2', 'hiphop', ['Eazy-E', 'Ice Cube', 'Nas', 'MC Ren'], 2, 'Nas was never in N.W.A. The others were.', 150),
  od('oo_hiphop_3', 'hiphop', ['Outkast', 'T.I.', 'Gucci Mane', 'Nelly'], 3, 'Nelly is from St. Louis. The others built their careers in Atlanta.', 150),
  od('oo_hiphop_4', 'hiphop', ['Busta Rhymes', 'RZA', 'GZA', 'Method Man'], 0, 'Busta Rhymes was never in the Wu-Tang Clan. The others are members.', 200),

  // ── Series ──
  od('oo_series_1', 'series', ['Barney', 'Ross', 'Chandler', 'Joey'], 0, 'Barney is from How I Met Your Mother. The others are from Friends.'),
  od('oo_series_2', 'series', ['Walter White', 'Tony Soprano', 'Jesse Pinkman', 'Saul Goodman'], 1, 'Tony Soprano is from The Sopranos. The others are from Breaking Bad.', 150),
  od('oo_series_3', 'series', ['Arya', 'Sansa', 'Daenerys', 'Bran'], 2, 'Daenerys is a Targaryen. The others are Stark children.', 150),
  od('oo_series_4', 'series', ['Money Heist', 'Elite', 'Cable Girls', 'Dark'], 3, 'Dark is a German series. The others are Spanish.', 200),

  // ── Disney ──
  od('oo_disney_1', 'disney', ['Toy Story', 'Cars', 'Shrek', 'Up'], 2, 'Shrek is a DreamWorks film. The others are Pixar films.'),
  od('oo_disney_2', 'disney', ['Lord Farquaad', 'Ursula', 'Jafar', 'Scar'], 0, 'Lord Farquaad is from Shrek. The others are Disney villains.', 150),
  od('oo_disney_3', 'disney', ['Doc', 'Grumpy', 'Sneezy', 'Smiley'], 3, 'Smiley is not one of the Seven Dwarfs. The others are.', 150),
  od('oo_disney_4', 'disney', ['Shenzi', 'Zazu', 'Banzai', 'Ed'], 1, 'Zazu is a hornbill. The others are hyenas from The Lion King.', 200),

  // ── Throwback ──
  od('oo_throwback_1', 'throwback', ['Hannah Montana', 'iCarly', 'The Suite Life of Zack & Cody', 'Wizards of Waverly Place'], 1, 'iCarly was a Nickelodeon show. The others were on Disney Channel.'),
  od('oo_throwback_2', 'throwback', ['Tahidi High', 'Papa Shirandula', 'Machachari', 'Generations'], 3, 'Generations is South African. The others are Kenyan shows.', 150),
  od('oo_throwback_3', 'throwback', ['Instagram', 'MySpace', 'Friendster', 'Hi5'], 0, 'Instagram launched in 2010. The others are early 2000s social networks.', 150),
  od('oo_throwback_4', 'throwback', ['Nameless', 'Redsan', 'Jose Chameleone', 'Wahu'], 2, 'Jose Chameleone is Ugandan. The others are Kenyan.', 200),

  // ── Mystery ──
  od('oo_mystery_1', 'mystery', ['Dr. Watson', 'Mrs. Hudson', 'Moriarty', 'Hercule Poirot'], 3, 'Hercule Poirot is an Agatha Christie detective. The others are from Sherlock Holmes.'),
  od('oo_mystery_2', 'mystery', ['Hercule Poirot', 'Father Brown', 'Miss Marple', 'Ariadne Oliver'], 1, 'Father Brown was created by G.K. Chesterton. The others are Agatha Christie characters.', 150),
  od('oo_mystery_3', 'mystery', ['Martin Freeman', 'Benedict Cumberbatch', 'Robert Downey Jr.', 'Jeremy Brett'], 0, 'Martin Freeman played Watson. The others played Sherlock Holmes.', 150),
  od('oo_mystery_4', 'mystery', ['Murder on the Orient Express', 'Death on the Nile', 'The Hound of the Baskervilles', 'And Then There Were None'], 2, 'The Hound of the Baskervilles is by Arthur Conan Doyle. The others are by Agatha Christie.', 200),

  // ── Sports ──
  od('oo_sports_1', 'sports', ['Basketball', 'Football', 'Cricket', 'Field hockey'], 0, 'Basketball has five players a side. The others have eleven.'),
  od('oo_sports_2', 'sports', ['Birdie', 'Eagle', 'Albatross', 'Love'], 3, 'Love is a tennis score. The others are golf scores.', 150),
  od('oo_sports_3', 'sports', ['Basketball', 'Rugby', 'Volleyball', 'American football'], 1, 'Rugby was invented in England. The others were invented in the USA.', 150),
  od('oo_sports_4', 'sports', ['Netball', 'Handball', 'Volleyball', 'Water polo'], 2, 'Volleyball has six players a side. The others have seven.', 200),

  // ── Football ──
  od('oo_football_1', 'football', ['Pele', 'Maradona', 'Ronaldinho', 'Kaka'], 1, 'Maradona was Argentine. The others are Brazilian.'),
  od('oo_football_2', 'football', ['Messi', 'Modric', 'Xavi', 'Kaka'], 2, 'Xavi never won the Ballon d\'Or. The others did.', 150),
  od('oo_football_3', 'football', ['The Gunners', 'The Red Devils', 'The Toffees', 'The Blaugrana'], 3, 'The Blaugrana is Barcelona. The others are nicknames of English clubs.', 150),
  od('oo_football_4', 'football', ['Romelu Lukaku', 'Arjen Robben', 'Robin van Persie', 'Wesley Sneijder'], 0, 'Romelu Lukaku is Belgian. The others are Dutch.', 200),

  // ── Basketball ──
  od('oo_basketball_1', 'basketball', ['Michael Jordan', 'Scottie Pippen', 'Shaquille O\'Neal', 'Dennis Rodman'], 2, 'Shaquille O\'Neal never played for the Chicago Bulls. The others won titles there.'),
  od('oo_basketball_2', 'basketball', ['Tim Duncan', 'Kobe Bryant', 'LeBron James', 'Kevin Garnett'], 0, 'Tim Duncan played college basketball. The others went straight from high school to the NBA.', 150),
  od('oo_basketball_3', 'basketball', ['Dirk Nowitzki', 'Giannis Antetokounmpo', 'Hakeem Olajuwon', 'Kevin Durant'], 3, 'Kevin Durant was born in the USA. The others were born abroad.', 150),
  od('oo_basketball_4', 'basketball', ['Bill Russell', 'Wilt Chamberlain', 'Larry Bird', 'Paul Pierce'], 1, 'Wilt Chamberlain never played for the Boston Celtics. The others are Celtics legends.', 200),

  // ── Motorsport ──
  od('oo_motorsport_1', 'motorsport', ['Ferrari', 'Ducati', 'McLaren', 'Williams'], 1, 'Ducati races motorbikes. The others are Formula 1 teams.'),
  od('oo_motorsport_2', 'motorsport', ['Lewis Hamilton', 'Jenson Button', 'Damon Hill', 'Fernando Alonso'], 3, 'Fernando Alonso is Spanish. The others are British F1 champions.', 150),
  od('oo_motorsport_3', 'motorsport', ['Valentino Rossi', 'Michael Schumacher', 'Ayrton Senna', 'Alain Prost'], 0, 'Valentino Rossi is a MotoGP rider. The others are F1 world champions.', 150),
  od('oo_motorsport_4', 'motorsport', ['Monza', 'Imola', 'Silverstone', 'Mugello'], 2, 'Silverstone is in England. The others are race tracks in Italy.', 200),

  // ── Athletics & Olympics ──
  od('oo_olympics_1', 'olympics', ['Blue', 'Yellow', 'Black', 'Orange'], 3, 'Orange is not an Olympic ring colour. The others are.'),
  od('oo_olympics_2', 'olympics', ['Eliud Kipchoge', 'David Rudisha', 'Haile Gebrselassie', 'Faith Kipyegon'], 2, 'Haile Gebrselassie is Ethiopian. The others are Kenyan.', 150),
  od('oo_olympics_3', 'olympics', ['Long jump', '400m hurdles', 'Javelin', 'Shot put'], 1, 'The 400m hurdles is a track event. The others are field events.', 150),
  od('oo_olympics_4', 'olympics', ['Sydney', 'London', 'Paris', 'Tokyo'], 0, 'Sydney has hosted the Summer Olympics once. The others have hosted more than once.', 200),

  // ── Tennis, Rugby & Cricket ──
  od('oo_racket_1', 'racket', ['Wimbledon', 'The Masters', 'US Open', 'French Open'], 1, 'The Masters is a golf major. The others are tennis Grand Slams.'),
  od('oo_racket_2', 'racket', ['Try', 'Wicket', 'Over', 'Bowled'], 0, 'A try is scored in rugby. The others are cricket terms.', 150),
  od('oo_racket_3', 'racket', ['England', 'Wales', 'Italy', 'South Africa'], 3, 'South Africa is not in the Six Nations. The others are.', 150),
  od('oo_racket_4', 'racket', ['Sachin Tendulkar', 'Virat Kohli', 'Wasim Akram', 'MS Dhoni'], 2, 'Wasim Akram is Pakistani. The others are Indian cricketers.', 200),

  // ── Wrestling ──
  od('oo_wrestling_1', 'wrestling', ['Muhammad Ali', 'John Cena', 'The Undertaker', 'Hulk Hogan'], 0, 'Muhammad Ali was a boxer. The others are wrestlers.'),
  od('oo_wrestling_2', 'wrestling', ['Roman Reigns', 'Randy Orton', 'Seth Rollins', 'Dean Ambrose'], 1, 'Randy Orton was never in The Shield. The others were.', 150),
  od('oo_wrestling_3', 'wrestling', ['Triple H', 'Ric Flair', 'Batista', 'Kane'], 3, 'Kane was never in Evolution. The others were.', 150),
  od('oo_wrestling_4', 'wrestling', ['Roman Reigns', 'Rikishi', 'Batista', 'Umaga'], 2, 'Batista is not part of the Samoan Anoa\'i wrestling family. The others are.', 200),

  // ── Food ──
  od('oo_food_1', 'food', ['Apple', 'Mango', 'Banana', 'Carrot'], 3, 'A carrot is a vegetable. The others are fruits.'),
  od('oo_food_2', 'food', ['Paella', 'Lasagna', 'Risotto', 'Carbonara'], 0, 'Paella is Spanish. The others are Italian dishes.', 150),
  od('oo_food_4', 'food', ['Parmesan', 'Brie', 'Mozzarella', 'Gorgonzola'], 1, 'Brie is French. The others are Italian cheeses.', 200),

  // ── Cars ──
  od('oo_cars_1', 'cars', ['BMW', 'Ferrari', 'Audi', 'Mercedes-Benz'], 1, 'Ferrari is Italian. The others are German.'),
  od('oo_cars_2', 'cars', ['Toyota', 'Honda', 'Hyundai', 'Nissan'], 2, 'Hyundai is Korean. The others are Japanese.', 150),
  od('oo_cars_3', 'cars', ['Volkswagen', 'Ferrari', 'Porsche', 'Lamborghini'], 0, 'Volkswagen means people\'s car. The others are named after their founders.', 150),
  od('oo_cars_4', 'cars', ['Lexus', 'Acura', 'Infiniti', 'Genesis'], 3, 'Genesis is Korean, from Hyundai. The others are luxury brands of Japanese makers.', 200),

  // ── Animals ──
  od('oo_animals_2', 'animals', ['Lion', 'Leopard', 'Buffalo', 'Cheetah'], 3, 'The cheetah is not in the Big Five. The others are.', 150),
  od('oo_animals_4', 'animals', ['Puffin', 'Ostrich', 'Emu', 'Kiwi'], 0, 'The puffin can fly. The others are flightless birds.', 200),

  // ── Brands ──
  od('oo_brands_1', 'brands', ['Rolex', 'Nike', 'Adidas', 'Puma'], 0, 'Rolex makes watches. The others are sportswear brands.'),
  od('oo_brands_2', 'brands', ['McDonald\'s', 'IKEA', 'Coca-Cola', 'Starbucks'], 1, 'IKEA is Swedish. The others are American.', 150),
  od('oo_brands_3', 'brands', ['Sony', 'Nintendo', 'Samsung', 'Panasonic'], 2, 'Samsung is Korean. The others are Japanese.', 150),
  od('oo_brands_4', 'brands', ['Volvo', 'H&M', 'Spotify', 'Nokia'], 3, 'Nokia is Finnish. The others are Swedish.', 200),

  // ── Money ──
  od('oo_money_1', 'money', ['Kenya', 'Nigeria', 'Uganda', 'Tanzania'], 1, 'Nigeria uses the naira. The others use the shilling.'),
  od('oo_money_2', 'money', ['Rand', 'Naira', 'Cedi', 'Peso'], 3, 'The peso is not an African currency. The others are.', 150),
  od('oo_money_3', 'money', ['George Washington', 'Abraham Lincoln', 'Thomas Edison', 'Benjamin Franklin'], 2, 'Thomas Edison is not on a US banknote. The others are.', 150),
  od('oo_money_4', 'money', ['Switzerland', 'Austria', 'Portugal', 'Finland'], 0, 'Switzerland uses the franc. The others use the euro.', 200),

  // ── Fashion ──
  od('oo_fashion_1', 'fashion', ['Sneakers', 'Sandals', 'Beret', 'Boots'], 2, 'A beret is a hat. The others are footwear.'),
  od('oo_fashion_2', 'fashion', ['Chanel', 'Gucci', 'Prada', 'Versace'], 0, 'Chanel is French. The others are Italian fashion houses.', 150),
  od('oo_fashion_3', 'fashion', ['Fedora', 'Beanie', 'Panama', 'Loafer'], 3, 'A loafer is a shoe. The others are hats.', 150),
  od('oo_fashion_4', 'fashion', ['Dior', 'Burberry', 'Louis Vuitton', 'Hermes'], 1, 'Burberry is British. The others are French fashion houses.', 200),

  // ── Nature ──
  od('oo_nature_1', 'nature', ['Pacific', 'Atlantic', 'Indian', 'Caspian'], 3, 'The Caspian is a sea. The others are oceans.'),
  od('oo_nature_2', 'nature', ['Kilimanjaro', 'Everest', 'Mount Kenya', 'Mount Elgon'], 1, 'Everest is in Asia. The others are mountains in Africa.', 150),
  od('oo_nature_3', 'nature', ['Amazon', 'Nile', 'Congo', 'Zambezi'], 0, 'The Amazon is in South America. The others are African rivers.', 150),
  od('oo_nature_4', 'nature', ['Granite', 'Basalt', 'Marble', 'Obsidian'], 2, 'Marble is a metamorphic rock. The others are igneous.', 200),
]
