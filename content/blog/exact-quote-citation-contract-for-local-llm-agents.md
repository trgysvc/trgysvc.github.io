Teaching a Local LLM Agent to Quote Its Sources: The Exact-Quote Citation Contract
2026-10-04

I had a test that said PASS, and I was happy about it for roughly as long as it took me to open the raw log.

The test is called MT-05. It's one block of my golden dataset, the big pile of scripted scenarios I throw at the agent. I've had a small version of that dataset since the summer, but in September and October I started running the whole thing properly, and that's when every problem that had been quietly hiding lined up to introduce itself.

MT-05 is a three-turn conversation about moving to Finland, a scenario I love because it forces the agent to do real research on real government websites instead of winging it from memory. Turn one asks about the startup residence permit. Turn two asks for the minimum monthly living budget. Turn three asks the agent to summarize what it learned and list the steps. The grader checks that the right tools got called at the right times, and that the agent didn't forget the conversation along the way. It passed all three turns. PASS, PASS, PASS. The agent even said "the figure we established earlier" in turn three, which is exactly the kind of context retention I'd spent weeks begging for.

The figure it had established was 1,635 euros a month. "Established" is a generous word for a number the model had invented one turn earlier.

PheronAgent is the Mac agent I've been building for a while, and it runs a local model on my own machine with no cloud involved. Most of my working life on it is not about the model. It's about the layer of checks around the model that compare what the agent says with what its tools actually returned. This post is about the day I found out that one of the nicest-looking tests I owned was passing on a number the model invented, and about the long, embarrassing week of getting my safeguards wrong in different directions before I landed on something I'm not ashamed of. It is also, honestly, a list of mistakes. I made most of them in sequence and each one made the next one possible.

What the model actually saw

When I stopped looking at the PASS column and read the raw search results the model had in front of it for turn two, the picture changed. I went through the whole text line by line and wrote down every number in it.

There was a page saying the living requirement starts from 1,030 euros a month. There was a page mentioning 16,700 dollars in savings. And there was a page on the official immigration service's own site that said 1,600 euros per month, but that one was about a completely different permit, the one for employed persons, so it was in the results but irrelevant to the question.

1,635 appeared nowhere. Not in a snippet, not in a title, not in a URL. The model took a handful of fragmentary and indirect hints, decided what a plausible answer would look like, and produced a number that sounded exactly like the kind of number that belongs there. It had a specific, authoritative, entirely invented figure for how much money a human being needs to prove to move to a country.

It got worse when I looked at the first attempt, the one before the "successful" second one. In the first draft the model had said 5,081 euros and cited a web address it had never visited. My citation guard caught that. The guard compares every URL in an answer against the URLs the agent actually saw during the task, and "this address is not present in any observation" is a perfectly good reason to bounce an answer back. The model got a correction turn and tried again.

The second draft said 1,635 and cited nothing at all. And that's the whole story of why it got through. My guard checked URLs. There was no URL, so there was nothing to check. The guard wasn't wrong. It was just looking the other way while the lie walked past.

And the tool description had already told it not to. The web search tool's description literally says: do not guess a specific fact, and never state a specific number you did not actually read. The model had read that sentence twice in two attempts and ignored it twice. I'd already learned that lesson once, with software version numbers, where I'd found out that a sentence in a prompt asking a small model to be honest is a suggestion and not a mechanism. I'd written it down, felt wise, and then done exactly the same thing with prices. I suspect that's true of any small model: a rule in the prompt is a hope, and the things that really matter have to live in code.

Turn three, by the way, repeated 1,635 with total confidence, because turn three was summarizing turn two. It wasn't lying twice. It was being a faithful secretary to its own earlier invention. Context retention working perfectly in service of a fabrication is a very particular kind of horror, and it passes a test.

Guard number one, aimed at the wrong target

My first instinct was the obvious one. The lie was a currency amount, so I wrote a money guard. It pulled euro, dollar and lira amounts out of the final answer and checked that each one appeared somewhere in the text the tools had returned. It worked. It was simple, it was deterministic, and it felt great.

Then I found out that money was only one of the disguises.

To test properly I stopped trusting live websites, whose content changes under me, and built my own little HTML page with a number I controlled. Something like "the minimum amount is exactly 2,743 euros per month." A page where I knew the right answer for certain.

