> For the complete documentation index, see [llms.txt](https://cs4all-icm.gitbook.io/js-intro-to-computational-media-2.0/llms.txt). Markdown versions of documentation pages are available by appending `.md` to page URLs; this page is available as [Markdown](https://cs4all-icm.gitbook.io/js-intro-to-computational-media-2.0/curriculum-extras/timers-in-p5.js.md).

# Timers in p5.js

How can I create simple timers using p5.js functionality?

### When To Use This Extra

This is an extra, optional lesson that is not officially a part of the p5.js curriculum. If you would like to teach this lesson, our recommendation would be:

* **Earliest:** You could teach this lesson once students learn conditionals, so anytime after U2LA1.3: Logical Operators And/Or.
* **Natural Flow:** As a part of U3LA4.1: Sound to prepare for the mini-project
* **Natural Flow:** As a part of Unit 4 lessons on animation, or as part of the Tamagotchi Project

This could also be used as a targeted extension for students who need a push towards extra content.

### Overview && Teacher Feedback

In this lesson, students will learn how to create timers using the looping nature of the draw function in p5.js and conditional statements. To take advantage of this, they will also need to learn about modulos which will require a mini, low-lift math lesson.

### Objectives

Students will be able to...

* Create program timers using the functionality of p5.js
* Utilize control structures such as conditional statements to keep time in a program
* Test their programs for usability

### Suggested Duration

\~1-2 Periods (45-90 minutes)

### NYS Standards

* **9-12.CT.4** Implement a program using a combination of student-defined and third party functions to organize the computation.
* **9-12.CT.8** Develop a program that effectively uses control structures in order to create a computer program for practical intent, personal expression, or to address a societal issue.
* **9-12.CT.9** Systematically test and refine programs using a range of test cases, based on anticipating common errors and user behaviors.

### Vocabulary

* **modulo** == a mathematical operation that returns the remainder of a division problem. It can be represented in code as % or in some languages, MOD.
* **frameRate ==** the rate at which new frames of the canvas are produced by the draw function. Typically about 60 frames per second.

### Planning Notes

|                                                                             Planning Notes                                                                             |   Materials Needed  |
| :--------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-----------------: |
| While there are no specific planning notes, you may want to research modulo operations and determine if you need any additional resources to explain them to students. | See Planning Notes. |

### Resources

* [What is a modulo?](https://youtu.be/oqJTPyS2rUg) (Youtube Video)
* [Timers in p5.js ](https://youtu.be/aXu99naMKOs)(Youtube Video)
* [p5 Timer Example Code](https://editor.p5js.org/marynotari/sketches/S1T2ZTMp-)

### Assessments

* Firework Project

### Do Now/Warm Up

Imagine you are making a program that needs a timer - maybe it's a game and you only have 10 seconds to score as many points as possible. Write out the pseudocode you imagine you would need to make this happen.

### Creating Timers

As a class, take a look at the pseudocode that students have written. Here are some common solutions and their big problems that you should review as a class:

1. **Using a while loop:** This probably says something like 'While timer > 5, timer -= 5' or similar. The problem with this is it WILL count down, but it will do it so rapidly that we aren't even aware the counting was happening. We need something that will take each second (or whatever the duration) into account before adding or subtracting any time from the total.
2. **Using a built-in time function, like millis().** This is a function in the p5 library that counts how many milliseconds have elapsed since a program began running. It can *certainly* be used to create a timer, but it may require a little more mental loops than the method we are learning today. This is a great thing for students to extend their thinking about in the future!

We need to do something a little different in our code. We want to follow the following steps:

1. Create a variable to hold the amount of time (this could be time remaining or something that will start at 0 and count up to a specific value)
2. Write code that will increment the amount of time IF one second has passed.

Making the variable should be easy enough, as that is something we have done many, many times before. The second part might seem weird - how can we tell if one second has passed? To do that, we are going to take a peek at a brand new mathematic operation.

### Introducing the Modulo

Feel free to reference [this Youtube Video](https://youtu.be/oqJTPyS2rUg) to get started on modulos. Another good introduction is to explain the modulo to students: it looks like a %, is sometimes written as MOD in code, and it does a *very specific thing.* Write a few examples on the board and ask students if they can figure out what's happening. Some examples might look like:

* 4 % 2 = 0
* 5 % 2 = 1
* 10 % 2 = 0
* 13 % 2 = 1

Or:

* 16 % 4 = 0
* 12 % 4 = 0
* 22 % 4 = 2
* 23 % 2 = 1

Try to give them examples where you are modding by several different numbers to avoid students generalizing incorrectly (like saying 'it gives 0 for even numbers and 1 for odd numbers'). The conclusion that students should come to, and the definition you should review together, is a modulo returns the REMAINDER of a division problem. 25 / 5 has no remainder, so 25 % 5 would equal 0. However, 27 / 5 would have a remainder of 2, so 27 % 5 equals 2.

This is a simple overview and mods are a very powerful tool in programming and encryption, but for now, that's all we need to know!

So now let's think: how can we use modulos to figure out if a single second has passed in our program?

### Timers Using Frame Count

If you haven't found it already, there is a property in p5 called frameCount that counts how many times the draw loop has repeated since the program began running. (Each time it repeats and draws itself, this is considered making a new frame.) On average, the frameRate - which directly impacts the frameCount - is about 60 frames per second. See where we're going with this?

Every time 60 frames have occurred, one second has passed, so if frameCount % 60 == 0, we know one second has gone by. So we can write something like this in our code:

```javascript
timer = 5

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  
  if (timer > 0 && frameCount % 60 == 0){
    text(timer, 200,200)
    timer -= 1
  }
  if (timer == 0){
    text("Timer Done!", 200, 200)
  }
}
```

### Changing Emojis Student Practice

Take this important information on timers and ask students to create their own project. There are A LOT of options of things they can create, but a simple one is to have students create 3 - 4 emojis on the page. Give each emoji a timer that is set to go off at different times; once the timer goes off (either by counting down or up to a specific value), have the emoji either change its face or change its features. (This could include color changes or shapes changing to display a different expression.)

As an easy extension, have students split their timer into thirds and make a different expression for each third of the timer.

### Wrap-Up

Ask students to share their creations with the group, either by sharing on the board or by completing a mini gallery walk.

### Extensions

As an easy extension, have students split their timer into thirds and make a different expression for each third of the timer.

Aim to have students create their emojis as object literals to make sure all the variables are held in one place and can easily be changed. There are LOTS of creative ways they could apply this to make their code more efficient!

If students are already in Unit 4 and have worked on motion/animation, consider having them use the timers to make a fireworks show!
