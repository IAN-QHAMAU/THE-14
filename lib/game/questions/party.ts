import type { BluffQuestion, MostLikelyQuestion, WouldRatherQuestion } from './schema'

// ─── More Would You Rather, Most Likely To and Bluff ──────────────────────

function wr(id: string, a: string, b: string): WouldRatherQuestion {
  // A matter of taste, so it is worth less than a real answer.
  return { id, type: 'wouldrather', category: 'party', question: 'Would you rather…', options: [a, b], points: 50, speedBonus: 0 }
}

export const MORE_WOULD_RATHER: WouldRatherQuestion[] = [
  wr('wy31', 'Fight one horse-sized chicken', 'Fight ten chicken-sized horses'),
  wr('wy32', 'Have a matatu with the loudest music', 'Have a matatu with free Wi-Fi'),
  wr('wy33', 'Always have to whisper', 'Always have to shout'),
  wr('wy34', 'Know how you will die', 'Know when you will die'),
  wr('wy35', 'Have hands for feet', 'Have feet for hands'),
  wr('wy36', 'Eat ugali with every meal', 'Never eat ugali again'),
  wr('wy37', 'Be stuck in traffic for 3 hours', 'Walk for 3 hours'),
  wr('wy38', 'Have your search history made public', 'Have your messages made public'),
  wr('wy39', 'Be the main character in an anime', 'Be the main character in a Nollywood movie'),
  wr('wy40', 'Have a rewind button for arguments', 'Have a mute button for people'),
  wr('wy41', 'Only whisper your answers in class', 'Sing your answers in class'),
  wr('wy42', 'Have a Death Note', 'Have a Shinigami best friend'),
  wr('wy43', 'Bend water like Katara', 'Bend fire like Zuko'),
  wr('wy44', 'Live inside the walls in Attack on Titan', 'Live in Dracula\'s castle'),
  wr('wy45', 'Never use emojis again', 'Only talk in emojis'),
  wr('wy46', 'Have a phone that never dies', 'Have data that never runs out'),
  wr('wy47', 'Be ten years older', 'Be five years younger'),
  wr('wy48', 'Go on a safari in the Mara', 'Go on a beach holiday in Diani'),
  wr('wy49', 'Always lose at games', 'Never be allowed to play games'),
  wr('wy50', 'Have a cat that talks', 'Have a dog that does your homework'),
  wr('wy51', 'Win a free car', 'Win free fuel for life'),
  wr('wy52', 'Be stuck in a lift with your ex', 'Be stuck in a lift with your teacher'),
  wr('wy53', 'Wear the same outfit forever', 'Never wear the same outfit twice'),
  wr('wy54', 'Never feel cold again', 'Never feel tired again'),
  wr('wy55', 'Have free chips mayai every day', 'Have free pizza once a week'),
  wr('wy56', 'Be able to stop time', 'Be able to replay time'),
  wr('wy57', 'Have everyone laugh at your jokes', 'Laugh at everyone\'s jokes'),
  wr('wy58', 'Live without music', 'Live without movies'),
  wr('wy59', 'Be the best player on a bad team', 'Be the worst player on a great team'),
  wr('wy60', 'Get a new phone every year', 'Get a holiday every year'),
  wr('wy61', 'Have a personal theme song that plays when you walk in', 'Have a laugh track after everything you say'),
  wr('wy62', 'Be a famous YouTuber', 'Be a famous actor'),
  wr('wy63', 'Always have messy hair', 'Always have bad breath'),
  wr('wy64', 'Never sleep in again', 'Never stay up late again'),
  wr('wy65', 'Swim with sharks', 'Sleep in a room with spiders'),
  wr('wy66', 'Only listen to one song forever', 'Only watch one movie forever'),
  wr('wy67', 'Be a genius but always late', 'Be average but always on time'),
  wr('wy68', 'Have the power to fly but only 1 metre off the ground', 'Run fast but only backwards'),
  wr('wy69', 'Lose all your photos', 'Lose all your contacts'),
  wr('wy70', 'Host every party', 'Never host a party'),
]

function ml(id: string, question: string): MostLikelyQuestion {
  return { id, type: 'mostlikely', category: 'party', question, points: 100, speedBonus: 0 }
}