First attempt: I pasted the page address into the prompt and asked what the figure was. The agent never fetched the page. It classified my question as ordinary chat, told me it was unable to access that page right now, and offered a figure in Turkish lira instead. A page I'd handed it. In the prompt. With the address right there.

That one turned out to be a plain old classification bug, and a satisfying one. The router decided a message was a "read this page" request only when it contained a URL and also a reading verb like read or summarize. "What's the figure at this address?" has neither verb, so it fell through to chat. The fix was to make the URL alone sufficient, because if a person pastes an address into a prompt, they want the agent to look at it, whatever word they use. I doubt I'm the only one whose router assumed people would phrase things the way my keyword rules did. They don't, and a pasted address says everything by itself.

Second attempt: I rephrased as "read this and summarize." Now the page got fetched, successfully. The log shows a real result of 559 characters of real content. And the agent told me: "the page came back empty or its content could not be loaded."

It had the content. It said there was no content. That is a different kind of lie from inventing a number, and my money guard was completely blind to it, because no wrong number was being said. A correct fact was being denied.

Guard number two, and the four ways of saying "not found"

So I wrote an evidence-denial guard. If a tool in this task returned a meaningful amount of text, and the answer says things like "the page came back empty," reject the answer and make the model re-read its own observation. The logic of the check was sound: tool returned real data, and answer claims it didn't. It was the how-do-I-detect-the-claim part that was the problem, and I detected it with a list of phrases.

I rebuilt the app, ran the same fixture test, and the model said the page returned a 404 error. A 404. For a page that had come back with 559 characters of perfectly good content. And in the same answer, it gave the right number. It was complaining about a missing page while quoting it.

My phrase list didn't contain "404 error," so the guard didn't fire. I added it. I'm a little embarrassed about how automatically I added it. Third run, new fixture number, 3,891 euros this time. And here is the moment I keep coming back to. In one of its intermediate steps the model wrote, in its own notes, that the information about 3,891 euros was available. It had the right number, in its own handwriting, correctly. Then its final answer said the figure was "not found," using yet another construction, the formal Turkish "bulunmamaktadır," which my list also didn't contain.

So the same false claim, "the data isn't there," had now appeared as: it came back empty, it couldn't be fetched, there was a 404 error, and it is not found in the formal register. Four different ways, in four runs. And Turkish has more. It has "bulunamadı," "bulunmuyor," "yok," "mevcut değil," and every one of them takes endings for tense and politeness and person. I'd already been bitten by this in a previous post, where a safety check recognizing six Turkish words missed the sentence it was written to catch. You'd think I'd learn. I did learn, eventually, but not before spending a few hours adding words to a list. I'd have saved myself that afternoon by remembering how Turkish works, and I suspect any language with rich word endings does the same thing to a list of phrases.

What stopped me was not self-awareness. It was a sentence from the person who has to live with this system, which is me, in a different mood. Earlier in that same session I'd told my coding assistant that the model is going to be using data from the internet, and that when we protect it we must not build something complicated, full of constant patch-like measures. I'd said to be very careful about that. When I'd added the second phrase, the assistant took the warning seriously: it stopped adding phrases, said the phrase-list approach had reached its natural limit, and wrote a plain note that the guard was best-effort and partial and would stay marked that way. Not fixed. Honestly partial. That was the right call, though I'd like to say I made it myself.

The question both guards were really asking

Here is the thing that took me embarrassingly long to see. The money guard and the evidence-denial guard looked like two separate problems. They were one problem wearing two coats. Both of them were asking: where did this claim come from?

A fabricated number is a claim with no source. A fabricated "no data" is a claim about the source that the source contradicts. If I could make the model show me its source, then I wouldn't have to guess which kind of lie I was hunting.

So I replaced both with a contract. Research and report answers must end with a marker. Either the answer carries a quoted sentence taken from what the tools returned, written as a source-quote tag with the sentence inside quotation marks, or, if the data genuinely isn't there, the answer says so explicitly with a tag that says "none." In Turkish the tags are KAYNAK ALINTI, which means source quote, and YOK, which means none.

