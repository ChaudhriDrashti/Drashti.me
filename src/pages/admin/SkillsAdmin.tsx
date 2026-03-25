import CrudPage, { FieldDef } from "@/components/admin/CrudPage";

const fields: FieldDef[] = [
  { name: "name", label: "Skill Name", type: "text", required: true },
  { name: "category", label: "Category", type: "text", required: true },
  { name: "proficiency", label: "Proficiency (0-100)", type: "number" },
  { name: "sort_order", label: "Sort Order", type: "number" },
];

const SkillsAdmin = () => (
  <CrudPage title="Skills" table="skills" fields={fields} displayColumns={["sort_order", "name", "category", "proficiency"]} />
);

export default SkillsAdmin;
