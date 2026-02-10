import { assertEquals } from "jsr:@std/assert";
import isItLocal, { REMOTE_HOST } from "./isItLocal.js";

Deno.test("isItLocal returns false for remote host", () => {
  assertEquals(isItLocal(REMOTE_HOST), false);
  assertEquals(isItLocal(`www.${REMOTE_HOST}`), false);
  assertEquals(isItLocal(`subdomain.${REMOTE_HOST}`), false);
});

Deno.test("isItLocal returns true for local hosts", () => {
  assertEquals(isItLocal("localhost"), true);
  assertEquals(isItLocal("127.0.0.1"), true);
  assertEquals(isItLocal("192.168.1.1"), true);
});

Deno.test("isItLocal returns true for non-string inputs", () => {
  assertEquals(isItLocal(undefined), true);
  assertEquals(isItLocal(null), true);
  assertEquals(isItLocal(123), true);
});
