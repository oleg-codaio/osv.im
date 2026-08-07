---
title: Online Poker in a Document
date: 2020-02-29
readTime: 6
image: /images/writing/online-poker-in-a-document/cover.png
description: Over the winter holidays, I built a functional multiplayer poker game entirely within a Coda document using only formulas and buttons.
---

Over the winter holidays, I found some time to work on improving my poker game, reading a couple [great](https://www.amazon.com/Harrington-Expert-Strategy-Limit-Tournaments-ebook/dp/B002XQ2C6O) [books](https://www.amazon.com/Theory-Poker-Professional-Player-Teaches-ebook/dp/B001QCYJQ2) and then applying their theories into practice. While there is no substitute for playing in a casino or at someone's house, one of the quickest ways to get into a game is to play online poker. There are hundreds of platforms out there, and after playing on a few I thought it would be a fun learning experience to create my own, but with a twist: what if you could have a doc that lets you play poker? Our goal at [Coda](https://osv.im/coda) is to precisely to facilitate that: creating docs as powerful as apps (with the help of formulas, not code), so I set out on an attempt. Read on to see the result and go behind the scenes.

Without further ado, here's the doc: [coda.io/@osv/poker](https://coda.io/@osv/poker) (open on a desktop for the best experience). Get a game going, and it will look something like this:

![Multiplayer poker gameplay inside Coda](/images/writing/online-poker-in-a-document/gameplay.webp)

No team of engineers behind it. No long release cycle or lots of code to maintain. And while there are also no pleasant poker table graphics or pretty animations when someone bets, at the end of the day, this whole game is really just a super-document put together by a single hobbyist with some free time over a few days.

So what did it take? If you've used Coda before, you'll likely be familiar with some of these concepts. But if not, I hope to show that creating apps and games like this is no longer reserved for folks with a computer science degree: anyone who's written a few formulas in Excel can figure it out.

## Getting started

The first step to putting together a doc like this is to think through the _schema_, i.e., the different kinds of data or entities that comprise a poker game, which in Coda are collected into tables.

### Cards

Naturally the first thing my mind jumped to when putting together a poker game was the deck. After finding a set of public domain card images [online](https://code.google.com/archive/p/vector-playing-cards), I added a table of 52 rows, corresponding to each of the cards. The crucial things to know here about each card are its rank and suit (for identifying different hands later on) as well as the location of each card: whether it's in the deck, dealt out on the table, or in a player's hand.

![Cards Coda table](/images/writing/online-poker-in-a-document/cards-table.webp)

### Ranks and suits

Ranks in Poker can be numeric (2–10) or face cards (J, Q, K, and A), and I had a hunch that only keeping around the value as shown on the card wasn't going to be that useful, since Coda won't just magically know that a King is better than a Queen. So, I added another table for Ranks, and while I was at it, one for Suits as well. Later on this turned out useful for adding a "sort value" for each rank to enable us to sort cards by how strong they are.

<figure>
  <img src="/images/writing/online-poker-in-a-document/ranks-suits-table.webp" alt="Ranks and Suits Coda table" />
  <figcaption>The "sort value" of a rank is an alternative representation of it that can be lexicographically sorted within Coda. The weakest card (two) has a sort value of 0. A ten has a sort value of 8, a jack is a 9, queen is A, king is B, and ace is C.</figcaption>
</figure>

### Players

The last major set of entities in poker is the set of players in the game, which is also tied to the hand they form from their pocket cards and the community cards on the table. This Coda table started out fairly simple, but actually grew to about 60 columns, containing info such as the user playing as each player, whether it's their turn, whether they're holding a flush or a four-of-a-kind, their role as a dealer or blind in the current round, and so on.

![Players Coda table](/images/writing/online-poker-in-a-document/players-table.webp)

Thanks to Coda's [conditional formats](https://help.superhuman.com/hc/en-us/articles/46210184375437-Add-color-and-formatting-to-your-tables), it was relatively easy to improve the readability of this table to highlight the current player or someone's turn.

## Game logic

With the foundations put in place\*, the next step was putting together the game logic that actually allows playing the game, which is made up of two things: _state_ and _procedures_. Nearly every game needs to keep track of state, and for poker that includes whose turn it is, who's the dealer, the size of the bet, etc. In addition to that, each action that a player takes results in a procedure, or set of steps, happening. An example is that starting a new game should cause the cards to get shuffled. In Coda, this can be accomplished using [buttons](https://blog.coda.io/introducing-buttons-8acda6413030).

<figure>
  <img src="/images/writing/online-poker-in-a-document/game-state.webp" alt="State and game engine internals" />
  <figcaption>A hidden section in the Coda doc that contains the internals of the "game engine". There are many more columns that aren't shown here.</figcaption>
</figure>

I created a new single-row table called "State" to contain all the state and buttons in one place. Feel free to make a copy of the doc and explore all the formulas and buttons to see how they work!

<p class="footnote">* Actually making this doc involved a lot of back and forth between updating the schema and the game logic, since the latter often depended on updates to the former. For instance, when someone takes their turn, we want to update "Current Player" to be the next player to take their turn. This meant adding a new column to the Players table called "Next Player", which contains a formula that determines the next, non-folded player in the round.</p>

## Ranking hands

At the end of a poker hand, the player with the best cards takes the pot (well, without getting into complexities). To determine the winning player, we need to convert each player's hands — which might be a list of the individual cards they're holding — into a sortable representation reflecting the strength of the game. Sorts in Coda are done lexicographically, meaning sequential numbers come before alphabetical letters. For example:

<figure>
  <img src="/images/writing/online-poker-in-a-document/five-cards-example.webp" alt="Five cards hand representation example" />
  <figcaption>The five cards above would get represented as "7–0A". The "7" corresponds to them forming a four-of-a-kind, which is better than a "6", which would make a full house. The numbers after the hyphen are used for tie breaking, and in this case refer to the quads having a rank of 2 (the lowest rank, represented as "0") with a Q kicker (represented as an "A" since it's the 11th best card).</figcaption>
</figure>

If you're interested in the details of how each hand is determined, check out the ["How It's Made"](https://coda.io/@osv/poker) section in the doc. But, here's an example of a formula used to find all the pairs in a player's hand:

<figure>
  <img src="/images/writing/online-poker-in-a-document/formula-example.png" alt="Coda hand ranking formula example" />
  <figcaption>That "Ranks" table we added earlier? I added a new column called "Player Counts", which contains the number of times each rank appears in each player's hand. Here we're only returning ranks that occur at least twice in a player's hand.</figcaption>
</figure>

With this representation, we can find what the best hand on the table is (by sorting all the representations and taking the last one), and subsequently the player(s) who have it.

## Putting it all together

After a lot of trial and error putting together the schema and game logic to get the intricacies of poker working (e.g., raising, side pots, ties), the final step was creating a user interface on top of all the backend tables and game state. In Coda this is done using views, which provide an alternative way to view the same table.

![Putting it all together](/images/writing/online-poker-in-a-document/putting-it-all-together.webp)

In the screenshot above, the two blocks in #1 are actually views of the Cards table, showing only the "Card Image" column and filtered down to cards held by the current player and in the community, respectively. Block #2 contains a formula summarizing the game state in a user-friendly way (i.e., showing whose turn it is or if someone won a given pot). And finally, block #3 is a view on the players table, hiding most of the 60 columns associated with each player and only showing the player number, their role, the user behind them, their balance, revealed cards at the end of a hand, and how much they've bet in the current round.

## Reflections

Building a poker game as a doc in Coda was rewarding, but ultimately it wouldn't be possible without the progress made as part of the nascent no-code movement. New platforms (like Coda) are allowing makers with domain-specific knowledge and a curious mindset the ability to build solutions to complex problems without requiring engineering knowledge. These tools aren't yet fitting for every problem — for instance, you won't be able to make a distributed search engine or a self-driving car — but that's ok. There are plenty of use cases, such as platforms for small communities or business tools, that can be vastly made easier to create, and the future is looking brighter for helping us spend less time and resources on developing these tools and more on the problems we're trying to solve with them.

<p class="footnote">Disclosure: links to Coda here include a referral link, which credits your new account with $10 (at the time of writing). As an employee, I don't personally get anything out of referrals, but having worked on our referral program I wanted to help out anyone who signs up after reading this article. :)</p>
