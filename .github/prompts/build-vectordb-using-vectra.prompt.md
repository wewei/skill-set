# Build a Vector Database Using Vectra (Node.js)

This prompt provides a quickstart reference for building a local vector database using [Vectra][vectra-npm] in Node.js. It covers installation, index creation, adding items, querying, and best practices, following Markdown best practices.

---

## Overview

Vectra is a local, file-based vector database for Node.js, similar to Pinecone or Qdrant, but optimized for small, mostly static datasets. Each index is a folder on disk, and all vectors and indexed metadata are stored in an `index.json` file. Vectra loads the entire index into memory for fast queries.

---

## Installation

Install Vectra using your preferred package manager:

```sh
npm install vectra
# or
pnpm add vectra
```

---

## Creating a Local Index

```ts
import { LocalIndex } from 'vectra';
import path from 'path';

const index = new LocalIndex(path.join(__dirname, 'index'));

if (!(await index.isIndexCreated())) {
  await index.createIndex();
}
```

---

## Adding Items to the Index

You will need to generate vector embeddings for your items. The example below uses OpenAI embeddings, but you can use any embedding provider.

```ts
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: '<YOUR_KEY>' });

async function getVector(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text
  });
  return response.data[0].embedding;
}

async function addItem(text: string) {
  await index.insertItem({
    vector: await getVector(text),
    metadata: { text }
  });
}

// Add items
await addItem('apple');
await addItem('oranges');
await addItem('red');
await addItem('blue');
```

---

## Querying the Index

```ts
async function query(text: string) {
  const vector = await getVector(text);
  const results = await index.queryItems(vector, 3); // Top 3 matches
  if (results.length > 0) {
    for (const result of results) {
      console.log(`[${result.score}] ${result.item.metadata.text}`);
    }
  } else {
    console.log('No results found.');
  }
}

await query('green');
// Example output:
// [0.90] blue
// [0.87] red
// [0.83] apple
```

---

## Best Practices and Notes

- Vectra loads the entire index into memory; best for small, mostly static datasets.
- Each index is a folder; you can mimic namespaces by using separate folders.
- Only indexed metadata is stored in `index.json`; other metadata is stored in separate files.
- Not suitable for large-scale, long-term memory (e.g., chatbots with large histories).
- See [Vectra GitHub][vectra-github] for more advanced usage and updates.

---

## References

- [Vectra on npm][vectra-npm]
- [Vectra GitHub Repository][vectra-github]

[vectra-npm]: https://www.npmjs.com/package/vectra
[vectra-github]: https://github.com/Stevenic/vectra
