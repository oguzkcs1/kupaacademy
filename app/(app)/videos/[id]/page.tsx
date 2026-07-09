"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye, Tag, Calendar, Edit, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/lib/store";
import { useDataStore } from "@/lib/data-store";

import { formatDate, formatDuration } from "@/lib/utils";

export default function VideoDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuthStore();
  const { videos } = useDataStore();
  const video = videos.find((v) => v.id === params.id);
  if (!video) return notFound();

  const isAdmin = user?.role === "admin";

  const getEmbedUrl = () => {
    if (video.youtubeId) return `https://www.youtube.com/embed/${video.youtubeId}`;
    if (video.vimeoId) return `https://player.vimeo.com/video/${video.vimeoId}`;
    return null;
  };

  const embedUrl = getEmbedUrl();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/videos"><ArrowLeft className="w-4 h-4" />Videolara Dön</Link>
        </Button>
        {isAdmin && (
          <Button size="sm" variant="outline">
            <Edit className="w-4 h-4" />Düzenle
          </Button>
        )}
      </div>

      {/* Video player */}
      <div className="rounded-2xl overflow-hidden bg-black aspect-video w-full">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : video.thumbnail ? (
          <div className="relative w-full h-full">
            <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center">
                <PlayCircle className="w-12 h-12 text-primary" />
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <PlayCircle className="w-20 h-20 text-white/30" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div>
            <h1 className="text-2xl font-bold">{video.title}</h1>
            {video.description && (
              <p className="text-muted-foreground mt-2 leading-relaxed">{video.description}</p>
            )}
          </div>
          {video.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {video.tags.map((tag) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
          )}
        </div>

        <Card>
          <CardContent className="p-4 space-y-3 text-sm">
            {video.duration && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <PlayCircle className="w-4 h-4" />
                <span>{formatDuration(video.duration)}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Eye className="w-4 h-4" />
              <span>{video.views} izlenme</span>
            </div>
            {video.category && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Tag className="w-4 h-4" />
                <span>{video.category.name}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(video.createdAt)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
