import { marked } from "npm:marked@^15.0.0";

const POSTS_DIR = "./posts";
const POSTS_OUTPUT_DIR = "./docs/posts";
const POST_FILES = await Array.fromAsync(Deno.readDir(POSTS_DIR));
const POST_FILE_NAMES = POST_FILES.map(entry => entry.name);
const EXCERPT_LENGTH = 250;

const POST_TEMPLATE_FILE = await Deno.readTextFile("./templates/post/post.template.html");
const POST_TEMPLATE_CSS_FILE = await Deno.readTextFile("./templates/post/post.css");
const POST_CSS_OUTPUT_FILEPATH = "./docs/css/post.css";
const POST_TEMPLATE_JS_FILE = await Deno.readTextFile("./templates/post/post.js");
const POST_JS_OUTPUT_FILEPATH = "./docs/js/post.js";


await Deno.writeTextFile(POST_CSS_OUTPUT_FILEPATH, POST_TEMPLATE_CSS_FILE);
await Deno.writeTextFile(POST_JS_OUTPUT_FILEPATH, POST_TEMPLATE_JS_FILE);

const INDEX_TEMPLATE_FILE = await Deno.readTextFile("./templates/index/index.template.html");
const INDEX_TEMPLATE_CSS_FILE = await Deno.readTextFile("./templates/index/index.css");
const INDEX_CSS_OUTPUT_FILEPATH = "./docs/css/index.css";
const INDEX_TEMPLATE_JS_FILE = await Deno.readTextFile("./templates/index/index.js");
const INDEX_JS_OUTPUT_FILEPATH = "./docs/js/index.js";


await Deno.writeTextFile(INDEX_CSS_OUTPUT_FILEPATH, INDEX_TEMPLATE_CSS_FILE);
await Deno.writeTextFile(INDEX_JS_OUTPUT_FILEPATH, INDEX_TEMPLATE_JS_FILE);

console.info("Post file names:", POST_FILE_NAMES);

const POST_FILES_CONTENTS = await Array.fromAsync(
  POST_FILE_NAMES.map(async (fileName) => {
    const contents = await Deno.readTextFile(`${POSTS_DIR}/${fileName}`);
    return {
      contents: marked(contents.split(/---\n*/)[2]),
      fileName,
      title: contents.split("title: ")[1].split("\n")[0],
      date: contents.split("date: ")[1].split("\n")[0],
      friendlyDateTime: new Date(contents.split("date: ")[1].split("\n")[0]).toLocaleDateString(),
      formattedTitle: contents.split("title: ")[1].split("\n")[0].split(" |")[0]
    };
  }),
);

console.info("File contents:", POST_FILES_CONTENTS);

let posts = [];

for (const content of POST_FILES_CONTENTS) {
  const htmlFilePath = `${POSTS_OUTPUT_DIR}/${content.fileName.replace('.md', '.html')}`;
  
  const htmlContent = POST_TEMPLATE_FILE
    .replaceAll("${title}", content.title)
    .replaceAll("${date}", content.date)
    .replaceAll("${friendlyDateTime}", content.friendlyDateTime)
    .replaceAll("${contents}", content.contents)
    .replaceAll("${formattedTitle}", content.formattedTitle);

  await Deno.writeTextFile(htmlFilePath, htmlContent);
  console.info(`Created HTML file: ${htmlFilePath}`);

  posts.push({
    title: content.title,
    date: content.date,
    friendlyDateTime: content.friendlyDateTime,
    formattedTitle: content.formattedTitle,
    contents: content.contents,
    htmlFilePath: htmlFilePath
  });
}

// Add this function to handle template parsing
function parseTemplate(template, data) {
  let result = template;
  
  // Handle loops first (before simple replacements)
  const loopRegex = /\$\{#each\s+(\w+)\}([\s\S]*?)\$\{\/each\}/g;
  
  result = result.replace(loopRegex, (match, arrayName, loopContent) => {
    const array = data[arrayName];
    if (!Array.isArray(array)) {
      console.warn(`Warning: ${arrayName} is not an array or doesn't exist`);
      return '';
    }
    
    return array.map(item => {
      let itemContent = loopContent;

      // Handle conditionals within loops
      const loopIfRegex = /\$\{#if\s+(\w+)\}([\s\S]*?)\$\{\/if\}/g;
      itemContent = itemContent.replace(loopIfRegex, (ifMatch, variableName, ifContent) => {
        return item[variableName] ? ifContent : '';
      });

      // Replace variables within the loop context
      Object.keys(item).forEach(key => {
        const regex = new RegExp(`\\$\\{${key}\\}`, 'g');
        itemContent = itemContent.replace(regex, item[key] || '');
      });
      return itemContent;
    }).join('');
  });
  
  // Handle simple variable replacements
  Object.keys(data).forEach(key => {
    if (!Array.isArray(data[key])) { // Skip arrays (already handled above)
      const regex = new RegExp(`\\$\\{${key}\\}`, 'g');
      result = result.replace(regex, data[key] || '');
    }
  });
  
  return result;
}

// Replace the index generation part with:
const indexData = {
  title: "Paolo Di Pasquale - Elaborating thoughts on the web",
  posts: posts.map(post => ({
    title: post.formattedTitle,
    excerpt: getExcerpt(post.contents),
    url: `/posts/${post.htmlFilePath.split('/').pop()}`,
    date: post.friendlyDateTime,
    readMore: post.contents.length > EXCERPT_LENGTH
  }))
};

const indexHtml = parseTemplate(INDEX_TEMPLATE_FILE, indexData);
await Deno.writeTextFile("./docs/index.html", indexHtml);
console.info("Created index.html");

function getExcerpt(contents) {
  if (contents.length <= EXCERPT_LENGTH) {
    return contents;
  }
  
  // Find the last space before the excerpt length limit
  const truncated = contents.substring(0, EXCERPT_LENGTH);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  
  // If we found a space, cut there; otherwise, use the original limit
  if (lastSpaceIndex > 0) {
    return contents.substring(0, lastSpaceIndex) + '...';
  }
  
  // Fallback to original behavior if no space found
  return truncated + '...';
}



