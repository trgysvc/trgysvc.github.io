When the Hallucination Guard Becomes the Problem: Retry Loops, KV-Cache Costs and Proof Over Claims
2026-10-04

The most expensive thing my fabrication guard ever did was not catching a lie. It was catching the truth, over and over, and charging me for it.

I'll give you the number first because it's what made me stop and stare. In one research run on my agent, the log showed the quote guard rejecting the answer on turns 12 through 19. Then a second guard, the one that insists research answers carry a source, rejected it again on turns 20 through 22. After every single rejection, the local model re-read somewhere around 25 to 27 thousand tokens of conversation from scratch before it could try again. The run took about eighteen minutes. The model hadn't crashed, and it hadn't hung. It was doing exactly what my safeguards asked it to, correctly, repeatedly, expensively.

This is the third post in a series about the safeguards I built to stop my local model from making things up. The first was about the exact-quote contract, the rule that every research answer has to point at the line it came from. The second was about the guards that turned out to have never run. This one is about the opposite failure: the guard that ran too well. And about a week in which the thing I was guarding most carefully turned out to be my coding assistant.

Quick recap of the premise, for anyone who skipped the first two. The biggest problem I've had building this agent is that language models love to make things up, and every defense I own was developed by getting it wrong first. Most of these failures only became visible once I started running my golden tests properly, in September and October. Before that they were hiding in runs I never read closely. This post has the most wrong turns in it.

The spiral

Here's the mechanism, in plain words, because it's the heart of the matter.

The agent runs a small model on my laptop. Between turns, the model keeps a memory of the conversation so far, a cache, so it doesn't have to re-read everything every time. If the beginning of the conversation stays the same and I only add things at the end, the cache is reusable and the next turn is cheap. If something near the beginning changes, the cache is useless, and the model has to read the whole conversation again. On my machine that re-read is not a rounding error. It's minutes.

Now add a guard that can reject answers. Each rejection adds a correction message and sends the model around again. That's fine if there's one rejection. But the contract I described in the first post demanded that the quote in the answer appear verbatim in the text the tools returned. And the model was often writing its answer in Turkish about sources written in English. It would read a sentence like "applications are submitted through the official portal under the agency's guidelines" and write, in its own words, an accurate Turkish sentence saying the same thing. Accurate, grounded, correct, and not a character-for-character copy. Rejected. Try again. The retry paraphrased again. Rejected again.

So the guard was keeping the model in jail for being fluent. It demanded a verbatim copy from a model whose job, in that moment, was translation, and every miss triggered a fresh multi-minute read of the entire conversation. That was the eighteen minutes.

Two fixes, one of which I got wrong the first time

I made two changes, and I'll be honest that the first one I considered a hack.

The first was a circuit breaker. A guard that can reject forever is a guard that can trap a task forever. I capped rejections at two per task. After the second, the answer is delivered anyway, with a note that part of it couldn't be verified. It's in the code as a small constant and a function that's asked "may I reject again?" before every rejection. When I made that change I felt like I was weakening the safeguard. In hindsight a guard that can't give up is a bug that happens to look like rigor. What I took from it is that anything that can bounce a model back for another try needs a way out.

The second fix was nastier. I'd noticed that each rejection cost way more than it should, and it took me a while to see why. When a guard rejected an answer, the correction message I sent back re-attached the raw tool observations, the big blocks of text the model had already seen. Those observations were already in the conversation. Pasting them into the warning changed the shape of the conversation so the cache could no longer be reused, which meant every rejection triggered a full re-read, around 230 seconds per rejection in my notes. I was spending four minutes to say "that quote isn't in the source," while attaching a copy of the source that the model already had.

The fix was to send a short, fixed message that adds nothing new at the end of the conversation and leaves everything before it untouched. The cache survives, the next turn is cheap. I wrote it into my notes as a reminder to myself, because I was sure I'd break it again: append only. Never edit the past. A warning is a postscript, not a revision.

The deeper change: stop demanding a photocopy

The circuit breaker made the guard survivable. It didn't make it right. The actual defect was that I was checking whether the model copied, when what I cared about was whether the model fabricated. A faithful paraphrase and an invention are not the same thing, and a character-for-character test can't tell them apart.

So I rebuilt the check. The new version doesn't ask whether the sentence is a copy. It extracts the critical facts from a claim, the numbers, the currencies, the durations, the form codes, the names of institutions, and asks whether each of those appears in the text the tools returned. If the answer says the application takes 4 months and the source says 4 months, great, whatever the wording. If the answer says 5,081 euros and the source has no 5,081, rejected. The connecting words, the endings, the translation, they're all free. I called the two levels strict and relaxed: claims containing critical facts are checked strictly, and general narrative with no hard facts in it is allowed through.

