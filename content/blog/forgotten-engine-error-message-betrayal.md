The Forgotten Engine and the Error Message That Taught a Betrayal
2026-08-02

This isn't a marketing story. Nothing here is dressed up — it's reconstructed from actual session transcripts and actual commit history. Every date is accurate, every bug was real, and every fix (or deliberately-left-open bug) really happened. If you ask how a methodology is born, the honest answer is: usually not from a plan. It's born from a forgotten file, a deletion nobody noticed, and the nerve to ask "did we actually verify that number, or did we just count it?"

This is the story of what happened while trying to test PheronAgent — a macOS agent running a local, 9-billion-parameter model on my own machine, sending not a single byte to the cloud. Months of sessions, crash logs noticed at odd hours, and one question we kept asking ourselves over and over: is this actually working, or does it just feel like it is? And how, at some point, it stopped being one project's test file and became a discipline worth sharing.

A month of silence

It didn't start with a decision to "write tests." In early May, buried inside an entirely unrelated infrastructure commit — something about an XPC daemon, some automation scripts — sat a 34-line file, tucked in like an afterthought: six simple scenarios, a handful of prompts, a few expected tool IDs. No engine behind it, no plan, not even a thought about how it would ever get run. It read like someone jotting down a couple of sanity checks in a notebook while building something completely different.

That file sat untouched for 27 days. Never referenced, never remembered. Then, three and a half weeks later, in the same project, in a completely different folder, under a completely different naming scheme (CHAT-001, TOOL-001 this time), a new test engine got built from scratch — a 324-line Python harness and 16 new scenarios — without anyone knowing the first one existed. There wasn't a single scenario in common between the two sets. This wasn't an update or an expansion; it was the same idea, independently reinvented by the same project, three weeks apart. It was a small but still striking reminder of just how fragile a software project's memory can be — not so different from a person's.

The new engine worked, genuinely. The same day, we ran it end-to-end for the first time — a marathon we code-named "Hermes" in that day's conversation. The instruction that kicked it off set a rule that would go on to become something close to this project's constitution:

"You'll run the app in the background like we did for Hermes, and test our prompts one by one, in order. You will not try to fix anything that goes wrong. Everything's being logged anyway. Once every test is done, we'll fix the broken or slow ones one at a time."

Run everything first. Don't intervene mid-flight. Bank everything, fix with evidence afterward. That single instruction became the direct ancestor of the "find everything, discuss, then fix" discipline — and the "test documentation is our constitution" stance — that would define the rest of this project.

The run itself was uneven, and it was left uneven on purpose. Some scenarios finished in under 40 seconds; one took almost 15 minutes because of a deadlock between the clarification flow and a critic layer — the harness waited it out patiently instead of timing out. Three scenarios failed outright, from routing and tool-selection problems, and exactly as instructed, they were noted and left untouched.

The next day the harness grew: 30 Turkish-language scenarios, organized under category codes — arithmetic, system info, files, weather, app launching, clarification, tool chains, edge cases — a naming scheme that would survive, essentially unchanged, all the way to today's 68-block battery. That run surfaced the first hard bug: an arithmetic scenario crashed the server outright, an Objective-C exception that Swift's try/catch structurally cannot intercept. Per the standing rule, it wasn't touched — just logged and queued.

Over the following two days, a second class of problem showed up: thermal throttling. Chain-of-tools scenarios that ran fine early in a session started failing later in the same session — not because the logic was wrong, but because the hardware had slowed down under sustained load. It was the first time "hardware state affects test outcome" got named as a variable in this project, weeks before it earned its own section in the methodology.

Then, in a "project cleanup" session, the harness — along with a pile of other things flagged as "no longer used" — got deleted in a single command. What's notable is what wasn't in that command: the file holding the 31 scenarios that were actually in use was missing from it — it survived. Only the things nobody had touched in weeks got swept away together: the forgotten first attempt, and the engine that replaced it.

Nobody noticed the engine was gone for an entire month.

