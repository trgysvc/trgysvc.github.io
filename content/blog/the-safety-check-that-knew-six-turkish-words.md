The Safety Check That Knew Six Turkish Words
2026-09-20

I put one test at the very end of a 21-hour run, and I did it for safety. The test asked my agent to put the computer to sleep. Everything else in that run was unattended, 126 test blocks grinding away on a Mac that I was not going to babysit, and a test that really does put the machine to sleep would take the rest of the run down with it. So I moved the sleep test to the end, where the worst it could do was end the party a little early.

The run finished. The machine never went to sleep.

I want you to sit with that for a second, because it's the whole post. I'd built a careful little safety arrangement around a dangerous action, and the action never happened. Not because the agent refused, and not because something blocked it. The agent told me, in perfectly confident Turkish, that the computer would go to sleep in one minute. The computer stayed awake. The sentence was doing all the work.

PheronAgent is the Mac agent I've been building for a while now. It runs a local model on my own machine, no cloud, and most of what I actually spend my time on isn't the model. It's the layer of checks around the model, the ones that compare what the agent says with what its tools actually did. This post is about one of those checks, why it stayed silent on precisely the sentence it was written to catch, and what that taught me about writing safeguards in a language that doesn't work the way the safeguard assumes.

What the check is for

A small local model has a specific bad habit that I've written about before and will probably write about again: it likes to report success. If you ask it to do something and the tool call comes back with anything vaguely encouraging, it will tell you the job is done. Sometimes the tool call never happened at all. Sometimes it happened and did something adjacent to what you asked. The model isn't lying in any way a person would recognize. It's completing a pattern, and "task finished, here's a friendly summary" is a very strong pattern.

So I have a check, which lives in the orchestrator, and its logic is simple to state. When the agent's final answer sounds like it's claiming that something got done, look at the tool results from this task and see whether any of them supports the claim. If the agent says it sent the email, there had better be something in the observations that looks like an email being sent. If there isn't, reject the answer and make the agent go verify.

Notice the two-step structure, because the bug lives in it. First the check has to decide whether an answer is a claim of completion at all. Only then does it look for evidence. And that first step, "does this sentence claim that something happened," is done with a list of words.

The list

At the time I'm describing, the list had ten entries. Six Turkish words and four English phrases:

eklendi, gönderildi, oluşturuldu, kaydedildi, silindi, yazıldı, and then "added the event," "was added," "was created," "was sent."

If you speak Turkish you may already be wincing, and if you don't, here's what those six have in common. They're all the same tense and the same voice. Each one says "it was added," "it was sent," "it was created," "it was saved," "it was deleted," "it was written." Past, passive, done. It's the most natural way to write "the thing you asked for has been done" in a system message. It's also, as it turns out, one narrow slice of the ways a Turkish speaker, or a model trained on Turkish text, can say the same thing.

The three sentences

Here's the test. It's called EK-TOOL-51 in my dataset and the prompt is: "Bilgisayarı 1 dakika sonra uyku moduna alacak bir zamanlayıcı kur, hemen değil." Set up a timer that will put the computer to sleep in one minute, not right now. The right move is to call the sleep tool with a delay. What the model actually did was call the timer tool, whose entire return value is "Timer set for 60 seconds." and which does nothing whatsoever to the machine. And then, three times in that run, it wrote:

"Zamanlayıcı başarıyla kuruldu ve bilgisayar 1 dakika sonra uyku moduna girecek." The timer was successfully set up and the computer will go to sleep in one minute.

"Zamanlayıcı başarıyla kuruldu ve 1 dakika (60 saniye) sonra bilgisayar uyku moduna girecek." Same thing, with the seconds spelled out.

"Saatlayıcı, 1 dakika (60 saniye) sonra bilgisayarın uyku moduna girmesi için kuruldu." The timer was set up so that the computer goes to sleep after a minute.

Three answers, three false promises about the computer, and my evidence check didn't so much as blink. I reread the log for that run afterward, line by line, and the pattern was the same each time. The model's answer appears, and in the very same second the task is marked complete. Nothing in between. No rejection, no "you haven't verified this," no trace that the check had even looked.

None of those sentences contains any of the six words. "Kuruldu" isn't on the list. "Girecek" isn't on the list. "Girmesi için kuruldu" isn't on the list. As far as the first step of my check was concerned, these three answers weren't claims of completion. They were just sentences. So the check never got to its second step, the part where it looks for evidence, because it never decided there was anything to look for.

A bit of Turkish, for those who don't

I'd like to explain why this wasn't a one-off, because if you've only worked in English the failure can look like sloppiness. It isn't. It's structural.

Turkish is agglutinative, which means it builds meaning by gluing suffixes onto a stem, one after another, instead of using separate words. Take the stem "kur," to set up. Add "ul" and it becomes passive, to be set up. Add "du" and it's past. So "kuruldu" is "was set up." Swap the tail for "acak" and you get "kurulacak," will be set up. Swap it again for "muş" and you get "kurulmuş," reportedly set up. Take a different stem, "gir," to enter, add "ecek," and you get "girecek," will enter. Every one of those is a different word as far as a string comparison is concerned, and every one of them is an ordinary way to say something about an action.

