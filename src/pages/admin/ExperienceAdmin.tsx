import CrudPage, { FieldDef } from "@/components/admin/CrudPage";

const fields: FieldDef[] = [
  { name: "company", label: "Company", type: "text", required: true },
  { name: "role", label: "Role", type: "text", required: true },
  { name: "start_date", label: "Start Date", type: "date" },
  { name: "end_date", label: "End Date", type: "date" },
  { name: "location", label: "Location", type: "text" },
  { name: "details", label: "Details (Markdown)", type: "textarea" },
  { name: "sort_order", label: "Sort Order", type: "number" },
];

const ExperienceAdmin = () => (
  <CrudPage title="Experience" table="experience" fields={fields} displayColumns={["sort_order", "company", "role", "start_date"]} />
);

export default ExperienceAdmin;
