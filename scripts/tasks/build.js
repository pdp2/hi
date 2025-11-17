import { marked } from "npm:marked@^15.0.0";
import * as path from "jsr:@std/path";

// Default config
const DEFAULT_LAYOUT_TEMPLATE_FILEPATH = "./templates/layouts/default/default-layout.template.html";
const DEFAULT_LAYOUT_CSS_FILEPATH = "./templates/layouts/default/default-layout.css";
const DEFAULT_LAYOUT_CSS_OUTPUT_FILEPATH = "./docs/css/default-layout.css";
const DEFAULT_LAYOUT_JS_FILEPATH = "./templates/layouts/default/default-layout.js";
const DEFAULT_LAYOUT_JS_OUTPUT_FILEPATH = "./docs/js/default-layout.js";
const SITE_HEADER_JS_FILEPATH = "./templates/layouts/default/site-header.js";
const SITE_HEADER_JS_OUTPUT_FILEPATH = "./docs/js/site-header.js";


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

const AUTO_RUN_ARG = "--auto-run";

if (Deno.args.includes(AUTO_RUN_ARG)) {
  build();
}

export default async function build() {
  // To do: create a loggin function so that we can toggle verbose mode
  console.info('\n🔨 Building...');
  console.info('\n📖 Reading from', POSTS_CONTENT_DIR);
  const postFiles = await Array.fromAsync(Deno.readDir(POSTS_CONTENT_DIR));
  const postFileNames = postFiles.map(entry => entry.name);
  console.info('\n🔍 Found files:', postFileNames);
  
  console.info('\n💾 Getting posts data...');
  const postsData = await getPostsData(postFileNames);
  console.info('\n🔍 Found posts data:', postsData);
  
  const postTemplateFile = await Deno.readTextFile(POSTS_TEMPLATE_FILEPATH);
  const postLayoutFile = await Deno.readTextFile(DEFAULT_LAYOUT_TEMPLATE_FILEPATH);
  await buildPostsFiles(postsData, postTemplateFile, postLayoutFile);
  await addPostStylesAndScripts();
  
  const indexTemplateFile = await Deno.readTextFile(INDEX_TEMPLATE_FILEPATH);
  const indexLayoutFile = await Deno.readTextFile(DEFAULT_LAYOUT_TEMPLATE_FILEPATH);
  await buildIndexFile(postsData, indexTemplateFile, postTemplateFile, indexLayoutFile);
  await addIndexStylesAndScripts();
  
  await addDefaultLayoutStylesAndScripts();
  
  console.info(`\n🎉 Build completed at ${new Date().toISOString()} 🎉\n`);
}

async function addDefaultLayoutStylesAndScripts() {
  const defaultTemplateCssFile = await Deno.readTextFile(DEFAULT_LAYOUT_CSS_FILEPATH);
  await Deno.writeTextFile(DEFAULT_LAYOUT_CSS_OUTPUT_FILEPATH, defaultTemplateCssFile);
  
  let defaultTemplateJsFile = await Deno.readTextFile(DEFAULT_LAYOUT_JS_FILEPATH);

  // Include imported JS 
  const importRegex = /import \S+ from "(.+)";/g;
  const matches = [...defaultTemplateJsFile.matchAll(importRegex)];

  for (const match of matches) {
    const importPath = match[1];
    let importedFile = await Deno.readTextFile(importPath);
    const outputPath = path.normalize(`./docs/${importPath}`);
    await Deno.mkdir(path.dirname(outputPath), { recursive: true });
    await Deno.writeTextFile(outputPath, importedFile);
  }

  defaultTemplateJsFile = defaultTemplateJsFile.replace("/js", "");
  
  await Deno.writeTextFile(DEFAULT_LAYOUT_JS_OUTPUT_FILEPATH, defaultTemplateJsFile);
  
  // Copy site header React component
  const siteHeaderJsFile = await Deno.readTextFile(SITE_HEADER_JS_FILEPATH);
  await Deno.writeTextFile(SITE_HEADER_JS_OUTPUT_FILEPATH, siteHeaderJsFile);
}

async function addIndexStylesAndScripts() {
  const indexTemplateCssFile = await Deno.readTextFile(INDEX_TEMPLATE_CSS_FILEPATH);
  const indexTemplateJsFile = await Deno.readTextFile(INDEX_TEMPLATE_JS_FILEPATH);

  /* To do: If the index template JS file has imports we probably need to do the same thing as the 
    addDefaultLayoutStylesAndScripts function.
  */

  await Deno.writeTextFile(INDEX_CSS_OUTPUT_FILEPATH, indexTemplateCssFile);
  await Deno.writeTextFile(INDEX_JS_OUTPUT_FILEPATH, indexTemplateJsFile);
}

