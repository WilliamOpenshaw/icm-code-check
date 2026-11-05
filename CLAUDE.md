# ICM Code Check

Supervised, randomly generated comprehension tests for a high school course using the ICM JS curriculum (p5.js). The teacher's goal: students were skipping learning by using AI on assignments, so short in-room tests check that they understand the concepts and code flow themselves.

The teacher's decisions (2026-10-31):
- Delivery: an Apps Script web app with a Google Sheet, plus an offline single-file backup
- Default test: 12 questions, 20 minutes, adjustable per test
- Stakes: low, with one retake on a new version; the higher score counts
- Students see their score and missed concepts, not answers, after a test
- Blanks are filled from a word bank
- Tests are supervised in person. Do not build webcam proctoring or similar

`README.md` is the teacher's guide, so keep it accurate when behavior changes. `docs/assessment-research.md` has the evidence behind these choices and suggested question types for each unit.

## Project philosophy

The teacher's direction (2026-11-02), which guides all decisions about questions:

- **The purpose is understanding.** Students may use AI for their work, but not during tests. Practicing for and taking tests should help them understand the concepts and build critical thinking, however much AI they use elsewhere, and encourage them to experiment with their work.
- **Variety in assessing understanding matters more than making every question hard to share.** Keep vocabulary and concept questions even when their answers can't differ much between students, because those ideas are essential. Don't drop or distort a question just to lower its shared answers.
- **Sharing is limited by several things together:** the teacher watching the room and screens, no talking, shuffled questions and choices, per-student differences in many questions, and some questions that resist sharing. A test needs some of those resistant questions, not only those.
- **`npm run differences` is information, not a target.** Use it to confirm a test has some variation and to report it honestly. A lesson's code-based slots should still vary, as the steps below require.

## Commands

```bash
npm run build         # regenerates test-offline.html and apps-script/
npm test              # interpreter, generators, and server tests
npm run differences   # how different students' tests are, for every test
npm run differences -- U2LA4.1   # the same for one test, slot by slot
npm run sample -- U2LA4.1 --patterns   # prints one of every question with answers
npm run samples       # rewrites docs/question-samples for the teacher
npm run stress        # builds every pattern 400 times, to catch rare bad random values
```

There are no dependencies. Only Node is needed.

## Layout

- `src/mini.js`: a small JavaScript interpreter. Answer keys and arrangement checks run here
- `src/engine.js`: seeded randomness, test assembly, grading, scoring
- `src/lessons/kit.js`: themes, colors, canvases, and question builders
- `src/lessons/<lesson>.js`: one lesson's question slots and patterns. Unit 1 groups related lessons in `u1la1.js` to `u1la4.js`, using builders from `u1kit.js`
- `src/lessons/unit2.js`: the end-of-unit test, built with `CC.defineComposite` from slots in the lessons
- `src/questions.js`: draws each question type
- `src/display.js`: the text size and dark mode controls
- `src/styles.css`: colors are tokens with a dark set, and sizes are in rem so the text size control scales them
- `src/app.js`: screens and the timed runner
- `src/backend.js`: Sheet and offline storage behind one interface
- `src/server/Code.gs`: the Apps Script server
- `tools/sources.js`: the file list and order for the build and tests
- `apps-script/`, `test-offline.html`: build output. Never edit these directly
- `site/index.html`: build output, the practice-only page (`CC.practiceOnly`). `.github/workflows/pages.yml` builds, tests, and publishes it to GitHub Pages on each push to `main`
- The repo is public at github.com/WilliamOpenshaw/icm-code-check. `.gitignore` keeps the answer-key samples and the teacher's planning files off it. Commit or push only when the teacher asks
- **Demo video:** `npm run build`, then `node tools/demo/record-demo.js` drives the Sheet simulator in headless Chrome over the DevTools Protocol (`tools/demo/cdp.js`, no npm packages) and saves `test-output/demo.mp4`. `overlay.js` adds the cursor, captions, and title cards, and knows each question's answer. Re-encode it and refresh the poster: `ffmpeg -i test-output/demo.mp4 -vf "setpts=PTS/1.15,fps=30,format=yuv420p" -c:v libx264 -preset slow -crf 26 -tune stillimage -movflags +faststart -an docs/demo.mp4` and `ffmpeg -ss 34 -i docs/demo.mp4 -frames:v 1 -q:v 3 docs/demo-poster.jpg`. Check frames before publishing. The Pages workflow copies the video to the practice site. The README plays a copy the teacher uploaded through github.com (a user-attachments URL), so a new recording needs the teacher to upload it again. Re-record after visible UI changes
- `curriculum/`: saved course pages (`INDEX.md` lists them)
- `tests/gas-mock.js`: stand-in for Google services; `tests/browser-student.js` answers a whole test through the real controls