Then the check is one question: is this quoted sentence really in the text the tools returned in this task? If not, reject. A made-up number can't produce a real quote. A false "the page was empty" can't produce a real quote either. And a model that honestly found nothing has a clean way out, which is to say none, and that's honest rather than punished. That, more than any single guard, is the idea I'd keep from the whole week: I stopped asking the model to be honest and started asking it to show its source, with an honest way out for the times it has none.

I called it the exact-quote citation contract, because that's what it was in my head: you may say what you like, but you have to point at the line. One mechanism instead of a money guard, an evidence-denial guard and a growing pile of phrases. It was also the first thing in that whole week that made me feel like I was building a system and not feeding a pet.

I'll tell you now, because I promised myself honesty in this series, that the contract I just described is not exactly what runs today. The way the check works changed within days, for a reason that cost me eighteen minutes of staring at a spinning agent, and that's a later post. But the idea survived intact, and I think it's the right idea.

The trap with two routers

The first live test of the contract found another bug, and it wasn't in the contract.

I asked the agent to read a page and prepare a report. The contract instruction never showed up. The model just answered in free text as before. I'd put the instruction in the place where search results get handed back to the model, and I'd conditioned it on the task category being research. But my request had been classified as report creation, not research, because the word "report" appeared in it.

And here's the part I should have known. Classification in this codebase isn't one place. There's the classifier file I'd been editing. There's also a block of deterministic early checks at the top of the orchestrator that run before the classifier is ever consulted, and one of those checks sees "report" plus a verb like prepare or write and decides report creation on its own. My instruction condition was reading the result of that earlier layer and I'd only ever looked at the later one. Three layers decide what category a request is, and I'd been holding one of them in my head and assuming it was all of them.

The fix was one line: apply the instruction to research and report creation both. The lesson was to grep for the early deterministic blocks every time I touch classification. I've written that down in the documentation now, in capital letters, which is where I put things I've personally tripped over twice. It's humbling to learn that changing a rule in one classifier means hunting down every other place that quietly classifies too.

Does it actually work on a real page

Fixtures are controlled, and controlled is good for debugging and bad for confidence. So I took the contract to a real, ugly, public web page. I asked the agent to examine the Wikipedia article for the city of Tampere and prepare a report.

The first draft contained a quote that wasn't in the page. The guard fired, rejected it, and sent the model back with a short message that said, in effect, that's invented, copy the actual sentence. The second draft came back with a report whose figures I checked against the raw observation, character by character. The population, 230,537. The founding date, 1 October 1779. Both are in the fetched text exactly as written.

I timed the whole thing because I wanted to know what the guard costs. Classification took about nothing, since it's deterministic. Planning to pick the tool took 86 seconds. The actual internet fetch, the thing I'd been blaming for slowness for months, took 2 seconds. Writing the report, including the rejection and the retry, took 128 seconds. Basically all the time was the model thinking, and the guard added a retry I'd gladly pay for. I was a little startled by how short the network part was. For months I'd assumed the web was the slow part. I'd blamed the network for months. It was two seconds out of roughly three and a half minutes, which is a good reminder to time a suspect before convicting it.

A day later the guard caught something I wouldn't have thought to look for. The model took two different sentences from the page and fused them into a single quote, as if one sentence on the page said both things. It's a very human mistake, the kind you make when you remember an article and "quote" it. The guard rejected it as not a real line of the source, which it wasn't.

Two things I blamed on the model that were my fault

When the agent said "none" on questions where the answer was plainly in the fetched text, my first theory was that the model was being stubborn. After a week of being wrong about models I tried a different theory: the model is reading what I gave it, and I gave it something bad.

The first problem: attention. There's a known behavior where a model, when what it learned in training clashes with what's in front of it, glides past the context. The cheap, training-free trick that the research on this recommends is to ask the question again right before the model answers. I added the original question to the end of the synthesis instruction, as "read the question again," and the exact fixture that had been failing started succeeding. Three runs in a row, all correct, all with real quotes. I want to be careful here and say three runs is three runs. It's evidence, not a proof.

The second problem was embarrassing in a different way. The tool that fetches a web page wrapped the content in a "this is data, not instructions" safety frame but never said which address the content came from. A search result carries its address with each snippet. A fetched page didn't. So the model would find the right sentence, quote it correctly, and then refuse to answer because it couldn't tie that text to the page I'd asked about. It had no evidence in front of it of where the text came from, only its own memory of a tool call several turns back. I'd built a quote contract, demanded precise sourcing from the model, and then withheld the source from it. The fix was one line, a "Source URL" line at the top of every fetched page. A model that refuses to use something sitting right in front of it is sometimes telling you what you failed to give it.

