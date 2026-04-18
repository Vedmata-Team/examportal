import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useListInstitutions, useCreateInstitution, useListDistricts, getListInstitutionsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";

export default function AdminInstitutions() {
  const [filterDistrictId, setFilterDistrictId] = useState<string>("");
  const { data: institutions, isLoading } = useListInstitutions(
    filterDistrictId ? { districtId: Number(filterDistrictId) } : undefined
  );
  const { data: districts } = useListDistricts();
  const createInstitution = useCreateInstitution();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [districtId, setDistrictId] = useState("");

  const handleCreate = () => {
    if (!name || !districtId) return;
    createInstitution.mutate({ data: { name, districtId: Number(districtId) } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListInstitutionsQueryKey() });
        setOpen(false);
        setName("");
        setDistrictId("");
      },
    });
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold" data-testid="text-institutions-title">Manage Institutions</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-institution"><Plus className="h-4 w-4 mr-2" />Add Institution</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add New Institution</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Institution Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Govt. High School" data-testid="input-institution-name" /></div>
                <div>
                  <Label>District</Label>
                  <Select value={districtId} onValueChange={setDistrictId}>
                    <SelectTrigger data-testid="select-institution-district"><SelectValue placeholder="Select district" /></SelectTrigger>
                    <SelectContent>
                      {districts?.map((d) => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreate} disabled={createInstitution.isPending} className="w-full" data-testid="button-submit-institution">
                  {createInstitution.isPending ? "Creating..." : "Create Institution"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-4">
          <Select value={filterDistrictId} onValueChange={setFilterDistrictId}>
            <SelectTrigger className="w-48" data-testid="select-filter-district"><SelectValue placeholder="All Districts" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Districts</SelectItem>
              {districts?.map((d) => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow><TableHead>Name</TableHead><TableHead>District</TableHead><TableHead>State</TableHead><TableHead>Created</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {institutions?.map((inst) => (
                  <TableRow key={inst.id} data-testid={`row-institution-${inst.id}`}>
                    <TableCell className="font-medium">{inst.name}</TableCell>
                    <TableCell>{inst.districtName}</TableCell>
                    <TableCell>{inst.stateName}</TableCell>
                    <TableCell>{new Date(inst.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
                {(!institutions || institutions.length === 0) && (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No institutions added yet</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
