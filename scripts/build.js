import { marked } from "npm:marked@^15.0.0";

// Index config
const INDEX_OUTPUT_FILEPATH = "./docs/index.html";
const INDEX_TEMPLATE_FILEPATH = "./templates/index/index.template.html";
const INDEX_TEMPLATE_CSS_FILEPATH = "./templates/index/index.css";
const INDEX_CSS_OUTPUT_FILEPATH = "./docs/css/index.css";
const INDEX_TEMPLATE_JS_FILEPATH = "./templates/index/index.js";
const INDEX_JS_OUTPUT_FILEPATH = "./docs/js/index.js";
const EXCERPT_LENGTH = 250;

// Posts config
const POSTS_CONTENT_DIR = "./posts";
const POSTS_OUTPUT_DIR = "./docs/posts";
const POSTS_TEMPLATE_FILEPATH = "./templates/post/post.template.html";
const POSTS_TEMPLATE_CSS_FILEPATH = "./templates/post/post.css";
const POST_CSS_OUTPUT_FILEPATH = "./docs/css/post.css";
const POST_TEMPLATE_JS_FILEPATH = "./templates/post/post.js";
const POST_JS_OUTPUT_FILEPATH = "./docs/js/post.js";

console.info('\n🔨 Building...')

console.info('\n📖 Reading from', POSTS_CONTENT_DIR);
const postFiles = await Array.fromAsync(Deno.readDir(POSTS_CONTENT_DIR));
const postFileNames = postFiles.map(entry => entry.name);
console.info('\n🔍 Found files:', postFileNames);

console.info('\n💾 Getting posts data...');
const postsData = await getPostsData(postFileNames);
console.info('\n🔍 Found posts data:', postsData);

const indexTemplateFile = await Deno.readTextFile(INDEX_TEMPLATE_FILEPATH);
await buildIndexFile(postsData, indexTemplateFile);

const postTemplateFile = await Deno.readTextFile(POSTS_TEMPLATE_FILEPATH);
await buildPostsFiles(postsData, postTemplateFile);

console.info('\n🎉 Build successful 🎉\n');

async function buildIndexFile(postsData, templateFile) {
  console.info('\n🔨 Building index file');
  const indexData = {
    title: "Paolo Di Pasquale - Elaborating thoughts on the web",
    posts: postsData.map(post => ({
      title: post.formattedTitle,
      excerpt: getExcerpt(post.contents),
      url: `/posts/${post.fileName.replace('.md', '.html')}`,
      date: post.friendlyDateTime,
      readMore: post.contents.length > EXCERPT_LENGTH
    }))
  };

  const indexHtml = parseTemplate(templateFile, indexData);
  await Deno.writeTextFile(INDEX_OUTPUT_FILEPATH, indexHtml);

  const indexTemplateCssFile = await Deno.readTextFile(INDEX_TEMPLATE_CSS_FILEPATH);
  const indexTemplateJsFile = await Deno.readTextFile(INDEX_TEMPLATE_JS_FILEPATH);

  await Deno.writeTextFile(INDEX_CSS_OUTPUT_FILEPATH, indexTemplateCssFile);
  await Deno.writeTextFile(INDEX_JS_OUTPUT_FILEPATH, indexTemplateJsFile);
  console.info('\n💪 Created file:', INDEX_OUTPUT_FILEPATH);
}

async function buildPostsFiles(postsData, templateFile) {
  console.info('\n🔨 Building posts files...')
  for (const post of postsData) {
    const postFilePath = `${POSTS_OUTPUT_DIR}/${post.fileName.replace('.md', '.html')}`;
    
    // TO DO: This can be set up in config
    const postHtml = templateFile
      .replaceAll("${title}", post.title)
      .replaceAll("${date}", post.date)
      .replaceAll("${friendlyDateTime}", post.friendlyDateTime)
      .replaceAll("${contents}", post.contents)
      .replaceAll("${formattedTitle}", post.formattedTitle);
  
    await Deno.writeTextFile(postFilePath, postHtml);
    console.info('\n💪 Created file:', postFilePath);
  }

  const postTemplateCssFile = await Deno.readTextFile(POSTS_TEMPLATE_CSS_FILEPATH);
  const postTemplateJsFile = await Deno.readTextFile(POST_TEMPLATE_JS_FILEPATH);

  await Deno.writeTextFile(POST_CSS_OUTPUT_FILEPATH, postTemplateCssFile);
  await Deno.writeTextFile(POST_JS_OUTPUT_FILEPATH, postTemplateJsFile);
}

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

async function getPostsData(fileNames) {
  return await Array.fromAsync(
    fileNames.map(async (fileName) => {
      const contents = await Deno.readTextFile(`${POSTS_CONTENT_DIR}/${fileName}`);
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
}

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