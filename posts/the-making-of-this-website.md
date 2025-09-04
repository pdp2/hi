---
title: The making of this website | Paolo Di Pasquale
date: 2025-07-10T11:26Z
---
Part of the idea for making my own website was to use it as an opportunity to create my own tools for doing it, and also so I could write about it. I am now in a position where I can add a MD file to the posts folder, run the build script and have it generate the HTML for the pages. I think this is a good point to reflect on what I have done so far.

Before I get stuck in, I just wanted to mention the unescapable topic that is AI. As an engineer I have found it interesting to use tools such as [Cursor](https://cursor.com/en) and [Warp](https://www.warp.dev/). I have learned so much using them and I have found that the conversational approach to learning has really helped me clarify certain concepts that I was trying to grasp. It's probably something that deserves its own dedicated post, but I just wanted to mention that I have leaned on these tools, particularly for writing the scripts to build and serve the website locally. I have actually found that it encourages me to write more code rather than less. Where in the past I may have thought, I'll pick a library to acheive something, I'm thinking "I can give it a go myself!". I guess that's why I'm trying to build a SSG in the first place 😅.

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

From there, it's just regular markdown. I wrote a [build task](https://github.com/pdp2/hi/blob/e676a82f5251cda1b254d91baf9fb7ee3f7128be/scripts/tasks/build.js) and a [watch task](https://github.com/pdp2/hi/blob/e676a82f5251cda1b254d91baf9fb7ee3f7128be/scripts/tasks/watch.js) that can be executed with Deno and a bash script for both ([build](https://github.com/pdp2/hi/blob/e676a82f5251cda1b254d91baf9fb7ee3f7128be/scripts/build) and [watch](https://github.com/pdp2/hi/blob/e676a82f5251cda1b254d91baf9fb7ee3f7128be/scripts/watch)) that run with the necessary permissions. That's one of the things I like about Deno. It has security built in and it doesn't let you read or write to the file system by default, you have to add the `--allow-read --allow-write` arguments to allow this.

To view the changes, I run both those scripts concurrently with:

```
scripts/serve & scripts/watch
[1] 82561

🚀 Serving ./docs at http://localhost:8080/

Listening on http://0.0.0.0:8080/

🔍 Watching for changes...
```

Then visit the URL above in my browser 🙌

Once I'm happy with the changes, I can merge into the `main` branch and this triggers a deployment to GitHub pages.

In a future post I might expand on the build task and how the files are generated in the docs folder (which is what GitHub serves), but I've had this branch open for a while now and I want to write about something else for a bit.







