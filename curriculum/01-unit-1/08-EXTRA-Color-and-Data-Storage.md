> For the complete documentation index, see [llms.txt](https://cs4all-icm.gitbook.io/js-intro-to-computational-media-2.0/llms.txt). Markdown versions of documentation pages are available by appending `.md` to page URLs; this page is available as [Markdown](https://cs4all-icm.gitbook.io/js-intro-to-computational-media-2.0/unit-1-draw-and-draw-with-functions/extra-color-and-data-storage.md).

# EXTRA: Color & Data Storage

An optional, extra lesson on different ways to represent color that will connect HEX with RGB. Fantastic AP CSP prep!

### Teacher Notes && Overview

This optional lesson allows students to very lightly explore the ideas of different base number systems and data storage through a context they are familiar with in this course - color! This lesson is entirely coding free and makes a great little 'extra' to be tossed in if you are looking to be extra thorough, have a focus on AP CSP course prep, or just have some miscellaneous days to fill without starting something bigger.

While this lesson is brief, it could be extended to include more background on binary or other related topics. There are a plethora of resources out there for lessons teaching binary to kids (it's a great way to build number sense!) including fun activities like creating binary bracelets and poems. This is a great option if you have extra time before, say, a holiday and don't want to start anything new yet!

### Objectives

**Students will be able to:**

* Understand that computers store data as a series of bits
* Understand value in base 2 and base 16 numbers
* Interpret the value of base 16 numbers to determine color

### Suggested Duration

1 period (\~45 minutes)

### NYS Standards

**9-12.NSD.2** Explain the levels of interaction existing between the application software, system software, and hardware of a computing system.

### Vocabulary

* **binary -** a base 2 number system made of just 1s and 0s in which every place value is a power of 2
* **bit -** short for ***binary digit***
* **byte -** 8 bits
* **hexadecimal -** a base 16 number system with digits 0 - 9 and A-F, in which every place value is a power of 16

### Resources

* [What the Hex? Game](https://yizzle.com/whatthehex/)
* [CS Unplugged: Binary Numbers](https://www.csunplugged.org/en/topics/binary-numbers/) (Optional Extra Extension)
* [Code.org: Binary Bracelets ](https://code.org/curriculum/course2/14/Teacher)(Optional Extra Extension)

### Assessments

**Formative:**

* Wrap Up Responses

### Do Now/Warm Up (\~3 - 5 minutes)

Answer one or both of the following questions:

1. How do we think computers store information?
2. Why do you think color values exist in a range of 0 - 255?

### Everything is Bits (\~10 min)

Explain to students that when we type code into our computer, it doesn't get read the same way by a computer as we read it - it gets translated down a string of languages into something the computer can understand. At its core, the computer is seeing everything as something called *binary -* this is a number system made of just 1s and 0s. (If you think about it, you are probably familiar with lots of things with the bi- prefix which almost always means two things!)

Even though computers are seeing 1s and 0s, the numeric system makes it so they can represent a lot of data with just those numbers. Binary works in a base 2 number system, which can sound confusing - but keep in mind the numbers you use every day are based on a base 10 system. This just means that each place value is based on a power of 10. 10^0 is 1, 10^1 is 10, 10^2 is 100, etc etc. The same is true in binary - because 2^0 is 1, they have a ones place, but then the next number would be the 2^1 place, or the twos place. So a binary number 11 would really represent the base 10 number 3 - it has 1 value in the 2s place, and 1 value in the 1s place. Crazy, right?

Each of these 1s or 0s is called a *bit*, which is just short for *binary digit.* Combine 8 bits and you have a *byte.* Colors are represented with 3 *bytes* of information or 24 *bits* (3 bytes \* 8 bits per byte). If we do the math of possible place values with the 24 bits - feel free to work these out with your students if you'd like - we can go as high as 255, and with 0, that is 256 different values that can be used to represent color.

This is cool, but if we think about all the colors on a screen at any given time - and all the other data our computer needs to process - this stacks up *fast.* There are, luckily, ways of **encoding** and **compressing** data so that it takes up less room on a computer, but there are also different ways to represent data. We see this when we write colors as base 10, integer values rather than as strings of 24 bits for each value of red, green, and blue. But some of those base 10 number still need 3 digits, which takes more space than something with say, one or two digits. So what other options exist?

### Introducing: Hexadecimal Values (\~10 minutes)

Programmers often encounter *hexadecimal values.* You're most likely to see these in web development environments as they are commonly used in HTML/CSS and can also be used in p5.js! Hexadecimal values are another base number system, but this time it is a *base 16 system.* This means that every place value represents a power of 16, and that there are 16 possible digits in the system.

Start by writing the numbers 0 - 9 on the board and explain that this is 10 digits in total, all that we are familiar with. Since hexadecimal has 16 possible digits, there are 5 more after this - and they use letters instead of numbers! So after 9, we have A, then B, C, D, E, and F. In the ones place, A would represent 10, B would represent 11, so on and so forth. It's worth labeling these letters so students get the idea!

So let's look at a hexadecimal value - in the ones place it's easy. Seeing C as a hex value is the same as seeing 12. But what about something like B2? Well, we know these place values:

* 16^0 = 1
* 16^1 = 16

So this is saying we have 2 ones and 11 sixteens. That would mean 11 \* 16 + 2 \* 1 = 178. It's not entirely important that we know exactly how to convert the numbers from hex to base 10 values at this point in our CS journey, but it is helpful if we have a good idea about how the *sizes* of these numbers exist. For example, if we looked at these two numbers, could we tell which is bigger? Display and ask students to think it through before discussing the italicized answers!

* **3F ? 99 -** *Without converting, we immediately know 99 is bigger because in the 16s place, 9 is bigger than 3.*
* **A0 ? A5 -** *Without converting, each have the same value in the 16s place, but A5 has a bigger number in the 1s place, so it's a bigger value.*
* **FF ? BB -** *Without converting, we know F is a larger value than B, so FF is bigger than BB.*
* **76 ? AD -** *Without converting, we can see that A in the 16s place is bigger than 7.*

Now, let's test that knowledge!

### What the Hex? Game (\~10 minutes)

We are going to play a game to see how good we are at intuiting colors *and* translating - without converting - hexadecimal values. First, let's remember how additive color mixing (what's happening on the screen with light) works:

<figure><img src="https://3365989970-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F6CpkJAKaYOwA5TCz4W7l%2Fuploads%2FRYFKbijLsHjKcLgQwrZ2%2Fimage.png?alt=media&amp;token=ca6bac36-95ca-4b5a-a8d4-e068a9df0444" alt=""><figcaption><p>Additive mixing showing overlapping colors and results</p></figcaption></figure>

Red and green mix to create yellow colors, green and blue create cyan, and red and blue mix to create magenta. This assumes all equal amounts of colors - a green-yellow color might have a lot of green with just some red, and perhaps even a little blue. A maroon probably has a lot of red with only a little blue, etc.

So let's put that to use in the [What the Hex? Game](https://yizzle.com/whatthehex/)! In each round, you'll be presented with colors and a hex code an asked to match them. See how far you can get!

Teachers looking to extend, consider running through the extension as part of the main lesson.

### Wrap-Up (\~5 min)

Come back together and discuss the following:

* What was the furthest level we got to?
* What about this was difficult?
* What about this was easy or intuitive?
* What takeaways do we have about working in different base number systems?

### Extensions

There are two interesting functions in the p5 library - `hex()` and `unhex()`. Students will likely never use them in p5 since they can just use the hex values within fill (as long as they make it a string by putting quotes around it), but these do complete an interesting funciton of turning RGB colors into hex codes or vice versa.

While students don't have the full background knowledge in Unit 1 to recreate these functions from scratch, they can work to plan on the pseudocode algorithm for how one can unhex a value into an RGB, since it is briefly reviewed in the lesson! As an extra challenge, consider having students map out these steps - you can even save them for later and try to recreate the code once students have reviewed more on string methods and conditionals. (Note: hexing codes is a little more difficult but still doable for algorithmic creation!)
