import { marked } from "npm:marked";

const POSTS_DIR = "./posts";

const dirEntries = await Array.fromAsync(Deno.readDir(POSTS_DIR));
const fileNames = dirEntries.map(entry => entry.name);

console.info("File names:", fileNames);

const fileContents = await Array.fromAsync(
  fileNames.map(async (fileName) => {
    const contents = await Deno.readTextFile(`${POSTS_DIR}/${fileName}`);
    console.log(contents.split(/---\n*/));
    return {
      contents: marked(contents.split(/---\n*/)[2]),
      fileName,
      title: contents.split("title: ")[1].split("\n")[0],
      date: contents.split("date: ")[1].split("\n")[0],
    };
  }),
);

console.info("File contents:", fileContents);

// Create individual HTML files for each post
for (const post of fileContents) {
  const htmlFileName = post.fileName.replace('.md', '.html');
  const htmlFilePath = `${POSTS_DIR}/${htmlFileName}`;
  
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${post.title}</title>
</head>
<body>
    <header>
        <h1>${post.title}</h1>
        <time datetime="${post.date}">${new Date(post.date).toLocaleDateString()}</time>
    </header>
    <main>
        ${post.contents}
    </main>
</body>
</html>`;

  await Deno.writeTextFile(htmlFilePath, htmlContent);
  console.info(`Created HTML file: ${htmlFilePath}`);
}


