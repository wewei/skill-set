import type { Skill, SkillData } from "./types";

// In-memory storage for skills
const skills: Skill[] = [];

export const storage = {
  /**
   * Upsert a skill by name. If the skill exists, update it; otherwise, add it.
   * Returns the upserted skill.
   */
  upsert(skill: SkillData) {
    const idx = skills.findIndex(s => s.name === skill.name);
    const now = Date.now();
    if (idx === -1) {
      skills.push({ ...skill, createdAt: now, updatedAt: now });
      return skill;
    }
    skills[idx] = { ...skills[idx], ...skill, updatedAt: now };
    return skills[idx];
  },
  get(name: string) {
    return skills.find(s => s.name === name);
  },
  list(tags: string[] = []) {
    if (tags.length === 0) {
      return [...skills];
    }
    return skills.filter(skill => skill.tags.some(tag => tags.includes(tag)));
  },
};