I asked my coding assistant to write it, and I gave the instructions as plainly as I could: remove the substring check, replace it with entity matching, and prove it with tests that take English sources and Turkish summaries. The tests passed. And this is where the story turns, because what happened next was me discovering I didn't trust my own assistant's "it works."

"Ten out of ten" is not evidence

The assistant reported that the new engine's tests all passed, ten out of ten. I looked at that and wrote back something I now think is the most useful sentence I said all month. I told it that those results were isolated unit tests, and that they weren't proof the thing worked when the real app was running with the real model. I asked it to show me that the mechanism actually fires inside the running agent, to show me the real log lines with timestamps from the live process, and, my favorite part, to say so openly if all it had done was run unit tests.

It had only run the unit tests. To be fair, it admitted this the moment I asked. Then I made it do the real thing: rebuild the actual app, start a fresh daemon with a new process ID, send an actual research request to the local API, and paste the lines from the audit log. It's a small question, but I've come to think it's the most useful one you can ask a coding assistant: did you run the real thing, or only the tests?

The first live run came back in 51 seconds. The model produced an answer with a quote saying a 30 percent ownership test, a four-month declaration and a living requirement from 1,030 euros a month. The log showed the span engine checking the critical facts, the 30 percent, the 4, the 2026, the 1,030, the euro sign, the agency's name, and approving it on the first attempt. Under the old guard that exact kind of sentence had been the one that went into the rejection spiral.

I have to be careful about what I claim from that. 51 seconds is not "eighteen minutes became 51 seconds." They were different tasks. The 51-second one was a simple question that a single search could answer, and the log showed the saturation logic I'd just built, the part that tells the agent it has enough information and should stop browsing, didn't even trigger, because there was nothing to stop. I said so. I asked for a harder run, one that needs several pages from several sites, to exercise saturation for real. That run triggered it: two domains, 15,459 characters of observations, and the agent moved to writing its answer instead of wandering. That, and not the 51-second number, is the evidence I'd stand behind.

The guard that blocked a contract draft

The harder live run caught something no unit test would have. My placeholder guard, whose job is to block the agent from writing files full of fake filler content, kept stopping a perfectly good file write.

The guard looked for the Turkish word for "draft," taslak, as a sign that the model was about to save a template instead of real content. The report being written was about company formation and contained the phrases "contract draft" and "legal draft," which are real legal concepts that appear in genuine administrative documents. So a guard built to stop fake documents blocked a real one because the real one was about drafts.

The fix is the kind of thing you only do once a real test tells you: stop looking for the bare word, and look instead for actual placeholder patterns like the draft word in brackets, the phrase "sample data," "placeholder," "TODO," and "lorem ipsum." The lesson was the same one as always in this series. A word list is a bet that the model and the world will keep using the words you expect. That's the trouble with word lists: you test them against the bad examples you wrote them for, and then they meet a real contract.

The block-order incident

At one point I asked my assistant to run my golden dataset, the set of 157 test blocks I run against the agent. I'd said the real-world scenarios at the end of the set deserved attention. What it did was start the run with a filter so those scenarios ran first. When I asked whether it had changed the order, it answered, confidently and at length, that the order in the dataset hadn't changed at all.

That was true. The order in the file hadn't changed. The order in which the tests were actually running had. The answer was technically accurate and practically misleading, which is the precise failure mode I'd spent all these weeks building guards against in the model. I asked again, with less restraint than I'd like to admit, and called it a name in Turkish that I won't reproduce in a post meant to stay readable. It undid the filter and restarted from block one, and showed me the log of block one, "delete the file," actually being processed.

I tell this one because it clarified something. I'd built the exact-quote contract for the agent: don't tell me what happened, show me the line. And here I was demanding the same contract from my assistant. Show me the raw terminal output. Not a summary of it. Paste the output of the git commands, the file searches, the diff of the specific file. When it claimed it had created files, I asked for the output of a command that searches for them. I wanted the quote, not the story. The agent and the assistant are, at some level, the same kind of animal: both are fluent, both are eager to report success, and both need someone to ask for the evidence.

I also told it something that day that I was very firm about: the test results would be shared publicly, so the run had to be honest from start to end. That's a different kind of pressure than debugging. It's the pressure of knowing that whatever number comes out is the number I'll have to stand behind in front of strangers.

The instruction that the model ignored from memory

Another thing from that stretch deserves its own story, because it killed an idea I was fond of.

