import fs from "node:fs/promises";
import { connect, Index } from "@lancedb/lancedb"
import { Schema, Field, Utf8, FixedSizeList, Float32 } from "apache-arrow";
import OpenAI from "openai";

async function ensureDir(dir: string) {
  if (!(await fs.stat(dir).catch(() => false))) {
    await fs.mkdir(dir, { recursive: true });
  }
}

export type ApiConfig = {
  model: string; // Model name for the skill vector
  baseURL: string; // Endpoint for the skill vector
  apiKey: string; // API key for the skill vector
  dimensions: number; // Dimension of the skill vector
};

export async function makeStore(root: string, {
  model,
  baseURL,
  apiKey,
  dimensions,
}: ApiConfig) {
  // Ensure the directory exists
  await ensureDir(root);

  const db = await connect(root);

  const skills = await db.createTable("skills", [], {
    schema: new Schema([
      new Field("embedding", new FixedSizeList(dimensions, new Field("item", new Float32(), false)), false),
      new Field("task", new Utf8(), false),
      new Field("prompt", new Utf8(), false),
    ])
  });

  // skills.createIndex("task", {
  //   config: Index.fts(),
  // });

  // skills.createIndex("embedding", {
  //   config: Index.ivfPq({
  //     distanceType: "cosine",
  //     numPartitions: 10,
  //     numSubVectors: 16,
  //   }),
  // });

  const openai = new OpenAI({
    baseURL,
    apiKey,
  });

  async function getEmbedding(input: string): Promise<number[]> {
    const result = await openai.embeddings.create({
      model,
      input,
      encoding_format: "float",
      dimensions,
    });
    return result.data[0].embedding;
  }

  async function write(task: string, prompt: string) {
    const embedding = await getEmbedding(task);

    await skills
      .mergeInsert("task")
      .whenMatchedUpdateAll()
      .whenNotMatchedInsertAll()
      .execute([
        {
          embedding,
          task,
          prompt,
        },
      ]);
  }

  async function read(task: string): Promise<string | null> {
    const result = await skills
      .query()
      .where(`task == ${JSON.stringify(task)}`)
      .toArray();
    return result.length > 0 ? result[0].prompt : null;
  }

  async function rename(task: string, newTask: string): Promise<void> {
    if (task === newTask) { return; }

    const result = await skills
      .query()
      .where(`task == ${JSON.stringify(task)} OR task == ${JSON.stringify(newTask)}`)
      .toArray();

    if (!result.find((r) => r.task === task)) {
      throw new Error(`Task ${task} not found`);
    }
    if (result.find((r) => r.task === newTask)) {
      throw new Error(`Task ${newTask} already exists`);
    }
    await write(newTask, result[0].prompt);
    await skills.delete(`task == ${JSON.stringify(task)}`);
  }



  return {
    write,
    read,
    rename,
  };
}
