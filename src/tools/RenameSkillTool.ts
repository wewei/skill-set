import { MCPTool } from "mcp-framework";
import { z } from "zod";

interface RenameSkillInput {
  task: string;     // The old task name of the skill
  newTask: string;  // The new task name for the skill
}

class RenameSkillTool extends MCPTool<RenameSkillInput> {
  name = "rename_skill_tool";
  description = "Rename a skill with a new task name";

  schema = {
    task: {
      type: z.string(),
      description: "The old task name of the skill",
    },
    newTask: {
      type: z.string(),
      description: "The new task name for the skill",
    },
  };

  async execute({ task, newTask }: RenameSkillInput) {
    return `Renamed skill from ${task} to ${newTask}`;
  }
}

export default RenameSkillTool;
