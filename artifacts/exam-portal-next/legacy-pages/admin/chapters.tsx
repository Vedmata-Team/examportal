import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useListChapters, useCreateChapter, useListClasses, getListChaptersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, FileText } from "lucide-react";

export default function AdminChapters() {
  const [filterClassId, setFilterClassId] = useState<string>("");
  const { data: chapters } = useListChapters(filterClassId ? { classId: Number(filterClassId) } : undefined);
  const { data: classes } = useListClasses();
  const createChapter = useCreateChapter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [classId, setClassId] = useState("");
  const [orderIndex, setOrderIndex] = useState("0");

  const handleCreate = () => {
    if (!title || !classId) return;
    createChapter.mutate({ data: { title, classId: Number(classId), orderIndex: Number(orderIndex) } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListChaptersQueryKey() });
        setOpen(false);
        setTitle("");
        setClassId("");
        setOrderIndex("0");
      },
    });
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold" data-testid="text-chapters-title">Manage Chapters</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-chapter"><Plus className="h-4 w-4 mr-2" />Add Chapter</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add New Chapter</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Chapter Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Introduction to Algebra" data-testid="input-chapter-title" /></div>
                <div>
                  <Label>Class</Label>
                  <Select value={classId} onValueChange={setClassId}>
                    <SelectTrigger data-testid="select-chapter-class"><SelectValue placeholder="Select class" /></SelectTrigger>
                    <SelectContent>
                      {classes?.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Order</Label><Input type="number" value={orderIndex} onChange={(e) => setOrderIndex(e.target.value)} data-testid="input-chapter-order" /></div>
                <Button onClick={handleCreate} disabled={createChapter.isPending} className="w-full" data-testid="button-submit-chapter">
                  {createChapter.isPending ? "Creating..." : "Create Chapter"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-4">
          <Select value={filterClassId} onValueChange={setFilterClassId}>
            <SelectTrigger className="w-48" data-testid="select-filter-class"><SelectValue placeholder="All Classes" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes?.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow><TableHead>Title</TableHead><TableHead>Class</TableHead><TableHead>Order</TableHead><TableHead>Actions</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {chapters?.map((ch) => (
                  <TableRow key={ch.id} data-testid={`row-chapter-${ch.id}`}>
                    <TableCell className="font-medium">{ch.title}</TableCell>
                    <TableCell>{ch.className}</TableCell>
                    <TableCell>{ch.orderIndex}</TableCell>
                    <TableCell>
                      <Link href={`/admin/content/${ch.id}`}>
                        <Button variant="outline" size="sm" data-testid={`button-edit-content-${ch.id}`}>
                          <FileText className="h-3 w-3 mr-1" />Content
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
                {(!chapters || chapters.length === 0) && (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No chapters added yet</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