export const MORE_MOST_LIKELY: MostLikelyQuestion[] = [
  ml('ml51', 'Who is most likely to pick a Death Note out of the trash and use it?'),
  ml('ml52', 'Who is most likely to argue with a matatu tout and win?'),
  ml('ml53', 'Who is most likely to finish an anime in one weekend?'),
  ml('ml54', 'Who is most likely to cry when their team loses?'),
  ml('ml55', 'Who is most likely to take 50 selfies before posting one?'),
  ml('ml56', 'Who is most likely to fall for a fake giveaway?'),
  ml('ml57', 'Who is most likely to eat food that fell on the floor?'),
  ml('ml58', 'Who is most likely to become a pastor?'),
  ml('ml59', 'Who is most likely to forget their password every week?'),
  ml('ml60', 'Who is most likely to win an argument they are wrong about?'),
  ml('ml61', 'Who is most likely to marry a celebrity?'),
  ml('ml62', 'Who is most likely to run away from a cockroach?'),
  ml('ml63', 'Who is most likely to become president one day?'),
  ml('ml64', 'Who is most likely to say "this is my last game" and play five more?'),
  ml('ml65', 'Who is most likely to have the most unread messages?'),
  ml('ml66', 'Who is most likely to borrow money and forget to pay back?'),
  ml('ml67', 'Who is most likely to trip on a flat road?'),
  ml('ml68', 'Who is most likely to eat someone else\'s food from the fridge?'),
  ml('ml69', 'Who is most likely to fake being sick to skip something?'),
  ml('ml70', 'Who is most likely to win a rap battle?'),
  ml('ml71', 'Who is most likely to become a teacher?'),
  ml('ml72', 'Who is most likely to still be awake at 4am?'),
  ml('ml73', 'Who is most likely to scream during a scary movie?'),
  ml('ml74', 'Who is most likely to post a long caption nobody reads?'),
  ml('ml75', 'Who is most likely to survive Attack on Titan?'),
  ml('ml76', 'Who is most likely to join the Fire Nation?'),
  ml('ml77', 'Who is most likely to send a voice note longer than 5 minutes?'),
  ml('ml78', 'Who is most likely to become a famous DJ?'),
  ml('ml79', 'Who is most likely to cheat at board games?'),
  ml('ml80', 'Who is most likely to live to 100?'),
  ml('ml81', 'Who is most likely to clap when the plane lands?'),
  ml('ml82', 'Who is most likely to start dancing first at a wedding?'),
  ml('ml83', 'Who is most likely to say "I told you so"?'),
  ml('ml84', 'Who is most likely to have a secret talent?'),
  ml('ml85', 'Who is most likely to change their hairstyle every month?'),
  ml('ml86', 'Who is most likely to get scammed buying something online?'),
  ml('ml87', 'Who is most likely to make friends with a stranger in a queue?'),
  ml('ml88', 'Who is most likely to be the last one ready?'),
  ml('ml89', 'Who is most likely to win a game show?'),
  ml('ml90', 'Who is most likely to keep a plant alive the longest?'),
]

function bl(id: string, question: string, answer: string, decoys: string[]): BluffQuestion {
  return { id, type: 'bluff', category: 'party', question, answer, decoys, points: 150, speedBonus: 0 }
}

export const MORE_BLUFF: BluffQuestion[] = [
  bl('bl40', 'A group of ferrets is called a ___.', 'business', ['hustle', 'scurry', 'tangle']),
  bl('bl42', 'A shrimp\'s heart is in its ___.', 'head', ['tail', 'legs', 'back']),
  bl('bl43', 'When the inventor of the frisbee died, his ashes were made into ___.', 'frisbees', ['a statue', 'a kite', 'a trophy']),
  bl('bl44', 'Hot water freezing faster than cold water is called the ___ effect, after a Tanzanian student.', 'Mpemba', ['Kilimanjaro', 'Nyerere', 'Serengeti']),
  bl('bl45', 'A day on Venus is longer than its ___.', 'year', ['summer', 'week', 'winter']),
  bl('bl46', 'Lake Turkana is also known as the ___ Sea.', 'Jade', ['Emerald', 'Desert', 'Salt']),
  bl('bl47', 'Nintendo started out in 1889 making ___.', 'playing cards', ['toys', 'umbrellas', 'radios']),
  bl('bl48', 'Instagram started as an app called ___.', 'Burbn', ['Snapgram', 'PicNow', 'Filtr']),
  bl('bl49', 'Twitter was first called ___.', 'twttr', ['Chirp', 'Tweeter', 'Statusly']),
  bl('bl50', 'A group of hippos is called a ___.', 'bloat', ['splash', 'wallow', 'tonne']),
  bl('bl51', 'A baby puffin is called a ___.', 'puffling', ['pufflet', 'puffkin', 'fluffin']),
  bl('bl52', 'Humans share about 60 percent of their genes with ___.', 'bananas', ['tomatoes', 'jellyfish', 'mushrooms']),
  bl('bl53', 'The fingerprints of a ___ are so close to ours they could confuse a crime scene.', 'koala', ['sloth', 'raccoon', 'lemur']),
]