## Rules that protect test validity

- **Never use `eval` or `new Function` in shipped code.** Apps Script's sandbox may block them, and I could not confirm otherwise. Tests may use them to compare against real JavaScript.
- **Never run student input as code.** Only generator-written lines and word-bank tokens reach the interpreter.
- **Answer keys come from running the code**, not from reasoning by hand. Tests compare the interpreter with real JavaScript.
- **Grade by behavior.** A scrambled or filled-in answer that really works earns full credit, even when it differs from the canonical answer.
- **Keep scrambled lines free of indentation.** The app indents the student's current order.
- **Tests use no distractor lines.** Research shows little exam benefit and more time spent.
- **Never write `//` or `/*` inside a string in shipped code.** Google's HtmlService strips them even there, which leaves a blank page. Write `/\/` instead. `tests/google-strip.test.js` checks this.
- **Students type only numbers.** Use a `number` question for values, and a word bank for code, so a typo can't look like a misunderstanding.
- **Keep text and fields usable at 200% text size, in both themes.** Size things in rem, color them with tokens, and don't add sideways scrolling to code. `tests/contrast.test.js` checks contrast for the tokens.

## Adding a lesson's test

1. **Read the lesson and everything before it** in `curriculum/`. Only use what students have been taught by then. List what they have NOT seen at the top of the lesson file, as `src/lessons/u2la1-3.js` does.
2. **Match the course's code style:** no semicolons, `==` for comparing, `let`, `if(x > 1){` spacing, and `}` on its own line before `else`.
3. **Create `src/lessons/<lesson>.js`** and add it to `LESSON_FILES` in `tools/sources.js`.
4. **Define slots with skills** `concepts`, `flow`, or `build`, and cover all three. Give each slot at least 3 to 4 structurally different patterns of about the same difficulty. Renaming variables alone doesn't make a new pattern.
5. **Set `defaults` and `priority`.** The priority order is used when a teacher asks for fewer questions. `defaults.practice` sets whether the Sheet's Practice box starts ticked, so keep it false for lessons the class hasn't reached.
6. **Test for what students can't have seen.** List what's banned for this lesson under `notYetTaught` in the lesson definition. The generator tests check every question against it, along with the course's style rules.
7. **Run `npm test` and `npm run differences`,** then read the output of `npm run sample` as a teacher would. Passing tests don't prove the questions read well.
8. **Check it in a browser.** Run the `code-check` server from `.claude/launch.json`, then have `tests/browser-student.js` answer a whole test and confirm exactly 100%. `tests/dist/sheet-simulator.html?open=<lesson>` opens a test in the Sheet version. Look at each new question type at 1366x768, since Chromebooks are the likely device, in both themes.
9. **Rebuild,** run `npm run samples`, and tell the teacher to follow **When the code changes** in the README.

## Later lessons will need engine work

- **All of Units 1 to 4 are built.** The teacher chose JavaScript, and tests for every course lesson. Their schedule file uses Python names from an older plan, and only its order matters.
- **Language support:** loops, objects, arrays with their methods, and classes all work. Arrow functions such as those in `forEach` do not, so they can only be displayed.
- **More of p5:** `CC.makeHostGlobals` and `CC.p5Functions` in `src/engine.js` list what sketches can call. `vec.frames` plays changing mouse and key values across frames.
- **New interaction types:** add a renderer in `src/questions.js` and a grader in `src/engine.js`. Keep every interaction usable by touch, mouse, and keyboard, with no dragging required.
- **End-of-unit tests:** use `CC.defineComposite`, as `src/lessons/unit2.js` does. Add it after that unit's lessons in `LESSON_FILES`, and consider including one or two slots from an earlier unit.

## Limits to stay honest about

- On 2026-11-01 one full test ran on Google's real servers from the teacher's own account, and the score reached all the tabs, including the `QUERY` reports. The teacher confirmed the link opens in a private window signed in only as a test student, and that account can't open the Restricted Sheet. A full test from a student-only login and a whole class at once are untested. Say so if that's still true.
- The mock models values, not formatting, `QUERY` formulas, locks, quotas, or Google's removal of comments from pages.
- Grading happens in the student's browser, so a determined student could fake a score. Supervision is the safeguard.
