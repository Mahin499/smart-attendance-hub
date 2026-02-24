import { useState } from "react";
import { MOCK_FACULTY, type FacultyMember } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserPlus, Trash2, Edit, Copy, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function FacultyManagement() {
  const [faculty, setFaculty] = useState<FacultyMember[]>(MOCK_FACULTY);
  const [regCode] = useState("FAC-2026-XKQM");
  const { toast } = useToast();

  const copyCode = () => {
    navigator.clipboard.writeText(regCode);
    toast({ title: "Copied!", description: "Registration code copied to clipboard." });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Faculty Management</h1>
          <p className="text-muted-foreground">Manage faculty accounts and registration codes</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Key className="h-4 w-4" />
                Registration Code
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-heading">Faculty Registration Code</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Share this code with faculty members so they can register:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-muted px-4 py-3 rounded-lg text-lg font-mono font-bold text-foreground text-center">
                    {regCode}
                  </code>
                  <Button variant="outline" size="icon" onClick={copyCode}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="h-4 w-4" />
                Add Faculty
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-heading">Add New Faculty</DialogTitle>
              </DialogHeader>
              <form className="space-y-4" onSubmit={e => e.preventDefault()}>
                <div className="space-y-2"><Label>Full Name</Label><Input placeholder="Faculty name" /></div>
                <div className="space-y-2"><Label>Username</Label><Input placeholder="Username" /></div>
                <div className="space-y-2"><Label>Department</Label><Input placeholder="Department" /></div>
                <div className="space-y-2"><Label>Password</Label><Input type="password" placeholder="Password" /></div>
                <Button type="submit" className="w-full">Add Faculty</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-heading">All Faculty ({faculty.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 text-sm font-medium text-muted-foreground">Name</th>
                  <th className="pb-3 text-sm font-medium text-muted-foreground">Username</th>
                  <th className="pb-3 text-sm font-medium text-muted-foreground">Department</th>
                  <th className="pb-3 text-sm font-medium text-muted-foreground">Joined</th>
                  <th className="pb-3 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {faculty.map(f => (
                  <tr key={f.id} className="border-b last:border-0">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-xs">
                          {f.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-foreground">{f.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-sm text-muted-foreground">{f.username}</td>
                    <td className="py-3 text-sm text-muted-foreground">{f.department}</td>
                    <td className="py-3 text-sm text-muted-foreground">{f.joinedDate}</td>
                    <td className="py-3">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
