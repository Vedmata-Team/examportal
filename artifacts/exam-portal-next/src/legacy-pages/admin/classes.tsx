import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useListClasses, useCreateClass, getListClassesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";

export default function AdminClasses() {
  const { data: classes, isLoading } = useListClasses();
  const createClass = useCreateClass();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = () => {
    if (!name) return;
    createClass.mutate({ data: { name, description: description || null } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListClassesQueryKey() });
        setOpen(false);
        setName("");
        setDescription("");
      },
    });
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold" data-testid="text-classes-title">Manage Classes</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-class"><Plus className="h-4 w-4 mr-2" />Add Class</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add New Class</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Class Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Class 10" data-testid="input-class-name" /></div>
                <div><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" data-testid="input-class-description" /></div>
                <Button onClick={handleCreate} disabled={createClass.isPending} className="w-full" data-testid="button-submit-class">
                  {createClass.isPending ? "Creating..." : "Create Class"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow><TableHead>Name</TableHead><TableHead>Description</TableHead><TableHead>Created</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {classes?.map((cls) => (
                  <TableRow key={cls.id} data-testid={`row-class-${cls.id}`}>
                    <TableCell className="font-medium">{cls.name}</TableCell>
                    <TableCell>{cls.description || "-"}</TableCell>
                    <TableCell>{new Date(cls.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
                {(!classes || classes.length === 0) && (
                  <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No classes added yet</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