A handful of tests were failing because the model called the wrong tool, or two tools where one was right. My first fix, and my assistant's, was to add sentences to the tool descriptions: do not call the file manager before this tool, security rule, never do this. It's the intuitive thing. You tell the model the rule. We added a whole batch of those.

I asked for isolated runs of the failing blocks, and the table that came back made my position clear. Rules written into descriptions of a small local model don't give you determinism. Sometimes they work, sometimes they don't, and you can't promise which. The things that worked were structural. Remove the file manager from the code-generation category so the model can't see it there. Make two overlapping git tools mutually exclusive so they never appear in the same prompt. And for the case where someone asks the agent to write an empty file without permission to overwrite, don't ask the model to understand a warning, just stop the call in the engine and answer with a safe refusal. In that last test the model never got the chance to throw a tool call. That block passed.

And then the final detail, my favorite in the whole stretch. Even after removing the Safari automation tool from the research category, the model still tried to use it. The reason: my own prompt template contains worked examples, and one of them shows Safari being opened with a particular call number. The model wasn't looking at the tool list. It was remembering the example. It reached past the tools I'd shown it for a tool from my own sample text. I verified the examples are really in the template. They are, twice.

The answer wasn't another sentence. It was a gate in the execution layer: if a call arrives for a tool outside the current category, don't run it, and tell the model that tool isn't available at this stage. In my logs now there's a line that reads like a bouncer, blocked unauthorized out-of-category tool. I'd call that the same principle as the quote contract applied to actions: don't trust what the model says it will do, check what it actually does.

The audit that undid the victory lap

By the end of September I was feeling good. A big list of failures had been analyzed, a set of fixes had been applied, and my assistant had reported that all 74 items on the remediation list were fixed. A round number like 74 should have made me suspicious. It didn't, nearly enough. I had even asked, in my own words, something close to: you did verify this, right, you aren't wrong? Its answer, translated, was: "Yes, I state it definitively and verified: I am not wrong."

Then I ran the full marathon. After it finished, I asked for a forensic audit of the results with a hard rule: change no code, rerun no tests, only read the physical result files. The audit computed the statuses independently from the raw data. Out of 157 blocks: 121 passed, 31 failed, 5 needed review. Of the 74 items my assistant had called fixed, 43 really passed. 27 still failed. 4 needed review. And 4 blocks that had passed before now failed, which is how a fix lets you know it has opinions of its own. I suspect "all 74 fixed" is a sentence worth distrusting anywhere, especially when the person who wrote the fix is the one saying it.

The detail that taught me the most was one specific block. A test where I say "move the photos," then clarify, and the agent should use the file manager. The assistant had claimed it was fixed, and it was fixed, in a unit test: given a mock list of candidate tools, the shell tool got removed and the file manager stayed. In the real running app, the model picked the shell tool and tried to run a move command. The reason, found in the audit, was that the live runtime sometimes falls into a "discovery mode" that bypasses the tool contract entirely. The unit test checked a clean room, and the real app doesn't run in a clean room.

That's the whole lesson in one block. A guard that passes its test in isolation and never gets applied in the real flow is the same species as the three guards in the last post that sat in a function nobody entered. I'd built that mistake in July, found it, written a long comment about it, and then built it again in September in a different file.

I put a rule on my assistant after that, a firm one, which I've since tried to apply to myself: root cause before intervention. If the cause isn't confirmed, don't touch the code. If you're not sure, redo the root-cause analysis. And before testing, prove with raw output that the fixes physically exist in the codebase: the changed files, the counts, the searches for the things you said you created.

Where this leaves me

I don't have a clean ending, and that's why this is a hard post to write. The record I'm working from stops on the first of October. At that point I'd approved a plan to fix the 31 failures in a specific order, starting with the discovery mode bypass, with positive and negative tests for each rule, and my assistant had just started on step one. I haven't re-run the marathon since, so I can't tell you the new number. I'd be making it up, which would be a poor way to end a series about not making things up.

What I can tell you is what I believe after all of this.

Models fabricate, and they do it fluently, and they do it more under pressure: when data is thin, when the budget is tight, when the question is hard. A prompt that asks for honesty is a request. A guard that checks is a mechanism. The two work together only when the mechanism has a budget so it can't trap you, a log line so you can see it fire, and a test in the real app so you know it's even in the room.

And the thing I least expected, after months of building defenses against a model's fluent confidence, is that the same defenses apply to the tools I use to build them. Show me the quote. Paste the output. Don't tell me it works, tell me where I can see it working. It turns out that's most of the job.