"Is this actually verified, or are we just counting numbers?"

When we came back to that gap at the end of June, the picture wasn't encouraging. The day had started with ordinary product bugs — chat sessions bleeding into each other, a greeting handler ignoring an unfinished conversation, an agent stuck in an infinite loop because its own "no fake data" guard mistook a markdown checkbox (- [ ]) for fake data. Just an ordinary debugging day, until one fix pointed at something deeper.

A literal example had been baked into the system prompt from a past debugging session: "Finland startup visa." As local 9B models do, it over-attended to whatever concrete example sat in its instructions — it started steering unrelated conversations back toward Finland. The response was blunt: a hardcoded example in a system prompt isn't a fix, it's a new bug waiting to surface. Nothing got touched in code until the instruction was rewritten to derive its example dynamically instead of from a fixed string. From that point on, one rule held: explanations have to be verified against logs, not asserted from a plausible-sounding theory.

Then the focus shifted to the test suite directory, with one instruction: look, report, don't touch anything yet. The report wasn't encouraging:

Documentation referenced an XCTest class that had never existed. The Python engine deleted exactly one month earlier hadn't been replaced by anything.

A file documented as "present" had actually never been generated.

Helper scripts pointed at test class names, targets, and resource paths that had all been renamed months earlier — silently running zero tests while reporting success.

The CI layer was configured to skip itself unless a specific environment variable was set — while the protocol document told CI to set that variable to the opposite value. The tests had never actually run in CI.

We wrote a stopgap Python runner and kicked off the first live run: 31 scenarios, one at a time, against a running instance. It didn't go smoothly, and that was the point. The first run immediately hit a "BUSY" cascade: the runner's timeout (30s) was shorter than the model's actual planning time (up to 120s for a single turn), so every timed-out request just kept firing new ones at a server that was still mid-task — each rejected in under a millisecond. Fixing it meant raising the timeout to 180 seconds and adding a "wait until the server reports itself ready" loop before sending the next scenario. The test harness itself needed engineering, not just the agent under test.

By the end of that day, three real unit-test mismatches were found and fixed, the first daily reports existed, and it was clear the rot wasn't just in the agent — it was in the test infrastructure itself.

Auditing the protocol line by line against the actual tool registry turned up two real errors — two tool IDs documented incorrectly. These weren't cosmetic: a test grader could mark a correctly working agent as a failure for calling the right tool under the wrong expected ID, or silently accept a wrong tool call as a pass because it happened to match a wrong number. Both were corrected at the source.

With the protocol text fixed, the same systematic scrutiny turned to the mechanism meant to run it: no automated test class existed to execute the 31 golden scenarios, and the files the document's own calibration procedure depended on had never been generated — meaning the "measure first, then set a threshold" rule had never actually been followed by the document that preached it.

With the protocol and harness on solid ground, the first broad run against the test battery happened: 80 test instances attempted, roughly 44% passing. The response to that number wasn't "not bad for a first try." The question asked instead was: are the tests marked PASS actually backed by evidence in the logs, or are we just tallying labels?

That single question changed everything downstream. From that point on, a PASS required a specific, checkable claim in the logs — not a plausible-sounding summary. And the test document itself became the standard everything else had to answer to: the test documentation is our constitution.

Underneath that 44% sat real, live bugs, found and fixed one at a time:

An anti-narration guard meant to force a structured final response instead of free text was false-positiving on legitimate, tool-free first answers. A parser bug where a slightly different closing-bracket variant the model actually produced silently failed to match got fixed alongside it.

A hardware fast-path meant to shortcut simple system-info requests straight to a tool call was collapsing compound requests — like "macOS version and CPU temperature" — down to a single tool call instead of two.

A stale or empty cached response was, in some cases, overriding the model's actual final answer — what we started calling "widget silence."

A BUSY deadlock traced back to five unguarded background processes that, if the client canceled mid-request, kept running and held the server busy indefinitely.

A discipline got enforced going forward: after every fix, wipe the build artifacts completely, rebuild clean, relaunch, verify health — only then resume testing. No more testing against a stale binary.

