import { marked } from "npm:marked@^15.0.0";

/**
 * Parses markdown files with frontmatter and returns structured post data
 * @param {string[]} fileNames - Array of markdown file names to process
 * @param {string} postsDir - Directory path where post files are located
 * @returns {Promise<Array>} Array of post data objects
 */
export async function getPostsData(fileNames, postsDir = "./posts") {
  return await Array.fromAsync(
    fileNames.map(async (fileName) => {
      const contents = await Deno.readTextFile(`${postsDir}/${fileName}`);

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

/**
 * Parses frontmatter from markdown content
 * @param {string} content - Raw markdown content with frontmatter
 * @returns {Object} Object containing frontmatter data and remaining content
 */
export function parseFrontmatter(content) {
  const parts = content.split(/---\n*/);
  
  if (parts.length < 3) {
    throw new Error('Invalid frontmatter format');
  }

  const frontmatterSection = parts[1];
  const contentSection = parts.slice(2).join('');
  
  const frontmatter = {};
  const lines = frontmatterSection.split('\n').filter(line => line.trim());
  
  lines.forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > -1) {
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();
      frontmatter[key] = value;
    }
  });

  return {
    frontmatter,
    content: contentSection
  };
}

/**
 * Formats a date string into a human-friendly format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
export function formatFriendlyDateTime(dateString) {
  return new Date(dateString).toGMTString().split(' ').slice(0, 4).join(' ');
}

/**
 * Extracts the title without the site suffix (before the "|" character)
 * @param {string} fullTitle - Full title including site suffix
 * @returns {string} Formatted title without suffix
 */
export function formatTitle(fullTitle) {
  return fullTitle.split(" |")[0];
}
