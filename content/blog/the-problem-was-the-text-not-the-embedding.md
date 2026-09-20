I Went Looking for a Better Embedding Model. The Problem Was the Text.
2026-09-20

Back in June I wrote a post about the day I discovered that Apple's on-device embedding model can't tell Turkish sentences apart, and how a boring string match ended up beating it. I was pretty pleased with myself in that post. There's a whole section where I stand at a crossroads, look at the option of dropping in a proper multilingual model through MLX, and turn it down with a little speech about lightweight native agents and not drowning in unnecessary complexity. I even wrote that if I'd insisted on vectors alone I'd "probably be integrating a 2 GB model into my system right now." Very wise. Very restrained.

Then in September I went and integrated a 2 GB model into my system. Well, "integrated" is generous. I downloaded three of them, ran them in Python, and stared at the numbers. But the spirit of the thing is the same: June me closed a door with great ceremony, and three months later I walked back up to it with a new excuse and a fresh coffee.

This post is about what was behind that door, which turned out to be much less interesting than the model and much more interesting than I expected. Along the way there's a WhatsApp database that anyone on your Mac can read, a security change that quietly unplugged the only part of my search that worked, a measurement I ran on the wrong question with great rigor, an improvement I had to take back within an afternoon, and a "Delete All" button that didn't delete anything. I'll say up front that I'm going to be a bit annoying about numbers in this one. Every figure below comes from a log, a script output or a database query I can point at, and where a number is weak I'll tell you it's weak.

What I was trying to build

The feature sounds simple when you say it out loud. PheronAgent is the Mac agent I've been building, it runs a local model on my own machine, and I wanted to be able to ask it things like "what did I decide with this person about the contract?" or "who was that concert booking with?" and have it answer from my actual iMessage, WhatsApp and Mail history. All of it on-device. Opt-in, channel by channel, off by default, and even after you switch a channel on nothing happens until you press a separate "Import Now" button. I didn't want anything in there that quietly ran in the background reading my messages, because I'm the person who has to live with the app that does that, and I'd like to keep being able to look at myself in the mirror.

The first version was the obvious one, the one every retrieval tutorial hands you. Three small readers, one per channel. For each person, grab the messages from the window you chose, have the local model write a short summary, turn the summary into an embedding vector, store it. When a question comes in, embed the question, find the nearest vectors, answer from those. I'd already built exactly that shape for the agent's other memory, so this was supposed to be an afternoon of plumbing.

The file anyone can read

Before I'd written a single line of the embedding part, I had to figure out what permissions each channel would need, and that's where the first surprise was waiting.

iMessage and SMS live in one database, ~/Library/Messages/chat.db, and macOS guards it properly. I tried opening it from a terminal without Full Disk Access and got "authorization denied," which is exactly what you want to see.

WhatsApp is a different story. It keeps its local data in a SQLite file called ChatStorage.sqlite, inside a Group Container. I opened it from a normal terminal command. No prompt, no dialog, no "Terminal would like to access...", nothing. I just read the message table, on my own machine, as myself. There were 3,681 messages in it, 3,078 of them with real text in the text column, sitting there as plain, unencrypted SQLite. It turns out macOS's protection covers a curated list of Apple's own locations, and another company's Group Container isn't on it. So WhatsApp's data isn't protected from any other program running as you. Which, obviously, includes mine.

I want to be careful not to make that sound more dramatic than it is. It's not a vulnerability I'm disclosing, it's how the platform works, and anyone who has looked at that folder knows it. But it changed how I designed the feature, and I think it should change how anyone designs a feature that touches that file. If the operating system isn't standing guard, then the only thing between that data and my app is my own decisions. So the WhatsApp toggle stopped being a convenience switch and became the one and only permission boundary for that channel. The app must never touch the file while the toggle is off. The toggle ships off. And right next to it in the settings screen there's a plain-language warning that unlike the other two channels, nothing else protects this data, so this switch is the only thing that does.

