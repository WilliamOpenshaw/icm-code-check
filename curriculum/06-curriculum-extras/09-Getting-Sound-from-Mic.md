> For the complete documentation index, see [llms.txt](https://cs4all-icm.gitbook.io/js-intro-to-computational-media-2.0/llms.txt). Markdown versions of documentation pages are available by appending `.md` to page URLs; this page is available as [Markdown](https://cs4all-icm.gitbook.io/js-intro-to-computational-media-2.0/curriculum-extras/getting-sound-from-mic.md).

# Getting Sound from Mic

How can user generated sound control program elements?

### When to Use

This lesson is fairly brief, but it is suggested that students know how to use the map function as well as conditionals for the best experience.

* **Earliest:** After U1.LA4.4: Random Function & Variables *(Students will be unable to do the portions of the lesson that involve the map function or conditionals.)*
* **Natural Flow:** After U2LA2.2: The Map Function. This is a natural opportunity and reason to practice using the map function along with skills they have learned previously.
* **Natural Flow:** After U3LA4.1: Loading & Playing Sound Files. While this does not directly relate to loading or playing sounds, it does involve using sound to control program elements, which can tie together nicely.
* **Most Ideal/Natural Flow:** This is a great callback of past skills to introduce prior to or during the Unit 5 Final Project.

### Overview && Teacher Feedback

This is a fairly brief and straightforward lesson - the most fun comes from the play. In p5.js, it's a very quick and easy process to get input from the mic and use that value to control elements of the program. Students generally enjoy using inputs to control their programs, and they'll come up with a lot of creative projects as a result of this lesson!

### Objectives

Students will be able to...

* Integrate input from the computer's microphone to their program
* Use volume levels of audio input to control program elements

### Suggested Duration

1 Period (\~45 minutes)

### NYS Standards

**9-12.CT.2** Collect and evaluate data from multiple sources for use in a computational artifact.

**9-12.CT.7** Design or remix a program that utilizes a data structure to maintain changes to related pieces of data.

### Vocabulary

* **p5.AudioIn** - a class built into the p5.js sound library that allows the program to connect to your computer's microphone

### Resources

* [Microphone Input ](https://www.youtube.com/watch?v=q2IDNkUws-A)- p5.js Tutorial (Youtube Video)
* [p5.AudioIn](https://p5js.org/reference/#/p5.AudioIn) (p5 Reference Sheet)

### Assessment

Final Lesson Project (varies)

### Do-Now/Warm Up

*Ask students:*

What are some of the different ways we can interact with technology? Think about all the different technologies you use in a day, and all of the different ways that you interact with them.

### Getting Audio in Our Program

Once students have come up with their list, highlight the option they have to talk to their technology. (Such as saying 'Hey Google' etc.) Today, students are going to get to a point where they can get programs that will start responding to sound from the microphone - to start, they will only be using the volume from the sound, but there is another optional lesson that uses ml5 to classify the sounds they are saying.

Ask students to point their browsers to a new, blank editor. To start, let's just capture the microphone and see what it reports back, like so:

```javascript
let mic

 function setup(){
  createCanvas(400, 400)
  mic = new p5.AudioIn() //gets the incoming audio
  mic.start() //starts reading incoming audio
}

function draw(){
  background(0)
  console.log(mic.getLevel()) //gets the current volume of mic input
}
```

When students run this example, they should first see this (exactly, if they're in Chrome, or as some similar pop up in another browser)

<figure><img src="https://3365989970-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F6CpkJAKaYOwA5TCz4W7l%2Fuploads%2FAMIXB96u6wRnbHmBJvi9%2Fimage.png?alt=media&amp;token=da39ae40-ffad-40e7-8028-d4862ecc7e4f" alt=""><figcaption><p>Pop up notification asking user to allow or block the microphone use.</p></figcaption></figure>

We want to hit 'Allow' so that our browser can get data from our microphone. Stress to students that this is acceptable as we know what this website is doing with our microphone data - since we are writing the code that will use it - but they should be cautious about just hitting allow on any website they are confronted with.

Once students have hit allow, they should see a bunch of numbers being printed to the console. Have students practice talking/snapping/clapping near their computer's microphone to watch how this value changed. Ask students to all be as quiet as possible to see what the lowest number they can get is, and then as loud as possible (within reason - you know how thin your walls are!) to see what the highest number they can get is. They should notice that they are always getting numbers between 0 and 1, and most likely those values are between 0.01 and 1.

So, what if they wanted to use this value? They could just try saving it to a variable and plugging it directly into a part of their program, like here where it controls the size of an ellipse:

```javascript
let mic

 function setup(){
  createCanvas(400, 400)
  mic = new p5.AudioIn() //gets the incoming audio
  mic.start() //starts reading incoming audio
}

function draw(){
  background(0);
  let circSize = mic.getLevel()
  
  ellipse(200, 200, circSize)
}
```

They should notice that their circle is very, VERY, speck-of-dust-style small. That's because this number is incredibly miniscule - we need a way to make it bigger! One option that we can use to scale values is to multiply them by a larger number, as seen here:

```javascript
let mic

 function setup(){
  createCanvas(400, 400)
  mic = new p5.AudioIn() //gets the incoming audio
  mic.start() //starts reading incoming audio
}

function draw(){
  background(0)
  let circSize = mic.getLevel()
  
  ellipse(200, 200, circSize*200)
}
```

This is a completely acceptable solution, but it doesn't give us the most control. Now, our circle will always be somewhere between 0 and 200 pixels in size, based on the little expression we have set up to calculate size. But what if we want the circle to always be between 100 and 200? Or 200 and 400?

To do that, we need to use the map function. The map function, if we recall, takes a changing variable, it's original range (in this case, 0 to 1), and a new range. It then 'maps' the original range to the new range so that all the values proportionally line up. In this example, we might say:

```javascript
let mic

 function setup(){
  createCanvas(400, 400)
  mic = new p5.AudioIn() //gets the incoming audio
  mic.start() //starts reading incoming audio
}

function draw(){
  background(0)
  let circSize = map(mic.getLevel(), 0, 1, 100, 350)
  
  ellipse(200, 200, circSize)
}
```

Now, when the volume is 0, the circSize will be set to 100. When the volume is as loud as possible - 1 - it will be 350. If the volume is somewhere in between, the mic level will be proportionally matched to a value between 100 and 350. Allow students time to test by talking/clapping/snapping near the microphone again.

### Create Something Sound-Reactive

Ask students to either:

* Duplicate a past project with a clear design, such as the emoji project OR
* Create a new brief design.

They will be trying to use microphone input to make several elements of their program reactive to the volume coming in from the microphone. By using the map function, or multiplying the .getLevel() value by different numbers, they should be able to make multiple elements react a little differently.

### Wrap Up

Structured shares:

Ask students to share their project on the board and explain how it works and one challenge they had. At the start of their share, have the class make a variety of levels of noise to get the project to react appropriately.

### Extension Activity

See if students can use this volume power for good - ask students to create something like a volume meter that will react if someone is too loud or too quiet.
