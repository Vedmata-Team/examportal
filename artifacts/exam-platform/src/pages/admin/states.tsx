import { useState } from "react";
import AdminLayout from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useListStates, useCreateState, getListStatesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";

export default function AdminStates() {
  const { data: states, isLoading } = useListStates();
  const createState = useCreateState();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const handleCreate = () => {
    if (!name || !code) return;
    createState.mutate({ data: { name, code } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListStatesQueryKey() });
        setOpen(false);
        setName("");
        setCode("");
      },
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold" data-testid="text-states-title">Manage States</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-state"><Plus className="h-4 w-4 mr-2" />Add State</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add New State</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>State Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Maharashtra" data-testid="input-state-name" /></div>
                <div><Label>State Code</Label><Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. MH" data-testid="input-state-code" /></div>
                <Button onClick={handleCreate} disabled={createState.isPending} className="w-full" data-testid="button-submit-state">
                  {createState.isPending ? "Creating..." : "Create State"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="animate-pulse space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-10 bg-muted rounded" />)}</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Name</TableHead><TableHead>Code</TableHead><TableHead>Created</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {states?.map((state) => (
                    <TableRow key={state.id} data-testid={`row-state-${state.id}`}>
                      <TableCell className="font-medium">{state.name}</TableCell>
                      <TableCell>{state.code}</TableCell>
                      <TableCell>{new Date(state.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                  {(!states || states.length === 0) && (
                    <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No states added yet</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
