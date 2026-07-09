"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, PlayCircle, Eye, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/lib/store";
import { useDataStore } from "@/lib/data-store";
import { formatDuration } from "@/lib/utils";
import type { Video } from "@/types";

function VideoCard({ video }: { video: Video }) {
  return (
    <Link href={`/videos/${video.id}`}>
      <Card className="overflow-hidden hover:shadow-md transition-all duration-200 group cursor-pointer">
        <div className="relative h-40 bg-muted overflow-hidden">
          {video.thumbnail ? (
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <PlayCircle className="w-12 h-12 text-muted-foreground/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
              <PlayCircle className="w-7 h-7 text-primary" />
            </div>
          </div>
          {video.duration && (
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
              {formatDuration(video.duration)}
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
            {video.title}
          </h3>
          {video.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{video.description}</p>
          )}
          <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {video.views}
            </span>
            {video.category && (
              <Badge variant="outline" className="text-xs font-normal">
                {video.category.name}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function VideosPage() {
  const { user } = useAuthStore();
  const { videos } = useDataStore();
  const [search, setSearch] = useState("");

  const isAdmin = user?.role === "admin";

  const filtered = videos.filter(
    (v) => !search || v.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Videolar</h1>
          <p className="text-muted-foreground mt-1">{filtered.length} video</p>
        </div>
        {isAdmin && (
          <Button asChild>
            <Link href="/admin/videos/new">
              <Plus className="w-4 h-4" />
              Yeni Video
            </Link>
          </Button>
        )}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Video ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <PlayCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">Video bulunamadı</p>
        </div>
      )}
    </div>
  );
}
