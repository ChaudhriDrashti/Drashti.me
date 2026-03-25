import CrudPage, { FieldDef } from "@/components/admin/CrudPage";

const fields: FieldDef[] = [
  { name: "title", label: "Title", type: "text", required: true },
  { name: "issuer", label: "Issuing Organization", type: "text" },
  { name: "date", label: "Date", type: "date" },
  { name: "credential_link", label: "Credential Link", type: "text" },
  { name: "sort_order", label: "Sort Order", type: "number" },
];

const CertificationsAdmin = () => (
  <CrudPage title="Certifications" table="certifications" fields={fields} displayColumns={["sort_order", "title", "issuer", "date"]} />
);

export default CertificationsAdmin;
