> For the complete documentation index, see [llms.txt](https://cs4all-icm.gitbook.io/js-intro-to-computational-media-2.0/llms.txt). Markdown versions of documentation pages are available by appending `.md` to page URLs; this page is available as [Markdown](https://cs4all-icm.gitbook.io/js-intro-to-computational-media-2.0/unit-3-arrays-loops-media/u3la1-mini-project-wallpaper-design.md).

# U3LA1 Mini Project: Wallpaper Design

How can sounds, images, and fonts be combined and manipulated with code?

### Prompt

You recently have been hired by Microsoft’s design team to create 2 new wallpapers for their new line laptops. In order to boost sales and reach out to many different audiences, Microsoft would like these wallpapers to have some different color themes and use repetition. Be as creative and original as possible!

**Task**:

Create 2 variations of a desktop background using repeated elements. The design should be easily altered by changing the values in the for loop to create variations in the design.

**Requirements**:

1. Your canvas size should be (800 x 450)
2. The program should include at least one for loop.
3. The for loop(s) should be used to increment values such as width, height, or color. Variations should result from changing different values in the loop.
4. The designs should not only vary in color. Play with size, number of repetitions etc.
5. Save three different variations of the same design.

**Writing Prompt:**

Write a paragraph explaining what your wallpaper means to you and why it should be added to a new line of laptops by Apple or Microsoft.

### Sample Output

<figure><img src="https://3365989970-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F6CpkJAKaYOwA5TCz4W7l%2Fuploads%2FBCwroKz6vqdcrXAA9PCu%2Fimage.png?alt=media&amp;token=11ea0409-a578-4c12-8bbf-2b0467d8d0f0" alt=""><figcaption><p>Example of three outputs with colorful geometric designs made up of several shapes.</p></figcaption></figure>

Students can right-click to save their design from the editor.

**OPTIONAL:** *Alternately, you are welcome to briefly teach students how to program in a save option using the* [*built in saveCanvas() function*](https://p5js.org/reference/#/p5/saveCanvas) *or* [*save function*](https://p5js.org/reference/#/p5/save)*. The former requires the canvas to be stored in a variable, but the latter will just save an image of the canvas by default. If you choose to introduce this to students, they should use them in a major callback function outside of the draw function to avoid repetition, such as mousePressed or keyPressed, like so:*

```
// Option 1 - mousePressed major callback
//mousePressed happens outside of and after draw (built in event listener for p5.js)

function mousePressed(){
   save("myCanvas.jpg")
}
```

```
// Option 2 - keyPressed major callback
//keyPressed happens outside and after draw (built in event listener in p5.js)

function keyPressed(){
  if(key==='s'){
    save("myCanvas.jpg")
  }
}
```

### Culturally Responsive Best Practices

Within this design-based challenge, there are many prompts you can give students to make the project seem more relevant to them and the cultures of communities that they are a part of. *(Please recall that communities can refer to a lot of things, including just the culture of being a teen, a Minecraft player, or a KPop fan - be mindful that you are allowing students to explore choice in their creations in a way that is authentic to them!)*

**Possible CR-SE Prompts:**

1. Use colors and shapes of your preference to create a repeated, generative pattern that allow the user to know more about the creator.
2. Create a digital wallpaper that includes visual elements specific to a certain community or culture (ex: color schemes or shapes that create traditional indigenous patterns - look into Islamic, Andean, African and other folk art patterns).
3. Create a digital wallpaper that includes visual elements specific to a certain culture. When the user hovers over elements of your pattern, explain the meaning behind what was chosen.
4. Create a digital wallpaper that includes features specific to a certain community. When the user hovers over elements of your pattern, display a call to action that will improve your chosen community. (EX: How is climate change affecting communities in the Andes?)

### Extensions

**Randomize your wallpaper**

* Use the random function to generate variations of your wallpaper.
* It should randomize the size of the shapes or color while still keeping the same shapes and design in place.
* Additionally, play with using mouseX and mouseY to vary your loop output!

### Teacher Notes

This is a brief, fun project that students usually complete in 1-2 days. It's very visually appealing and the usually enjoy what the make! Consider ending the mini project with a gallery walk or other feedback cycle so students can show off their work and get feedback.

If you collect student work with Google Forms, you can designate that a question be answered with a file so students can easily upload their saved canvas images. (Click the question type option - multiple choice by default - and select 'file upload.' It will aggregate them to a single Drive Folder.)

**If you download this folder, you can use it as your computer background and have your computer rotate through the different images during the day.** Students really like seeing their work on your screen - consider sharing with the rest of your school staff so the kids know you brag about their work outside of the computer science room!
