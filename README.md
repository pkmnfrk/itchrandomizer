# Itch Superbundle Randomizer

If you're like me, and hundreds of thousands of people are, then you bought one of the recent itch.io bundles that has thousands of games in it for pennies on the dollar, and now you want to play some of them. But, which ones to play? There's too many! How to choose?!

Well, don't worry, let a random number generator choose for you!

https://pkmnfrk.github.io/itchrandomizer/

## Features
 * Randomly choose a game from a list of 2500+
 * Filter based on the supposed platforms
 * Input your own bundle URL and it'll link you as close to the download as possible
 * Support for the [Bundle for Racial Justice and Equality](https://itch.io/b/520/bundle-for-racial-justice-and-equality)
 * Support for the [Indie bundle for Palestinian Aid](https://itch.io/b/902/indie-bundle-for-palestinian-aid)

## Known issues
 * There's no way to link directly to the downloads, due to how itch.io handles purchases. I did look into an API solution, but it's just not possible.
 * There isn't much information to filter on. Maybe additional metadata could be pulled in at build time?

## Build instructions
 * Set up your node environment as normal (`npm i`)
 * Run the update script to generate the data file (`node update.js`)
 * Open index.html
 * * Note, this must be hosted via a server. A simple static server will do, eg `npx static-server`

## Acknowledgements
 * Obviously, all the contributers to the bundle itself made this happen in the first place. There are 1300+ unique authors in the first bundle alone, so I can't list them all here, but exposing the fruits of their labour is the whole point, so I hope this is okay!
 * itch.io is a fantastic service and the idea to put this bundle together in the first place is wonderful. Without them, this would not exist either, nor many of the games.
 * [Corey Dutson](https://twitch.tv/cdutson), my dear friend and streamer for whom I built this in the first place. I hope you find this useful!
