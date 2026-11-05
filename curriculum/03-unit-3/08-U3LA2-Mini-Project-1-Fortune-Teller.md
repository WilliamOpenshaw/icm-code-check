> For the complete documentation index, see [llms.txt](https://cs4all-icm.gitbook.io/js-intro-to-computational-media-2.0/llms.txt). Markdown versions of documentation pages are available by appending `.md` to page URLs; this page is available as [Markdown](https://cs4all-icm.gitbook.io/js-intro-to-computational-media-2.0/unit-3-arrays-loops-media/u3la2-mini-project-1-fortune-teller.md).

# U3LA2 Mini Project 1: Fortune Teller

How can arrays help us simplify code?

### Teacher Notes

While this is marked as a mini-project, it is really a specific practice activity for working with arrays using floor() and random(). It can take as little or as long as you'd like, but generally, 2 class days (about 90 minutes) is the sweet spot for students to make something they are happy with that is fully functional.

If students are struggling to come up with interesting things to fill their arrays with, encourage them to Google - this is a coding task, not a creative writing one, and students feeling stumped should feel free to get inspiration where they can.

Students have not *formally* been taught to join strings, which is a part of this lesson. Many students can figure out that strings can be joined by looking at the **text()** function they use to display mouse coordinates - **string + string** creates a joined version. Students may need assistance remembering this, or reasoning out why they made need spaces in their strings to make sentences readable. Students who are looking to add another skill (and vocab word) to their toolbox may benefit from learning about the [.**concat()** string method](https://www.w3schools.com/jsref/jsref_concat_string.asp), either on their own or in the briefest of mini lessons.

**Students may benefit from pre-planning before they jump to coding. This** [**planning page**](https://docs.google.com/document/d/1uyZFZFd9S9_S7JSSeRgbZ5GyqovOm4k0BE8P5Vd_H88/edit) **specifically designed for this project is available for their use.**

### Prompt

Create a project that will generate a random string of text from three distinct arrays when run by taking a random value from each array and joining them to create a sentence. In the case of the fortune teller, the three arrays might be TIME, PREDICTION, and REASON, so it gives you something like "Tomorrow during the full moon" (for time), "you will meet a masked stranger" (for prediction), "because of the position of Venus" (for reason). It would then generate the full sentence: **"Tomorrow during the full moon you will meet a masked stranger because of the position of Venus."**

The *time* array would contain strings similar to the example that give different times - likewise for prediction and reason, and you should be able to pick one element from each array and get a complete sentence.

**NOTE:** You do NOT have to make a fortune teller, but you do need to have three arrays that hold strings that can be combined to make any random sentence. If you were feeling crafty, maybe make a homework generator, or get creative with the other random things you could generate!

#### Requirements

Your project should:

* Generate a sentence by sequentially combining random elements from three different arrays when run
* Include a button that can be clicked or key that can be pressed to generate a new sentence
* Be designed/styled in a creative way (not just text on a plain background)
* Utilize any and all skills from prior units that you see fit to use!

### Sample Output

<figure><img src="https://3365989970-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F6CpkJAKaYOwA5TCz4W7l%2Fuploads%2FHyjOxqIK2ZeB3htqbWkh%2Ffortuneteller.gif?alt=media&amp;token=c7ba97f4-947d-41a2-8640-8ec58e09ed09" alt=""><figcaption><p><a href="https://editor.p5js.org/cmorgantywls/full/sGbnng-fA">Fortune Teller Exemplar</a></p></figcaption></figure>

### Culturally Responsive Best Practices

Once again, allow lots of room for student choice within this project. Not all students may resonate with the idea of 'fortunes,' but there are many ways to generate random sentences without creating a fortune. Brainstorm other options that might appeal to kids, and give them the freedom to create their own options as long as they meet the criteria of the project.

*(Please recall that communities can refer to a lot of things, including just the culture of being a teen, a Minecraft player, or a KPop fan - be mindful that you are allowing students to explore choice in their creations in a way that is authentic to them!)*

### Extensions

For students who are ready for the next level, consider asking them to create a MadLib. This should be a story that will fill random verbs/nouns/adjectives from arrays that they create to change the meaning of the story.

As many teachers over the age of 27 may be surprised to know, not all students know what mad libs are anymore. Students can [start exploring here](https://www.madlibs.com/printables/) to get ready for the extension!

**NB:** If the fortune teller seems like it would just be too easy for your class, generally, you can always have them start with the mad lib option.
