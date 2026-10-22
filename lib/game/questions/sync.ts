import type { SyncQuestion } from './schema'

// One player answers about themselves, everyone else guesses what they said.
function sp(id: string, question: string, self: string, options: string[]): SyncQuestion {
  return { id, type: 'sync', category: 'party', question, self, options, points: 100, speedBonus: 0 }
}

export const SYNC: SyncQuestion[] = [
  sp('sp1', 'What is {name} ordering first at a restaurant?', 'What are you ordering first at a restaurant?', ['Something new', 'The usual', 'Whatever is cheapest', 'Whatever my friend gets']),
  sp('sp2', 'How does {name} spend a free Saturday?', 'How do you spend a free Saturday?', ['Out with friends', 'Sleeping in', 'Watching series', 'Working on something']),
  sp('sp3', 'What would {name} grab first in a fire?', 'What would you grab first in a fire?', ['Phone', 'Wallet', 'Laptop', 'Photos']),
  sp('sp4', 'What kind of traveller is {name}?', 'What kind of traveller are you?', ['Beach and relax', 'City and food', 'Mountains and hikes', 'Home is fine']),
  sp('sp5', 'What does {name} do first when they wake up?', 'What do you do first when you wake up?', ['Check my phone', 'Snooze the alarm', 'Pray or stretch', 'Go straight to the kitchen']),
  sp('sp6', 'Which superpower would {name} pick?', 'Which superpower would you pick?', ['Flying', 'Invisibility', 'Reading minds', 'Teleporting']),
  sp('sp7', 'What is {name} like in a group chat?', 'What are you like in a group chat?', ['Sends the memes', 'Reads, never replies', 'Starts the plans', 'Voice notes only']),
  sp('sp8', 'What would {name} do with a surprise 100,000 shillings?', 'What would you do with a surprise 100,000 shillings?', ['Save it', 'Treat myself', 'Invest it', 'Spend it on family']),
  sp('sp9', 'What is {name}\'s go-to comfort food?', 'What is your go-to comfort food?', ['Chips', 'Pilau', 'Pizza', 'Chapati and stew']),
  sp('sp10', 'How does {name} handle an argument?', 'How do you handle an argument?', ['Talk it out right away', 'Go quiet', 'Make a joke', 'Win it, no matter what']),
  sp('sp11', 'What is {name} most likely to be late for?', 'What are you most likely to be late for?', ['Church', 'Work or class', 'A party', 'Never late']),
  sp('sp12', 'Which pet would {name} choose?', 'Which pet would you choose?', ['Dog', 'Cat', 'Fish', 'No pets, thanks']),
  sp('sp13', 'What music is {name} playing on a long drive?', 'What music are you playing on a long drive?', ['Afrobeats', 'Gospel', 'Hip-hop', 'Old school hits']),
  sp('sp14', 'What would {name} rather skip forever?', 'What would you rather skip forever?', ['Cooking', 'Laundry', 'Washing dishes', 'Cleaning the house']),
  sp('sp15', 'How does {name} pick a movie?', 'How do you pick a movie?', ['Trailers', 'Reviews', 'Whatever is trending', 'Rewatch an old favourite']),
  sp('sp16', 'What does {name} spend too much money on?', 'What do you spend too much money on?', ['Food', 'Clothes and shoes', 'Data and airtime', 'Going out']),
  sp('sp17', 'What is {name} like at a party?', 'What are you like at a party?', ['On the dance floor', 'Near the food', 'Deep in one conversation', 'Ready to leave early']),
  sp('sp18', 'Where would {name} live if money was no issue?', 'Where would you live if money was no issue?', ['Coast, by the beach', 'Big city', 'Quiet countryside', 'Abroad']),
  sp('sp19', 'What scares {name} the most?', 'What scares you the most?', ['Snakes', 'Heights', 'Deep water', 'Public speaking']),
  sp('sp20', 'What kind of student was {name}?', 'What kind of student were you?', ['Front row, top marks', 'Class clown', 'Quiet but clever', 'Always last minute']),
  sp('sp21', 'What would {name} name a pet goat?', 'What would you name a pet goat?', ['Something funny', 'A celebrity name', 'A normal human name', 'Just Goat']),
  sp('sp22', 'How does {name} reply to a message they do not want to answer?', 'How do you reply to a message you do not want to answer?', ['Leave it on read', 'Reply days later', 'Send a sticker', 'Answer honestly']),
  sp('sp23', 'What is {name}\'s dream job, honestly?', 'What is your dream job, honestly?', ['Running my own business', 'Something creative', 'Doing nothing, rich', 'Helping people']),
  sp('sp24', 'Which snack is {name} choosing?', 'Which snack are you choosing?', ['Crisps', 'Chocolate', 'Fruit', 'Mandazi']),
  sp('sp25', 'What does {name} do when they cannot sleep?', 'What do you do when you cannot sleep?', ['Scroll my phone', 'Watch something', 'Lie there and think', 'Get a snack']),
  sp('sp26', 'What would {name} bring to a desert island?', 'What would you bring to a desert island?', ['A knife', 'A good book', 'Music', 'A friend']),
  sp('sp27', 'How does {name} react to a scary movie?', 'How do you react to a scary movie?', ['Scream out loud', 'Laugh at it', 'Cover my eyes', 'Refuse to watch']),
  sp('sp28', 'What is {name}\'s phone battery usually at?', 'What is your phone battery usually at?', ['Always above 80%', 'Somewhere in the middle', 'Living on 5%', 'Charger in hand']),
  sp('sp29', 'What would {name} pick for a first date?', 'What would you pick for a first date?', ['Dinner', 'Movies', 'Something outdoors', 'Coffee and a walk']),
  sp('sp30', 'Which sport would {name} actually play?', 'Which sport would you actually play?', ['Football', 'Basketball', 'Swimming', 'None, I would watch']),
  sp('sp31', 'How does {name} take their tea?', 'How do you take your tea?', ['Lots of sugar', 'No sugar', 'Coffee instead', 'Not a tea person']),
  sp('sp32', 'What is {name} most likely to forget?', 'What are you most likely to forget?', ['Keys', 'Birthdays', 'Names', 'Why I walked into the room']),
  sp('sp33', 'What would {name} do on a day off with no phone?', 'What would you do on a day off with no phone?', ['Read', 'Sleep', 'Visit people', 'Panic']),
  sp('sp34', 'Which decade would {name} live in?', 'Which decade would you live in?', ['The 80s', 'The 90s', 'The 2000s', 'Right now']),
  sp('sp35', 'How does {name} prepare for a big exam or meeting?', 'How do you prepare for a big exam or meeting?', ['Weeks ahead', 'The night before', 'On the way there', 'I wing it']),
  sp('sp36', 'What would {name} rather win?', 'What would you rather win?', ['A car', 'A trip abroad', 'A year of free food', 'Cash']),
]
