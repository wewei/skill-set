import { MCPTool } from "mcp-framework";
import { z } from "zod";

interface ReadSkillInput {
  task: string;
}

class ReadSkillTool extends MCPTool<ReadSkillInput> {
  name = "read_skill_tool";
  description = "Read the prompt for the given task";

  schema = {
    task: {
      type: z.string(),
      description: "Name of the task, it should be a phase after \"how to\", e.g. \"write a story\"",
    },
  };

  async execute({ task }: ReadSkillInput): Promise<string | null> {
    return `Task: ${task}, Prompt: ${prompt}`;
  }
}

export default ReadSkillInput;
