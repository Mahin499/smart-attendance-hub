import { useState } from "react";
import { MOCK_STUDENTS, type Student } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserPlus, Search, Upload } from "lucide-react";

export default function StudentManagement() {
  const [students] = useState<Student[]>(MOCK_STUDENTS);
  const [search, setSearch] = useState("");

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.regNo.toLowerCase().includes(search.toLowerCase()) ||
    s.class.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Student Management</h1>
          <p className="text-muted-foreground">Manage student records and photos</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2"><UserPlus className="h-4 w-4" />Add Student</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-heading">Add New Student</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={e => e.preventDefault()}>
              <div className="space-y-2"><Label>Full Name</Label><Input placeholder="Student name" /></div>
              <div className="space-y-2"><Label>Register Number</Label><Input placeholder="e.g., CS2024001" /></div>
              <div className="space-y-2"><Label>Class</Label><Input placeholder="e.g., CSE-A" /></div>
              <div className="space-y-2">
                <Label>Photo for Recognition</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Click to upload student photo</p>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 5MB</p>
                </div>
              </div>
              <Button type="submit" className="w-full">Add Student</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search students..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Student Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(s => (
          <Card key={s.id} className="shadow-card hover:shadow-elevated transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-heading font-bold">
                  {s.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.regNo}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">{s.class}</span>
                <span className="text-xs text-accent font-medium">Photo ✓</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
