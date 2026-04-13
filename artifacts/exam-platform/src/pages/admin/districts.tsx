import { useState } from "react";
import AdminLayout from "@/components/admin-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useListDistricts, useCreateDistrict, useListStates, getListDistrictsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";

export default function AdminDistricts() {
  const [filterStateId, setFilterStateId] = useState<string>("");
  const { data: districts, isLoading } = useListDistricts(
    filterStateId ? { stateId: Number(filterStateId) } : undefined
  );
  const { data: states } = useListStates();
  const createDistrict = useCreateDistrict();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [stateId, setStateId] = useState("");

  const handleCreate = () => {
    if (!name || !stateId) return;
    createDistrict.mutate({ data: { name, stateId: Number(stateId) } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListDistrictsQueryKey() });
        setOpen(false);
        setName("");
        setStateId("");
      },
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold" data-testid="text-districts-title">Manage Districts</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-district"><Plus className="h-4 w-4 mr-2" />Add District</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add New District</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>District Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Pune" data-testid="input-district-name" /></div>
                <div>
                  <Label>State</Label>
                  <Select value={stateId} onValueChange={setStateId}>
                    <SelectTrigger data-testid="select-district-state"><SelectValue placeholder="Select state" /></SelectTrigger>
                    <SelectContent>
                      {states?.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreate} disabled={createDistrict.isPending} className="w-full" data-testid="button-submit-district">
                  {createDistrict.isPending ? "Creating..." : "Create District"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-4">
          <Select value={filterStateId} onValueChange={setFilterStateId}>
            <SelectTrigger className="w-48" data-testid="select-filter-state"><SelectValue placeholder="All States" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {states?.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow><TableHead>Name</TableHead><TableHead>State</TableHead><TableHead>Created</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {districts?.map((d) => (
                  <TableRow key={d.id} data-testid={`row-district-${d.id}`}>
                    <TableCell className="font-medium">{d.name}</TableCell>
                    <TableCell>{d.stateName}</TableCell>
                    <TableCell>{new Date(d.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
                {(!districts || districts.length === 0) && (
                  <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No districts added yet</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
