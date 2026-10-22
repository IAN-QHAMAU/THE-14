export interface PicOddOne {
  id: string
  /** Four pictures (emoji). */
  pics: string[]
  /** What each picture is, shown at the reveal. */
  names: string[]
  correct: number
  why: string
  points: number
}

// Points set the level: 100 easy, 150 medium, 200 hard.
function od(id: string, pics: string, names: string[], correct: number, why: string, points = 100): PicOddOne {
  return { id, pics: pics.split(' '), names, correct, why, points }
}

export const ODD_ONE_PICS: PicOddOne[] = [
  // ── Easy ──
  od('op1', '🐶 🐱 🐹 🦁', ['Dog', 'Cat', 'Hamster', 'Lion'], 3, 'The others are pets. Please do not keep a lion.'),
  od('op2', '🍎 🥕 🍌 🍇', ['Apple', 'Carrot', 'Banana', 'Grapes'], 1, 'The carrot is the only vegetable.'),
  od('op3', '⚽ 🏀 🍩 🎾', ['Football', 'Basketball', 'Doughnut', 'Tennis ball'], 2, 'Round, yes. A ball, no.'),
  od('op4', '🚗 🚀 🚕 🚌', ['Car', 'Rocket', 'Taxi', 'Bus'], 1, 'The others drive on roads.'),
  od('op5', '🌞 🌙 🌵 ⭐', ['Sun', 'Moon', 'Cactus', 'Star'], 2, 'The others are up in the sky.'),
  od('op6', '🎸 📺 🎹 🥁', ['Guitar', 'TV', 'Piano', 'Drum'], 1, 'The others are instruments.'),
  od('op7', '🐟 🐬 🐫 🐙', ['Fish', 'Dolphin', 'Camel', 'Octopus'], 2, 'The others live in the sea. The camel prefers sand.'),
  od('op8', '👟 🧤 👞 👢', ['Trainer', 'Gloves', 'Shoe', 'Boot'], 1, 'The others go on your feet.'),
  od('op9', '🍕 🍔 🥦 🌭', ['Pizza', 'Burger', 'Broccoli', 'Hot dog'], 2, 'The others are fast food. Broccoli is just trying its best.'),
  od('op10', '☕ 🍰 🍵 🧃', ['Coffee', 'Cake', 'Tea', 'Juice'], 1, 'The others are drinks.'),
  od('op11', '✏️ 🖊️ 🍴 🖍️', ['Pencil', 'Pen', 'Fork and knife', 'Crayon'], 2, 'The others are for writing.'),
  od('op12', '🐝 🦋 🐞 🐍', ['Bee', 'Butterfly', 'Ladybird', 'Snake'], 3, 'The others are insects.'),
  od('op13', '❄️ 🏖️ ⛄ 🧣', ['Snow', 'Beach', 'Snowman', 'Scarf'], 1, 'The others are all about cold weather.'),
  od('op14', '🍦 🌶️ 🍧 🍨', ['Ice cream', 'Chilli', 'Shaved ice', 'Sundae'], 1, 'The others are cold desserts. Definitely not cold.'),
  od('op15', '🦒 🦓 🐧 🐘', ['Giraffe', 'Zebra', 'Penguin', 'Elephant'], 2, 'You will not find a penguin in the Maasai Mara.'),
  od('op16', '📱 🪑 💻 ⌚', ['Phone', 'Chair', 'Laptop', 'Smartwatch'], 1, 'The others need charging.'),
  od('op17', '🎃 👻 🎅 🧛', ['Pumpkin', 'Ghost', 'Santa', 'Vampire'], 2, 'The others are Halloween. Santa is a few weeks early.'),
  od('op18', '🌹 🍄 🌻 🌷', ['Rose', 'Mushroom', 'Sunflower', 'Tulip'], 1, 'The others are flowers.'),
  od('op19', '🔴 🟢 🟦 🔵', ['Red circle', 'Green circle', 'Blue square', 'Blue circle'], 2, 'The others are circles.'),
  od('op20', '😀 😢 😃 😄', ['Grin', 'Crying', 'Smile', 'Big smile'], 1, 'Everyone else is having a great day.'),
  od('op21', '🦅 🦇 🦜 🦉', ['Eagle', 'Bat', 'Parrot', 'Owl'], 1, 'The others are birds. The bat is a mammal.'),
  od('op22', '🧀 🥚 🥛 🍦', ['Cheese', 'Egg', 'Milk', 'Ice cream'], 1, 'The others are made from milk.'),
  od('op23', '👑 💍 🧦 💎', ['Crown', 'Ring', 'Socks', 'Diamond'], 2, 'The others are treasure. Socks are only treasure when you lose one.'),
  od('op24', '🔨 🧸 🪛 🔧', ['Hammer', 'Teddy bear', 'Screwdriver', 'Spanner'], 1, 'The others are tools.'),
  od('op25', '🥇 🏆 🥈 🥉', ['Gold', 'Trophy', 'Silver', 'Bronze'], 1, 'The others are medals.'),
  od('op26', '🎄 🎅 🐰 🦌', ['Tree', 'Santa', 'Bunny', 'Reindeer'], 2, 'The others are Christmas. The bunny belongs to Easter.'),
  od('op27', '🍿 🎬 📚 🎟️', ['Popcorn', 'Film', 'Books', 'Ticket'], 2, 'The others are a night at the cinema.'),
  od('op28', '☂️ 🧥 🩳 👢', ['Umbrella', 'Coat', 'Shorts', 'Boots'], 2, 'The others are for a rainy day.'),
  od('op29', '🧑‍🚀 🛰️ 🚂 🚀', ['Astronaut', 'Satellite', 'Train', 'Rocket'], 2, 'The others go to space.'),
  od('op30', '🐸 🥝 🍓 🥦', ['Frog', 'Kiwi', 'Strawberry', 'Broccoli'], 2, 'The others are green.'),
  od('op31', '🧇 🥞 🍕 🥓', ['Waffle', 'Pancakes', 'Pizza', 'Bacon'], 2, 'The others are breakfast. Probably.'),
  od('op32', '🌊 🏄 🏜️ 🐚', ['Wave', 'Surfer', 'Desert', 'Shell'], 2, 'The others are a day at the beach.'),
  od('op33', '💤 ☕ 🛏️ 🌙', ['Sleep', 'Coffee', 'Bed', 'Night'], 1, 'The others are about sleep. Coffee is the enemy.'),
  od('op34', '🍳 🔪 🧹 🧑‍🍳', ['Frying pan', 'Knife', 'Broom', 'Chef'], 2, 'The others are for cooking.'),
  od('op35', '🎂 🎁 🪦 🎈', ['Cake', 'Present', 'Gravestone', 'Balloon'], 2, 'The others are a birthday party. That one is not.'),
  od('op36', '🛸 👽 🧑‍🚀 🤖', ['UFO', 'Alien', 'Astronaut', 'Robot'], 2, 'The astronaut is the only human here.'),

  // ── Medium ──
  od('op37', '🐋 🦈 🐬 🦭', ['Whale', 'Shark', 'Dolphin', 'Seal'], 1, 'The shark is a fish. The others are mammals.', 150),
  od('op38', '🦅 🦘 🐝 🦇', ['Eagle', 'Kangaroo', 'Bee', 'Bat'], 1, 'The others can fly. The kangaroo just jumps really high.', 150),
  od('op39', '🇰🇪 🇺🇬 🇳🇬 🇹🇿', ['Kenya', 'Uganda', 'Nigeria', 'Tanzania'], 2, 'The others are in East Africa.', 150),
  od('op40', '🇫🇷 🇯🇵 🇮🇹 🇪🇸', ['France', 'Japan', 'Italy', 'Spain'], 1, 'The others are in Europe.', 150),
  od('op41', '🐊 🐸 🦎 🐢', ['Crocodile', 'Frog', 'Lizard', 'Turtle'], 1, 'The frog is an amphibian. The others are reptiles.', 150),
  od('op42', '🍋 🍌 🍆 🌽', ['Lemon', 'Banana', 'Aubergine', 'Corn'], 2, 'The others are yellow.', 150),
  od('op43', '🧊 🪨 💧 ♨️', ['Ice', 'Rock', 'Water', 'Steam'], 1, 'The others are all water in different forms.', 150),
  od('op44', '🥐 🍚 🥖 🍞', ['Croissant', 'Rice', 'Baguette', 'Bread'], 1, 'The others are baked.', 150),
  od('op45', '🎺 🎷 🎻 📯', ['Trumpet', 'Saxophone', 'Violin', 'Horn'], 2, 'The others are played by blowing.', 150),
  od('op46', '🦁 🐺 🐯 🐆', ['Lion', 'Wolf', 'Tiger', 'Leopard'], 1, 'The others are big cats.', 150),
  od('op47', '🐄 🐖 🐐 🐑', ['Cow', 'Pig', 'Goat', 'Sheep'], 1, 'Farmers milk the others. Nobody milks a pig.', 150),
  od('op48', '🌋 🏝️ 🏔️ ⛰️', ['Volcano', 'Island', 'Snowy peak', 'Mountain'], 1, 'The others are mountains.', 150),
  od('op49', '🧠 🦴 🫀 🫁', ['Brain', 'Bone', 'Heart', 'Lungs'], 1, 'The others are organs.', 150),
  od('op50', '🥥 🍍 🍎 🥭', ['Coconut', 'Pineapple', 'Apple', 'Mango'], 2, 'The others are tropical fruits.', 150),
  od('op51', '🦍 🐨 🐒 🦧', ['Gorilla', 'Koala', 'Monkey', 'Orangutan'], 1, 'The others are primates. The koala is a marsupial.', 150),
  od('op52', '🍷 🍺 🥛 🥂', ['Wine', 'Beer', 'Milk', 'Champagne'], 2, 'Milk is the only one you can have at breakfast.', 150),
  od('op53', '♠️ ♥️ ⭐ ♦️', ['Spades', 'Hearts', 'Star', 'Diamonds'], 2, 'The others are card suits.', 150),
  od('op54', '✈️ 🚢 🚁 🎈', ['Plane', 'Ship', 'Helicopter', 'Balloon'], 1, 'The others fly. The ship would rather not.', 150),
  od('op55', '🌧️ ⛈️ 🌈 🌨️', ['Rain', 'Storm', 'Rainbow', 'Snow'], 2, 'The others drop something on your head.', 150),
  od('op56', '🐌 🐆 🐢 🦥', ['Snail', 'Cheetah', 'Tortoise', 'Sloth'], 1, 'The others are famously slow.', 150),
  od('op57', '🍫 🧂 🍬 🍭', ['Chocolate', 'Salt', 'Sweet', 'Lollipop'], 1, 'The others are sweet. Do not put salt in your tea.', 150),
  od('op58', '🦷 👃 🦵 👁️', ['Tooth', 'Nose', 'Leg', 'Eye'], 2, 'The others are on your face.', 150),
  od('op59', '💵 🪙 💶 💷', ['Dollar', 'Coin', 'Euro', 'Pound'], 1, 'The others are notes.', 150),
  od('op60', '🏸 🏏 🎾 🏓', ['Badminton', 'Cricket', 'Tennis', 'Table tennis'], 1, 'The others are played over a net.', 150),
  od('op61', '🐣 🦆 🐥 🐔', ['Hatching chick', 'Duck', 'Chick', 'Hen'], 1, 'The others are chickens at different ages.', 150),
  od('op62', '🦁 🐘 🦒 🦏', ['Lion', 'Elephant', 'Giraffe', 'Rhino'], 2, 'The others are in the Big Five.', 150),
  od('op63', '🍣 🍙 🌮 🍜', ['Sushi', 'Rice ball', 'Taco', 'Ramen'], 2, 'The others are Japanese.', 150),
  od('op64', '🦩 🌸 🥦 🐷', ['Flamingo', 'Blossom', 'Broccoli', 'Pig'], 2, 'The others are pink.', 150),
  od('op65', '🍊 🍆 🎃 🥕', ['Orange', 'Aubergine', 'Pumpkin', 'Carrot'], 1, 'The others are orange.', 150),
  od('op66', '🇬🇭 🇫🇷 🇳🇬 🇿🇦', ['Ghana', 'France', 'Nigeria', 'South Africa'], 1, 'The others are in Africa.', 150),
  od('op67', '🇧🇷 🇦🇷 🇪🇸 🇨🇴', ['Brazil', 'Argentina', 'Spain', 'Colombia'], 2, 'The others are in South America.', 150),
  od('op68', '🦓 🐴 🦄 🐎', ['Zebra', 'Horse', 'Unicorn', 'Racehorse'], 2, 'The others are real. Sorry.', 150),

  // ── Hard ──
  od('op69', '🐙 🦀 🦑 🐚', ['Octopus', 'Crab', 'Squid', 'Shell'], 1, 'The crab is a crustacean. The others are molluscs.', 200),
  od('op70', '🍌 🍇 🍓 🍅', ['Banana', 'Grapes', 'Strawberry', 'Tomato'], 2, 'Botanically, the others are berries. The strawberry is not.', 200),
  od('op71', '🍉 🥒 🍋 🎃', ['Watermelon', 'Cucumber', 'Lemon', 'Pumpkin'], 2, 'The others are in the gourd family.', 200),
  od('op72', '🐄 🦒 🐎 🦌', ['Cow', 'Giraffe', 'Horse', 'Deer'], 2, 'The others chew the cud. The horse does not.', 200),
  od('op73', '🎻 🎸 🎹 🪕', ['Violin', 'Guitar', 'Piano', 'Banjo'], 2, 'The others are plucked or bowed. Piano strings are hit by hammers.', 200),
  od('op74', '🌲 🍄 🌵 🌻', ['Pine', 'Mushroom', 'Cactus', 'Sunflower'], 1, 'The mushroom is a fungus. The others are plants.', 200),
  od('op75', '🐟 🦈 🐬 🐡', ['Fish', 'Shark', 'Dolphin', 'Pufferfish'], 2, 'The dolphin is a mammal. The others are fish.', 200),
  od('op76', '🧜‍♀️ 🦖 🐉 🧚', ['Mermaid', 'T. rex', 'Dragon', 'Fairy'], 1, 'The T. rex actually existed. The others never did.', 200),
  od('op77', '🌶️ 🍆 🥒 🫑', ['Chilli', 'Aubergine', 'Cucumber', 'Pepper'], 2, 'The others are in the nightshade family.', 200),
  od('op78', '🐪 🦙 🐘 🐫', ['Camel', 'Llama', 'Elephant', 'Bactrian camel'], 2, 'The others are in the camel family.', 200),
  od('op79', '🦬 🐆 🐊 🦁', ['Buffalo', 'Leopard', 'Crocodile', 'Lion'], 2, 'The others are in the Big Five.', 200),
  od('op82', '🧄 🥔 🧅 🥕', ['Garlic', 'Potato', 'Onion', 'Carrot'], 1, 'The potato is a stem tuber. The others are roots or bulbs.', 200),
]
