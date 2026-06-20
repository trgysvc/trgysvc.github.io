Why a simple string match beat Apple's NLEmbedding for local RAG
2026-06-20

how apple's nlembedding drove me crazy and how i built my own hybrid search engine

recently, while working on my personal ai agent (pheronagent), i was focused on perfecting its memory and retrieval system.

everyone is talking about that famous acronym: rag (retrieval-augmented generation).

the system is simple: i feed the agent my documents, it converts them into vectors (embeddings), and when i ask a question, it finds the most similar vectors and answers me. sounds perfect on paper, right?

so, like any loyal apple ecosystem developer, instead of downloading massive models from external sources (or burning money on apis), i decided to use nlembedding—the native capability of the operating system that runs directly on-device. after all, apple had embedded this into the os; it was both fast and privacy-focused.

but real life, as it turns out, doesn't progress as smoothly as wwdc presentations...


where have i worked? - the first explosion

it all started with a very innocent question. i had uploaded my cv to the system. while chatting with my agent, i casually asked:

"where have i worked?"

i expected the agent to fire up the metal cores in the background within seconds, find my cv, and list the companies for me. instead, the agent stared blankly. i opened the logs to see what the hell the search engine was doing behind the scenes. the shocking scenario was exactly this:

- cosine similarity between the query and my actual cv text: 0.587
- the threshold i set for relevance: 0.60

it missed it by a hair! "no worries," i thought. "we can just lower the threshold a bit, make it 0.55, and call it a day."

but then i saw the truly terrifying thing just one line below. for the exact same query, guess what score a completely irrelevant, junk record in the system—a list of files containing .ds_store—got? 0.59 - 0.60!

wait a minute... my detailed, multi-page resume gets a score of 0.587 just because it doesn't contain the words "which", "company", "work" in that exact order; yet a meaningless list of hidden files scraped from some corner of the disk gets a higher score than my cv!


the "it must be language incompatibility" fallacy

i immediately started theorizing. apple's nlembedding.sentenceembedding(for: .english) model, as the name suggests, was optimized for english. because i asked a question in turkish, the model was likely tagging the words as "out of vocabulary" (oov) and throwing them to a completely random point in the vector space. the high score of the .ds_store list was just a product of this randomness—it happened to land near a similar vector by pure luck.

"okay," i said. "since the model is english, i will ask in english. after all, ai speaks every language anyway."

i changed the prompt: "which companies have i worked at?"

i watched the logs with anticipation. my expectation was that the english model would perfectly understand this query in its native language and boost my cv's score to somewhere around 0.80.

the result? 0.17.

yes, you read that right. 0.17. by asking in english, the score crashed even further. my language compatibility theory collapsed like a house of cards before my eyes.


what's under the hood of apple's nlembedding?

after this disaster, i decided to do some research. how does apple's nlembedding class actually work under the hood?

i learned that nlembedding on apple devices (especially the structures inherited from older ios/macos versions) doesn't function like massive, dynamic transformer-based models (like bert or gpt). it most likely relies on static word vector representations like glove (global vectors for word representation) or highly lightweight neural network architectures based on word-level compression.

the biggest weakness of such models is that their contextual understanding is extremely limited. meaning:
- they might fail to distinguish between "bank" in "i went to the bank to deposit money" and "bank" in "i sat on a wooden bank by the river".
- they don't do much more than take a simple weighted average of word vectors when generating a sentence embedding.

consequently, agglutinative languages like turkish become a complete nightmare for these models. unable to properly extract word roots for variations like "çalıştım", "çalışmışım", or "çalışıyordum" (all forms of "worked"), the model treats the words as completely foreign. in the end, we are left with meaningless 512-dimensional float arrays carrying close to zero semantic information—essentially just "noise".


speeding up with metal, choking on vectors

the tragicomic part of it was that i spared no expense in terms of performance in the search infrastructure of the project. in the experiencevault.swift file representing the agent's memory vault, i had written a metal gpu kernel so i wouldn't waste time iterating through similarity calculations one by one on the cpu!

i had a fancy metal shader code like this:

```metal
include <metal_stdlib>
using namespace metal;

kernel void cosine_similarity_batch(
    device const float* query [[buffer(0)]],
    device const float* documents [[buffer(1)]],
    device float* results [[buffer(2)]],
    constant uint& vector_dim [[buffer(3)]],
    uint id [[thread_position_in_grid]]) 
{
    // we calculate cosine similarity by scanning hundreds of memory records simultaneously on the gpu...
    float dot_product = 0.0;
    float query_norm = 0.0;
    float doc_norm = 0.0;
    
    uint offset = id * vector_dim;
    for (uint i = 0; i < vector_dim; i++) {
        float q = query[i];
        float d = documents[offset + i];
        dot_product += q * d;
        query_norm += q * q;
        doc_norm += d * d;
    }
    
    results[id] = dot_product / (sqrt(query_norm) * sqrt(doc_norm));
}
```

think about it: i had descended to the hardware level, running gpu threads in parallel, calculating cosine similarity on the order of nanoseconds... but the vectors i was calculating were junk!

actually, the story of this metal kernel was even more tragic. a while before writing these lines, i had discovered that this kernel wasn't running in any environment at all—neither in cli tests, nor in a separate xpc service, nor inside the actual .app bundle. the reason was a pure swiftpm trap: the device.makedefaultlibrary() call only looks for the compiled metal library in the top-level resources folder of bundle.main. but swiftpm embeds a package target's .metal files into its own nested, separate resource bundle (pheronagent_pheronagentcore.bundle)—which makedefaultlibrary() never checks. this meant that this clever gpu code, sitting there for months, was quietly returning nil every time and bypassing calculations without executing anything in the background. the solution was equally elegant: compiling the kernel not from a resource file, but directly from a string embedded in swift at runtime using device.makelibrary(source:options:). no bundle dependency, completely agnostic of which process it runs in.

once i fixed that, the kernel actually started working—but as you will see in a moment, this was only the tip of the iceberg.

the oldest rule of computer science had hit me in the face once again: garbage in, garbage out. no matter how fast you calculate, using metal doesn't matter if those vectors coming from apple's nlembedding are meaningless.


the bitter truth: apple's model is not discriminative

at that moment, i saw clearly that apple's on-device nlembedding model did not have real discriminative power over my small, personal, and noisy dataset. both relevant and completely irrelevant content clustered closely together, somewhere between 0.50 and 0.60. the model was mapping a general "semantic map" of the text, but it wasn't fine-tuned enough to answer specific questions.

i couldn't solve this by playing with threshold values. if i pulled the threshold down to 0.5, i would get junk files. if i raised it to 0.7, the system would turn into a blind robot that finds nothing. it had become a pure hit-or-miss game.

i had made many fixes in the agent's memory system today: switching to content-based embedding, patiently re-embedding all 903 historical records, setting up threshold-triggered searches in chat mode, and refining the system prompts. these were all correct, logical, and architecturally necessary steps. but a chain is only as strong as its weakest link. and my weakest link was the underlying similarity engine upon which this whole fancy architecture relied.

i was building a structure on an unreliable foundation. without fixing this similarity engine, that cv scenario—or any personal data assistant scenario—would never work stably.


crossroads: a new model or new intellect?

i was faced with two choices:

1. bringing out the big guns: throw apple's toy nlembedding in the trash, and run a full huggingface model (like all-minilm-l6-v2 or a multilingual model) via mlx (apple silicon's machine learning framework).
   - downside: the user would have to wait for an extra few hundred megabytes of model weights to load into ram when starting the app. battery consumption would spike. things would get sluggish. i would be betraying my vision of a "lightweight and fast native agent." plus, i'd disrupt the smooth flow of the uno architecture.

2. blending old school wisdom with ai: why rely solely on the ai's "semantic understanding" capability anyway? ai can be smart, but sometimes it's dumb. the human brain, on the other hand, forms semantic connections and catches literal (exact) matches in a flash.

and then, lightning struck: hybrid search!


the birth of "keyword + embedding" hybrid search

the root of the problem was this: words like "turgay", "cv", or "apple" are proper nouns or concrete facts. an embedding model generalizes these meanings to "human", "document", or "company". but when i search, i'm not looking for some general company; i'm searching for companies on my own cv. here, a literal (exact) match was far more valuable than semantic similarity.

why not combine both?

the plan was simple but deadly:
1. records would still be scored via cosine similarity on metal as usual (we keep that lousy 0.587 score in our pocket).
2. next, the user's query would be split into words ("which", "company", "work", "cv").
3. we would check if these words appear literally in the record text.
4. for every matching meaningful word, we would add a small "bonus" to that record's score!

i thought:
if there's a literal word or name match between the query and the record text (for instance, "turgay" or "cv" appears in both), let's add that to the embedding score.