I also made a rule for myself that raw message text never gets written anywhere. It's read into memory just long enough to be summarized, then thrown away. What gets stored is the summary, encrypted with AES-256-GCM, with the key in the Keychain.

Hold on to that encryption detail. It comes back to bite me in about two sections.

The first question came back empty

I ran a real import on my own WhatsApp history, with the local model doing the summarizing, and then asked the agent about a specific person I know I've talked to. It came back empty. Not wrong, not weird, just empty.

My first theory was that I'd broken it myself, and I still think that was a reasonable theory. I'd just bolted encryption onto the storage, and if my embeddings were being computed over encrypted text, everything downstream would be noise. So I wrote a small throwaway test whose only job was to accuse the encryption and either convict it or clear it. Take one stored row, decrypt its summary, use that very same summary as the query, and score it against the vault. A healthy pipeline should give something very close to 1. It gave 0.94. The encryption, the storage and the scoring code were all innocent.

Which meant the vectors themselves were the problem, and that's where I got to run my second throwaway test, which I now think of as the one that made me put my coffee down. I took three unrelated Turkish sentences and two unrelated English ones and compared every pair. The three unrelated Turkish sentences scored between 0.79 and 0.85 against each other. That's what near-duplicates look like. The two unrelated English sentences scored 0.34, which is roughly what unrelated sentences are supposed to look like. Then I took one Turkish sentence and its own English translation, the same meaning in two languages, and got 0.11 and 0.08.

So, to summarize the model's worldview: any two Turkish sentences are basically the same sentence, and a sentence is not the same as itself in English. It wasn't comparing meaning in Turkish at all. It was folding most Turkish text into roughly the same corner of the space.

Then I asked the framework whether Apple even ships a Turkish model. It doesn't. Asking for the Turkish sentence embedding and the Turkish word embedding both returned nil on my machine, while English returned a model for each. The app had been quietly running the English model on Turkish text the whole time, and nobody, including me, had noticed, because something else had been doing the real work.

The thing I'd unplugged

That "something else" was the keyword boost from the June post. If you read that one, you'll remember it: exact word overlap layered on top of the vector score, the thing I wrote about with such satisfaction. In June I'd found out the vectors were bad and patched around them. What I hadn't fully appreciated is that the patch was carrying the entire load. In the older memory code, the vectors were decorating the results and the word matching was doing the retrieving. (There's a code comment from that work noting that a Turkish query against an English CV scored 0.587, which lost to an unrelated .DS_Store listing at 0.59. The .DS_Store won. Somewhere, a hidden Finder file is still smug about this.)

And when I added encryption to the new archive, I broke that layer. You can't match a query's words against ciphertext. My change notes from that day actually mention it: "known tradeoff, acceptable," it says, more or less, with the ranking now depending on embedding similarity alone. Acceptable if the embedding is any good. It was not. In the name of protecting people's messages, I had switched off the one signal in the system that worked and replaced it with one that couldn't tell Turkish sentences from each other.

The fix wasn't clever. Decrypt the candidates before scoring instead of after, so the word matching has plaintext to look at again. Security fine, search fine, and I'd learned a lesson about the difference between a tradeoff I've accepted and a tradeoff I've actually looked at.

Going back to the door

So now the model question was open again, and I did what June me had declined to do. I ran real multilingual models on real data. Offline, in Python, on my own WhatsApp text: multilingual-e5-small, multilingual-e5-base and bge-m3. These aren't toys, they're proper retrieval models, and bge-m3 in particular has a good reputation. If any of them could tell Turkish sentences apart, I'd know it quickly.

For each person in the test I compared the score of the right conversation against the average score of all the wrong ones. Before running it I'd decided that a useful model ought to open up a gap of 0.2. The average gaps came back as minus 0.0002 for e5-small, 0.0049 for e5-base and 0.0143 for bge-m3. Top-1 accuracy was 0 percent for the small one and 33 percent for the other two, out of six questions. All three models failed, and they failed in the same near-random way.

