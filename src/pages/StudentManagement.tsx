import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserPlus, Search, Upload, Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Student {
  id: string;
  name: string;
  reg_no: string;
  class: string;
  photo_url: string | null;
  faculty_id: string;
}

export default function StudentManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [form, setForm] = useState({ name: "", reg_no: "", class: "" });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchStudents = async () => {
    const { data } = await supabase.from("students").select("*").order("name");
    setStudents(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchStudents(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    let photo_url: string | null = null;
    if (photoFile) {
      const path = `${user.id}/${Date.now()}-${photoFile.name}`;
      const { error: uploadErr } = await supabase.storage.from("student-photos").upload(path, photoFile);
      if (!uploadErr) {
        const { data: urlData } = supabase.storage.from("student-photos").getPublicUrl(path);
        photo_url = urlData.publicUrl;
      }
    }

    const { error } = await supabase.from("students").insert({
      name: form.name,
      reg_no: form.reg_no,
      class: form.class,
      photo_url,
      faculty_id: user.id,
    });

    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Student added" });
      setForm({ name: "", reg_no: "", class: "" });
      setPhotoFile(null);
      setOpen(false);
      fetchStudents();
    }
  };
+  
+  const handleEdit = (s: Student) => {
+    setEditingStudent(s);
+    setForm({ name: s.name, reg_no: s.reg_no, class: s.class });
+    setPhotoFile(null);
+    setOpen(true);
+  };
+
+  const handleUpdate = async (e: React.FormEvent) => {
+    e.preventDefault();
+    if (!user || !editingStudent) return;
+    setSaving(true);
+
+    let photo_url = editingStudent.photo_url;
+    if (photoFile) {
+      const path = `${user.id}/${Date.now()}-${photoFile.name}`;
+      const { error: uploadErr } = await supabase.storage.from("student-photos").upload(path, photoFile);
+      if (!uploadErr) {
+        const { data: urlData } = supabase.storage.from("student-photos").getPublicUrl(path);
+        photo_url = urlData.publicUrl;
+      }
+    }
+
+    const { error } = await supabase.from("students").update({
+      name: form.name,
+      reg_no: form.reg_no,
+      class: form.class,
+      photo_url,
+    }).eq("id", editingStudent.id);
+
+    setSaving(false);
+    if (error) {
+      toast({ title: "Error", description: error.message, variant: "destructive" });
+    } else {
+      toast({ title: "Student updated" });
+      setForm({ name: "", reg_no: "", class: "" });
+      setPhotoFile(null);
+      setOpen(false);
+      setEditingStudent(null);
+      fetchStudents();
+    }
+  };

  const handleDelete = async (id: string) => {
    await supabase.from("students").delete().eq("id", id);
    fetchStudents();
  };

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.reg_no.toLowerCase().includes(search.toLowerCase()) ||
    s.class.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Student Management</h1>
          <p className="text-muted-foreground">Manage student records and photos</p>
        </div>
        {user?.role === "faculty" && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><UserPlus className="h-4 w-4" />{editingStudent ? "Edit Student" : "Add Student"}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-heading">{editingStudent ? "Edit Student" : "Add New Student"}</DialogTitle></DialogHeader>
              <form className="space-y-4" onSubmit={editingStudent ? handleUpdate : handleAdd}>
                <div className="space-y-2"><Label>Full Name</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></div>
                <div className="space-y-2"><Label>Register Number</Label><Input value={form.reg_no} onChange={e => setForm(p => ({ ...p, reg_no: e.target.value }))} placeholder="e.g., CS2024001" required /></div>
                <div className="space-y-2"><Label>Class</Label><Input value={form.class} onChange={e => setForm(p => ({ ...p, class: e.target.value }))} placeholder="e.g., CSE-A" required /></div>
                <div className="space-y-2">
                  <Label>Photo for Recognition</Label>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => setPhotoFile(e.target.files?.[0] || null)} />
                  <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">{photoFile ? photoFile.name : "Click to upload student photo"}</p>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{editingStudent ? "Update Student" : "Add Student"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No students found. {user?.role === "faculty" && "Add your first student!"}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(s => (
            <Card key={s.id} className="shadow-card hover:shadow-elevated transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  {s.photo_url ? (
                    <img src={s.photo_url} alt={s.name} className="h-12 w-12 rounded-full object-cover" />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-heading font-bold">{s.name.charAt(0)}</div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.reg_no}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">{s.class}</span>
                  <div className="flex items-center gap-1">
                    {s.photo_url && <span className="text-xs text-accent font-medium">Photo ✓</span>}
                    {user?.role === "faculty" && s.faculty_id === user.id && (
                      <>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(s)}>
                          <UserPlus className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(s.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
