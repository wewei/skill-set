# Working with LanceDB in TypeScript

LanceDB is an open-source database for vector search built with persistent storage. This document provides TypeScript-specific prompts for working with LanceDB.

## Installation

```bash
# For TypeScript/JavaScript
npm install @lancedb/lancedb
# or
pnpm add @lancedb/lancedb
# or if you're using vectra (which you already have in your dependencies)
# vectra is a wrapper around lancedb with some additional features
```

## Connecting to a Database

```typescript
import * as lancedb from "@lancedb/lancedb";

// Connect to a local database (will create directories if they don't exist)
const db = await lancedb.connect("data/lancedb");

// If using vectra:
import { Vectra } from "vectra";
const vectra = new Vectra({
  directory: "data/vectra"
});
```

## Creating and Managing Tables

```typescript
// Create a table with data
const data = [
  { vector: [1.0, 2.0, 3.0], text: "document 1", id: 1 },
  { vector: [4.0, 5.0, 6.0], text: "document 2", id: 2 },
  { vector: [7.0, 8.0, 9.0], text: "document 3", id: 3 }
];

const table = await db.createTable("my_table", data);

// Open an existing table
const existingTable = await db.openTable("my_table");

// List all tables
const tableNames = await db.tableNames();

// Add more data to a table
const moreData = [
  { vector: [10.0, 11.0, 12.0], text: "document 4", id: 4 },
  { vector: [13.0, 14.0, 15.0], text: "document 5", id: 5 }
];
await table.add(moreData);

// Delete rows from a table (using SQL filter expression)
await table.delete("id = 3");

// Drop a table
await db.dropTable("my_table");
```

## Vector Search

```typescript
// Basic vector search
const queryVector = [1.0, 2.0, 3.0];
const results = await table.search(queryVector).limit(10).execute();

// Search with filters
const filteredResults = await table.search(queryVector)
  .where("id > 2")
  .limit(5)
  .execute();

// Build an ANN index for faster searches (for >50k vectors)
await table.createIndex({
  numPartitions: 256,
  numSubVectors: 2
});
```

## Using Embedding Models with LanceDB

```typescript
import { Pipeline } from "@lancedb/lancedb/embedding";
import { OpenAI } from "@lancedb/lancedb/embedding/providers";

// Create an embedding function using OpenAI
const embedder = await OpenAI.create({
  model: "text-embedding-ada-002",
  apiKey: process.env.OPENAI_API_KEY
});

// Create a pipeline that converts text to vectors
const pipeline = await Pipeline.create(embedder);

// Create schema for the table
const tableSchema = {
  vector: { type: "vector", dimension: embedder.dimension },
  text: { type: "string" },
  id: { type: "int" }
};

// Create table with schema
const table = await db.createTable("documents", [], { schema: tableSchema });

// Add data with automatic vectorization
await table.add(pipeline.process([
  { text: "LanceDB is a vector database", id: 1 },
  { text: "Vector databases store embeddings", id: 2 },
]));

// Search with automatic vectorization of query
const query = "database for vectors";
const searchResults = await table.search(
  pipeline.processOne({ text: query })
).limit(5).execute();
```

## Using Vectra (If you prefer the Vectra wrapper)

```typescript
import { Vectra } from "vectra";

// Initialize Vectra
const vectra = new Vectra({
  directory: "data/vectra",
  // Optional embedding model configuration
  model: {
    name: "openai", // Or "local", "transformers", etc.
    options: {
      apiKey: process.env.OPENAI_API_KEY,
      model: "text-embedding-ada-002" // Default OpenAI model
    }
  }
});

// Create a collection
const collection = await vectra.createCollection("documents");

// Add documents
await collection.upsert([
  { id: "1", text: "LanceDB is a vector database" },
  { id: "2", text: "Vector databases store embeddings" }
]);

// Search
const results = await collection.search("database for vectors", {
  limit: 5
});

// With filters
const filteredResults = await collection.search("database for vectors", {
  limit: 5,
  filter: {
    where: "id = '1'"
  }
});
```

## Filtering and Advanced Queries

```typescript
// Using SQL filters
const textFilterResults = await table.search(queryVector)
  .where("text LIKE '%vector%'")
  .limit(10)
  .execute();

// Combining multiple filters
const combinedFilterResults = await table.search(queryVector)
  .where("(id > 2) AND (text LIKE '%document%')")
  .limit(5)
  .execute();

// Full-text search
const ftsQuery = "vector database";
const ftsResults = await table.search(queryVector)
  .where(`fts_match(text, '${ftsQuery}')`)
  .limit(5)
  .execute();
```

## Creating Hybrid Search

```typescript
// Combine vector search with BM25 for hybrid search
const query = "vector database";

// Get vector search results
const vectorResults = await table.search(
  pipeline.processOne({ text: query })
).limit(100).execute();

// Get BM25 text search results
const bm25Results = await table.search()
  .where(`fts_match(text, '${query}')`)
  .limit(100)
  .execute();

// Custom reranking of results (example)
// This is a simplified example - you would implement your own ranking logic
function hybridRank(vectorResults, bm25Results, alpha = 0.5) {
  // Create a map of all unique document IDs
  const allDocs = new Map();
  
  // Add vector search scores (normalize between 0-1)
  const maxVectorScore = vectorResults[0]?.score || 1;
  for (const item of vectorResults) {
    allDocs.set(item.id, {
      item,
      vectorScore: item.score / maxVectorScore,
      bm25Score: 0
    });
  }
  
  // Add BM25 scores (normalize between 0-1)
  const maxBm25Score = bm25Results[0]?.score || 1;
  for (const item of bm25Results) {
    const entry = allDocs.get(item.id) || {
      item,
      vectorScore: 0
    };
    entry.bm25Score = item.score / maxBm25Score;
    allDocs.set(item.id, entry);
  }
  
  // Calculate hybrid scores
  const hybridResults = Array.from(allDocs.values()).map(entry => ({
    ...entry.item,
    hybridScore: alpha * entry.vectorScore + (1 - alpha) * entry.bm25Score
  }));
  
  // Sort by hybrid score
  return hybridResults.sort((a, b) => b.hybridScore - a.hybridScore);
}

// Get hybrid results
const hybridResults = hybridRank(vectorResults, bm25Results);
```

## Best Practices for TypeScript Projects

1. Use proper TypeScript typing for your data schemas
2. Create an ANN index for tables with more than 50,000 vectors
3. Use connection pooling for production applications
4. Consider using environment variables for sensitive information like API keys
5. Implement proper error handling around database operations
6. Use batching for adding large amounts of data
7. Close database connections when they're no longer needed

## Integrating with Your TypeScript Application

```typescript
// Example integration in a Node.js/Express application
import express from 'express';
import * as lancedb from '@lancedb/lancedb';

const app = express();
app.use(express.json());

// Initialize database connection
let db: any;
async function initDb() {
  db = await lancedb.connect('data/lancedb');
  console.log('Connected to LanceDB');
}

// API endpoint for vector search
app.post('/search', async (req, res) => {
  try {
    const { query, limit = 10 } = req.body;
    
    const table = await db.openTable('documents');
    const results = await table.search(query)
      .limit(limit)
      .execute();
      
    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  await initDb();
  console.log(`Server running on port ${PORT}`);
});
```

## Troubleshooting for TypeScript Projects

1. "How to fix TypeScript type errors with LanceDB?"
2. "How to handle async/await properly with LanceDB operations?"
3. "What's the best way to structure a TypeScript project with LanceDB?"
4. "How to implement proper error handling for database operations?"
5. "How to optimize memory usage when working with large vector datasets?"