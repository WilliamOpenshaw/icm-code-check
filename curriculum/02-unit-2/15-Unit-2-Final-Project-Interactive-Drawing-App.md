> For the complete documentation index, see [llms.txt](https://cs4all-icm.gitbook.io/js-intro-to-computational-media-2.0/llms.txt). Markdown versions of documentation pages are available by appending `.md` to page URLs; this page is available as [Markdown](https://cs4all-icm.gitbook.io/js-intro-to-computational-media-2.0/unit-2-respond-and-draw-on-canvas/unit-2-final-project-interactive-drawing-app.md).

# Unit 2 Final Project: Interactive Drawing App

How can I use my skills in p5.js to create an interactive drawing application?

<figure><img src="https://3365989970-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F6CpkJAKaYOwA5TCz4W7l%2Fuploads%2FcHRGdeosSzhatN7W6987%2Fimage.png?alt=media&amp;token=8d03beda-a4a8-4766-927a-7ec4c7578053" alt=""><figcaption><p>Image of MS Paint circa 2001</p></figcaption></figure>

### Prompt

Remember the days of Microsoft Paint? (If you don't, you can take a field trip to 1998 [with this emulator](http://127.0.0.1:5000/s/tUpfie3pkg7cJrwQEthi/unit-1-draw-and-draw-with-functions).) When you could click a start bar, open a program that came preloaded on the computer, and just create? Those days were good. Those days were simple. Those days were internet free and possibly came with very little in the way of design sense.

We are better today; we have the tools needed to build our very own, p5 Microsoft Paint that looks better than ever before. And so that’s what we are going to do!

**Requirements**:

1. Create a program that allows you to draw with the mouse - this can be by simply moving it, or only when clicked.
2. Create at least 4 buttons that will control different aspects of the program, such as color changes.
3. Create at least 4 key press reactions that will control different aspects of the program, such as brush type.
4. Utilize objects to control multiple attributes of the same element (such as the drawing tool), or the same attribute of multiple elements (such as the button colors).
5. Create functions to control any repeated code and make your program as efficient as possible.
6. Make sure the user understands how to use your program!
7. **EXTEND YOUR WORK:** If you finish the above requirements, look into some of the extensions below, such as how to save your work.

**Writing Prompt:**

Write a sales pitch for your program that includes instructions on how to use it and persuasive reasoning behind why you made your specific design choices.

### Sample Output

<figure><img src="https://3365989970-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F6CpkJAKaYOwA5TCz4W7l%2Fuploads%2FoiQqu4SLUA4mADtodEYc%2FScreen%20Shot%202023-01-18%20at%202.09.59%20PM.png?alt=media&amp;token=2f65937a-9b1b-4215-897b-543d2d42b3e9" alt=""><figcaption><p>Several screengrabs of sample programs</p></figcaption></figure>

You can additionally see an interactive version of a [mid-level project](https://editor.p5js.org/cmorgantywls/sketches/rux1mjZLD), and can also take a look at the [same project with a few extensions added](https://editor.p5js.org/cmorgantywls/sketches/GxoCEUEoS).

If students are struggling with the abstraction components, it may help to display sample code and talk through what may be inside these custom functions and what other functions they may want to create together:

<figure><img src="https://3365989970-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F6CpkJAKaYOwA5TCz4W7l%2Fuploads%2FAk0Lm2kX9BMaww9sdejD%2FScreen%20Shot%202023-01-18%20at%2012.47.14%20PM.png?alt=media&amp;token=71a65e78-f928-41bd-b7d6-bcad697ccedd" alt=""><figcaption><p>Sample cod eof a draw function displaying multiple lines of custom functions</p></figcaption></figure>

### Extensions

There are many ways to extend this project. Students can create more aesthetic interfaces (some students have been known to recreate computer GUI), or they can add more button/key options. They can also consider:

* Have one button that will always generate a random color
* Allow the user to change the colors displayed to a new palette
* Make an eraser
* Make a way to clear the canvas
* Make complex brush types (draw with different shapes, or with designs)
* Create a website to house your creation
* Make your canvas a saved image (see below)

#### OPTIONAL EXTENSION: Make Your Canvas a Saved Image

*You are welcome to briefly teach students how to program in a save option using the* [*built in saveCanvas() function*](https://p5js.org/reference/#/p5/saveCanvas) *or* [*save function*](https://p5js.org/reference/#/p5/save)*. The former requires the canvas to be stored in a variable, but the latter will just save an image of the canvas by default. If you choose to introduce this to students, they should use them in a major callback function outside of the draw function to avoid repetition, such as mousePressed or keyPressed, like so:*

```javascript
/// Option 1 - mousePressed major callback
//mousePressed happens outside of and after draw (built in event listener for p5.js)

function mousePressed(){
   save("myCanvas.jpg")
}
```

```javascript
// Option 2 - keyPressed major callback
//keyPressed happens outside and after draw (built in event listener in p5.js)

function keyPressed(){
  if(key==='s'){
    save("myCanvas.jpg")
  }
}
```

### Overview && Teacher Feedback

This culminating project of Unit 2 challenges students to make an interactive application that will allow a user to draw (and change their drawing tool in a variety of ways). Some students will approach this head on and make very obvious drawing applications, and some will enjoy an opportunity to flex and explore their design skills. Both are fantastic approaches to this project.

This is a complex project, and students will need to carefully manage their code to avoid getting lost. Encourage them to use comments as often as possible to keep things straight!

This will be the most challenging project students have encountered so far, as it requires combining many skills and dealing with a complex control flow. Students may need help ‘chunking’ their projects so they do not become overwhelmed and try to do everything at once.

Suggestions for this are available in the Project Introduction, but you can also create worksheets or other resources if you think it will help your students navigate the creation of their drawing application.

### Culturally Responsive Best Practices

Within this design-based challenge, there are many prompts you can give students to make the project seem more relevant to them and the cultures of the communities that they are a part of. (Please recall that communities can refer to a lot of things, including just the culture of being a teen, a Minecraft player, or a KPop fan - be mindful that you are allowing students to explore choice in their creations in a way that is authentic to them!)

**Possible CR-SE Prompts:**

1. Recreate your own version of MS paint so that it includes colors, stamps, and elements that you will find useful for your art projects.
2. Create a drawing app that includes features specific to a certain community (ex: color schemes that reflect your community, or drawing tools that create an important pattern used within a community).
3. Create a drawing app that is accessible to all users in your community (take into account color blindness, button size, etc)
4. Create a drawing app that allows users to quickly put together images and shapes to address specific issues on a shareable image (ex. animal shapes, logos of nonprofits, slogans (text)).

### Objectives

Students will be able to:

* Showcase skills learned in Unit 2
* Create a drawing application with button and key press reactions that allow the user to draw with the mouse

### Suggested Duration

1-2 45 minute periods for launch & Planning

3-4 45 minute periods for work time

*This is all quite subjective; in early projects, you should adjust pace to suit your students so they can make something they are proud of. But this project should take about a week.*

### Assessments

***This project serves as the final summative Assessment for Unit 2. Assessments beyond the final product will need to be assessed on a day-to-day basis.***

Assess the final project. Check for the ability to:

* Experiment with the commands of a programming language.
* Create a program that can have different outputs based on different key and/or mouse inputs
* Create a creative drawing program.

Assess wrap-ups and progress. Check for the ability to:

* Describe different things they tried in order to achieve a goal.
* Explain why they chose to include the specific components of their prototype over others.
* Explain how their prototype can be used by someone else.

### Do-Now/Warm-Up (3-5 minutes)

Ask students to go back to the good ol’ days and think about MS Paint (or any other drawing application) OR have them play with the MS Paint emulator/another drawing application. What could you do with it? What couldn’t you do?

### Prompt Info Guidance

This is a big project as there is a lot of control-flow happening here beyond just drawing order. It is useful to ask students to consider an MVP - minimum viable product - before beginning, and plan around that. You can do this easily with planning worksheets.

You'll want students to break down their site to determine where they are using all of their skills - especially creating variables, object literals, and functions - and it may also be helpful to help them draw out their user interface prior to beginning to code.

To keep track of student progress, ask them to take a piece of paper and fold it into thirds. Label each one ‘NOW,’ ‘SOON,’ and ‘LATER.’ Students should write on post its what they need to do to complete their MVPs and put in appropriate columns. Things the finish from now will be removed from the paper, and then items from soon and later will move up. It is recommended to have students complete this or some sort of planning activity before they begin!

### Daily Wrap-Up

A good practice, especially during long term projects, is to have students share their progress. You can do this through volunteers, or as is my preference, through random selection.

This share out method can be used outside of project time, as well. Use a calendar to sign up 1-2 students per day, working your way through your roster (and then repeating once you reach the end). Each day, be sure to conference or check in with students who will share so they are aware they are sharing and also know what they will talk about. Students can share successes or struggles - if they share a success, they should focus on what they did to make it happen (so the class can learn). If they share a struggle, they should ask questions that the class can then assist them. Allow about 5 minutes for both shares.