The refusal I decided not to fix

There's one case where the model still says "none" and where I decided to leave it alone, and I want to explain why because I think it's the most important decision in this whole story.

I made a fixture page whose sentence said the valid amount for a particular permit is a certain number of euros per month. It didn't use the phrase "minimum living budget" anywhere. The model said none. When I read its reasoning, it wasn't confused. It said, in its own words, that this information belongs to the entrepreneur visa conditions and not to the minimum subsistence budget.

In real immigration law, those can be different numbers. A program's own fee or investment requirement is not the same thing as the general income requirement. The model was being careful about a distinction that actually exists.

I could have forced it by telling the model that different words can mean the same thing. I tried it once. In one test it fell into a nonsense loop where it graded its own answer PASS and FAIL alternately. I reverted it. And I thought about it for a while afterward and concluded that forcing the match would just move the failure to the opposite direction: a model that confidently merges two genuinely different numbers because I told it that synonyms exist. I'd rather have an agent that says "I couldn't find that" about something that is on the page than one that confidently gives me the wrong number from the right page. I left it, documented it as a known and deliberate behavior, and moved on. Forcing a loose match is a trade, not a fix: you swap a missed answer for a possibly wrong one, and I knew which of the two I could live with.

What I decided not to build

A few ideas I considered and rejected, because the list of things you decline is part of the design.

I didn't build a general "any number must appear in the sources" guard. Models legitimately compute things. If the page says a machine has 16 gigabytes and the answer says half of that is 8, the 8 is correct, and rejecting it would punish good reasoning.

I didn't add a second, smaller model to judge whether each sentence is entailed by the source. It's the textbook approach, and it would double the inference cost of a system whose entire point is that it runs locally on a laptop.

And I didn't switch to forcing structured JSON output, because the internal protocol of the whole system is deliberately not JSON, and I wasn't going to break that rule for one feature.

What I took away

I started the week believing the problem was that the model lies. By the end I thought the problem was that I kept building detectors for the specific lie I'd just seen, and the model had unlimited other lies available. The week's actual progress was not a new guard. It was changing the question from "what's wrong with this answer" to "can you show me where this came from." The first question needs a catalog of lies. The second needs one string comparison.

The bigger thing I took away is about the size of the job. A system this eager to make things up does not become honest because you asked it nicely, and it does not become honest because of one clever check either. Getting a small local model to give accurate, honest answers takes serious engineering, a stack of measures that each cover a different way of going wrong.

Look at what even this one story needed. The router has to send the request to the right kind of task in the first place, and in my codebase that decision lives in three separate layers. The model should only be shown the tools that make sense for that task, because a tool it can see is a tool it might use. A governance layer stops it repeating the same call, spending more than its budget, or wandering through search results long after it has enough. A citation check compares every web address in the answer with the ones it really visited. The quote contract makes it point at the line a claim came from. Every guard that can reject an answer needs a limit on how many times it may reject, or it traps the task in a loop. The correction messages have to be written so they don't throw away the model's memory of the conversation, which on a laptop costs minutes. The page the model reads has to say where it came from. And all of it has to be watched in the real running app, with log lines as proof, because a guard that passes its unit test and never fires in production is decoration.

None of these layers is clever on its own, and none of them is enough on its own. Each one exists because the model found the gap in the previous one. That's what building on a model that fabricates fluently actually looks like: you aren't installing a lie detector, you're building a set of walls and checking, over and over, where the water still gets through. And you never get to say the job is finished. The most I can honestly say is that the gaps I know about are smaller than they were, and that I have a better habit of looking for the ones I don't.

I also took away an uncomfortable fact about my own testing. MT-05 had been green for a while before I opened the log. A test that checks the shape of a conversation, right tools, right turns, remembered context, will happily pass on an invented number. If your test never reads the facts in the answer against the facts in the sources, you're not testing whether your agent is honest. You're testing whether it's coherent. A lie told coherently scores very well.

And the next time you see a green checkmark next to a research task, I'd gently suggest finding one number in the answer and looking for it in the raw text. It takes a minute. It cost me a week.
