> For the complete documentation index, see [llms.txt](https://cs4all-icm.gitbook.io/js-intro-to-computational-media-2.0/llms.txt). Markdown versions of documentation pages are available by appending `.md` to page URLs; this page is available as [Markdown](https://cs4all-icm.gitbook.io/js-intro-to-computational-media-2.0/curriculum-extras/sound-recognition-with-ml5.md).

# Sound Recognition with ml5

How can I use machine learning to recognize sound?

### When to Use

This brief lesson lends itself well to extending the sound unit; it works especially well if you have introduced how to get user input from the microphone which exists in an additional, optional lesson.

* **Earliest:** After U3LA3.2: Images and Arrays with ml5 (follows on the concept of machine learning)
* **Most Ideal/Natural Flow:** After the Unit 4 lesson on animation/variable incrementation, as a way to loop back to using sound and build on those topics.
* **Most Ideal/Natural Flow:** As part of Unit 5, either before or after introducing the final project.

### Overview && Teacher Feedback

This lesson is very similar to the image classifier lesson - the functionality of the ml5 library is very similar, except now they will be using a sound recognition library that can identify the digits from zero to nine, up, down, left, right, go, stop, yes, and no (as well as identifying unknown words and background sound). The build will look the same, and again, the emphasis is on reading and using the code, so we suggest using starter code for this activity and building onto it.

As an important aside, if you do plan to build this from scratch with your students, you will need to ensure the ml5 library is linked in the HTML of your program:

```html
<script src="https://unpkg.com/ml5@latest/dist/ml5.min.js"></script>
```

### Objectives

Students will be able to:

* Use the ml5 library to create a program that recognizes input spoken by the user
* Create programs that react to spoken input words

### Suggested Duration

\~1-2 periods (45 - 90 minutes). *Time will be dependent on how much time you want to spend working on the project attached to the lesson.*

### NYS Standards

**9-12.CT.2** Collect and evaluate data from multiple sources for use in a computational artifact.

**9-12.CT.4** Implement a program using a combination of student-defined and third-party functions to organize the computation.

**9-12.CT.7** Design or remix a program that utilizes a data structure to maintian changes to related pieces of data.

### Vocabulary

* **machine learning -** an application of artificial intelligence (AI) that provides systems the ability to automatically learn and improve from experience without being explicitly programmed

### Resources

* [Coding Train Sound Classifier ](https://youtu.be/cO4UP2dX944)(Youtube Tutorial)
* [Starter Code](https://editor.p5js.org/cmorgantywls/sketches/JJ6V66ANp) (p5 Sketch)

### Assessment

**Summative:** Final lesson project

### Do-Now/Warm Up

Ask students what verbal commands they are able to give their phones. How are your devices able to understand what you are saying, based on what you've learned about technology, code, and machine learning?

### Sound Classification

Students should have come up with the idea that computers, via machine learning, have 'learned' to recognize sounds. And that's true, but maybe not in the way they think - computers actually learn to recognize the *image* of sound, and then match that to what is being said. It converts sounds into these soundwave images and then learns in a similar way to the image classifier they looked at in Unit 3:

<figure><img src="https://3365989970-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F6CpkJAKaYOwA5TCz4W7l%2Fuploads%2FiZYWsUWofwWA5iCdA0u4%2Fimage.png?alt=media&amp;token=4b38562b-2177-44f2-9fc1-f351f5298cff" alt=""><figcaption><p>Simplified image of a sound wave</p></figcaption></figure>

Also much like the image classification lesson, we will be using a pre-created machine learning library that can recognize the words for digits from zero to nine, up, down, left, right, go, stop, yes, and no (as well as identifying unknown words and background sound).

Have students make a copy of the starter code (if you are choosing to have them focus on reading the code) and we will walk through it line-by-line. Alternately, you can use the lines we go through as a way to help your students build out their code via a code-along.

Let's start by taking a look at the starter code (this has been adapted from the ml5 tutorial and Coding Train tutorial, both of which are wonderful):

```javascript
//Thanks for the tutorials, ml5 and The Coding Train! ❤️

let classifier

function preload(){
  let options = { probabilityThreshold: 0.7 }
  classifier = ml5.soundClassifier('SpeechCommands18w', options)
}

function setup() {
  createCanvas(400, 400)
  classifier.classify(gotResults)
}

function draw() {
  background(220)
}

function gotResults(error, results){
  if (error){
    console.log("oops")
    console.log(error)
  }
  console.log(results[0].label)
}
```

If you are going through line by line with students, be sure to offer them a chance to explain what they think is happening in code, and encourage them to take notes on what they figure out by leaving code comments.

Let's start from the top:

* **Line 3:** we create a global variable called 'classifier' that will hold the - you guessed it! - sound classifier model.
* **Line 5-8:** the ml5 library has been updated to work with the preload function, rather than needing a string of callbacks, which is great! This should look familiar from Unit 3. In this preload, we do two things: on line 7, we load the soundClassifier model (and the specific library it's referencing) into the classifier variable. We also feed it the 'options' which we set up as an object literal on line 6. These are things built into the ml5 library that we just need to define - here, we are setting a probability threshold which determines how sure the computer needs to be before reporting back to us. You can try adjusting the numbers later, and you can also look at the ml5/sound classifier reference page for more options you could set and change!
* **Line 12:** gets the classifier to run the gotResults function to classify any audio it hears. (This also turns the mic on all at once.)
* **Line 19-25:** Skipping over draw, let's peek at this function that we use as a callback. Notice it takes two inputs that we do not give it on line 12 - that's okay! Callback functions never have the () so they don't trigger immediately, and any inputs are passed as arguments *after* the callback. In this case, they are filled by informaiton that .classify() fills after running the callback function itself. Cool, huh?
* **Let's look inside the function:** Right now, it's going to give a message in the console and print the error if any error is found. It will also print the results - specifically the *first* result (results\[0]) and the label of that result.
* **Let's run it and test, and then we will make this more fun!**

When students run the program, ask them to try saying some of the keywords and pay attention to what is showing up in the console. They can try adjusting the probability threshold (anything between 0 and 1) to see if results vary, and you can also have a discussion of how certain thresholds may be problematic (either because they are too specific and may eliminate people with different speech patterns, or because they are too vague and don't give specific answers).

Once students are satisfied, let's try to get the canvas involved!

Let's say we want to get our results to display on the canvas - and eventually, we want to be able to *use* those outputs in our program. So let's start by creating a global variable up at the very top of our program, like this:

```javascript
let resultsText = ""
```

This will eventually hold the result of running the sound classifier, but right now, it's just set to an empty string. Let's adjust our gotResults function to make sure this variable gets a value:

```javascript
function gotResults(error, results){
  if (error){
    console.log("oops")
    console.log(error)
  }
  console.log(results[0].label)
  resultsText = results[0].label
}
```

Now, let's see if we can get our results on the canvas, like so:

```javascript
function draw() {
  background(220)
  text(resultsText,20,20)
}
```

Now, we should see our results not only in our console, but on our page! But there are probably more interesting ways we could use this....

### Code a Program Run by Voice

Using this model, students are going to code their own program that will take inputs from their voice using the keywords the model knows. The sky can really be the limit with this mini-project/task, but a simple version would be:

1. Make a shape/design that will move around the screen (up/down/left/right) with your voice.
2. Create 'food' objects that the shape can 'eat' for points.
3. Create 'poison' objects that the shape cannot touch without ending the game
4. Come up with a scorekeeping mechanism
5. Find a way to end the game if you a certain score is reached or the 'poison' object is touched.

But anything that uses these keywords would be a viable option, here!

Allow students time to work, independently or in pairs, to figure out how they would create their basic game.

### Wrap Up

Consider allowing students to do a gallery walk/game swap - they rotate to other computers, play the game, and leave feedback. Allow time for shout-outs at the end.

### Extension

The project itself can be extended to create a more complex or challenging game, or you can consider having students use the [Google Teachable Machine](https://teachablemachine.withgoogle.com/) to create a model trained on other keywords. The starter code would look similar except they would load in their own model instead of the SpeechCommands18w.
