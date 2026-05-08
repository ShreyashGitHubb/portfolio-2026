import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, Plus, Pencil, X } from "lucide-react";

export type FieldDef = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "number" | "url" | "checkbox" | "tags" | "date";
  placeholder?: string;
  required?: boolean;
};

type Props = {
  table: string;
  title: string;
  description?: string;
  fields: FieldDef[];
  orderBy?: { column: string; ascending?: boolean };
  primary: string; // field used as title in row list
  defaults?: Record<string, any>;
};

export function CrudManager({ table, title, description, fields, orderBy, primary, defaults = {} }: Props) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: [`admin-${table}`],
    queryFn: async () => {
      let q = supabase.from(table as any).select("*");
      if (orderBy) q = q.order(orderBy.column, { ascending: orderBy.ascending ?? true });
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  const [editing, setEditing] = useState<any | null>(null);

  const refresh = () => qc.invalidateQueries({ queryKey: [`admin-${table}`] });

  const handleSave = async (form: Record<string, any>) => {
    const payload = { ...form };
    // coerce
    for (const f of fields) {
      if (f.type === "tags" && typeof payload[f.key] === "string") {
        payload[f.key] = payload[f.key].split(",").map((s: string) => s.trim()).filter(Boolean);
      }
      if (f.type === "number" && payload[f.key] !== "" && payload[f.key] != null) {
        payload[f.key] = Number(payload[f.key]);
      }
      if (payload[f.key] === "") payload[f.key] = null;
    }
    if (editing?.id) {
      const { id, created_at, updated_at, ...rest } = payload;
      const { error } = await supabase.from(table as any).update(rest).eq("id", editing.id);
      if (error) return toast.error(error.message);
      toast.success("Saved");
    } else {
      const { error } = await supabase.from(table as any).insert({ ...defaults, ...payload });
      if (error) return toast.error(error.message);
      toast.success("Created");
    }
    setEditing(null);
    refresh();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    const { error } = await supabase.from(table as any).delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); refresh(); }
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        <button onClick={() => setEditing({ ...defaults })} className="inline-flex items-center gap-1 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90">
          <Plus className="h-4 w-4" /> Add new
        </button>
      </div>

      <div className="mt-6 divide-y rounded-2xl border bg-card shadow-soft">
        {isLoading && <p className="p-4 text-sm text-muted-foreground">Loading…</p>}
        {!isLoading && data?.length === 0 && <p className="p-4 text-sm text-muted-foreground">Nothing yet. Click "Add new".</p>}
        {data?.map((row: any) => (
          <div key={row.id} className="flex items-center justify-between gap-3 p-4">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{row[primary] || "(untitled)"}</p>
              <p className="truncate text-xs text-muted-foreground">
                {fields.slice(1, 3).map((f) => row[f.key]).filter(Boolean).join(" · ")}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button onClick={() => setEditing(row)} className="rounded-md border p-1.5 hover:bg-secondary"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => remove(row.id)} className="rounded-md border p-1.5 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <EditDrawer fields={fields} initial={editing} onClose={() => setEditing(null)} onSave={handleSave} />
      )}
    </div>
  );
}

function EditDrawer({ fields, initial, onClose, onSave }: { fields: FieldDef[]; initial: any; onClose: () => void; onSave: (f: any) => void }) {
  const [form, setForm] = useState<any>(() => {
    const f: any = { ...initial };
    fields.forEach((fld) => {
      if (fld.type === "tags" && Array.isArray(f[fld.key])) f[fld.key] = f[fld.key].join(", ");
    });
    return f;
  });

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" />
      <div className="relative ml-auto h-full w-full max-w-lg overflow-y-auto bg-background p-6 shadow-md-google" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">{initial?.id ? "Edit" : "Create"}</h2>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-secondary"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-3">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="text-sm font-medium">{f.label}</label>
              {f.type === "textarea" ? (
                <textarea rows={6} value={form[f.key] ?? ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-google-blue" />
              ) : f.type === "checkbox" ? (
                <label className="mt-1 flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={!!form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.checked })} />
                  Enabled
                </label>
              ) : (
                <input
                  type={f.type === "number" ? "number" : f.type === "url" ? "url" : "text"}
                  value={form[f.key] ?? ""}
                  placeholder={f.placeholder}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-google-blue"
                />
              )}
              {f.type === "tags" && <p className="mt-1 text-xs text-muted-foreground">Comma separated</p>}
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-md border px-4 py-2 text-sm hover:bg-secondary">Cancel</button>
          <button onClick={() => onSave(form)} className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90">Save</button>
        </div>
      </div>
    </div>
  );
}
