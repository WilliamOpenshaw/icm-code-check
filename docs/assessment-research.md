# Testing for understanding: research notes and test plan

Written 2026-10-31 for the ICM JS course. Most findings below come from abstracts, summaries, and search excerpts rather than full papers, so treat exact numbers as approximate and read the original before citing one.

## Short version

- **Use a mix.** Scrambled code and fill-in-the-blank are good, but on their own they miss too much. Students also need to trace code and explain what it means.
- **Make versions truly different.** Changing names and numbers alone is not enough. Each question needs several different structures of about the same difficulty.
- **Keep it low stakes and frequent.** Short, regular checks with a chance to retake support learning and give you more honest data.
- **The room stops AI, not the software.** No web page can block a phone or a second device. Supervision does that.

## What the research says

### Skills build on each other: tracing, then explaining, then writing

Lopez and colleagues (2008) proposed that reading and tracing code, explaining it, and writing it form a hierarchy. Venables, Tan, and Lister (2009) found that tracing and explaining scores together accounted for about 66% of the variation in code-writing scores. Later studies give mixed support for the exact order, but the practical point holds: a student who can't trace or explain code usually can't really write it, even if a chatbot can.

**What this means here:** each test has concept, code flow, and writing questions, and the Sheet reports all three separately. A student strong on projects but weak on tracing is worth a conversation.

### How much randomization actually deters copying

Chen, West, and Zilles (2018) studied students passing exam information to each other. Pools of 3 to 4 question generators with randomized values cut the cheating advantage sharply. A secondary source reports it falling from about 13 points to under 2. PrairieLearn gives the same 3 to 4 advice. Their follow-up work warns that pools can become unfair if the problems differ in difficulty.

**What this means here:** every question slot has 3 to 8 different patterns, and each pattern also randomizes names, numbers, and messages. Results record which pattern each student got, so an unfairly hard one can be spotted later.

### Scrambled code (Parsons problems)

Scrambled code works as a learning and testing tool, but Weinman, Fox, and Hearst point out that students can solve standard versions with syntax tricks instead of understanding. Evidence on adding wrong "distractor" lines is mixed:

- On exams, distractors did little to improve question quality in a CS1 Python study and made students take longer.
- For young novices, they lowered learning efficiency (Harms and colleagues).
- In practice, one later study found a benefit on an immediate post-test.

**What this means here:**

- Tests use no distractor lines.
- Lines have no indentation, because indentation gives away the structure.
- The written rules decide which message goes with which condition, so students must understand the logic, not just the shape of an `if`.
- Grading runs the student's order, so any arrangement that really works gets full credit.

### Explaining code in plain English

"Explain in plain English" questions predict writing skill, but open answers are hard to grade consistently. These tests use multiple-choice versions with wrong answers built from common mix-ups: `&&` versus `||`, and which way `mouseY` goes. I did not find direct evidence on how well the multiple-choice version works, so it's a reasonable adaptation, not a proven swap. A few spoken explanations each week would cover what it can't.

### Frequent, low-stakes checks

Studies of introductory programming courses support low-stakes retrieval practice, and link ungraded quiz engagement to better final exam scores. Novices also often overestimate what they understand until a test shows them otherwise. I found no direct evidence on retake policies. One retake on a new version is my judgment, since retakes keep the stakes low and a new version means the score still reflects understanding.

### Known trouble spots with `&&` and `||`

Research on Boolean logic reports that novices struggle with how the operators work, and that even intermediate students make tracing errors with compound conditions. The questions target these mistakes:

- Reading `&&` as "either" or `||` as "both"
- Writing `x > 5 && < 10` or `fruit == "apple" || "pear"`, as you would in English
- Conditions that are always true or never true
- Thinking every true branch of an `else if` chain runs
- `mouseY` growing downward, and a mouse exactly on a dividing line

## Question types in this project

| Type | What the student does | What it shows |
| --- | --- | --- |
| Truth rows | Marks a condition true or false for several values | Reading `&&` and `\|\|` |
| Rule to code | Picks the condition that matches a rule in words | Choosing the right operator |
| Code to English | Picks what a condition means | Explaining code |
| Canvas regions | Taps the parts of a canvas where a condition is true | A mental picture of the logic |
| Output trace | Says what a chain prints | Code flow: the first true branch wins |
| Typed number | Works out a value, such as what `map()` returns or a score after several frames | Code flow, without answer choices to lean on |
| Mouse trace | Picks the result at several mouse positions | Code flow, including edge cases |
| Lines that run | Taps each line that executes | Code flow, line by line |
| Find the bug | Taps the bad line and says why | Debugging and reasoning |
| Fill in the blanks | Assigns words from a bank to blanks | Constructing conditions and chains |
| Scrambled lines | Orders lines to match written rules | Constructing programs |

## Suggested questions for each unit

These are starting points to build as each week comes up. Each lesson needs its own check against what students have seen by then.

### Unit 1: Draw and Draw with Functions

- **Coordinates and shapes:** tap where a `point()` or `rect()` lands; fill in arguments for `line()`, `rect()`, and `ellipse()`.
- **Layering:** which shape ends up on top; put drawing lines in order to match a picture.
- **Color:** pick the color an RGB value makes.
- **Variables:** trace values through assignments; replace repeated numbers with a variable.
- **Functions and parameters:** match arguments to parameters; tap the lines that run; spot a function that is never called.
- **`random()`:** which values could this produce; `setup()` versus `draw()` placement.
- **Abstraction (U1LA4.1):** a few concept questions at most. This fits discussion better.

### Unit 2: Respond and Draw on Canvas (built)

