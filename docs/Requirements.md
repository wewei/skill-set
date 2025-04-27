# Requirements

## Overview

This document outlines the requirements for an MCP tool designed to help Agents manage and query their skill sets. The tool communicates via `stdio` transport.

## Concepts & Principles

- **Skill:** A skill is a document containing a prompt that instructs the Agent on how to perform specific tasks.
- **Skill Names:** Skills are named as phrases that can follow "how to," e.g., "Write good functional spec." As a skill, it answers the question "how to write a good functional spec."
- **Skill Format:** Skills are formatted as prompts in Markdown for an AI agent. Each skill begins with a role declaration, followed by detailed instructions. Including positive and negative examples is recommended.

## Schema

```typescript
type Skill = {
  name: string;
  description: string;
  content: string; // Detailed prompts
  tags: string[];
  createdAt: number;   // Timestamp (ms since epoch)
  updatedAt: number;   // Timestamp (ms since epoch)
};
```

## Scenarios (APIs)

### Add a New Skill

Allows the creation of a new skill by providing the necessary details such as name, description, content, and tags.

#### Input

```json
{
  "name": "string",
  "description": "string",
  "content": "string",
  "tags": ["string"],
  "createdAt": 1714195200000
}
```

#### Output

```json
{
  "name": "string",
  "description": "string",
  "content": "string",
  "tags": ["string"],
  "createdAt": 1714195200000,
  "updatedAt": 1714195200000
}
```

### Update an Existing Skill

Enables updating the details of an existing skill.

#### Input

```json
{
  "name": "string",
  "description": "string",
  "content": "string",
  "tags": ["string"],
  "updatedAt": 1714195200000
}
```

#### Output

```json
{
  "name": "string",
  "description": "string",
  "content": "string",
  "tags": ["string"],
  "createdAt": 1714195200000,
  "updatedAt": 1714195200000
}
```

### Semantic Search on Skills

Performs a semantic search to find skills matching specific criteria. The response does not include the `content` field.

#### Input

```json
{
  "query": "string"
}
```

#### Output

```json
[
  {
    "name": "string",
    "description": "string",
    "tags": ["string"]
  }
]
```

### List Skills by Tags

Retrieves a list of skills filtered by tags. The response does not include the `content` field.

#### Input

```json
{
  "tags": ["string"]
}
```

#### Output

```json
[
  {
    "name": "string",
    "description": "string",
    "tags": ["string"]
  }
]
```

### Get Full Skill with Prompts

Retrieves the full details of a skill, including the `content` field.

#### Input

```json
{
  "name": "string"
}
```

#### Output

```json
{
  "name": "string",
  "description": "string",
  "content": "string",
  "tags": ["string"],
  "createdAt": 1714195200000,
  "updatedAt": 1714195200000
}
```

### List All Tags

Retrieves a list of all unique tags used across skills.

#### Output

```json
[
  "tag1",
  "tag2",
  "tag3"
]
```