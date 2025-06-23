import { assertEquals } from "jsr:@std/assert";

import isItLocal, { REMOTE_HOST } from "./isItLocal.js";

Deno.test("Returns true for hosts that are not pdp2.github.io", () => {
  const exampleLocalHosts = ['localhost', '127.0.0.1', '0.0.0.0'];
  
  exampleLocalHosts.forEach(host => assertEquals(isItLocal(host), true));
});

Deno.test("Returns false when host is pdp2.github.io", () => {
  assertEquals(isItLocal(REMOTE_HOST), false);
});

Deno.test("Returns true if argument is not supported", () => {
  const unsupportedValues = [undefined, null, {}, true, false];
  
  unsupportedValues.forEach(value => assertEquals(isItLocal(value), true))
})