import CrudPage, { FieldDef } from "@/components/admin/CrudPage";

const fields: FieldDef[] = [
  { name: "institution", label: "Institution", type: "text", required: true },
  { name: "degree", label: "Degree", type: "text", required: true },
  { name: "start_year", label: "Start Year", type: "number" },
  { name: "end_year", label: "End Year", type: "number" },
  { name: "gpa", label: "GPA", type: "text" },
  { name: "details", label: "Details", type: "textarea" },
  { name: "sort_order", label: "Sort Order", type: "number" },
];

const EducationAdmin = () => (
  <CrudPage title="Education" table="education" fields={fields} displayColumns={["sort_order", "institution", "degree", "start_year", "end_year"]} />
);

export default EducationAdmin;