async function addPostStylesAndScripts() {
  const postTemplateCssFile = await Deno.readTextFile(POSTS_TEMPLATE_CSS_FILEPATH);
  const postTemplateJsFile = await Deno.readTextFile(POST_TEMPLATE_JS_FILEPATH);

  /* To do: If the post template JS file has imports we probably need to do the same thing as the 
    addDefaultLayoutStylesAndScripts function.
  */

  await Deno.writeTextFile(POST_CSS_OUTPUT_FILEPATH, postTemplateCssFile);
  await Deno.writeTextFile(POST_JS_OUTPUT_FILEPATH, postTemplateJsFile);
}

async function buildIndexFile(postsData, indexTemplateFile, postTemplateFile, layoutFile) {
  console.info('\n🔨 Building index file');

  // Sort posts by date in reverse chronological order (newest first)
  const sortedPostsData = postsData.sort((a, b) => new Date(b.date) - new Date(a.date));

  const posts = sortedPostsData.map(data => parseTemplate(postTemplateFile, {
    ...data,
    isIndex: true,
    excerpt: getExcerpt(data.contents),
    readMore: data.contents.length > EXCERPT_LENGTH,
    url: `/posts/${data.fileName.replace('.md', '.html')}`,
  }));

  const indexMainData = {
    posts: posts.map(p => p.html).join(""),
  };

  /* To do: fix parseTemplate returns styles and scripts for each post, which is a waste.
    That's why index.styles + posts[0].styles is used, accessing the first item in posts.
  */
  const index = parseTemplate(indexTemplateFile, indexMainData);

  const indexLayoutData = {
    title: "Paolo Di Pasquale - Elaborating thoughts on the web",
    main: index.html,
    styles: index.styles + posts[0].styles,
    scripts: index.scripts + posts[0].scripts,
  }

  const indexLayout = parseTemplate(layoutFile, indexLayoutData, { extractStyleAndScriptTags: false });

  await Deno.writeTextFile(INDEX_OUTPUT_FILEPATH, indexLayout.html);
  console.info('\n💪 Created file:', INDEX_OUTPUT_FILEPATH);
}

async function buildPostsFiles(postsData, templateFile, layoutFile) {
  console.info('\n🔨 Building posts files...');

  for (const postItem of postsData) {
    const post = parseTemplate(templateFile, postItem);

    const postLayoutData = {
      title: postItem.title,
      main: post.html,
      styles: post.styles,
      scripts: post.scripts,
    }

    const postLayout = parseTemplate(layoutFile, postLayoutData, { extractStyleAndScriptTags: false }); 
    const postFilePath = `${POSTS_OUTPUT_DIR}/${postItem.fileName.replace('.md', '.html')}`;

    await Deno.writeTextFile(postFilePath, postLayout.html);
    console.info('\n💪 Created file:', postFilePath);
  }
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
        contents: marked(contents.split(/---\n*/).slice(2).join('')),
        fileName,
        title: contents.split("title: ")[1].split("\n")[0],
        date: contents.split("date: ")[1].split("\n")[0],
        friendlyDateTime: new Date(contents.split("date: ")[1].split("\n")[0]).toGMTString().split(' ').slice(0, 4).join(' '),
        formattedTitle: contents.split("title: ")[1].split("\n")[0].split(" |")[0]
      };
    }),
  );
}

function parseTemplate(template, data, opts = {extractStyleAndScriptTags: true}) {
  let result = {
    html: template,
    styles: null,
    scripts: null,
  };

  /* 
    This option is used for the first parse before sending data 
    to parse with the layout file.
  */
  if (opts.extractStyleAndScriptTags) {
    const linkRegex = /<link\s+rel="stylesheet"\s+href="[^"]+"\s*>/g;
    const linkElements = result.html.match(linkRegex) || [];
    result.html = result.html.replace(linkRegex, '').trim();
    result.styles = linkElements.join('\n ');

    const scriptRegex = /<script[^>]*>[^<]*<\/script>/g;
    const scriptElements = result.html.match(scriptRegex) || [];
    result.html = result.html.replace(scriptRegex, '').trim();
    result.scripts = scriptElements.join('\n ');
  }

  /* Handle conditionals (including nested ones).
    Process from innermost to outermost by finding the deepest nesting first.
  */
  let hasConditionals = true;
  while (hasConditionals) {
    const conditionalRegex = /\$\{#if\s+(\w+)\}((?:(?!\$\{#if\s+\w+\})[\s\S])*?)(?:\$\{else\}((?:(?!\$\{#if\s+\w+\})[\s\S])*?))?\$\{\/if\}/g;
    // Array.from is used because matchAll returns an iterator and that has no length
    const matches = Array.from(result.html.matchAll(conditionalRegex));
    
    if (matches.length === 0) {
      hasConditionals = false;
    } else {
      result.html = result.html.replace(conditionalRegex, (match, variableName, ifContent, elseContent) => {
        return data[variableName] ? ifContent : (elseContent || '');
      });
    }
  }
  
  // Handle simple variable replacements
  Object.keys(data).forEach(key => {
    const regex = new RegExp(`\\$\\{${key}\\}`, 'g');
    result.html = result.html.replace(regex, data[key] || '');
  });
  
  return result;
}