import '@angular/compiler';

import { ResourceLoader } from '@angular/compiler';
import { NgModule } from '@angular/core';
import * as ngCore from '@angular/core';
import { getTestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach } from 'vitest';

interface ResourceEntry {
  absolutePath: string;
  relativePath: string;
  baseName: string;
}

type ResolveComponentResourcesFn = (resolver: (url: string) => Promise<string>) => Promise<void>;

const resolveComponentResources = (ngCore as Record<string, unknown>)[
  '\u0275resolveComponentResources'
] as ResolveComponentResourcesFn | undefined;

const SOURCE_ROOT = path.resolve(process.cwd(), 'src');
const APP_ROOT = path.resolve(SOURCE_ROOT, 'app');
const RESOURCE_EXTENSIONS = new Set(['.html', '.scss', '.css']);

function toPosixPath(value: string): string {
  return value.replace(/\\/g, '/');
}

function stripQuery(url: string): string {
  return url.replace(/[?#].*$/, '');
}

function addCandidate(candidates: string[], value: string): void {
  if (!value) {
    return;
  }

  const normalized = path.normalize(value);
  if (!candidates.includes(normalized)) {
    candidates.push(normalized);
  }
}

function collectResourceEntries(directory: string): ResourceEntry[] {
  if (!existsSync(directory)) {
    return [];
  }

  const entries: ResourceEntry[] = [];
  const stack = [directory];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) {
      continue;
    }

    for (const dirent of readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, dirent.name);
      if (dirent.isDirectory()) {
        stack.push(fullPath);
        continue;
      }

      if (!dirent.isFile()) {
        continue;
      }

      const extension = path.extname(dirent.name).toLowerCase();
      if (!RESOURCE_EXTENSIONS.has(extension)) {
        continue;
      }

      entries.push({
        absolutePath: fullPath,
        relativePath: toPosixPath(path.relative(APP_ROOT, fullPath)),
        baseName: dirent.name,
      });
    }
  }

  return entries;
}

const resourceEntries = collectResourceEntries(APP_ROOT);

function readResourceFromDisk(url: string): string {
  const cleanUrl = stripQuery(url);
  const normalizedUrl = toPosixPath(cleanUrl.replace(/^\.\//, ''));

  const candidates: string[] = [];
  if (cleanUrl.startsWith('file://')) {
    addCandidate(candidates, fileURLToPath(cleanUrl));
  }

  if (path.isAbsolute(cleanUrl)) {
    addCandidate(candidates, cleanUrl);
  }

  addCandidate(candidates, path.resolve(process.cwd(), normalizedUrl));
  addCandidate(candidates, path.resolve(SOURCE_ROOT, normalizedUrl));
  addCandidate(candidates, path.resolve(APP_ROOT, normalizedUrl));

  const baseName = path.basename(normalizedUrl);
  for (const entry of resourceEntries) {
    if (
      entry.relativePath === normalizedUrl ||
      entry.relativePath.endsWith(`/${normalizedUrl}`) ||
      entry.baseName === baseName
    ) {
      addCandidate(candidates, entry.absolutePath);
    }
  }

  for (const candidate of candidates) {
    if (!existsSync(candidate)) {
      continue;
    }

    return readFileSync(candidate, 'utf-8');
  }

  throw new Error(`[VitestResourceLoader] Nao foi possivel resolver o recurso '${url}'.`);
}

class VitestResourceLoader extends ResourceLoader {
  override async get(url: string): Promise<string> {
    return readResourceFromDisk(url);
  }
}

const ANGULAR_TESTBED_SETUP = Symbol.for('@frontend/angular-testbed-setup');
const globalSetup = globalThis as Record<PropertyKey, unknown>;

if (!globalSetup[ANGULAR_TESTBED_SETUP]) {
  globalSetup[ANGULAR_TESTBED_SETUP] = true;

  @NgModule({
    providers: [{ provide: ResourceLoader, useClass: VitestResourceLoader }],
  })
  class TestModule {}

  getTestBed().initTestEnvironment([BrowserTestingModule, TestModule], platformBrowserTesting(), {
    errorOnUnknownElements: false,
    errorOnUnknownProperties: false,
  });
}

beforeEach(async () => {
  if (resolveComponentResources) {
    await resolveComponentResources(async (url) => readResourceFromDisk(url));
  }
});

afterEach(() => {
  getTestBed().resetTestingModule();
});
