import { path } from "./paths";
import { italian } from "../data/italian";
import { projects, thesisBeats } from "../data/portfolio";
export type Language = "en" | "it";
export const translate = (language: Language, text: string) =>
  language === "it" ? (italian[text] ?? text) : text;
export const localizedPath = (language: Language, value = "") =>
  path(`${language === "it" ? "it/" : ""}${value.replace(/^\//, "")}`);
export const localizedProjects = (language: Language) => {
  const t = (text: string) => translate(language, text);
  return projects.map((project) => ({
    ...project,
    title: t(project.title),
    shortTitle: t(project.shortTitle),
    category: t(project.category),
    status: t(project.status),
    summary: t(project.summary),
    role: t(project.role),
    question: t(project.question),
    sections: project.sections.map((section) => ({
      title: t(section.title),
      paragraphs: section.paragraphs.map(t),
    })),
  }));
};
export const localizedBeats = (language: Language) =>
  thesisBeats.map((beat) => ({
    ...beat,
    label: translate(language, beat.label),
    description: translate(language, beat.description),
  }));