My coding assistant's first read of those numbers was the tidy one: embeddings don't work on this data, skip the MLX work, close the item. It would have been a satisfying entry in the log. It also would have been wrong, and what stopped me is a habit I've picked up the hard way: when every single candidate fails in exactly the same manner, I start wondering whether the candidates are the problem at all.

So I looked at my own test, and here's what was wrong with it. All six questions had the same shape: "what did we talk about with such-and-such person." That's a question about who. But in a one-to-one chat, the other person's name almost never appears in the messages. Think about it. Nobody starts every line of a private conversation by addressing the person they're already talking to. The name isn't in the text. It lives in a different table, as metadata. No embedding model on earth can recover a signal that isn't in the text you hand it. I had taken three genuinely good models and measured them, carefully, on a job none of them could possibly do, and then nearly read their failure as a verdict on what they're actually for.

The measurement itself was fine, by the way. Real models, real data, the right prefixes. It was just aimed at the wrong target, and a careful measurement of the wrong thing is somehow worse than a sloppy one, because it looks so convincing.

Chat logs are mostly "ok"

While I was picking apart that failed test, I noticed something that turned out to matter a lot more than the models.

A raw one-to-one chat is nearly empty of meaning. Scroll through one, any one, yours included. "ok." "tamam." "olur." A thumbs-up. "yes, later." A huge amount of what people actually send each other is conversational glue, the verbal equivalent of nodding. The real content of a stretch of conversation, the decision about the contract, the plan for the concert, doesn't live in any single message. It only exists after something reads a whole stretch of messages and decides what they were about.

Which means that for weeks, in effect, I'd been trying to figure out the best way to search text that had almost nothing in it to find. I'd been shopping for a better metal detector for a beach where the coins hadn't been buried yet.

The redesign, and a rule I wrote down first

The second version has two layers, and the important idea is that the searchable thing isn't the messages, it's what a model makes of them.

The importer cuts each person's history into monthly batches. That's a purely mechanical boundary, there only to keep the model's input a sensible size. Each batch goes to the local model with an instruction to split it into distinct topics, give each one a short label and a two or three sentence summary of only that topic, and to produce nothing at all for a stretch that's just greetings. Once all of a person's topic summaries exist, a second prompt builds a small profile from them: the likely relationship, the tone, the recurring topics, and a field called "commitments" with strict rules. It may only contain promises that are stated explicitly in the summaries, with a date if there is one, and it stays empty if there's nothing. I made the profile derive from the summaries rather than the raw messages so that importing a later month can never produce a merge conflict against an earlier one. It just re-derives from the pile.

Questions then route two ways. If the question names a person, it's matched against the profile by name, deterministically, no embedding involved. That was always the half that was never going to be a search problem, it's a lookup. If the question is about a topic and doesn't name anyone ("who was the concert booking with"), it searches the topic summaries.

While rewriting the prompts I found something in my own v1 code that I'll file under "character-building": the summary prompt was written in English. My messages are in Turkish and my questions are in Turkish. I had a language mismatch I'd created myself, sitting in the middle of the pipeline, possibly contributing to the very thing I'd been measuring. The new prompts are written in Turkish and they stay that way.

And before I wrote a single line of embedding code for the topic search, I did the thing I'm most glad I did in this whole episode: I wrote the decision rule into the spec and locked it. Embeddings would get built only if they beat plain lexical search at top-1 by at least 0.2, measured on questions that don't name anyone, against real distilled summaries. If they didn't, the whole MLX embedding subsystem, the tokenizer, the pooling, the model bundling, none of it would get written. The rule sat on paper before I'd seen any of the numbers. I'm telling you that because I know myself, and if the numbers had come first I'd have found a way to reinterpret them.

The result, and what it doesn't say

