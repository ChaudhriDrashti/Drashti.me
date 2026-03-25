import CrudPage, { FieldDef } from "@/components/admin/CrudPage";

const fields: FieldDef[] = [
  { name: "title", label: "Title", type: "text", required: true },
  { name: "slug", label: "Slug", type: "text", required: true },
  { name: "summary", label: "Summary", type: "textarea" },
  { name: "description", label: "Description (Markdown)", type: "textarea" },
  { name: "tools", label: "Tools/Tech", type: "tags" },
  { name: "repo_link", label: "GitHub Link", type: "text" },
  { name: "live_link", label: "Live Link", type: "text" },
  { name: "featured", label: "Featured", type: "boolean" },
  { name: "sort_order", label: "Sort Order", type: "number" },
];

const ProjectsAdmin = () => (
  <CrudPage title="Projects" table="projects" fields={fields} displayColumns={["sort_order", "title", "tools", "featured"]} />
);

export default ProjectsAdmin;
