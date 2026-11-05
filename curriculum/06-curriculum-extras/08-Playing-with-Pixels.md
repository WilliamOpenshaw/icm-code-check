> For the complete documentation index, see [llms.txt](https://cs4all-icm.gitbook.io/js-intro-to-computational-media-2.0/llms.txt). Markdown versions of documentation pages are available by appending `.md` to page URLs; this page is available as [Markdown](https://cs4all-icm.gitbook.io/js-intro-to-computational-media-2.0/curriculum-extras/playing-with-pixels.md).

# Playing with Pixels

How can I utilize the pixel values on a canvas to create interactive work?

### When to Use This Extra

This lesson requires students to have a solid understanding of dictionaries, for loops, and how to import images into their program.

* **Earliest/Natural Flow:** Anytime after lesson **U3LA3.1 Loading Images.** At this point, students will have covered all things they need to be successful in this lesson.
* **Natural Flow:** This lesson is a great inclusion as a part of Unit 5, possibly before students move into their final projects.

### Objectives

Students will be able to:

* Load pixels from a canvas
* Save pixel data into a usable dictionary
* Utilize pixel data to create designs in their programs

### Suggested Duration

\~2 - 3 Days (\~45 - 135 minutes)

### NYS Standards

**9-12.CT.4** Implement a program using a combination of student-defined and third-party functions to organize the computation.

**9-12.CT.7** Design or remix a program that utilizes a data structure to maintain changes to related pieces of data.

**9-12.DL.1** Type proficiently on a keyboard.

**9-12.DL.2** Communicate and work collaboratively with others using digital tools to support individual learning and contribute to the learning of others.

### Vocabulary

* **pixel -** a minute area of [illumination](https://www.google.com/search?sca_esv=570966760\&rlz=1C5GCEM_en\&sxsrf=AM9HkKkGzf9_5xNa9I8naIaFZCLp271oGg:1696515853821\&q=illumination\&si=ALGXSlb91IXEiYApD91csfAulari_bO0BSo1Plg_iuFefmHS8p1LSkeeo4MTEV90lL_5OA0ybsVot2EpXR99T9IU_dF9TSlOd27V7OdDatv3ngVx3Bh5Ucc%3D\&expnd=1) on a display screen, one of many from which an image is composed.
* **`loadPixels()` -** a function that will load color values for every pixel currently a part of the canvas into an array called `pixels`.
* **`get()` -** will take specific values from the `pixels` array. (Can also be used to get other data, but that is how we will see it in this lesson!)

### Resources

* [Completed Sample Code](https://editor.p5js.org/cmorgantywls/sketches/sFh5vlXaZ) (p5 editor)
* [loadPixels()](https://p5js.org/reference/#/p5.Image/loadPixels) and [get()](https://p5js.org/reference/#/p5.TypedDict/get) (p5 Reference Sheet)
* Starter Code ([p5 editor](https://editor.p5js.org/cmorgantywls/sketches/ChC78YB1a))

### Do Now/Warm Up (\~3-5 minutes)

When we give shapes a size in p5.js, what unit are we measuring in? What do you think the size of that unit is?

### Exploring and Capturing Pixels (15 minutes)

Begin by explaining the do now - the units they are measuring in are actually *pixels*. Each pixel is a tiny area of illumination on the screen - really just a dot! (If students have ever adjusted screen settings, they may have noticed they'll be listed in DPI or PPI - literally dots per inch or pixels per inch.)\
\
Everything they see on a screen is just made up of pixels, and they have been controlling the appearance of those pixels in their p5.js sketches. In addition to telling the pixels how to look, we can also load all the pixel data of a project and use that to make some cool interactive projects - including hidden images, which is what we will explore together today!

To begin, we will make a copy of the Starter Code ([p5 editor](https://editor.p5js.org/cmorgantywls/sketches/ChC78YB1a)). Notice that there isn't much there - we have created two variables at the top of our page, added a preload function and loaded an image, and done a tricky little thing of setting our canvas equal to the width and height of our image. But nothing is displaying or doing anything interesting yet!

**NB:** *This starter code is fairly basic - if you would prefer, you can have students begin with a blank canvas to practice loading images, or you can create your own version with an image other than the default puppy one.*

Our first goals are to display our image on the screen, load the pixels from the image into a saved data structure, and then get the pixel color data to be a little more organized.

Let's start by displaying our image on the screen:

```javascript
//GLOBAL VARIABLES
let img
let pDictionary = {}

function preload(){
	img = loadImage("puppy.png") //load image
}

function setup() {
  let canvas = createCanvas(img.width, img.height)
  
  image(img, 0, 0) //display image on screen, top left corner of image on top left corner of screen
	
  //background(220) //cover image
}

function draw() {
  
}
```

Easy enough, right? Now let's load in our pixels. For our purposes, these code blocks will *only show the setup() function -* please know the other parts are still there, we are just trying to focus in!

```javascript
function setup() {
  let canvas = createCanvas(img.width, img.height)
  
  image(img, 0, 0) //display image on screen
  loadPixels() //load all pixels of current screen - creates an array of all pixels on the screen
	
  //background(220) //cover image
}
```

This is also an easy, one-line step! Now part of the magic of the `loadPixels()` function is it automatically populates a system variable called `pixels` with an array of all the color values of the pixels. This array is *huge* - so big we can't recommend printing it to the console because your editor may crash - because it contains color values for *every pixel.* On a canvas that is 500 by 500 pixels, there are *250,000 pixels!* That's a lot of information!

Because of this, we are going to populate the object literal `pDictionary` which is declared at the top of the code using some for loops. When declaring the variable we already let our code know that it will be an object with the curly braces, so we can go about trying to get useful values into it.

Now, to get the data into that object, we need to loop through every possible x value and every possible y value in our canvas. For each one, we want to create a new dictionary key that is easy for us to read - let's say it'll look something like `'x,y'` with appropriate values filled in - and use that key to save the color value in a dictionary. For this, we will use the `get()` function, which is part of Processing.py and will automatically access the `pixels` array to find our color information at the appropriate coordinate.

**NB:** *We are going to use string interpolation in this process. String interpolation requiers using back ticks - to the left of the 1 key on your keyboard - and essentially allows you to easily combine variables into strings in your program. If this is confusing, you're welcome to explore other ways of combining the values, like writing x+","+y if you do not feel like working on this new skill.*

We can use this process and check it by printing the value of PDictionary once we finish:

```javascript
function setup() {
  let canvas = createCanvas(img.width, img.height)
  
  image(img, 0, 0) //display image on screen
  loadPixels() //load all pixels of current screen - creates an array of all pixels on the screen
  
  for(x=0;x<width;x++){ //loop through every x value 
    for(y=0;y<height;y++){ //loop through every y with every x
      pDictionary[`${x},${y}`] = get(x, y) // create a new key for every x,y and save the color values for that pixel to the dictionary
      
      //alternately, if you do not want to use string interpolation:
      //newKey = x+","+y //save string 'x,y' to create object key
      //pDictionary[newKey] = get(x,y) //for every newKey, save color values
    }
  }
  
  //console.log(pDictionary) //optional!
  //background(220) //cover image
}
```

So now we have a super useful dictionary, but nothing is really going on in our program. We are going to make the actual activity happen in `draw()`! We only have one last thing to do here, which is to comment the `//background(220)` on the last line of `setup()` back in. This will cover the image, and this is what we want for what we will do next.

### Drawing with Pixels - Hidden Images (\~10 - 15 minutes)

Now in part 2, we are going to take all that good, juicy data we setup for ourselves and use it to create a program that will slowly reveal a hidden image in a cool, watercolor-esque style.

To reveal our hidden image, we want to be able to take the current position of the mouse, use it to retrieve the correct color, and then draw an ellipse (really, a circle) on the screen with the correctly colored pixel for where our mouse is based on the image below it.

First, we need to know where the mouse is, which we know we can use `mouseX` and `mouseY` for. We also want to save that as a readable key for our dictionary, which is easy as we did something similar in `setup()` - but we have one spanner in the works: our mouseX and mouseY sometimes return *decimal* values, which won't match any of our dictionary keys. We can solve that by first rounding them with the `int()` function, then turning them to strings to create our key. The process would look like this:

<pre class="language-javascript"><code class="lang-javascript"><strong>function draw() {
</strong>    //The below example uses string interpolation - if you choose not to use it,
    //this would be your strategy:
    
    //currentLocation = int(mouseX)+","+int(mouseY)
    //fill(pDictionary[currentLocation])
    fill(pDictionary[`${int(mouseX)},${int(mouseY)}`])
    ellipse(mouseX,mouseY,10)
  
}
</code></pre>

If we play our program and move our mouse around the screen, we should see colored dots appearing, and we may even start to see the image coming through if we make a lot of them! We do have a few issues that we can sort out.

First, most importantly, you may notice that if you move the mouse *below* the bounds of the canvas it throws an error. This is something to do with how the display area below the canvas is read. We can fix it by just putting our previous code into a conditional so that the drawing only happens if we are above the bottom of the canvas:

```javascript
function draw() {
    if(mouseY < height){
        fill(pDictionary[`${int(mouseX)},${int(mouseY)}`])
        ellipse(mouseX,mouseY,10)
  }
}
```

Our second issues is that our ellipse may look a little sad given it has a solid black stroke around the outside, and with one uniform size of 10, it may be obnoxious to try to fill our whole shape. So let's fix both!

```javascript
function draw() {
    circSize = int(random 1, 15)

    if(mouseY < height){
        fill(pDictionary[`${int(mouseX)},${int(mouseY)}`])
        noStroke()
        ellipse(mouseX,mouseY,circSize)
  }
}
```

And tah-dah! Just like that, you have created a hidden image program.

### Utilizing Hidden Images (\~30 - 60+ min)

It's now going to be your turn to create something with a hidden image by recreating the same steps we learned here! Your goal should be to create a program with hidden images (created in setup) and always visible images (created in draw).

Anything made in `setup` will only be created once, at the beginning of the program, and when you use `loadPixels()` it will capture *everything on the screen in setup.* You can include multiple loaded images or even designs that you draw with p5.js shapes.

Anything made in `draw` will be drawn in the repeated loop of the draw function, meaning it will be always visible on the screen and cannot be drawn over.

Get as creative as you can!

### Wrap-Up (\~5-15 min)

Depending on the dedication you give to this project, you may have students just submit their work, or do some sort of gallery walk or presentation so that they can show off what they made to other people in the room.

### Extensions

Look for an application of this that is more than just aesthetic! You could create a game like [Hocus Focus](https://www.hocusfocus.fun/?reddit), which has a hidden image and a bullseye drawn on top of it. In this game, as you move the mouse the size of the rectangles you draw gets smaller and smaller so the image comes more and more into focus until you can find and click the rectangle.

If students are feeling adventurous, there is a function called `updatePixels()` which will update the values in the `pixels` array (which would likely necessitate repeating the steps in `setup()` to be useful to students) - they could explore this as an option after making changes to the program, for example, and it may give some students ideas of new ways to engage with their program.