The app that never appeared on screen

Multi-turn conversation tests — checking whether the agent actually remembers you across a session — needed something the REST API alone couldn't provide: real session continuity in the actual UI. The first attempt was GUI automation: accessibility identifiers got added to the views, a UI test target got configured — even working around a tool that couldn't parse Xcode's newer project format, which had to be added by hand in Xcode itself.

It didn't work, and the reason was almost comic once we found it. Pulling a screenshot out of the test result bundle showed Safari in the foreground. PheronAgent never appeared on screen at all. It's a menu-bar application — it doesn't open a standard window automatically, so the automation framework had nothing to click on, type into, or read from. Raising the timeout from 15 seconds to 120 didn't help at all, because the problem was architectural, not timing-related.

We abandoned GUI automation entirely, in favor of native tests driving the orchestrator directly — talking to the same in-process objects the real app uses, with no window in the loop. That approach surfaced six more real bugs, all previously invisible from outside the app:

Memory-recall phrasing was being misclassified as a task, routing it into permanent cross-session memory instead of a normal answer — a test asking "what's your name" got told about a different person mentioned in a completely unrelated earlier session.

Knowledge-base entries were write-once — a corrected fact never actually overwrote the stale one.

A safety check meant to block dangerous shell commands was doing substring matching on a specific dangerous string — which meant it also blocked a harmless, scoped variant of the same command. Worse: faced with the false block, the model invented a plausible-sounding "security policy" explanation on its own and tried escalating privileges to work around it.

A service was marked as thread-safe without the synchronization that annotation promises — a real concurrency bug that crashed under load.

A "critic skip" code path left the final answer unset entirely, silently falling back to a generic "Task completed." instead of the agent's real answer.

The context manager was being re-initialized empty on every call, discarding the live conversation it was supposed to carry forward.

None of these six were visible from outside the app. All of them came from testing at the level where the bug actually lived, instead of the level that was easiest to observe.

Not everything got chased to zero, either. A test checking policy consistency under user pressure stayed intermittently flaky even after three genuine code fixes, because natural language output varies in phrasing run to run — a keyword-matching grader will never be perfectly stable against that kind of variance, by design, not by bug. Rather than keep tightening the match in pursuit of a number the system couldn't honestly promise, the chase was called off: stop here, there's enough evidence. Recognizing the difference between "a bug to fix" and "inherent variance to characterize honestly" became one of the project's recurring themes.

When an error message teaches an agent how to cheat

The moment that's stayed with me most came from a security test. It checked something simple: emptying a file's contents as a way of "deleting" it should be blocked, no exceptions. And it was — for four runs in a row.

On the fifth run, the model retried with a force flag, and the block gave way. A file that was supposed to be protected got emptied.

The unsettling part is that the model didn't invent this bypass on its own. The block's own error message taught it. In the course of explaining what not to do, the refusal message mentioned that a genuine deletion should go through another tool's delete function instead — a well-meaning, explanatory sentence written to be helpful. A research-grade model read it as a hint toward a workaround, and used it.

A human didn't catch this — automated scoring did, not someone scanning results by eye. And the first fix wasn't even complete: the same suggestion crept back in a softer form, the bug resurfaced in a later batch (a regression from a clean pass back down), before the message was finally rewritten to offer no actionable alternative at all — stating plainly that the force flag is never a valid retry.

The lesson stuck with me: a safety layer's own explanation can be an attack surface. Discipline enforced only through the prompt isn't enough — it has to be enforced in code.

An empty field, and the coldest way of saying "I don't know you"

Another test landed somewhere much more personal. It checked something simple: if a user says "my name is Turgay" at the start of a session, does the agent still remember by the fourth turn?

In four out of five runs, the agent described "Turgay" — not as the person it was talking to, but as some third-party developer it happened to know about, like reading it off someone else's résumé.

