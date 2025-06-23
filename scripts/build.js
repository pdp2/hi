const POSTS_DIR = "./posts";

const dirEntries = await Array.fromAsync(Deno.readDir(POSTS_DIR));
const fileNames = dirEntries.map(entry => entry.name);

console.log("File names:", fileNames);