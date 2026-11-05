> For the complete documentation index, see [llms.txt](https://cs4all-icm.gitbook.io/js-intro-to-computational-media-2.0/llms.txt). Markdown versions of documentation pages are available by appending `.md` to page URLs; this page is available as [Markdown](https://cs4all-icm.gitbook.io/js-intro-to-computational-media-2.0/curriculum-extras/using-sliders.md).

# Using Sliders

How can I use sliders to control elements of my program?

### When to Use This Extra

This is a brief lesson that can be used anytime after students have created variables. If you make an easy-to-follow guide, this can even be something that could be used as an **extension or sub lesson** when you want students to explore but are not necessarily available to offer guidance.

* **Earliest/Natural Flow:** After U1LA3.2: Custom Variables in p5.js
* **Natural Flow:** During Unit 5 as students are expanding on their final projects

### Overview && Teacher Feedback

This lesson is going to be a very brief overview of sliders that will allow students to start engaging with an HTML DOM element very early on. They don't need to understand every single piece to get the basics and get their slider working!

As mentioned above, this is fairly straightforward, and it could easily be given as an extension or sub lesson if you create a guide that is easy for students to follow. Essentially, keep this one in your back pocket and feel free to pull it out whenever your students need a little something extra to keep their interest!

### Objectives

Students will be able to:

* Create sliders to control values in their program
* Understand the basic functionality of sliders

### Suggested Duration

\~1 - 2 Periods (45 - 90 Minutes)

### NYS Standards

**9-12.CT.4** Implement a program using a combination of student-defined and third-party functions to organize the computation.

### Vocabulary

**sliders -** an HTML element you can add to your page to control values of a variable by clicking/dragging the dot on the slider.

### Resources

* [Sliders Reference](https://p5js.org/reference/p5/createSlider/) (Reference Sheet)
* [Interacting with DOM using Sliders ](https://youtu.be/587qclhguQg)(Youtube Video)

### Assessments

Slider Art Assignment (Formative)

### Do-Now/Warm Up

**Display on board:** Describe how we have set and changed variable values in the past. Are there interactions we may want to allow users to have that could change the value of different variables?

*Allow students time to think and brainstorm and clarify as necessary that this could be clicking, typing, etc - have them think to ways they have interacted with other apps and websites!*

### Introducing Sliders

Today, we are introducing a new thing that we can use in our sketches to help control values in our programs: the slider! Sliders are technically an HTML element that we use to control parts of our JavaScript code. (This is part of the HTML Document Object Model, or HTML DOM, that we may explore at various points in the year.)

Sliders look a bit like this:

<figure><img src="https://3365989970-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F6CpkJAKaYOwA5TCz4W7l%2Fuploads%2F7WONVjsCjAZFfbs712l7%2Fimage.png?alt=media&amp;token=82af2bf8-b742-4092-9b75-ee77c433b29d" alt=""><figcaption><p>Three sliders labeled red, green, blue at different levels on a lavender screen.</p></figcaption></figure>

We are going to recreate essentially this example to control the background of a sketch together, so let's open up a blank editor so we can get started. **NB:** *You are basically recreating the example from the reference sheet, so feel free to use that as guidance!*

**Sliders always have three parts:**

1. Defining a variable and setting it to a slider. *This can have ANY name!*
2. Giving the slider a (x,y) position on your page.
3. Declaring a variable in your program that takes the value from the slider. *Ideally, we do this in draw because it is always running and thus always updating based on new slider values.*

Once students have their blank editor open, begin coding along this example of making a slider that controls just the red value of their background:

```javascript
let redSlider, r

function setup() {
  createCanvas(400, 400);
  redSlider = createSlider(0, 255, 50)
  redSlider.position(10,10)
}

function draw() {
  r = redSlider.value()
  
  background(r, 220, 220);
}
```

Now let's think about what's happening:

1. On line 1, we create a variable to hold our slider.
2. On line 5, we create our slider and save it in the variable redSlider.
3. The (0, 255, 50) stand for the LOWEST value of the slider, the HIGHEST possible value of the slider, and the STARTING value of the slider. Ask students to change some of these values - starting with the STARTING value - to see how it changes things. Make sure students understand that THESE sliders go from 0 - 255 because that's our color number range - if the slider controlled something else, the range could look different!
4. On line 6, we are giving a position to the slider. Without this, you will notice the slider exists under the canvas. Similar to step 3, ask students to change these values to move the slider around the page.
5. And finally, on line 10, we make a variable to capture the value of the slider and use that variable in our background (on line 12).

Tah-dah! Now, ask students to create *two more sliders*. They can either do this independently or, ideally, they can work with a partner where each will take turns creating a slider while the other navigates them. The two remaining sliders should work to control the green and blue values of the background. When they are done, they should have three distinct sliders on their screen.

### Sliders & Modern Art Challenge

Look at the fine art examples below. Try to recreate one in p5.js - then, try to make it interactive using the slider AND other elements that you have learned about! (Each slide shows several different works - try to think about just ONE work from an artist, or think about your favorite elements of each that you could combine)

**Note:** We have used sliders to control color, but they can control *anything with a numeric value.* What could you have them control that *isn't* a color? How could this affect your final product?

<figure><img src="https://3365989970-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F6CpkJAKaYOwA5TCz4W7l%2Fuploads%2FC6YmjISHtdEAIqLt6R8E%2Fimage.png?alt=media&amp;token=ccc5f05e-f569-4c0d-87ae-046c5f255db3" alt=""><figcaption><p>Alexander Calder Art</p></figcaption></figure>

<figure><img src="https://3365989970-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F6CpkJAKaYOwA5TCz4W7l%2Fuploads%2F57PaPr18PImY8vl5zQ6F%2Fimage.png?alt=media&amp;token=36aea0a7-d3b2-47b3-968b-b7eeda7d8c75" alt=""><figcaption><p>Mary Corse Art</p></figcaption></figure>

<figure><img src="https://3365989970-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F6CpkJAKaYOwA5TCz4W7l%2Fuploads%2FBBgu2SBMjbgYlQVBVBFf%2Fimage.png?alt=media&amp;token=c6eb08eb-900c-48d5-8b3e-6cd177a2ad59" alt=""><figcaption><p>Olafur Eliasson</p></figcaption></figure>

<figure><img src="https://3365989970-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F6CpkJAKaYOwA5TCz4W7l%2Fuploads%2FSMqY3atnvBKTqqnaQ2FN%2Fimage.png?alt=media&amp;token=24116689-1d19-483a-aab5-bf8825afebfb" alt=""><figcaption><p>Dan Flavin Art</p></figcaption></figure>

<figure><img src="https://3365989970-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F6CpkJAKaYOwA5TCz4W7l%2Fuploads%2F97UI1cOuhaDiHAsE3bRW%2Fimage.png?alt=media&amp;token=72b26ef4-9228-443f-84cc-885f9cf67197" alt=""><figcaption><p>Carmen Herrera Art</p></figcaption></figure>

<figure><img src="https://3365989970-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F6CpkJAKaYOwA5TCz4W7l%2Fuploads%2FrBaXyEiPVIo5xPsxbWfN%2Fimage.png?alt=media&amp;token=18ea8196-093d-4d5b-84f2-b0303d2de2d7" alt=""><figcaption><p>Vassily Kandinsky Art</p></figcaption></figure>

### Wrap Up

Conclude with a gallery walk activity in which students circulate and get a chance to play with as many projects as possible by manipulating the sliders. Ask students to leave feedback either as code comments or on post its lefts near the computers.

### Extensions

Sol Le Witt is an artist famous for large installations, but many of them were not actually created by the artist - rather, the artist created instructions and would send the instructions to museums for them to recreate. (Now that he is deceased, this is the only way to recreate his work!)

Ask students to follow a Sol Le Witt tutorial from one of the following resources, or to try to create their own Sol Le Witt style tutorial in pseudocode that other students could follow:

1. [Whitney Kid's Tutorial](https://whitney.org/education/families/kids-art-challenge/sol-lewitt)
2. [SF MoMA Tutorial](https://www.sfmoma.org/read/drawing-with-instructions/)
3. [National Gallery of Art Tutorial](https://www.nga.gov/learn/teachers/lessons-activities/new-angles/sol-lewitt.html)
