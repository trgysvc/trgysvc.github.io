Anti-Hallucination Guards That Never Ran: Auditing the Safeguards of a Local AI Agent
2026-10-04

On the second of October I asked my coding assistant a simple question. I asked it to list the security measures in my agent. Everything we'd built over the months: the grounding guards, the exact-quote citation contract, the tool governance layer, all of it. I wanted a list. I got an audit, and the audit's first finding was that the list I'd been carrying around in my head was partly fiction.

I should be upfront about my mood, because it's part of the story. I was annoyed. I had asked for a list. What came back was a seven-thousand-line source file read from top to bottom, a pile of tests run, a sandbox probed, and a document full of findings I hadn't asked for. I told it, not gently, that it had expanded the job beyond what I wanted. I stand by that. If I ask for a list, I want a list.

But here's the awkward part: the unrequested audit was right. Everything I'm about to tell you came out of that reading, and I've since checked the key parts myself. So this post is half apology to a piece of software, and half a catalog of how I built safeguards that did nothing without noticing. My own wiki swore they worked. My own wiki, it turns out, is a very confident liar.

The problem underneath all of this

Before the specifics, the premise. PheronAgent runs a small local model. Small models fabricate. They don't do it maliciously. They do it because, when the facts they need are missing or fragmentary, producing something fluent and plausible is what the machinery is built to do. Every safeguard in this post exists because that tendency cost me something real, and every one of them got built the same way: the model did something wrong, I noticed late, I wrote a guard, and the guard turned out to be wrong too. I developed my defenses by making mistakes, over and over, and this post is mostly about the mistakes in the defenses themselves.

July 23: the version number that didn't exist

The oldest story starts with a question so simple I was embarrassed it failed. I asked the agent what the latest version of MLX Swift is. MLX Swift is the library my agent's model runs on, so I knew the answer cold. My own project's package file said 0.31.3, and a rebuild earlier that day had pulled 0.31.6. The agent said 0.2.0.

That's not a close miss. It's a number from a different era of the library, or from no era at all. I went through the search results the model had received, and none of the snippets contained a version number of any kind. The search wasn't returning wrong data. It was returning no data, and the model filled the hole from its training, confidently. The honest answer was "I couldn't find it" and the model had no appetite for that sentence.

We did the thing everyone does first, which is add a line to the prompt telling the model not to guess version numbers. I asked again. This time it said 0.1.4, a fresh invention. It had even found a real GitHub releases page in the results and ignored it. So the prompt line had accomplished one thing: it changed which wrong number I got.

That's when I wrote the first proper guard, which I called the version grounding guard. After the model writes its answer, code checks every version-shaped number in the text against the text the tools returned. If the answer contains a version that appears nowhere in the observations, the answer is bounced. No model involved in the check. Plain text comparison.

I rebuilt, asked again, and the model gave the right answer for the wrong reason: it said the version wasn't stated in the results. Perfect, except the guard had nothing to catch, so I couldn't tell whether it worked. I checked the log for the guard's message. Zero times. The only honest conclusion, and to its credit my assistant wrote it down straight away, was that I could not claim the guard worked. I could only claim the model had behaved that time.

Then I ran the same question a few more times to force the issue, and got a little parade of failures with different faces. One answer said 0.32.0. That's a real number, from a real project, and it appeared in the search results, so my guard waved it through. But it was the version of the main MLX project, not MLX Swift. The model had mixed up two sibling libraries, and my guard, which only asks "is this number present anywhere," had no way to notice. Another answer said no version was found. And a third answer was the best one: the model announced that its search results had been blocked by a bot-protection page.

It was right. When I went and looked, the search engine I was using as the first fallback was returning a CAPTCHA page. And my code was feeding that to the model as if it were search results, because the CAPTCHA page was 4,704 characters long, and my logic said "if the first search source returns more than 1,500 characters, that's enough content, no need to try the second source." The model received, as its research, a short text that said please complete the following challenge and select all squares containing a duck.