I ran the first real import through the new pipeline and it produced 90 topic summaries. Then I wrote eight new questions, none naming a person, each with a known correct target somewhere in those 90, and scored three approaches side by side.

Plain lexical search, which is a port of the keyword boost the agent already used, put the right topic first in 75 percent of the questions and in the top two 88 percent of the time. The e5-small embedding also got 75 percent at top-1, exactly the same, and 100 percent in the top two. A simple hybrid that added the two scores together did worse than either of them, 50 percent at top-1, which I'm choosing to blame on my naive addition and not on the concept.

At top-1, the embedding tied. It did not beat lexical by anything remotely near 0.2. By the rule I'd written down, the subsystem wasn't justified, so I didn't build it.

Now, this is a result that's easy to overclaim in both directions, and I've done enough overclaiming for one post. The result does not say embeddings are useless for this. The embedding was better in the top two, and one of the eight questions shows why. I asked how something was supposed to be mounted on a wall, and the stored summary talked about setting it up at home. Zero shared words. The lexical score for the right topic was exactly zero, while the embedding ranked it first. That's the textbook case for vectors, and it really happened on my data. What the result does say is narrower: at the position I'd chosen to judge by, on this data, the extra machinery bought nothing I could measure, and lexical search over distilled summaries runs on every Mac with no model sitting in memory. Also, it's eight questions from one person's messages, mostly in Turkish. So the accurate sentence is "not shown to help on this sample," and definitely not "shown not to help."

The improvement that lasted one afternoon

There was one more idea I wanted to try inside the summaries. I asked the distillation prompt to also produce a handful of search keywords for each topic and tacked them onto the end of the stored summary, on the theory that more vocabulary would give the word matching more to grab.

I re-imported, reran the eight questions, and top-1 jumped from 75 percent to 88 percent. Six correct out of eight became seven out of eight. My coding assistant reported it, quite happily, as a real improvement. I read the numbers and something felt off.

Six out of eight to seven out of eight is one question. One question moving. And the average score gap had barely budged, from 0.308 to 0.324, which is not what a real widening of the search surface looks like. Worse, the two runs weren't really comparable, and I hadn't noticed why until I went looking. A fresh import isn't deterministic. The second run had different topic boundaries and 108 summaries instead of 90. And when I put the two evaluation scripts next to each other, four of the eight questions were different between runs. I had compared two different datasets, with partly different questions, and called the difference an effect.

The fix was to stop re-importing and run an actual controlled comparison. Same 108 rows, same eight questions, and one variable: whether the keywords are included in the text being matched. I stripped the keyword suffix off all 108 rows and scored both versions. Without the keywords: 88 percent top-1, 88 percent top-2, average gap 0.306. With them: 88 percent, 88 percent, 0.324. The correct topic had the same rank in all eight questions. One question's score rose by 0.15, but it was already ranked first, so nothing changed.

Look at that again. The version without keywords also scored 88. The jump from 75 to 88 hadn't come from the keywords. It had come from the data and the questions changing underneath me. I took the sentence back. I kept the keyword feature, because it costs nothing and harms nothing, but the wording in my notes is now "harmless, no measurable benefit on this sample," which is a much less exciting sentence and a much more true one.

The keywords did cause a different, real problem. The longer output meant the model's JSON got cut off mid-object in 26 batches. I raised the token limits, and I also wrote a recovery step that keeps every complete object from before the cutoff and drops only the truncated tail, because a model that stops mid-sentence is a fact of life and not something to solve by asking it nicely. On the next run there were 20 truncation events. Fifteen were recovered and five were lost completely. That loss used to be a scattered log line nobody would ever read, and now it's counted and shown as an orange line in the settings screen after an import, since a silently partial import is precisely the sort of failure that looks like success.

