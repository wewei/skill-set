import { makeStore } from "../SkillStore";
import path from "node:path";

const store = await makeStore(path.join(__dirname, "temp", "test-store"), {
  baseURL: "https://api.siliconflow.cn/v1/",
  model: "BAAI/bge-large-en-v1.5",
  apiKey: process.env.API_KEY || "",
  dimensions: 1024,
});


async function run() {
  await store.write("write a story", "Write a story about a cat and a dog.");
  console.log(await store.read("write a story"));
}

run();
