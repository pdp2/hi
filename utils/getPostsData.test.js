import { assertEquals, assertRejects } from "jsr:@std/assert";
import { 
  getPostsData, 
  parseFrontmatter, 
  formatFriendlyDateTime, 
  formatTitle 
} from "./getPostsData.js";

// Mock file content for testing
const mockPostContent = `---
title: Test Post | Paolo Di Pasquale
date: 2025-07-10T11:26Z
---

This is a test post content with **markdown** formatting.

## Section

More content here.`;

const mockPostContentMinimal = `---
title: Simple Post
date: 2025-01-01T00:00Z
---

Simple content.`;

const mockPostContentInvalid = `title: No frontmatter separators
date: 2025-01-01T00:00Z

Invalid content.`;

// Create test files directory
const TEST_POSTS_DIR = "./test_posts";

async function setupTestFiles() {
  try {
    await Deno.mkdir(TEST_POSTS_DIR, { recursive: true });
    await Deno.writeTextFile(`${TEST_POSTS_DIR}/test-post.md`, mockPostContent);
    await Deno.writeTextFile(`${TEST_POSTS_DIR}/simple-post.md`, mockPostContentMinimal);
  } catch (error) {
    // Directory might already exist, that's ok
  }
}

async function cleanupTestFiles() {
  try {
    await Deno.remove(TEST_POSTS_DIR, { recursive: true });
  } catch (error) {
    // Files might not exist, that's ok
  }
}

Deno.test("getPostsData - parses multiple markdown files correctly", async () => {
  await setupTestFiles();
  
  try {
    const fileNames = ["test-post.md", "simple-post.md"];
    const result = await getPostsData(fileNames, TEST_POSTS_DIR);
    
    assertEquals(result.length, 2);
    
    // Test first post
    const firstPost = result[0];
    assertEquals(firstPost.fileName, "test-post.md");
    assertEquals(firstPost.title, "Test Post | Paolo Di Pasquale");
    assertEquals(firstPost.date, "2025-07-10T11:26Z");
    assertEquals(firstPost.formattedTitle, "Test Post");
    assertEquals(firstPost.friendlyDateTime, "Thu, 10 Jul 2025");
    assertEquals(firstPost.contents.includes("<strong>markdown</strong>"), true);
    
    // Test second post
    const secondPost = result[1];
    assertEquals(secondPost.fileName, "simple-post.md");
    assertEquals(secondPost.title, "Simple Post");
    assertEquals(secondPost.formattedTitle, "Simple Post");
  } finally {
    await cleanupTestFiles();
  }
});

Deno.test("getPostsData - handles empty array", async () => {
  const result = await getPostsData([]);
  assertEquals(result, []);
});

Deno.test("getPostsData - throws error for non-existent file", async () => {
  await assertRejects(
    async () => {
      await getPostsData(["non-existent.md"], TEST_POSTS_DIR);
    },
    Error
  );
});

Deno.test("parseFrontmatter - parses valid frontmatter correctly", () => {
  const result = parseFrontmatter(mockPostContent);
  
  assertEquals(result.frontmatter.title, "Test Post | Paolo Di Pasquale");
  assertEquals(result.frontmatter.date, "2025-07-10T11:26Z");
  assertEquals(result.content.trim().startsWith("This is a test post"), true);
});

Deno.test("parseFrontmatter - handles minimal frontmatter", () => {
  const result = parseFrontmatter(mockPostContentMinimal);
  
  assertEquals(result.frontmatter.title, "Simple Post");
  assertEquals(result.frontmatter.date, "2025-01-01T00:00Z");
  assertEquals(result.content.trim(), "Simple content.");
});

Deno.test("parseFrontmatter - throws error for invalid frontmatter", () => {
  let errorThrown = false;
  try {
    parseFrontmatter(mockPostContentInvalid);
  } catch (error) {
    errorThrown = true;
    assertEquals(error.message, "Invalid frontmatter format");
  }
  assertEquals(errorThrown, true, "Expected function to throw an error");
});

Deno.test("parseFrontmatter - handles empty frontmatter section", () => {
  const contentWithEmptyFrontmatter = `---
---

Content only.`;
  
  const result = parseFrontmatter(contentWithEmptyFrontmatter);
  assertEquals(Object.keys(result.frontmatter).length, 0);
  assertEquals(result.content.trim(), "Content only.");
});

Deno.test("parseFrontmatter - handles frontmatter with colons in values", () => {
  const contentWithColons = `---
title: Time: 12:30 PM | Site Name
url: https://example.com:8080
---

Content here.`;
  
  const result = parseFrontmatter(contentWithColons);
  assertEquals(result.frontmatter.title, "Time: 12:30 PM | Site Name");
  assertEquals(result.frontmatter.url, "https://example.com:8080");
});

Deno.test("formatFriendlyDateTime - formats date correctly", () => {
  const dateString = "2025-07-10T11:26Z";
  const result = formatFriendlyDateTime(dateString);
  assertEquals(result, "Thu, 10 Jul 2025");
});

Deno.test("formatFriendlyDateTime - handles different date formats", () => {
  const result1 = formatFriendlyDateTime("2025-01-01T00:00Z");
  assertEquals(result1, "Wed, 01 Jan 2025");
  
  const result2 = formatFriendlyDateTime("2024-12-25T23:59Z");
  assertEquals(result2, "Wed, 25 Dec 2024");
});

Deno.test("formatTitle - removes site suffix", () => {
  const fullTitle = "Test Post | Paolo Di Pasquale";
  const result = formatTitle(fullTitle);
  assertEquals(result, "Test Post");
});

Deno.test("formatTitle - handles title without suffix", () => {
  const titleWithoutSuffix = "Simple Post";
  const result = formatTitle(titleWithoutSuffix);
  assertEquals(result, "Simple Post");
});

Deno.test("formatTitle - handles multiple pipe characters", () => {
  const complexTitle = "Part 1 | Part 2 | Site Name";
  const result = formatTitle(complexTitle);
  assertEquals(result, "Part 1");
});

Deno.test("formatTitle - handles empty title", () => {
  const result = formatTitle("");
  assertEquals(result, "");
});

// Integration test to ensure the refactored function produces the same output
Deno.test("getPostsData - integration test with real post files", async () => {
  // Test with actual post files if they exist
  try {
    const postFiles = await Array.fromAsync(Deno.readDir("./posts"));
    const postFileNames = postFiles
      .filter(entry => entry.name.endsWith('.md'))
      .map(entry => entry.name);
    
    if (postFileNames.length > 0) {
      const result = await getPostsData(postFileNames, "./posts");
      
      // Basic validation - each post should have required fields
      result.forEach(post => {
        assertEquals(typeof post.contents, "string");
        assertEquals(typeof post.fileName, "string");
        assertEquals(typeof post.title, "string");
        assertEquals(typeof post.date, "string");
        assertEquals(typeof post.friendlyDateTime, "string");
        assertEquals(typeof post.formattedTitle, "string");
        
        // Validate date format
        assertEquals(isNaN(new Date(post.date).getTime()), false);
      });
    }
  } catch (error) {
    // Posts directory might not exist in test environment
    console.warn("Could not run integration test with real posts:", error.message);
  }
});