this was an incredibly elegant solution, especially for personal data containing proper nouns or concrete facts: much more reliable, codeable in seconds, and most importantly, requiring no extra heavyweight ai model.


the stop-word menace and the short word trap

when i started coding, the first trap that came to mind was the infamous turkish casing issue—the i/i/i/i character pairs can easily mismatch without a locale-sensitive lowercased() call. honestly, though, in the first version, i bypassed this and went with plain lowercased(); since the queries were freeform user input and the words were searched using contains(), it didn't cause problems in practice. (note to self: this is actual tech debt; one day, when "istanbul" doesn't match "istanbul", it will come back to haunt me.)

the second trap i took seriously was stop-words and short/meaningless tokens. words like "and", "of", "which", "what", or "a" in a query occur in almost every document. if i gave bonus points for those, that .ds_store file would jump right back to the top and poison my search results. similarly, 1-2 letter word fragments left behind from punctuation parsing were creating noise.

i set up a two-layer filter—supporting both turkish and english (since the agent operates in both languages):

```swift
private static let stopwords: Set<String> = [
    "the", "a", "an", "is", "are", "was", "were", "do", "does", "did", "i", "you", "me",
    "my", "have", "has", "had", "what", "which", "who", "where", "when", "how",
    "hangi", "ne", "ben", "beni", "benim", "kim", "nerede", "ne zaman", "nasıl",
    "mi", "mı", "mu", "mü", "misin", "mısın", "musun", "müsün", "miyim", "mıyım", "de", "da", "ve", "bir"
]

private func keywordBoost(query: String, candidateText: String) -> Float {
    let tokens = query.lowercased()
        .components(separatedBy: CharacterSet.alphanumerics.inverted)
        .filter { $0.count > 2 && !Self.stopwords.contains($0) }
    guard !tokens.isEmpty else { return 0 }
    let lowerCandidate = candidateText.lowercased()
    let matches = tokens.filter { lowerCandidate.contains($0) }.count
    return min(Float(matches) * 0.15, 0.6)
}
```

the count > 2 filter automatically weeds out meaningless 1-2 letter fragments without requiring every short suffix or abbreviation to be explicitly listed in the stopword set. thus, when the user asks "which companies have i worked at," the system extracts only "companies" and "worked" and awards bonus points for those matches.


mathematical weighting in hybrid search

now for the most satisfying part: formulation.

rather than blindly adding raw points, i wanted to control the impact of word matching. a word appearing by chance in a very long document shouldn't carry the same weight as in a concise and focused one. furthermore, the added bonus shouldn't completely dominate the cosine similarity, reducing the system to a basic keyword search tool. the semantic intelligence still needed to carry weight.

i devised a formula like this:

final score = w * semantic score + (1 - w) * keyword score

i experimented to find the optimal weight (w) parameter through trial and error.

- setting w = 0.8 kept semantic search as the primary decision-maker, while keyword-matching documents received a gentle nudge (boost).
- setting w = 0.4 allowed keyword matches to gain overwhelming dominance.

in my case, integrating the keyword score directly as a "bonus points" system was more intuitive because cosine similarity ranged between 0.0 and 1.0. adding a +0.15 bonus per matching word directly propelled spot-on matches (especially proper nouns) to the very top of the list.

one crucial tweak was necessary: capping the bonus. if left uncapped, a long document with 10 random matches but zero actual relevance could artificially inflate its score and override everything else. i capped the bonus at a maximum of 0.6—meaning keyword matching gives a powerful push but cannot completely hijack the system; semantic scoring still holds ground:

```swift
var finalScore = baseCosineSimilarity

// dynamic boost for each matching meaningful word
let matchingCount = queryTokens.filter { token in
    !stopWords.contains(token) && documentText.lowercased().contains(token)
}.count

if matchingCount > 0 {
    let lexicalBonus = min(Double(matchingCount) * 0.15, 0.6)
    finalScore += lexicalBonus
}
```


the result... i won't lie, it didn't work on the first try

i compiled the code, restarted the agent, and asked the same question: "where have i worked?" with hybrid scoring, everything should have been resolved. i looked at the logs.

the cv still wasn't there. it wasn't even in the top 5 results.

i could have easily gotten frustrated, but i kept digging through the logs and uncovered three distinct, interconnected issues—each one a lightbulb moment:

