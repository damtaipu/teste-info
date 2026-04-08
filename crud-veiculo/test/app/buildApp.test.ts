import assert from "node:assert/strict";
import { buildApp } from "../../src/app";

describe("buildApp", () => {
  it("deve criar app com configuracao padrao", () => {
    const app = buildApp();
    assert.ok(app);
  });
});