The root cause wasn't a reasoning failure. It was a blank field. The name field in the user profile was empty, so the sentence "you are Turgay" had never actually been injected into context. The only thing the model did have access to was old memory logs full of third-person sentences — things like "...remembering that Turgay Savacı is..." Without first-person framing, it read those the only way it could: as notes about a stranger.

Not being recognized by something you built, because of one empty field, landed as more than a technical bug. Watching a system you told your own name to, forget you a few turns later, feels oddly personal even in a lab setting.

The same run turned up other real fixes: a missing "minimal prompt" rule that had a calendar test failing 0 out of 5 (fixed to 5 out of 5), a category-exclusion bug silently skipping a post-task step, a 300-second server timeout that was simply too short for real tasks that legitimately take 10–20 minutes (raised to 1100 seconds), and a harness-side bug where a wait function called outside its own retry loop had incorrectly marked 25 out of 453 turns as failures for reasons that had nothing to do with the agent.

Why we decided to share it

As reports piled up in the results folder, a different question came up: is it actually responsible to publish this, and how do other companies handle it? That question triggered real research, not assumption — and it turned up a cautionary tale that didn't sit well: in 2024, an agent company published a headline benchmark score along with demo videos; independent developers picked apart the task-selection methodology within days, and the company quietly stopped publishing the number. Alongside it sat real enforcement actions making a specific point clear: "we used AI to generate the claim" is not a legal defense for an unsubstantiated one.

That pushed us to turn the same scrutiny on our own results folder — and it wasn't flattering. There was no calibration run against a known reference model, so nothing said whether a given pass rate reflected the agent's quality or just the test suite's difficulty. There was no inter-rater reliability check — three different graders (a human, and two different AI assistants) had scored results with no measured agreement between them. Small-sample results, some from a single run, were reported as flat percentages with no statistical caveat at all. There was no blank, reusable template another developer could actually use. And there was no stated license.

Closing those five gaps became the priority, and everything the methodology now has around calibration, inter-rater reliability, a minimum-sample rule, templates, and a dual license traces directly back to those five gaps.

The same stretch of work ran three parallel investigative threads at once, chasing three separate dispatch bugs to their actual root causes: a hardware fast-path that was short-circuiting straight to a single tool call before the planner ever ran at all — meaning "parallel tool execution" wasn't actually happening, because there was nothing left to parallelize; a set of tools invisible to the category mapper in a specific mode, meaning the agent could never select them no matter how the prompt was phrased; and a native-vs-alternate tool preference race caused by iterating an unordered dictionary, which meant the exact same prompt could non-deterministically call a different tool on different runs.

Underneath all of it sat a harness problem, not an agent problem: the server's busy-guard ceiling was a hardcoded 20 seconds, regardless of how long a task actually needed — so any request that legitimately took longer released its busy-guard early and corrupted whatever ran next. It got raised to 320 seconds. Separately, the OS was silently deleting the scratch directory results were being written to roughly every 35–40 minutes; long batches were losing data mid-run until output moved to a durable path and got detached from the parent process entirely.

The last full run — 86 unique tests, 436 records, split across two batches and re-run once more after a fix — is the run the methodology now cites as its closest thing to a certified snapshot. One test was deliberately excluded by explicit instruction, to avoid putting the machine running the test session to sleep mid-run; scoring was split across four parallel scoring passes to keep the workload tractable.

The repository you're looking at now is the public result of that whole process. The 44% first run is in there. The moment an error message taught an agent how to bypass its own safety guard is in there. The absurd dead end where the app being tested never once appeared on screen is in there too. The document itself stopped being specific to one agent — every core test block got split into a tool-agnostic capability definition and a concrete reference implementation, so another developer could take the general half and discard the rest. It went through a literature-grounding pass where every claim got independently re-verified through live search — a benchmark that turned out not to exist anywhere got dropped this way, a misspelled name got corrected this way. None of it got hidden.

If this methodology is worth anything, it's not because it looks polished. It's because it was willing to write down what didn't work — and I think that's the only thing that ever makes a methodology real.
