import { useState } from "react";
import AdminLayout from "@/components/admin-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useListUsers, useCreateUser, getListUsersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";

const roles = ["CENTRAL", "STATE", "DISTRICT", "INSTITUTION", "STUDENT"] as const;

export default function AdminUsers() {
  const [filterRole, setFilterRole] = useState<string>("");
  const { data: users, isLoading } = useListUsers(filterRole ? { role: filterRole } : undefined);
  const createUser = useCreateUser();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("STUDENT");

  const handleCreate = () => {
    if (!name || !email || !role) return;
    createUser.mutate({ data: { name, email, role: role as any } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
        setOpen(false);
        setName("");
        setEmail("");
        setRole("STUDENT");
      },
    });
  };

  const roleBadgeColor = (r: string) => {
    switch (r) {
      case "CENTRAL": return "bg-red-100 text-red-800";
      case "STATE": return "bg-blue-100 text-blue-800";
      case "DISTRICT": return "bg-green-100 text-green-800";
      case "INSTITUTION": return "bg-purple-100 text-purple-800";
      default: return "bg-orange-100 text-orange-800";
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold" data-testid="text-users-title">Manage Users</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-user"><Plus className="h-4 w-4 mr-2" />Add User</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add New User</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Full Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" data-testid="input-user-name" /></div>
                <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" data-testid="input-user-email" /></div>
                <div>
                  <Label>Role</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger data-testid="select-user-role"><SelectValue placeholder="Select role" /></SelectTrigger>
                    <SelectContent>
                      {roles.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreate} disabled={createUser.isPending} className="w-full" data-testid="button-submit-user">
                  {createUser.isPending ? "Creating..." : "Create User"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-4">
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-48" data-testid="select-filter-role"><SelectValue placeholder="All Roles" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {roles.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Created</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((u) => (
                  <TableRow key={u.id} data-testid={`row-user-${u.id}`}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell><Badge className={roleBadgeColor(u.role)} variant="outline">{u.role}</Badge></TableCell>
                    <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
                {(!users || users.length === 0) && (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No users found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
