# ICM Code Check

Weekly supervised tests and practice for the [ICM JS curriculum](https://cs4all-icm.gitbook.io/js-intro-to-computational-media-2.0). Every student gets their own randomly generated version, and scores go to a Google Sheet you own.

**Units 1 to 4 are built:** a test for each lesson, plus an end-of-unit test for each unit. Unit 5 is a personal project, so it has no test.

| Test | Topic | Minutes | Questions |
| --- | --- | --- | --- |
| U1LA1.1 | p5.js Introduction & Deconstruction | 12 | 8 |
| U1LA1.2 | Line Functions and Parameters | 15 | 9 |
| U1LA1.3 | Rectangles, Ellipses, and Layering | 15 | 9 |
| U1LA1.4 | Other Shapes & Styling | 15 | 9 |
| U1LA2.1 | Color, including the Data Storage and Palette extras | 20 | 12 |
| U1LA3.1 | Introducing Variables | 15 | 9 |
| U1LA3.2 | Creating Custom Variables | 20 | 12 |
| U1LA4.1 | What is Abstraction? | 12 | 8 |
| U1LA4.2 | Intro to Functions && Function Calls | 12 | 8 |
| U1LA4.3 | Draw with Functions | 15 | 9 |
| U1LA4.4 | Using the Random Function | 15 | 9 |
| U1LA5.1 | Your Custom Function Library | 12 | 8 |
| Unit 1 Review | End of Unit 1, drawn from all of the lessons | 30 | 16 |
| U2LA1.1 | Conditionals and If Statements | 15 | 9 |
| U2LA1.2 | Conditionals and if, else if, and else | 20 | 11 |
| U2LA1.3 | Logical Operators And/Or | 20 | 12 |
| U2LA2.1 | Draw with Mouse | 20 | 12 |
| U2LA2.2 | The Map Function | 20 | 12 |
| U2LA3.1 | Data Type Scavenger Hunt | 12 | 9 |
| U2LA3.2 | Functions that Return Values | 20 | 12 |
| U2LA3.3 | Functions with Purpose | 20 | 12 |
| U2LA4.1 | Collision Functions && Collide2D | 20 | 12 |
| U2LA4.2 | Mouse Clicks && Shapes as Buttons | 20 | 12 |
| U2LA5.1 | Key Presses && Nested Conditionals | 20 | 12 |
| Unit 2 Review | End of Unit 2, drawn from all of the lessons | 30 | 16 |
| U3LA1.1 | While Loops | 15 | 9 |
| U3LA1.2 | For Loops Pt 1 | 20 | 12 |
| U3LA1.3 | Nested For Loops | 20 | 10 |
| U3LA2.1 | Introduction to Arrays | 15 | 9 |
| U3LA2.2 | Arrays with floor() and random() | 12 | 8 |
| U3LA2.3 | Loops and Arrays | 20 | 12 |
| U3LA2.4 | Updating and Deleting from Arrays | 15 | 9 |
| U3LA3.1 | Preload, Images, Tint | 15 | 9 |
| U3LA3.2 | Images and Arrays with ml5 (optional in the course) | 12 | 8 |
| U3LA3.3 | Fonts && Text Styling | 12 | 8 |
| U3LA4.1 | Loading & Playing Sound Files | 15 | 9 |
| Unit 3 Review | End of Unit 3, without the optional ml5 lesson | 30 | 16 |
| U4LA1.1 | Intro to Motion with Flipbooks | 12 | 8 |
| U4LA1.2 | Move in All Directions && Make it Bounce | 15 | 9 |
| U4LA2.1 | Introduction to Classes and Objects | 15 | 9 |
| U4LA2.2 | Reading and Updating Object Properties | 12 | 8 |
| U4LA2.3 | Methods Off Canvas | 15 | 9 |
| U4LA2.4 | Objects on Canvas | 15 | 9 |
| U4LA3.1 | Creating Many Objects | 15 | 9 |
| U4LA4.1 | Translation Battleship | 15 | 9 |
| U4LA4.2 | Rotations | 15 | 9 |
| U4LA5.1 | Sine && Oscillating Motion (skippable in the course) | 15 | 9 |
| U4LA5.2 | Cosine && Circular Motion (skippable in the course) | 15 | 9 |
| Unit 4 Review | End of Unit 4, without the sine and cosine lessons | 30 | 16 |

Images, fonts, and sound don't really load in these tests, so those questions check the code and ideas, not how something looks or sounds. These are only starting points. You can change the minutes and questions for any test. The mini projects and the final project have no tests, since they show their learning in the project itself.

## Try it now

Double-click **`test-offline.html`**. Choose **Practice** to see the questions. To try the real test, open **Teacher settings**, set a PIN, tick **Open** for a test, and note its start code.

Offline copy scores stay on that one device, so use it as a backup. For class, set up the Google version below.

## What's in this folder

| Path | What it is |
| --- | --- |
| `test-offline.html` | The app as a single file, for backup or trying it out |
| `apps-script/` | The two files you paste into Google Apps Script |
| `docs/assessment-research.md` | The research, and suggested question types for each unit |
| `docs/question-samples/` | One example of every question for each test, with answers. Do not share these with students |
| `curriculum/` | All 80 course pages, saved locally. Start at `curriculum/INDEX.md` |
| `src/`, `tools/`, `tests/` | The source code, build tools, and automated tests |
| `CLAUDE.md` | Instructions for Claude when adding lessons |
| `.github/workflows/pages.yml` | Builds and publishes the practice site when changes reach GitHub |

## On GitHub

The code is at [github.com/WilliamOpenshaw/icm-code-check](https://github.com/WilliamOpenshaw/icm-code-check), and anyone can see it. The answer-key samples, your scheme of work files, and `tests/dist/` stay on this computer only.

**Practice site:** [williamopenshaw.github.io/icm-code-check](https://williamopenshaw.github.io/icm-code-check/) has practice for every lesson, with no sign-in, so students can use it at home. It has no tests, so nothing is graded or recorded there. Real tests stay on your Google link.

- **It shows every lesson,** unlike the Google link, which only shows lessons you've ticked for **Practice**. Working ahead does no harm, since practice never shows a real test.
- **It updates itself** a minute or two after Claude pushes a change to GitHub. Your Google link still needs the steps in **When the code changes**.
- **Anyone can read the code,** including how questions are made. That doesn't give away a student's test, which is random, and practice already shows answers. Supervision is still what protects a test.

The saved curriculum holds the page text. Images, slide decks, worksheets, and p5 sketches are still links to the original site.

## Set up the Google version (about 10 minutes)

Use your **school** Google account, not a personal one. This Sheet will hold student names and scores.

1. Create a new Google Sheet and name it something like `ICM Code Check`.
2. Choose **Extensions > Apps Script**.
3. Replace everything in `Code.gs` with the contents of `apps-script/Code.gs`.
4. Click **+** next to Files, choose **HTML**, and name it `Index`. Replace its contents with `apps-script/Index.html`. Then click **Save**.
5. In the toolbar's function menu, choose `setup` and click **Run**. Approve the permissions when asked.
6. Click **Deploy > New deployment**, click the gear, and choose **Web app**. Set:
   - **Execute as:** Me
   - **Who has access:** Anyone within your school, if that option appears
7. Click **Deploy** and copy the web app link. That link is what students open.
8. Back in the Sheet, reload the page. A **Code Check** menu appears. Click **Share** and set **General access** to **Restricted**, so that only you can open the Sheet. Students never need it. With wider access, they could see start codes, scores, and answers, and might be able to change them.
9. In the **Roster** tab, replace the sample students with your own. Use `First name + last initial` if you can.
10. In the **Tests** tab, tick **Open** for this week's test.
11. Open the link and try a practice question and a full test yourself. Then delete your test rows from **Attempts** and **Results**.

> **Mostly proven on Google.** On 2026-11-01, one full test ran on Google's real servers, and its score reached Attempts, Results, Gradebook, and Class Summary. The link also opened in a private window signed in only as a test student, and that account can't open the Restricted Sheet. A whole class at once has not been tried yet, so start with a low-stakes run. If anything fails, tell Claude what you see.

### When the code changes

Do this when nobody is in the middle of a test, because a student who reloads partway could get different questions.

1. Paste in the new `Code.gs` and `Index.html`, and click **Save**.
2. Choose **Deploy > Manage deployments**, click the pencil, set **Version** to **New version**, and click **Deploy**. The link stays the same. Saving alone does not update what students see.
3. In the Sheet, choose **Code Check > Set up or update tabs**. This adds rows for any new tests, and leaves your existing rows, students, and results alone. New rows go below your existing ones. The order doesn't matter, and students always see tests in course order.

## Your weekly routine

**When you start a lesson**
- In **Tests**, tick **Practice** for it, so students can practice before the test. Unit 1 and U2LA1.1 to U2LA1.3 start ticked, and later lessons start unticked so that nobody works ahead by accident.

**Before class**
1. In **Tests**, tick **Open** for this week's test and untick last week's.
2. Set **Minutes** and **Questions** for this test.
3. Choose **Code Check > New start codes for open tests**.

**In class**
1. Phones away, in a basket if you can.
2. Students open the link, pick their name, and wait.
3. Write the start code on the board when you're ready for them to begin.
4. As you walk around, check the top of each screen, which shows the lesson's name and the student's name. Both stay there during the test, and both also appear on the results screen. Students pick their own names, so this is how you catch a wrong one.
5. Keep the **Attempts** tab open on your own device. It updates as students work, and it turns red when someone leaves the screen.
6. Use a new start code for each class period, so one class can't pass it to the next.

**After class**
- **Class Summary** shows what to reteach, by class and skill.
- **Gradebook** shows each student's best score and number of tries.
- **Results** has the details. The **Detail** column holds every question, the student's answer, and the correct answer.
- For retakes, students come back under supervision with a start code. They get a brand-new version, and the higher score counts.

## The Sheet's tabs

| Tab | You edit it? | What it's for |
| --- | --- | --- |
| Tests | Yes | Which tests are open, the timer, question count, tries allowed, and start code |
| Roster | Yes | Class, student, extra time %, and extra attempts |
| Attempts | No | Live view of who is testing, with flags |
| Results | No | One row per finished test |
| Gradebook | No | Best score per student |
| Class Summary | No | Averages by skill |

**Extra time:** type `50` in a student's **Extra time %** cell to give them 1.5 times as long. Check this against any IEP or 504 plans.

**Another try:** type `1` in **Extra attempts**, for example after a device problem.

### What the flags mean

Flags are prompts to look or ask, and they never change a score.

| Flag | What was recorded | Innocent explanations |
| --- | --- | --- |
| Left screen / Seconds away | The test tab or window lost focus for over a second | A system pop-up |
| Reloads | The page was reloaded | A glitch or a dropped connection |
| Copy tries | Someone tried to copy text | A habit |
| Window shrunk | The window got much narrower, which could mean a side panel or split screen | Resizing by accident |
| Late | The turn-in arrived over a minute after time ran out | A slow connection |

## What these tests are for

Students may use AI for their work, but not during a test. The aim is for them to understand the concepts and build critical thinking, however much AI they use elsewhere. Practicing for and taking these tests should encourage them to experiment with their work and understand it, with or without AI.

**Checking understanding comes first.** Questions should cover the important ideas in a variety of ways, even when some answers are easy to share. Vocabulary and concept questions can't differ much between students, and they stay because those ideas are essential.

**Several things work together to limit answer sharing:**
- You watch the room and the screens, and students don't talk during a test.
- Questions are shuffled for each student, and so are their answer choices.
- Many questions and answers differ between students, and some are hard to share at all.

So a test doesn't need every question to be hard to share, as long as it has some that are.

## How the test works

Each test mixes three skills, and the Sheet reports each one separately:

| Skill | Kinds of question |
| --- | --- |
| Concepts | True or false rows, rule to code, code to English, canvas regions, reading documentation |
| Code flow | What it prints, what a value ends up as, results at different mouse positions or key presses, lines that run, find the bug |
| Writing code | Fill in the blanks from a word bank, scrambled lines |

**Typed answers:** students type their answer only when it's a number, such as what `map()` returns or a score after several clicks. A typo can't look like a misunderstanding there. Code blanks always use the word bank.

**Scoring:** each question is worth 1 point. One small mistake earns ½ point, and two or more earn none. Canvas questions with fewer than 6 parts are all or nothing, so tapping everything can't earn points.

**Tips for students:** the home page has short reminders about using AI for their work but not on tests, practicing, mixed question order, checking the lesson name, and retakes. To change them, ask Claude, or edit `showHome` in `src/app.js` and rebuild.

**After the test:** students see their name, the lesson's name, their score, points by skill, and which concepts to review, but not the answers.

**Practice:** students can take a full test or focus on one kind of question, and see answers as they go or at the end with the real timer. Practice questions come from the same generators, so students can never see their real test ahead of time. Nothing from practice is recorded.

**End-of-unit test:** this draws questions from across the unit's lessons, so it stays in step with them. Open it the same way as any other test.

**How different are the versions?** There are 990 question patterns across the 45 lesson tests, and each pattern randomizes names, numbers, and messages where it can. In 50 simulated classes of 30 students, comparing one question of each kind (4 to 16 per test):

- Two students share an average of **0.07 to 2.1 identical answers**, depending on the test.
- The closest pair on any test shared **8**, on a review test.
- Answer choices are shuffled too, so "the answer is B" means nothing.

Tests with many vocabulary and concept questions, such as U1LA2.1, U1LA4.1, and the Unit 1 Review, share the most. Those questions can reword or reorder, but their right answer stays the same, and that's fine (see **What these tests are for**). To re-run this: `npm run differences`

**Question order:** all of the questions are shuffled together, so each student gets a different order, and a hard question can come first. The home page and the test sign-in screen tell students to mark a question that's slowing them down and move on. The timer may need a little more room, because switching between kinds of question takes extra effort.

## Text size and dark mode

Every screen has these controls at the top:

- **A−** and **A+** make the text and fields smaller or larger, from 90% to 200%. Tap the percentage to go back to 100%.
- **☾ Dark** and **☀ Light** switch modes. Until a student picks one, it follows the device's setting.

Each browser remembers its own choice. On a shared device, the next student may need to change it back. Long lines of code wrap instead of running off the side, so nothing is hidden at large sizes.

## What this can't do

- **It can't block AI on its own.** No web page can stop a phone or another device, so supervision does that job. The flags help you notice what you might miss.
- **A determined student could cheat through the browser's developer tools.** Answers are worked out inside the page, so a student could dig them out or send a fake score. Watching screens makes this easy to catch. If your school manages the devices, ask IT whether developer tools can be turned off for students.
- **Students pick their own names.** The start code and your supervision are what stop someone from testing under another name.
- **Answers don't move between devices.** If a device dies mid-test, the student can reopen on another device and get the same test and time left, but must redo their answers. On the same device, reloading keeps them.
- **The timing hasn't been tried with real students.** The minutes for each test are estimates. Try them with a few students first, then adjust. Questions that trace code across frames may take longer than they look.

## Troubleshooting

| What you see | What to try |
| --- | --- |
| Can't run or deploy the script | Your school may restrict Apps Script. Ask IT to allow it |
| A warning that Google hasn't verified the app | This can appear with scripts you wrote yourself. Your school may require IT approval |
| Students are asked to sign in | The link is limited to your school, so they need their school account |
| The page won't connect or shows an error | Being signed in to several Google accounts can cause this. Try a private window with one account |
| "You have used all of your attempts" | Add a number under **Extra attempts** in Roster |
| "Your test has not saved yet" | Leave that screen up and press **Try saving again** once the connection is back |

## Adding more tests

Open this folder in Claude Code and ask, for example, "Build the test for U3LA1.1." `CLAUDE.md` has the rules Claude should follow. Then follow the steps under **When the code changes**.

## License

The code is under the [MIT License](LICENSE), so anyone may use, change, and share it.

The curriculum is by NYCDOE CS4All and licensed [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/), and that license requires anything based on it to use the same license. So the saved course pages in `curriculum/`, the questions in `src/lessons/`, and the built pages that include them stay under CC BY-NC-SA 4.0. Classroom use is fine. If you share them, keep the attribution, keep them non-commercial, and use the same license.