A near-relative of that bug had the same personality. When the model returned the commitments field as a list of objects instead of a list of strings, my strict decoder threw away the whole profile, including the relationship and tone, which had arrived perfectly fine. One bad field took down its neighbors. Now every field decodes on its own and falls back on its own, and there's a fault-injection test that feeds it a deliberately broken field and checks that the rest survives.

There was also a fun one where loading the encryption key raced with the first calls that needed it. In the real app it never fired, because loading the model gives everything plenty of time to settle. In a standalone test process it fired every single time, every row failed to decrypt, and the code shrugged and fell back to the ciphertext, so an import that had actually worked looked like "not found." The race is fixed by starting the key load lazily from inside the actor, and that silent shrug now writes a warning to the audit log. I have a growing collection of these, and they all have the same shape: something goes wrong, the code smooths it over politely, and I find out days later.

The relevance threshold got its own small dose of honesty. It's set at 0.1, deliberately just under the lowest score any correct topic got across the eight questions, which was 0.150. For a memory tool I'd rather surface a marginal topic than come back with nothing, so it errs on the side of recall. It's calibrated on eight questions, so I'm planning to recalibrate it once real usage gives me a better distribution than eight.

The delete button that didn't delete

The last part is the one I care about most, because it's a promise to whoever ends up using this.

Before calling the feature done I was reading through the code path for the settings screen's "Delete All Chat History" button, and found that it cleared the chat sessions and nothing else. It never touched the two new tables. So someone could import their message history, press delete, feel good about themselves, and have every summary and profile still sitting on disk. For a feature whose entire point is that the user stays in control of this data, that's not a cosmetic gap. I added a function that empties both tables and connected it to the same button. I also rewrote the privacy policy, which was still describing the first version, and now says what's actually stored: derived data, summaries and a profile, encrypted, on the device, retrieved only when asked.

Then I wanted to watch it work in the real app, because deletion is the one path where "it compiles" isn't good enough. I clicked through the actual GUI, pressed the button, and queried the database directly. The tables still held 19 profiles and 108 topics. The delete had done nothing.

The code was fine. The app I was clicking on was a build from an hour earlier. The command I'd been using all day to check my work, swift build, refreshes the Swift package but doesn't rebuild the Xcode app bundle, so the running app was a stale copy that didn't have my fix in it. I compared the timestamp on the binary against the timestamp on the source file and there was the gap, sitting right there, mildly humiliating. I rebuilt the real app with xcodebuild, relaunched it, confirmed the baseline was still 19 and 108, and pressed the button again. This time the raw SQLite counts read 0 and 0. The other memory tables, 3,867 and 236 rows, were untouched, which mattered just as much, because a delete button that clears too much is its own kind of bug. What I trust about that result is that I read the database itself, not the interface's report of what it had just done.

Where it actually stands

I'd rather end with the honest state of things than a neat conclusion, because neat conclusions are how I ended up believing 75 turned into 88.

Questions that name a person get answered deterministically from the profile, and that half works the way a lookup should. Questions about a topic find the right summary first somewhere between 75 and 88 percent of the time, on eight questions from one person's data, which is enough to call it probably useful and not enough to call it proven. The weakest link is the commitments field, since it's extracted second-hand from summaries and not from the messages, which makes it the first place I'd look for an invented promise. Profile matching depends on the name the other person uses in WhatsApp, and iMessage doesn't provide one at all. Embeddings are not built. If lexical search starts to crack on a much bigger archive, that decision reopens, and the measurement gate is sitting there ready to rerun.

If I could send one sentence back to June me, it wouldn't be "use a better model," even though I spent days building the case for exactly that. It would be closer to: go look at what you're searching before you go shopping for a way to search it. I spent my time measuring how well various tools could find things in a pile of text, and the single most valuable line in the whole feature turned out to be the prompt that decides what a month of "ok" and thumbs-up emojis is worth remembering. The retrieval layer was just the part that was easy to put a number on, so it got all my attention.

And yes, I know. June me is going to read this and say he told me so about the 2 GB model. He can have that one.
