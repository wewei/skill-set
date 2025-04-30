import { MCPTool } from "mcp-framework";
import { z } from "zod";

interface WriteSkillInput {
  task: string;
  prompt: string;
}

class WriteSkillTool extends MCPTool<WriteSkillInput> {
  name = "write_skill_tool";
  description = "Create or update a skill with a prompt for a given task";

  schema = {
    task: {
      type: z.string(),
      description: "Name of the task, it should be a phase after \"how to\", e.g. \"write a story\"",
    },
    prompt: {
      type: z.string(),
      description: "The prompt to be used for the task",
    },
  };

  async execute({ task, prompt }: WriteSkillInput) {
    return `Task: ${task}, Prompt: ${prompt}`;
  }
}

export default WriteSkillTool;