Let that sink in. During that session, at least, my agent was doing its research by reading a robot test. It did not pass, which for an agent is arguably the honest result. And some of its confident wrong answers weren't even the model's fault, in the sense I'd assumed. It had nothing to read, and I had labeled the nothing "search results." I fixed the detection so a challenge page no longer counts as content, the model got real results, and the version came back right. Handing the model reality outperformed every clever guard I'd written.

The same afternoon: a made-up web address

The second story is from the same day. I asked the agent what the notable new things in the latest Swift were. The answer ended with a line that said the source was a page on Apple's developer site with "wwdc26" in the path. It looked entirely plausible. It was also not a page the agent had ever seen. It appeared nowhere in the results. The answer included a sentence about a feature supposedly making error handling "AI-powered," which is not a thing.

The cause was ordinary. The search returned 14,882 characters, and the pipeline trimmed that to 2,487 before handing it to the model. The model, working from a trimmed fragment, filled the gaps from memory, and that included inventing the address it claimed as its source.

I wrote the citation grounding guard to match: every address in an answer must match an address the agent really saw during the task, with some tolerance for trivial differences like a trailing slash or a "www." That's the guard I mentioned in the previous post as the one that checks URLs and nothing else. It's a good guard. It works, and it still fires. In the audit logs on my machine it shows up 3 times.

The discovery that should have been a warning

Here's the part that matters for the rest of this post. While testing the citation guard, I noticed that it wasn't firing. The wwdc26 answer sailed through even after I'd written the guard. I dug in and found that the three guards I'd written that week, the date guard, the version guard and the citation guard, lived in a function called handleReporting. That's the function that runs when the agent finishes using several tools and writes up the result. And for a task that uses one tool, a single search and then a prose answer, the agent never goes through that function. It goes planning, executing, reviewing, completed, and the final answer text gets produced in a different place.

All three guards had been sitting in a room that single-search tasks never entered. They'd been dead on arrival for the most common kind of research question. I moved copies of them to the place where the final answer is really produced, left a long comment explaining exactly this, and wrote in my notes, with some satisfaction, that I'd found and fixed a guard that never ran. A guard that never ran, repaired. A very tidy little victory.

I keep that comment in the code on purpose. It's a monument to a mistake I thought I'd fixed. Keep reading, because I hadn't.

October 2: reading seven thousand lines

When my assistant read the whole orchestrator file for the audit, it found two things about those very guards.

The first is about that old function. The state the function handles is called "reporting." Nothing in the code ever sets the agent into that state. The word appears in a switch statement that handles it, and in comments, and in a log message, and nowhere does anything assign it. So the copies of the guards I'd left behind in handleReporting "as defense in depth," as my own comment put it, aren't a second line of defense. They're furniture.

I checked this myself. I searched the file for every occurrence of that state. The only places are the switch case at line 1685, a log message and a comment. Nobody enters it.

The second finding is the one that stung. The copies I'd moved to the real code path, the ones that were supposed to be the working version, begin with a condition: only run if there are observations from the current turn. And at the start of every planning turn, the code wipes the current turn's observations clean. The final answer is written on a later planning turn than the one that did the tool call. So by the time the answer exists, the list the guards are checking is empty, and the guards skip themselves.

The guards I'd fixed, after discovering that they never ran, still never ran. For a different reason, at the exact place I'd moved them to. I had carried the furniture from one empty room into another and felt very accomplished about it. I'd moved a guard and called it fixed, when what I should have waited for was a log line proving it had ever run.

I wanted proof beyond reading code, because reading code has misled me before. So I counted how often each guard has fired in the audit logs on this machine. The numbers: the date guard, zero. The version guard, zero. The quote grounding guard, 38. The span grounding engine, 148. The citation guard, 3. Those logs only cover a recent window, a day or two of heavy test runs, so this isn't a lifetime record. But a guard that doesn't fire once across a window that produced 38 quote rejections is either so well trained against that the model never gets it wrong, or asleep. After the day I'd had, I knew which way to bet.

I'll be careful about the claim. I haven't built a test that deliberately triggers the date or version guard to watch it stay silent. My evidence is what the code says and what the logs show, and I think that's strong, but it's not the same as forcing a failure. As I write this, I haven't changed any of the code. I wanted the evidence in hand before I touch anything.

