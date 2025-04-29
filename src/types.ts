// Defines the Skill data schema
export type Skill = {
  name: string;
  description: string;
  content: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
};

export type SkillData = Omit<Skill, "createdAt" | "updatedAt">;