- **Conditionals (U2LA1.1 to U2LA1.3):** truth rows, canvas regions, tracing chains, and building conditions.
- **Draw with mouse (U2LA2.1):** what `background()` in `setup()` versus `draw()` does; values across frames; reading objects.
- **`map()` (U2LA2.2):** work out the output for an input; fill in the ranges; choose the right order of arguments.
- **Data types (U2LA3.1):** classify values and predict `typeof`.
- **Return values (U2LA3.2 and U2LA3.3):** trace what a function returns; printing versus returning; order the lines of a function.
- **Collision and clicks (U2LA4.1 and U2LA4.2):** tap the area a condition covers; read the Collide2D documentation; `mouseIsPressed` versus `mousePressed()`; shapes that switch something else.
- **Key presses and nesting (U2LA5.1):** trace nested conditions; which nested code equals a given `&&`; why `key` needs `keyIsPressed`; values held inside limits.

### Unit 3: Arrays, Loops, Media

- **Loops (U3LA1.1 to U3LA1.3):** fill out a trace table; how many shapes get drawn; fix an off-by-one bug; tap the grid cells a nested loop draws.
- **Arrays (U3LA2.1 to U3LA2.4):** predict an index or `.length`; which values `floor(random(n))` can give; the list after `push` or `splice`; order a loop over an array.
- **Media (U3LA3.1 to U3LA4.1):** a short check of `preload()` order and file types. Most of this learning shows better in projects, so keep tests light here.

### Unit 4: Motion, Objects, Transformation

- **Motion (U4LA1.1 and U4LA1.2):** predict values across frames; trace a bounce condition.
- **Classes and objects (U4LA2.1 to U4LA3.1):** label class, constructor, property, and method; trace `this.x` updates; order a class; trace a loop calling methods.
- **Transformations (U4LA4.1 and U4LA4.2):** where a shape lands after `translate()`; `push()` and `pop()` flow; does the order of transformations matter.
- **Sine and cosine (U4LA5.1 and U4LA5.2):** the range of values produced; what `map()` or multiplying does. These lessons are marked skippable, so test them only if you teach them.

### End-of-unit tests

Build these by drawing question slots from that unit's lessons, then add one or two slots from earlier units. Research supports spaced review, and this also shows you what students kept. Unit 2's test is built this way, drawing only from Unit 2, because no Unit 1 test exists to draw from yet.

## What a test cannot do

- **Check creative or design thinking.** Projects and their written justifications still do that.
- **Prove a student understands their own project.** A two-minute "walk me through this part of your code" does that better than any test. It's also the hardest thing to outsource to AI. Picking two or three students a week would be a strong addition, and the Results tab shows which concept to ask them about.

## Sources

- [Chen, West, and Zilles: How much randomization is needed to deter collaborative cheating?](https://zilles.web.engr.illinois.edu/papers/chen_paper_async_randomization_las_2018.pdf)
- [Codio blog, quoting the Chen paper's figures](https://www.codio.com/blog/evergreen-curriculum-cheating-prevention-programming-courses)
- [PrairieLearn exam guidance](https://www.prairielearn.com/catalog/assessments/exam)
- [Sud and colleagues: follow-up on pool fairness](https://zilles.web.engr.illinois.edu/papers/sud_filter_exams_asee_2019.pdf)
- [Lopez and colleagues: Relationships between reading, tracing, and writing skills](https://opus.lib.uts.edu.au/bitstream/10453/10806/1/2008001530.pdf)
- [Venables, Tan, and Lister: A closer look at tracing, explaining and code writing skills](https://vuir.vu.edu.au/22276/)
- [Weinman, Fox, and Hearst: Exploring challenging variations of Parsons problems](https://researchr.org/publication/WeinmanFH20)
- [Weinman: Designing Exercises to Teach Programming Patterns](https://escholarship.org/uc/item/8794g5s0)
- [Harms and colleagues: Distractors in Parsons problems decrease learning efficiency](https://profiles.wustl.edu/en/publications/distractors-in-parsons-problems-decrease-learning-efficiency-for-/)
- [Distractors Make You Pay Attention (ICER 2024)](https://icer2024.acm.org/details/icer-2024-papers/24/Distractors-Make-You-Pay-Attention-Investigating-the-Learning-Outcomes-of-Including-)
- [Conducting multi-institutional studies of Parsons problems (ITiCSE 2023)](https://strathprints.strath.ac.uk/86100/1/Ericson_etal_ITiCSE_2023_Conducting_multi_institutional_studies_of_Parsons_problems.pdf)
- [How to grade Explain in Plain English questions (ICER 2021)](https://zilles.web.engr.illinois.edu/papers/how_to_eipe_icer_2021.pdf)
- [Low-stakes retrieval practice in CS1](https://par.nsf.gov/servlets/purl/10544324)
- [Tracing errors with compound Boolean expressions](https://par.nsf.gov/servlets/purl/10223173)
- [Illusionary Difficulty (SIGCSE 2025 poster)](https://cis.temple.edu/~jiewu/research/publications/Publication_files/Illusionary%20Difficulty%20SIGCSE%20Poster%202025.pdf)
- [W3C: Understanding WCAG 2.5.7 Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements)
- [Google: Apps Script quotas](https://developers.google.com/apps-script/guides/services/quotas)
- [Google: Web apps](https://developers.google.com/apps-script/guides/web)
- [Google: HTML service restrictions](https://developers.google.com/apps-script/guides/html/restrictions)
- [Google: locked mode in Forms quizzes](https://blog.google/outreach-initiatives/education/get-quizzing-locked-mode-and-grade-away-classroom/)
