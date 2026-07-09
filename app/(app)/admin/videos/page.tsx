"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Edit, Trash2, Video, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDataStore } from "@/lib/data-store";
import { formatDate, formatDuration } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminVideosPage() {
  const { videos, deleteVideo } = useDataStore();
  const [search, setSearch] = useState("");

  const filtered = videos.filter(
    (v) => !search || v.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string) => {
    deleteVideo(id);
    toast.success("Video silindi");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Video Yönetimi</h1>
          <p className="text-muted-foreground mt-1">{videos.length} video</p>
        </div>
        <Button asChild>
          <Link href="/admin/videos/new"><Plus className="w-4 h-4" />Yeni Video</Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Video ara..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Video bulunamadı</p>
            )}
            {filtered.map((video) => (
              <div key={video.id} className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                {video.thumbnail ? (
                  <img src={video.thumbnail} alt={video.title} className="w-20 h-12 rounded object-cover flex-shrink-0" />
                ) : (
                  <div className="w-20 h-12 rounded bg-muted flex items-center justify-center flex-shrink-0">
                    <Video className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{video.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {video.category && <Badge variant="secondary" className="text-xs">{video.category.name}</Badge>}
                    {video.duration && <span className="text-xs text-muted-foreground">{formatDuration(video.duration)}</span>}
                    <span className="text-xs text-muted-foreground">{video.views} izlenme</span>
                    <span className="text-xs text-muted-foreground">{formatDate(video.createdAt)}</span>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="flex-shrink-0">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/videos/${video.id}`}><Edit className="mr-2 h-4 w-4" />Görüntüle</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(video.id)}>
                      <Trash2 className="mr-2 h-4 w-4" />Sil
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
