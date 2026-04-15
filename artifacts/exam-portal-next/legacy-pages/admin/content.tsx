import { useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useGetChapter, useCreateContent, getGetChapterQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Clock } from "lucide-react";

export default function AdminContent({ chapterId }: { chapterId: number }) {
  const { data: chapter, isLoading } = useGetChapter(chapterId, {
    query: { enabled: !!chapterId, queryKey: getGetChapterQueryKey(chapterId) },
  });
  const createContent = useCreateContent();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");
  const [minReadTime, setMinReadTime] = useState("60");
  const [orderIndex, setOrderIndex] = useState("0");

  const handleCreate = () => {
    if (htmlContent == null) return;
    createContent.mutate({
      data: { chapterId, htmlContent, minReadTime: Number(minReadTime), orderIndex: Number(orderIndex) },
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetChapterQueryKey(chapterId) });
        setOpen(false);
        setHtmlContent("");
        setMinReadTime("60");
        setOrderIndex("0");
      },
    });
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-content-title">
              {isLoading ? "Loading..." : chapter?.title}
            </h1>
            <p className="text-sm text-muted-foreground">{chapter?.className}</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-content"><Plus className="h-4 w-4 mr-2" />Add Content</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>Add Content Section</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block">HTML Content</Label>
                  <div className="prose-none max-w-full border rounded-md overflow-hidden bg-background">
                    <CKEditor
                      editor={ClassicEditor}
                      data={htmlContent}
                      onChange={(_: any, editor: any) => {
                        const data = editor.getData();
                        setHtmlContent(data);
                      }}
                      config={{
                        placeholder: "Enter content here...",
                      }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Min Read Time (seconds)</Label><Input type="number" value={minReadTime} onChange={(e) => setMinReadTime(e.target.value)} data-testid="input-read-time" /></div>
                  <div><Label>Order</Label><Input type="number" value={orderIndex} onChange={(e) => setOrderIndex(e.target.value)} data-testid="input-content-order" /></div>
                </div>
                <Button onClick={handleCreate} disabled={createContent.isPending} className="w-full" data-testid="button-submit-content">
                  {createContent.isPending ? "Creating..." : "Add Content"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {chapter?.content && chapter.content.length > 0 ? (
          <div className="space-y-4">
            {chapter.content.map((c, idx) => (
              <Card key={c.id} data-testid={`card-content-${c.id}`}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    Section {idx + 1}
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />{c.minReadTime}s min read
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: c.htmlContent }} />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No content added yet. Click "Add Content" to get started.
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