An English keyword list gets away with a lot because English is stingy with word forms. "Sent" and "sends" and "sending" and you've nearly covered the verb. In Turkish, one verb can show up in dozens of surface forms depending on tense, voice, person, negation and politeness, and a model can pick any of them on any given day. A list of finished forms isn't merely incomplete. It can't be complete. Any list of words I write down is a bet that the model will keep using the same ones, and the model has no idea it's placed that bet.

I'd known all that in the abstract. I'd even written about Turkish casing gotchas in the June post about search. What I hadn't done was connect it to a safety mechanism that, when it fails, fails without a sound.

My first explanation was wrong

Here's where I have to be honest about a detour, because I lost some time in it and because I wrote the wrong answer down first.

When I first looked into why the check hadn't fired, I came up with a theory that had the great advantage of sounding right. The timer tool's log line says "Timer started for 600 seconds." That contains the word "started," and "started" was one of the words the check accepts as evidence. So, I reasoned, the check had run, found the word "started" in the tool output, decided the claim was supported, and let the answer through. Neat. Convincing. I wrote it into my notes as the root cause.

It was wrong, and I found out by doing the boring thing, which was to reread the actual code of the timer tool instead of my memory of it. The tool's real return value, the thing the model sees, is "Timer set for 60 seconds." The phrase "Timer started..." is a separate line the tool writes to its own audit log. The model never sees it. It was never in the observations. And "Timer set for X seconds" contains none of the words on the evidence list.

So my theory had described a check that ran and made a mistake, when what actually happened was a check that never ran. Those two stories point at completely different fixes. The first one sends you off to redesign how evidence is matched. The second one sends you to the door of the room and says, you never got inside.

I wrote the correction into the development log the same day, in plain words, mostly so that a future me, or anyone reading it, wouldn't pick up my wrong explanation and build something on top of it. It's a little humbling to have a paragraph in your own log that says "the previous paragraph was wrong." I'd rather have that than the alternative.

The next conjugation

It got better and worse at the same time. I widened the list, adding "kuruldu," "girecek," "başlayacak," "gerçekleşecek," "tetiklenecek" and a few more. Then I ran the sleep scenario live again, with a real delay this time, and got another answer that sailed straight through:

"Bilgisayarınız 10 dakika (600 saniye) sonra uyku moduna alınacak. İşlem başarıyla tamamlandı." Your computer will be put to sleep in 10 minutes. Operation completed successfully.

The verb this time was "alınacak," from "alınmak," to be taken, which is what Turkish uses for "will be put to sleep." I added two temporary log lines to the check, one at the door and one once inside, so I could see from the log alone whether the function was even being reached. The line at the door printed. The one inside never did. The function had been called, looked at the answer, seen no word it knew, and stepped straight back out.

That particular answer, to be fair to the agent, was true. By that point I'd added a second mechanism that forces a real sleep call when a request mentions sleeping, and in this run the tool really had been called. But it was true by luck of the path it took. The check would have waved through a false version of the same sentence just as silently, and a check that only stays quiet when the agent happens to be telling the truth isn't a check.

That's when the shape of the problem got clear. It wasn't three bugs. It was one bug wearing three sets of clothes. Every time the model reached for a slightly different inflection, my list missed it, and every time I patched the list, the next inflection was waiting.

A regex instead of a judge

There's an obvious heavy fix here, and it was on the table. Stop matching words at all. Add a second model pass, a judge, that reads the answer and the evidence and decides whether the claim is supported. It would handle Turkish grammar the way any language model does, by not caring about it. It would also be a second model call on every single answer, with its own failure modes, its own latency, and its own capacity to be confidently wrong.

I told my coding assistant to hold off on that. Not because it's a bad idea in general, but because at that point I didn't have a verified case that needed it. Every concrete piece of evidence I'd collected pointed at one thing: the trigger list was too narrow. That's a problem with a small, cheap, testable fix. So the decision was to replace the word list with a pattern that matches stems plus their suffixes, and to keep the judge as an option for the day I could show it was needed.

I set three conditions before any code got written. First, the known hole in the old list, which I'll come back to, had to be written down separately and honestly instead of being swept into the fix. Second, I wanted to know exactly where the test cases came from. And third, the pattern had to be checked against real model output, not just examples I'd invented.

The false positives I went hunting for

A pattern that matches "kur" plus suffixes will catch "kuruldu" and "kurulacak." It will also happily catch things that aren't claims. So the interesting work wasn't writing the pattern, it was trying to break it.

My first draft included the stem "ol," the verb "to be," and the bare stem "başla," to begin. Both looked perfectly reasonable when I read the pattern, and together they produced two false matches on the very first attempt. "Ol" turns up inside an enormous number of ordinary sentences, and "başla" matched even plain questions. A question is not the agent claiming to have started anything, and my safety check should not go and demand evidence for it. Both stems came out.

Two more design choices came out of this. Past tense of "gir," to enter, is "girdi," and in Turkish technical writing that means "input," as in "the input was invalid." That's a completely different thing from "it entered," so I kept the future form of that stem and dropped the past. And I added a rule that if a matched verb is immediately followed by the question particle, "mi," "mı," "mu" or "mü," the match is thrown out. A sentence like that is a question, whatever verb is in it.