The documentation lied too

This is where it gets personal. I keep a wiki page about my anti-fabrication system, and I'd had the assistant list the safeguards from that page first. The wiki said the exact-quote contract works by checking that the quoted sentence is a character-for-character substring of the observations. It said a missing quote marker gets the answer rejected, and it called that out as a critical design decision. It said the date and version guards were proven.

The code disagreed with all three, and in a way that makes the history awkward. The substring check had been replaced by something called the span grounding engine. Instead of requiring a verbatim match, it extracts the "critical entities" from a claim, meaning numbers, currencies, durations, form codes and known institution names, and checks each one appears somewhere in the observations. I'll tell the story of why I changed that in the next post. For now the point is that my own documentation still described the older mechanism.

About the missing marker: there's a function that extracts a single quote marker, with a lovely doc comment explaining that a missing marker is treated exactly like a fabricated one. Nobody calls that function. I searched. What the guard really uses is a plural version that extracts all the markers, and it takes whatever it finds. If the model writes no marker at all, nothing is rejected on that basis. The comment above the function promises a behavior that the program never performs. A comment is only a promise, and nothing checks promises except someone going looking.

I'd call that the most human bug in this whole post. Not a logic error. A confident sentence in a comment that nothing in the code had earned.

How the new check actually behaves, and where it is weak

For fairness, here's what the working mechanism really does, because it's better than nothing and worse than I'd have said a week ago.

It collects the quotes the model wrote, then looks through the answer and picks, at most, one line that contains critical entities and one line that contains none. It checks the entity line strictly: every number, currency, duration, code and institution in it has to be found in the observations. The line without entities is waved through as narrative. That's the whole "tiered" design.

Two weaknesses fall straight out of that. The first is that the corpus is treated as a bag of numbers. If the answer says a fee is 1,779 euros, and the number 1,779 appears anywhere in the text the tools returned, for example as a year in a history section of the page, the claim is considered grounded. Context is ignored. A real number in the wrong place passes. Every check has a blind spot, and the useful thing is to find yours before someone else does.

The second is that a made-up sentence containing no numbers, no codes, no institutions, passes as narrative. "The application is free of charge" has none of those entities. It sails through, whatever the page says. These aren't theoretical. They're direct consequences of a design I chose, for good reasons, and good reasons turn out not to cover everything.

The graveyard

The audit found a graveyard too. A list of classes that were written, sometimes with tests and documentation, and are never called from anywhere. An encrypted audit logger, which the first list my assistant gave me proudly included, and which does not exist in practice: the real log is plain text. A file-operation constraint class, written on September 30 during a remediation push, with its own tests, that nothing in the agent invokes. A trust-score system left from an early design. A request field that carries a sensitivity level and is never read.

When I then asked the assistant to dig into why each of these existed, it came back with a more nuanced answer: several of the things it had counted as dead security code were never security to begin with. One was a brief-mode output shortener. Another was a stability check for the model runtime. The assistant had over-counted, and I told it to stop investigating, because that digression was pure scope creep. I'm mentioning it because honesty cuts both ways: my audit had errors of its own. Even the person finding the mistakes made some.

What I think I learned

A safeguard is a claim about the system's behavior. Like any claim it needs evidence, and the evidence for a guard isn't a unit test that passes, or a comment that explains it. It's a line in a log from a real run in which it did its job. A guard with zero firings isn't a success metric. I read my zero as success for months.

Documentation written by the same person, and sometimes the same assistant, who wrote the code is a witness with a motive. My wiki described what I intended. The code did something else. I'd update the page right after the original change, and then the next change would move underneath it without anyone going back.

And moving a guard to fix one problem doesn't prove it works. I'd made the original discovery right: it wasn't running. I'd just stopped one step too early, at "I moved it" instead of "I watched it fire."

My plan, now that I've finished being annoyed, is not to fix these on instinct. It's to build a canary for each guard: a deliberately fabricated answer that should be rejected, run through the real agent, with the log line as proof. Then I'll know whether each one wakes up. I'll report back on how many do.