issue 1: generic labels. my agent had a "deep continuity" mechanism that automatically saved every tool result to memory in the background. the problem was that this mechanism assigned the exact same generic label ("turn-based data find") to everything it saved—including my cv. this meant there was no distinct label for keyword matching to latch onto; the cv's body was full, but its header was meaningless. i fixed this by writing a custom label describing the cv record in turkish ("kullanıcının özgeçmişi (cv) — iş geçmişi, çalıştığı firmalar...").

issue 2 (even more surprising): long text diluting short labels. even after fixing the label, the score remained low. when computing the embedding, i was appending the first 500 characters of the solution text to the label—thinking "more context, better embedding." but when i tested it, i saw that the embedding of the label alone scored 0.80 against the query, whereas the label combined with 500 characters of english cv text dragged the score down to 0.40! sentence embeddings calculate an average meaning over the entire text—a long, out-of-domain (relative to the turkish query) body text was swallowing the strength of the short, concise label. solution: i reduced the appended solution snippet from 500 characters down to 120 characters.

issue 3: the invasion of duplicate records. in the final check, i realized that the automatic recording mechanism saved the same generic message (like a calculator error or a "sound file detected" notification) every single time it occurred. out of 903 records, hundreds were duplicates, occupying top ranks purely by sheer volume. i added a quick check to prevent saving duplicate content during recording and cleaned up existing duplicates: 903 records → 627 records.

after fixing all three, i tried again. this time, the cv record made it into the top 3 out of ~600 records with a score of 0.70—comfortably exceeding the 0.60 threshold i set.

0.70 might not sound as spectacular as 0.88, but this was achieved not in a sterile sandbox, but in a messy, real-world dataset of 600+ records. and that's the whole point: the system must work under actual usage conditions, not just in "clean" scenarios.

and what happened to that nuisance .ds_store file, you ask? since it contained neither "company" nor "work," it was left with only its mediocre ~0.59 embedding score, falling safely below the threshold.


agent's brain surgery: the leap in llm response quality

this small hybrid search adjustment acted like brain surgery on the agent's response quality.

under the old system, when the search engine erroneously retrieved .ds_store contents, the prompt passed to the agent's llm looked like this:

```text
user question: hangi firmalarda çalışmışım?
retrieved memory records:
- .ds_store, .git, sources/pheronagentcore/memory/experiencevault.swift, readme.md, ...
```

faced with this input, the llm was forced to hallucinate or helplessly surrender: "i couldn't find any information in my memory about which companies you worked for, i only see file lists."

after hybrid search, however, the data sent to the llm was pristine:

```text
user question: hangi firmalarda çalışmışım?
retrieved memory records:
- turgay savacı - cv: "... between 2019-2024 as founder & general manager at savacı proje, and from 2019 to present as strategic software engineer & devops architect at sonaraura..."
```

as soon as the agent saw this context, it came alive and listed the companies i had worked for one by one, along with dates and roles. this was the true rag experience!

but there was another overlooked detail: my agent has two distinct response pathways—a "task" mode that can call tools and plan, and a lightweight "chat" mode for quick conversations that bypasses tools and answers directly. the rule i added to the system prompt ("search memory when asked about personal information") only served the first mode. short, conversational questions like "which companies have i worked at?" routed to the second mode never triggered this rule because there was no tool calling in that pathway. therefore, the second pathway required a separate, code-level solution: now, that mode embeds the query on every message and automatically appends relevant memories to the context if there's a match above the threshold—even if the model doesn't explicitly request it.


a developer's confession: the overengineering trap

this minor crisis taught me a valuable lesson about modern software development and ai integration: don't leave everything to neural networks.

as developers, when we get a new toy (in this case embeddings, vector databases, gpu-based shaders), we tend to completely forget old, proven, and "boring" methods. we disregard fundamental information retrieval algorithms, thinking "the ai will understand." yet, giants like google or elasticsearch still produce their stellar search results by blending bm25 (classic tf-idf-based term frequency counts) with vector searches (hybrid search).

had i stubbornly insisted, "no, i will solve this with vectors alone," i would probably be trying to integrate a 2 gb model into my system right now, heating up the device, and drowning in unnecessary complexity. instead, i placed a simple if string.contains() logic alongside the ai, and the problem was resolved 100%.

sometimes the smartest solution isn't the most complex one, but putting an old-school string matching if statement in the right place.

now, if you'll excuse me, i'm off to gossip with my perfectly functioning agent about the former companies on my cv!
