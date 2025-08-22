---
title: The making of this website | Paolo Di Pasquale
date: 2025-07-10T11:26Z
---
Part of the idea of making my own website and using it as an opportunity to create my own tools for doing it, was also so that I could write about it. I am now in a position where I can add a MD file to the posts folder, run the build script and have it generate the HTML for the pages. I think this is a good point to reflect on what I have done so far.

Before I get stuck in, I just wanted to mention the unescapable topic that is AI. As an engineer I have found it interesting to use tools such as [Cursor](https://cursor.com/en) and [Warp](https://www.warp.dev/). I have learned so much using them and I have found that the conversational approach to learning has really helped me clarify certain concepts that I was trying to grasp. It's probably something that deserves its own dedicated post, but I just wanted to mention that I have leaned on these tools, particularly for writing the scripts to build and serve the website locally. The reason I mention it is because I have actually found that it encourages me to do more rather than less. Where in the past I may have thought, I'll pick a library to acheive something, I'm finding that I give it a go myself, which is why I guess I'm trying to build a SSG in the first place. 

To start with I'll describe my current workflow for adding a new post. The first step is to create a MD file in the [posts directory](https://github.com/pdp2/hi/tree/e676a82f5251cda1b254d91baf9fb7ee3f7128be/posts).

<aside data-type="note">
  You will notice that GitHub links I provide include a specific commit SHA. I chose this way to guarantee that the file or folder I am pointing to actually exists. This would not be the same if I pointed to the main branch because it could get out of date, whereas I can guarantee that the reference existed at a specific commit.
</aside>

The MD file includes a section at the top which contains some metadata about the file and it looks like this:

```
---
title: Hello world! | Paolo Di Pasquale
date: 1999-07-10T11:26Z
---
```


