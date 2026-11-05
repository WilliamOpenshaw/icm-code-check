// U3LA3.1 to U3LA4.1: images, ml5 (optional in the course), fonts, and sound. No real media
// loads here. The stand-ins in engine.js record what a sketch asks for, so these tests check
// the code and the ideas, not how a picture or sound comes out.
var CodeCheck = typeof CodeCheck !== 'undefined' ? CodeCheck : {};

(function (CC) {
  'use strict';

  const kit = CC.kit;
  const U = CC.u1;
  const U3 = CC.u3;
  const { tok } = kit;
  const { slot, choice } = U;
  const noClasses = [[/\bclass\s/, 'classes (Unit 4)']];
  const IMAGES = ['tree.png', 'birch.jpg', 'cat.png', 'moon.gif', 'city.jpeg'];
  const VARS = ['tree', 'pic', 'photo', 'scene'];
  const sketch = { kind: 'sketch', vectors: [{}] };

  U3.lesson('U3LA3.1', 'Preload, Images, Tint', '12-U3LA3.1-Preload-Images-Tint.md', 15, 9, noClasses, [
    slot('preload', 'concepts', 'Knowing why images load in preload()', {
      purpose(r) {
        return choice(r, 'What is the purpose of preload()?', 'It finishes loading files before setup() and draw() begin', ['It draws the image on the canvas', 'It makes files smaller', 'It runs on every frame'], 'Without it, the program may try to use a file that hasn\'t finished loading.');
      },
      order(r) {
        return U3.rows(r, 'What order do these run in?', [['preload()', 0], ['setup()', 1], ['draw()', 2]], ['first', 'second', 'then over and over'], 'preload, then setup once, and then draw repeatedly.', undefined, 'Function');
      },
      fileName(r) {
        const file = r.pick(IMAGES);
        return choice(r, `Your file is named ${file}. Which call loads it?`, `loadImage("${file}")`, [`loadImage(${file})`, `loadImage("${file.split('.')[0]}")`, `image("${file}")`], 'The name has to be exact, in quotation marks, with its file extension.', { codeOptions: true });
      },
    }),
    slot('fileTypes', 'concepts', 'Recognizing image file types and scene layers', {
      types(r) {
        return U3.rows(r, 'Is each one an image file?', [[r.pick(['tree.png', 'tree.jpeg']), 0], [r.pick(['moon.gif', 'moon.svg']), 0], [r.pick(['song.mp3', 'song.wav']), 1], [r.pick(['sketch.js', 'index.html']), 1]], ['image', 'not an image'], 'Common image types are .png, .jpeg, .gif, .tiff, and .svg.', undefined, 'File');
      },
      layers(r) {
        return U3.rows(r, 'In which part of a scene does each one belong?', [['Elements farthest away', 0], ['Elements in the middle', 1], ['Elements at the very front', 2]], ['background', 'middle ground', 'foreground'], 'Draw from the back to the front.', undefined, 'Description');
      },
      tintMeaning(r) {
        return choice(r, 'What does tint() do?', 'It puts a colored overlay on images drawn after it', ['It resizes an image', 'It loads an image file', 'It changes the shape of the canvas'], 'Think of it like a photo filter.');
      },
    }),
    slot('image', 'flow', 'Reading image() and tint() calls', {
      width(r) {
        const v = r.pick(VARS); const w = 10 * r.int(5, 30); const h = 10 * r.int(5, 30);
        return kit.numberQuestion({ prompt: 'How wide is this image drawn?', code: [`image(${v}, 200, 300, ${w}, ${h})`], answer: w, explain: 'The order is the image, x, y, width, and height.' });
      },
      count(r) {
        const n = r.int(2, 5); const v = r.pick(VARS);
        const code = [`let ${v} = loadImage("tree.png")`, `for(let i = 0; i < ${n}; i++){`, `  image(${v}, i * 100, 0, 50, 50)`, '}'];
        return kit.numberQuestion({ prompt: 'How many times does this draw the image?', code, answer: U.shapesOf(code).shapes.length, explain: 'One image per pass through the loop.' });
      },
      tinted(r) {
        const [a, b] = r.sample(['255, 0, 0', '0, 0, 255', '0, 200, 0'], 2);
        const code = ['let pic = loadImage("tree.png")', `tint(${a})`, 'image(pic, 0, 0, 50, 50)', 'image(pic, 100, 0, 50, 50)', `tint(${b})`];
        return kit.numberQuestion({ prompt: `How many images are drawn with the tint (${a})?`, code, answer: U.shapesOf(code).shapes.filter((s) => s[3] === a.replace(/ /g, '')).length, explain: 'A tint affects images drawn after it, until it changes.' });
      },
    }),
    slot('bug', 'flow', 'Finding bugs in image code', {
      noQuotes(r) {
        const f = r.pick(IMAGES); const base = f.split('.')[0];
        const code = (e) => ['function preload(){', `  pic = loadImage(${e})`, '}'];
        return U3.bug(r, { prompt: `This should load ${f}.`, code: code(`${base}`), fixed: code(`"${f}"`), line: 1, why: 7, kind: 'sketch', explain: 'The file name goes in quotation marks, with its extension.' });
      },
      wrongOrder(r) {
        const w = 10 * r.int(5, 20);
        const code = (a) => ['let pic = loadImage("tree.png")', `image(${a})`];
        return U3.bug(r, { prompt: `The image should be at (0, 0), and ${w} wide and tall.`, code: code(`${w}, ${w}, pic, 0, 0`), fixed: code(`pic, 0, 0, ${w}, ${w}`), line: 1, why: 7, explain: 'The image comes first, and then x, y, width, and height.' });
      },
      tintAfter(r) {
        const t = r.pick(['255, 0, 0', '0, 0, 255']);
        const a = `image(pic, ${10 * r.int(0, 30)}, 0, 100, 100)`; const b = `tint(${t})`;
        return U3.bug(r, { prompt: 'The image should be tinted.', code: ['let pic = loadImage("tree.png")', a, b], fixed: ['let pic = loadImage("tree.png")', b, a], line: [1, 2], why: 9, explain: 'Set the tint before you draw the image.' });
      },
    }),
    slot('blanks', 'build', 'Completing image code', {
      load(r) {
        const f = r.pick(IMAGES);
        return kit.blanksQuestion(r, { prompt: `Complete the code so ${f} loads before anything else, and gets drawn on every frame.`, lines: [['let pic'], ['function ', tok('preload', 'f'), '(){'], [`  pic = `, tok('loadImage', 'g'), `("${f}")`], ['}'], ['function ', tok('draw', 'f'), '(){'], ['  ', tok('image', 'g'), '(pic, 0, 0, 100, 100)'], ['}']], must: ['f', 'g'], count: 3, pools: { f: ['mousePressed', 'keyPressed'], g: ['fill', 'rect'] }, spec: sketch, explain: 'Load in preload(), and draw in draw().' });
      },
      place(r) {
        const x = 10 * r.int(1, 30); const y = 10 * r.int(1, 30); const w = 10 * r.int(5, 20);
        return kit.blanksQuestion(r, { prompt: `Complete the call so the image is at (${x}, ${y}), and is ${w} wide and tall.`, lines: [['let pic = loadImage("tree.png")'], ['image(', tok('pic', 'v'), ', ', tok(x, 'n'), ', ', tok(y, 'n'), ', ', tok(w, 'n'), `, ${w})`]], must: ['n'], count: 3, pools: { v: ['tree'], n: [x + 5, y + 15] }, spec: U.spec(), explain: 'The image, x, y, width, and height.' });
      },
      tint(r) {
        return kit.blanksQuestion(r, { prompt: 'Complete the code so only the second image is tinted.', lines: [['let pic = loadImage("tree.png")'], [tok('image', 'g'), '(pic, 0, 0, 50, 50)'], [tok('tint', 'g'), `(${r.pick(['255, 0, 0', '0, 0, 255'])})`], [tok('image', 'g'), '(pic, 100, 0, 50, 50)']], must: ['g'], count: 2, pools: { g: ['fill', 'rect'] }, spec: U.spec(), explain: 'The tint goes between the two images.' });
      },
    }),
    slot('parsons', 'build', 'Putting image code in order', {
      whole(r) {
        const f = r.pick(IMAGES);
        return U3.parsons(r, [`In preload(), load ${f} into pic.`, 'In draw(), paint a background, and draw the image.'], ['function preload(){', `pic = loadImage("${f}")`, '}', 'function draw(){', 'background(220)', 'image(pic, 0, 0, 100, 100)'], 'preload stands on its own, ahead of draw.', [{ text: 'let pic' }], [{ text: '}' }], sketch);
      },
      layers(r) {
        return U3.parsons(r, ['Load back.png, and then front.png.', 'Draw the back image first.', 'Tint, and then draw the front image.'], ['let back = loadImage("back.png")', 'let front = loadImage("front.png")', 'image(back, 0, 0, 400, 400)', `tint(${r.pick(['255, 0, 0', '0, 0, 255', '0, 200, 0'])})`, 'image(front, 100, 100, 200, 200)'], 'The background goes first, so that the front image lands on top.');
      },
      row(r) {
        const n = r.int(3, 6);
        return U3.parsons(r, ['Load the image.', `Loop ${n} times.`, 'Draw the image each time, 60 further to the right.', 'Print "Done" after the loop.'], ['let pic = loadImage("tree.png")', `for(let i = 0; i < ${n}; i++){`, 'image(pic, i * 60, 0, 50, 50)', '}', 'console.log("Done")'], 'The image is loaded once, but drawn many times.');
      },
    }),
  ]);

  U3.lesson('U3LA3.2', 'Images and Arrays with ml5', '13-U3LA3.2-Images-and-Arrays-with-ml5.md', 12, 8, noClasses, [
    slot('ml', 'concepts', 'Understanding machine learning', {
      define(r) {
        return choice(r, 'What is machine learning?', 'A kind of AI where systems improve from data without being directly programmed', ['A machine that writes code on paper', 'Any program that runs quickly', 'A way of storing images in an array'], 'The model learns from the information it is given.');
      },
      flawed(r) {
        return choice(r, 'A model was mostly trained on photos of one group of people. What is the likely problem?', 'It may be biased, and work worse for other people', ['It will be perfect for everyone', 'It will run out of memory', 'It will stop using arrays'], 'A model reflects the data it was given.');
      },
      allKnowing(r) {
        return choice(r, 'Which statement about machine learning models is true?', 'They can be flawed, because people and data shape them', ['They know everything', 'They never make mistakes', 'They don\'t need any data'], 'Machine learning does not create an all-knowing being.');
      },
    }),
    slot('terms', 'concepts', 'Knowing the words for this lesson', {
      match(r) {
        return U3.rows(r, 'Which word matches each description?', [['Training a computer to do what we\'d call thinking', 0], ['Unfairly favoring or opposing a person or group', 1], ['A collection of functions you can reference in code', 2]], ['artificial intelligence', 'bias', 'library'], 'ml5 is a library for machine learning.', undefined, 'Description');
      },
      ml5(r) {
        return choice(r, 'What is ml5?', 'A machine learning library that is friendly for beginners', ['A type of image file', 'A p5 shape function', 'A website for fonts'], 'It lets you use models like MobileNet from JavaScript.');
      },
      mobilenet(r) {
        return choice(r, 'What is MobileNet being used for in this lesson?', 'Identifying what is in an image', ['Drawing shapes on the canvas', 'Loading a font', 'Playing sound files'], 'It is a pretrained image classifier.');
      },
    }),
    slot('arrays', 'flow', 'Using an array of images', {
      name(r) {
        const files = r.sample(IMAGES, 3); const i = r.int(0, 2);
        const code = [`let files = ["${files.join('", "')}"]`, `console.log(files[${i}])`];
        return kit.traceChoice(r, { code, wrong: files.map((f) => [f]), explain: 'Each element holds a file name.' });
      },
      loop(r) {
        const n = r.int(2, 5);
        const code = ['let pics = []', `for(let i = 0; i < ${n}; i++){`, '  pics[i] = loadImage("pic" + i + ".png")', '}', 'console.log(pics.length)'];
        return kit.printedNumber({ prompt: 'What number does this print?', code, explain: 'One image is stored per pass.' });
      },
      fileBuilt(r) {
        const i = r.int(1, 5);
        const code = [`let spot = ${i}`, 'console.log("pic" + spot + ".png")'];
        return kit.traceChoice(r, { code, wrong: [[`pic${i + 1}.png`], ['picspot.png'], ['pic.png']], explain: '+ joins strings with the value of the variable.' });
      },
    }),
    slot('blanks', 'build', 'Completing code with an array of images', {
      load(r) {
        const n = r.int(2, 5);
        return kit.blanksQuestion(r, { prompt: `Complete the code so pics holds ${n} loaded images.`, lines: [['let pics = ', tok('[]', 'e')], [`for(let i = 0; i < `, tok(n, 'n'), '; i++){'], ['  pics[', tok('i', 'v'), '] = ', tok('loadImage', 'f'), '("pic" + i + ".png")'], ['}'], ['console.log(pics.length)']], must: ['e', 'f'], count: 3, pools: { e: ['0', '""'], n: [n + 2], v: ['width'], f: ['image', 'fill'] }, spec: U.spec([{ width: 400 }]), explain: 'Start empty, and load one per pass.' });
      },
      show(r) {
        const i = r.int(0, 2);
        return kit.blanksQuestion(r, { prompt: `Complete the code so it draws the image at index ${i}.`, lines: [['let pics = [loadImage("a.png"), loadImage("b.png"), loadImage("c.png")]'], [tok('image', 'f'), '(pics[', tok(i, 'n'), '], 0, 0, 100, 100)']], must: ['n'], count: 2, pools: { f: ['fill', 'rect'], n: [i + 1, i + 2] }, spec: U.spec(), explain: 'The array element takes the image\'s place.' });
      },
      random(r) {
        return kit.blanksQuestion(r, { prompt: 'Complete the code so it picks a random image from pics.', lines: [['let pics = [loadImage("a.png"), loadImage("b.png"), loadImage("c.png")]'], ['let spot = ', tok('floor', 'f'), '(random(pics.', tok('length', 'p'), '))'], [`image(pics[spot], ${r.int(0, 90)}, 0, 100, 100)`]], must: ['f', 'p'], count: 2, pools: { f: ['fill', 'image'], p: ['size', 'count'] }, spec: U.spec(), explain: 'floor and random make a valid index.' });
      },
    }),
    slot('parsons', 'build', 'Putting image array code in order', {
      all(r) {
        const n = r.int(2, 4);
        return U3.parsons(r, ['Make pics an empty array.', `Loop ${n} times, loading "pic" + i + ".png" into index i.`, 'Then loop over pics, drawing each image.'], ['let pics = []', `for(let i = 0; i < ${n}; i++){`, 'pics[i] = loadImage("pic" + i + ".png")', '}', 'for(let j = 0; j < pics.length; j++){', 'image(pics[j], j * 100, 0, 90, 90)', '}'], 'Images have to be loaded before they get drawn.');
      },
      pick(r) {
        const f = r.sample(IMAGES, 2);
        return U3.parsons(r, [`Make pics hold ${f[0]} and ${f[1]} as loaded images.`, 'Pick a random index.', 'Draw that image.', 'Print the index, and then "Done".'], [`let pics = [loadImage("${f[0]}"), loadImage("${f[1]}")]`, 'let spot = floor(random(pics.length))', 'image(pics[spot], 0, 0, 100, 100)', 'console.log(spot)', 'console.log("Done")'], 'Each line depends on the one before it.');
      },
      preload(r) {
        return U3.parsons(r, ['In preload(), load two images into the pics array.', 'In draw(), draw the first image, and then the second.'], ['function preload(){', `pics[0] = loadImage("${r.pick(IMAGES)}")`, 'pics[1] = loadImage("second.png")', '}', 'function draw(){', 'image(pics[0], 0, 0, 50, 50)', 'image(pics[1], 60, 0, 50, 50)'], 'Loading goes in preload(), and drawing goes in draw().', [{ text: 'let pics = []' }], [{ text: '}' }], sketch);
      },
    }),
  ]);

  const FONTS = ['Georgia', 'Arial', 'Courier', 'Verdana'];

  U3.lesson('U3LA3.3', 'Fonts && Text Styling', '14-U3LA3.3-Fonts-and-Text-Styling.md', 12, 8, noClasses, [
    slot('type', 'concepts', 'Knowing about fonts and readable text', {
      serif(r) {
        return U3.rows(r, 'What kind of font is each?', [[r.pick(['Times New Roman', 'Georgia']), 0], [r.pick(['Arial', 'Verdana']), 1], ['Has small flourishes on its letters', 0], ['Has no flourishes on its letters', 1]], ['serif', 'sans-serif'], 'Sans means "without".', undefined, 'Item');
      },
      rules(r) {
        return U3.rows(r, 'Is each one good practice for text in a project?', [['Keep the number of fonts to a minimum', 0], ['Use enough contrast to be readable', 0], ['Put everything in all capitals', 1], [r.pick(['Make important text blink', 'Color text red on green']), 1]], ['good practice', 'avoid'], 'Blinking can trigger seizures, and red and green are hard for people with color blindness.', undefined, 'Choice');
      },
      font(r) {
        return choice(r, 'What is a font?', 'A set of text characters in a specific style and size', ['A way of drawing shapes', 'A type of image', 'A list of colors'], 'Sites like Google Fonts host many of them.');
      },
    }),
    slot('calls', 'flow', 'Predicting how text gets styled', {
      size(r) {
        const [a, b] = r.sample([14, 18, 24, 28, 32, 40], 2);
        const code = [`textSize(${a})`, 'text("First", 10, 40)', `textSize(${b})`, 'text("Second", 10, 80)'];
        return kit.numberQuestion({ prompt: 'What size is the word Second?', code, answer: U.shapesOf(code).shapes[1][3], explain: 'A style applies to the text drawn after it.' });
      },
      keep(r) {
        const a = r.pick([14, 18, 24, 28]);
        const code = [`textSize(${a})`, 'text("First", 10, 40)', 'text("Second", 10, 80)'];
        return kit.numberQuestion({ prompt: 'What size is the word Second?', code, answer: U.shapesOf(code).shapes[1][3], explain: 'The size stays until it is changed.' });
      },
      position(r) {
        const x = 10 * r.int(1, 30); const y = 10 * r.int(1, 30);
        const code = [`text("Hello", ${x}, ${y})`];
        return kit.numberQuestion({ prompt: 'What is the y value of this text?', code, answer: U.shapesOf(code).shapes[0][1][2], explain: 'The order is the string, x, and y.' });
      },
    }),
    slot('bug', 'flow', 'Finding bugs in text code', {
      afterText(r) {
        const s = r.pick([24, 28, 32]); const say = `text("Hello", ${10 * r.int(1, 30)}, 40)`;
        return U3.bug(r, { prompt: `The text should be size ${s}.`, code: [say, `textSize(${s})`], fixed: [`textSize(${s})`, say], line: [0, 1], why: 9, explain: 'Set the size first.' });
      },
      noQuotes(r) {
        const f = r.pick(FONTS); const y = 10 * r.int(2, 9);
        return U3.bug(r, { prompt: `The text should use the font ${f}.`, code: [`textFont(${f})`, `text("Hello", 10, ${y})`], fixed: [`textFont("${f}")`, `text("Hello", 10, ${y})`], line: 0, why: 7, explain: 'The font name is a string, typed exactly.' });
      },
      noText(r) {
        const x = 10 * r.int(1, 20); const y = 10 * r.int(1, 20);
        return U3.bug(r, { prompt: 'This should show the word Hello.', code: [`text(Hello, ${x}, ${y})`], fixed: [`text("Hello", ${x}, ${y})`], line: 0, why: 7, explain: 'Words need quotation marks.' });
      },
    }),
    slot('blanks', 'build', 'Completing text code', {
      styled(r) {
        const s = r.pick([24, 28, 32]); const f = r.pick(FONTS);
        return kit.blanksQuestion(r, { prompt: `Complete the code so the word Hello is in ${f} at size ${s}.`, lines: [[tok('textFont', 'f'), `("${f}")`], [tok('textSize', 'f'), '(', tok(s, 'n'), ')'], [tok('text', 'f'), '("Hello", 10, 50)']], must: ['f'], count: 3, pools: { f: ['fill', 'rect'], n: [s + 10] }, spec: U.spec(), explain: 'Set the font and size, and then draw the text.' });
      },
      color(r) {
        const x = 10 * r.int(1, 20);
        return kit.blanksQuestion(r, { prompt: `Complete the code so the text is red, and starts at x = ${x}.`, lines: [[tok('fill', 'f'), '(255, 0, 0)'], ['text("Hello", ', tok(x, 'n'), ', 50)']], must: ['f', 'n'], count: 2, pools: { f: ['background', 'rect'], n: [x + 5, 50 + x] }, spec: U.spec(), explain: 'fill colors text, as it does shapes.' });
      },
      preload(r) {
        const f = r.pick(['fun.ttf', 'cool.otf']);
        return kit.blanksQuestion(r, { prompt: `Complete the code so the downloaded font ${f} loads first.`, lines: [['let font'], ['function ', tok('preload', 'p'), '(){'], ['  font = ', tok('loadFont', 'l'), `("${f}")`], ['}'], ['function draw(){'], ['  ', tok('textFont', 'l'), '(font)'], ['  text("Hi", 10, 50)'], ['}']], must: ['p', 'l'], count: 3, pools: { p: ['mousePressed', 'keyPressed'], l: ['fill', 'rect'] }, spec: sketch, explain: 'Files load in preload(), like images.' });
      },
    }),
    slot('parsons', 'build', 'Putting text code in order', {
      twoLines(r) {
        const [a, b] = r.sample([14, 18, 24, 28, 32, 40], 2);
        return U3.parsons(r, ['Set the font to Arial.', `Set the size to ${a}, and draw the title.`, `Set the size to ${b}, and draw the subtitle.`], ['textFont("Arial")', `textSize(${a})`, 'text("Title", 10, 40)', `textSize(${b})`, 'text("Subtitle", 10, 80)'], 'Each style goes before the text that uses it.');
      },
      fontFile(r) {
        return U3.parsons(r, ['In preload(), load the font file.', 'In draw(), set the font and size, and then draw the text.'], ['function preload(){', `font = loadFont("${r.pick(['fun.ttf', 'cool.otf'])}")`, '}', 'function draw(){', 'textFont(font)', 'textSize(30)', 'text("Hi", 10, 50)'], 'Files load before they get used.', [{ text: 'let font' }], [{ text: '}' }], sketch);
      },
      colored(r) {
        return U3.parsons(r, ['Paint a background.', 'Set a dark fill.', 'Set the size.', 'Draw the text.', 'Draw a line under it.'], [`background(${r.pick([220, 240, 255])})`, 'fill(30)', 'textSize(24)', 'text("Hello", 10, 50)', 'line(10, 60, 100, 60)'], 'The background goes first, and the styles go before the text.');
      },
    }),
  ]);

  const SOUNDS = ['sax.wav', 'drum.mp3', 'bell.wav', 'clap.mp3'];

  U3.lesson('U3LA4.1', 'Loading & Playing Sound Files', '16-U3LA4.1-Loading-and-Playing-Sound-Files.md', 15, 9, noClasses, [
    slot('formats', 'concepts', 'Knowing about sound files and compression', {
      lossy(r) {
        return choice(r, 'What does lossy compression mean?', 'Some of the original data is left out to make the file smaller', ['The file is lost if it isn\'t saved', 'No data gets removed at all', 'The file gets larger and clearer'], 'MP3 is lossy, which keeps file sizes small.');
      },
      formats(r) {
        return U3.rows(r, 'Which format best fits each description?', [['Recommended for short sounds', 0], ['Often used for a full song or part of a song', 1], ['Keeps all of its audio data', 0], ['Became popular for its small files', 1]], ['.wav', '.mp3'], '.wav keeps its data, and .mp3 is compressed.', undefined, 'Description');
      },
      playsWhere(r) {
        return choice(r, 'Why shouldn\'t you call play() directly inside draw()?', 'draw() repeats, so the sound keeps restarting over itself', ['Sounds can\'t be used in functions', 'draw() can\'t read variables', 'It makes the canvas smaller'], 'Trigger sounds from a single event, such as a key press.');
      },
    }),
    slot('rights', 'concepts', 'Understanding usage rights', {
      license(r) {
        return U3.rows(r, 'Which license does each describe?', [['You must credit the original author', 0], ['New works must use the same terms', 1], ['You can\'t change the work', 2], ['New works can\'t be for sale', 3]], ['Attribution', 'ShareAlike', 'NoDerivs', 'NonCommercial'], 'These are Creative Commons terms.', undefined, 'Rule');
      },
      keepLinks(r) {
        return choice(r, 'Why should you keep a link to every sound you download?', 'So you can give credit, and check its license', ['So the sound loads faster', 'So that it becomes your own work', 'p5 reads the link to play the sound'], 'Attribution can go in a code comment.');
      },
      free(r) {
        return choice(r, 'A song is free to listen to online. Does that mean you can use it in your project?', 'Not necessarily, since its license decides that', ['Yes, anything online is free to use', 'Yes, as long as the project is small', 'No, because sounds can never be reused'], 'Listening and reusing are different rights.');
      },
    }),
    slot('flow', 'flow', 'Following when a sound plays', {
      keyOnce(r) {
        const f = r.pick(SOUNDS); const k = r.pick(['p', 's', 'b']); const n = r.int(2, 5);
        const code = ['let sound', 'function preload(){', `  sound = loadSound("${f}")`, '}', 'function keyPressed(){', `  if(key == '${k}'){`, '    sound.play()', '  }', '}'];
        const frames = [];
        for (let i = 0; i < n; i++) frames.push({ keyIsPressed: true, key: k }, { keyIsPressed: false });
        const logs = kit.printed(code, { frames }, 'sketch');
        return kit.numberQuestion({ prompt: `The ${k} key is pressed and let go ${n} times. How many times does the sound start?`, code, answer: logs.length, explain: 'keyPressed() runs once for each press.' });
      },
      inDraw(r) {
        const f = r.pick(SOUNDS); const n = r.int(2, 5);
        const code = ['let sound', 'function preload(){', `  sound = loadSound("${f}")`, '}', 'function draw(){', '  sound.play()', '}'];
        const logs = kit.printed(code, { frames: Array.from({ length: n }, () => ({})) }, 'sketch');
        return kit.numberQuestion({ prompt: `This runs for ${n} frames. How many times does the sound start?`, code, answer: logs.length, explain: 'draw() runs on every frame, so it restarts every time.' });
      },
      guarded(r) {
        const f = r.pick(SOUNDS); const n = r.int(2, 5);
        const code = ['let sound', 'function preload(){', `  sound = loadSound("${f}")`, '}', 'function draw(){', '  if(sound.isPlaying() == false){', '    sound.play()', '  }', '}'];
        const logs = kit.printed(code, { frames: Array.from({ length: n }, () => ({})) }, 'sketch');
        return kit.numberQuestion({ prompt: `The sound lasts much longer than ${n} frames. How many times does it start?`, code, answer: logs.length, explain: 'After it starts, isPlaying() is true, so play() doesn\'t run again.' });
      },
    }),
    slot('bug', 'flow', 'Finding bugs in sound code', {
      noParens(r) {
        const f = r.pick(SOUNDS); const v = r.pick(['sound', 'song', 'beat', 'clip']);
        const code = (c) => [`let ${v} = loadSound("${f}")`, c];
        return U3.bug(r, { prompt: 'This should play the sound.', code: code(`${v}.play`), fixed: code(`${v}.play()`), line: 1, why: 8, explain: 'A method needs parentheses to run.' });
      },
      wrongName(r) {
        const f = r.pick(SOUNDS); const v = r.pick(['sound', 'song', 'beat', 'clip']);
        const code = (c) => [`let ${v} = loadSound("${f}")`, c];
        return U3.bug(r, { prompt: 'This should play the sound.', code: code(`${v}.start()`), fixed: code(`${v}.play()`), line: 1, why: 7, explain: 'The method is .play().' });
      },
      loader(r) {
        const f = r.pick(SOUNDS); const v = r.pick(['sound', 'song', 'beat', 'clip']);
        const code = (c) => [`let ${v} = ${c}("${f}")`, `${v}.play()`];
        return U3.bug(r, { prompt: 'This should load and play a sound file.', code: code('loadImage'), fixed: code('loadSound'), line: 0, why: 7, explain: 'Sounds use loadSound().' });
      },
    }),
    slot('blanks', 'build', 'Completing sound code', {
      load(r) {
        const f = r.pick(SOUNDS);
        return kit.blanksQuestion(r, { prompt: `Complete the code so ${f} loads first, and plays once per key press.`, lines: [['let sound'], ['function ', tok('preload', 'f'), '(){'], ['  sound = ', tok('loadSound', 'g'), `("${f}")`], ['}'], ['function ', tok('keyPressed', 'f'), '(){'], ['  sound.', tok('play', 'm'), '()'], ['}']], must: ['f', 'm'], count: 3, pools: { f: ['draw', 'mousePressed'], g: ['loadImage', 'loadFont'], m: ['start', 'run'] }, spec: { kind: 'sketch', vectors: [{ frames: [{ keyIsPressed: true, key: 'a' }, { keyIsPressed: false }, { mouseIsPressed: true }] }] }, explain: 'Load in preload(), and play in keyPressed().' });
      },
      keys(r) {
        const [a, b] = r.sample(['s', 'd', 'k', 'l'], 2);
        return kit.blanksQuestion(r, { prompt: `Complete the code so ${a} plays drum, and ${b} plays bell.`, lines: [['let drum = loadSound("drum.mp3")'], ['let bell = loadSound("bell.wav")'], ['function keyPressed(){'], ['  if(key == ', tok(`'${a}'`, 'k'), '){'], ['    ', tok('drum', 'v'), '.play()'], ['  }'], ['  if(key == ', tok(`'${b}'`, 'k'), '){'], ['    ', tok('bell', 'v'), '.play()'], ['  }'], ['}']], must: ['k'], count: 3, pools: { k: ["'z'"], v: ['sound'] }, spec: { kind: 'sketch', vectors: [{ frames: [{ keyIsPressed: true, key: a }] }, { frames: [{ keyIsPressed: true, key: b }] }] }, explain: 'Each key check goes with its own sound.' });
      },
      guard(r) {
        const f = r.pick(SOUNDS);
        return kit.blanksQuestion(r, { prompt: `Complete draw() so ${f} only starts when it isn't already playing.`, lines: [[`let sound = loadSound("${f}")`], ['function draw(){'], ['  if(sound.', tok('isPlaying', 'm'), '() == ', tok('false', 'b'), '){'], ['    sound.', tok('play', 'm'), '()'], ['  }'], ['}']], must: ['m'], count: 2, pools: { m: ['stop', 'start'], b: ['true'] }, spec: sketch, explain: 'Check first, and then play.' });
      },
    }),
    slot('parsons', 'build', 'Putting sound code in order', {
      whole(r) {
        const f = r.pick(SOUNDS);
        return U3.parsons(r, ['In preload(), load the sound.', 'In mousePressed(), play the sound.'], ['function preload(){', `sound = loadSound("${f}")`, '}', 'function mousePressed(){', 'sound.play()', '}'], 'Each one stands on its own as a function.', [{ text: 'let sound' }], [{ text: 'console.log("Ready")' }], { kind: 'sketch', vectors: [{ frames: [{ mouseIsPressed: true }] }] });
      },
      keyCheck(r) {
        const k = r.pick(['p', 's', 'b']);
        return U3.parsons(r, [`In keyPressed(), if the key is ${k}, play the sound.`, 'Otherwise, stop it.'], ['function keyPressed(){', `if(key == '${k}'){`, 'sound.play()', '}', 'else{', 'sound.stop()', '}', '}'], 'play goes with the if, and stop goes with the else.', [{ text: `let sound = loadSound("${r.pick(SOUNDS)}")` }], [], { kind: 'sketch', vectors: [{ frames: [{ keyIsPressed: true, key: k }, { keyIsPressed: false }, { keyIsPressed: true, key: 'q' }] }] });
      },
      sequence(r) {
        const [a, b] = r.sample(SOUNDS, 2);
        return U3.parsons(r, [`Load ${a} into first.`, `Load ${b} into second.`, 'Play first.', 'Stop first.', 'Play second.'], [`let first = loadSound("${a}")`, `let second = loadSound("${b}")`, 'first.play()', 'first.stop()', 'second.play()'], 'A sound has to be loaded before it can play.');
      },
    }),
  ]);
})(CodeCheck);

if (typeof module !== 'undefined') module.exports = CodeCheck;
