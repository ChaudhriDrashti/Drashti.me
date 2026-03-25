import CrudPage, { FieldDef } from "@/components/admin/CrudPage";

const fields: FieldDef[] = [
  { name: "title", label: "Title", type: "text", required: true },
  { name: "slug", label: "Slug", type: "text", required: true },
  { name: "content", label: "Content (Markdown)", type: "textarea" },
  { name: "tags", label: "Tags", type: "tags" },
  { name: "published", label: "Published", type: "boolean" },
  { name: "sort_order", label: "Sort Order", type: "number" },
];

const BlogAdmin = () => (
  <CrudPage title="Blog Posts" table="blog_posts" fields={fields} displayColumns={["sort_order", "title", "tags", "published"]} />
);

export default BlogAdmin;