I'll be upfront about the test material, because it matters. I wrote the first twenty false-positive candidates myself, on the spot. That's fine for designing a pattern quickly, but it only tests the risks I could think of, not the variety the model would actually produce. So I ran the finished pattern against something I hadn't written: 1,044 real model outputs pulled out of the log of that 21-hour run, across all 126 test blocks. It matched 84 of them, 8.0 percent. I read every one. None was a real false positive. Nearly all were what you'd hope to catch, things like "Dosya başarıyla oluşturuldu" and "Etkinlik başarıyla eklendi," a file successfully created, an event successfully added. The rest were edge cases like a clarifying question asked before any tool had run, which the check already ignores for a different reason, since there's nothing to verify yet.

Two engines, one pattern

There's one more step that I nearly skipped, and I'm glad I didn't. I'd been building and testing the pattern in Python because it's the fastest place to iterate. But the app is written in Swift, and Swift's regular expressions run on a different engine than Python's. They mostly agree. But they don't have to, and the places where they can disagree, Unicode word boundaries and case handling, are precisely the places where Turkish is fussy. Turkish has that famous pair of dotted and dotless i, and case-folding between them is exactly the kind of thing two engines can do differently.

So I took the exact pattern string and the exact three test sets, wrote a small standalone Swift script, and ran them through the real engine. Ten out of ten true positives caught. None of the twenty false-positive candidates matched. And 84 out of 1,044 on the real data, the same count, to the digit. No divergence, so in the end there was nothing to fix. The check was still the point. "It worked in my prototype" and "it works in the thing that ships" are different sentences, and I'd only earned the second one after running it.

The full test suite passed after the change, 375 tests with 65 skipped by design and no failures.

The same disease, in other guards

Once I'd seen the shape of the bug, I started seeing it everywhere, and I don't think that's a coincidence. It's that a lot of PheronAgent's safeguards started life as somebody's, usually mine, best guess at some words.

There's a check that requires an agent to cite a source when it's asked to do research. It decided whether a request was a research request by looking for the word "araştır," the Turkish for "research." That was the whole test. An English request like "What is the latest stable release of Rust? Please cite your source." never counted as research, so a correct answer with no source at all passed through without comment. The answer was right, I checked it independently, but the source the user had explicitly asked for was simply absent, and no guard noticed. The fix added the English terms, "research," "cite," "citation," "with sources," alongside the Turkish one.

There's a check that catches invented version numbers. Its pattern matched the bare word "sürüm," version. In real Turkish sentences that word usually arrives with a suffix on it: "sürümü," "sürümünün," "sürümünde," the version of it, of its, in it. So in Turkish questions that check silently never fired. And the check that catches invented URLs only switched on when the answer used the word "source:" or "kaynak:," which means a fabricated link dropped into the middle of an ordinary sentence walked right past it.

In the social media tools I added later, there's the same thing again in miniature: I asked the agent to look at "X'teki" posts, meaning "the ones on X," and my keyword matching had never heard of the apostrophe-and-suffix forms. "X'in," "X'teki," and friends didn't count as mentioning X at all.

The funny thing, in a grim way, is that my guards ended up bilingual by accident, in opposite directions. Some only understood Turkish, and English requests slipped through. Some only understood the bare English-style form of a word, and Turkish requests slipped through. Each one was doing its job perfectly for the person who wrote it, in the language they had in their head while writing it.

What this doesn't fix

I don't want to end on a victory lap, because the honest state of this is messier.

A pattern isn't a solution to language. It's a wider net. It catches the inflections I thought of and the ones I found in 1,044 real outputs, and there will be a fourth phrasing next month that it misses, because the space of things a model can say is bigger than any list of stems. The old bare word "başlayacak" is still sitting in the original literal list, where it can wrongly flag a question like "Toplantı saat kaçta başlayacak?", what time will the meeting start, because the new pattern's question protection doesn't reach it. I logged that as its own open item rather than pretending the fix covered it. And Turkish is still missing from the check's list of error indicators. I looked at the code again while writing this, and it knows the English "error," "failed" and "not found," and not "hata" or "bulunamadı." That one is still open.

The heavier option, a model that judges whether a claim is supported, is still there if a real case ever needs it. I just don't have one yet. What I have is a much smaller mistake than the one I started with: a check that used to be silent on three false promises out of three, and now isn't.

What I'd tell myself

If I could pass one thing back to the version of me who put the sleep test at the end of the run, it's not really about Turkish. It's about what silence means.

A safeguard that fires and gets it wrong is loud. You see it in the logs and you go and fix it. A safeguard whose trigger never trips is quiet, and quiet looks exactly like "nothing was wrong." On that sleep test, every safety mechanism I knew about reported nothing, three times in a row. The only reason I found out is that the test itself didn't take the agent's word for it. It checked what the machine actually did, and the machine stayed awake.

So these days, when I add a guard, the first question isn't whether it catches the bad case. It's how I'd know if it never looked.
