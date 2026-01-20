import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useBookmarks } from '@/hooks/useLocalStorage';
import { Button } from '@/components/ui/button';
import { Bookmark, Trash2, ExternalLink, BookOpen } from 'lucide-react';

export default function Bookmarks() {
  const { bookmarks, removeBookmark } = useBookmarks();

  return (
    <div className="min-h-screen bg-background dark">
      <Header />

      <main className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Bookmark className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Bookmarks</h1>
              <p className="text-muted-foreground">
                {bookmarks.length} saved verse{bookmarks.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {bookmarks.length === 0 ? (
            <div className="text-center py-16 bg-card border border-border rounded-xl">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">No bookmarks yet</h2>
              <p className="text-muted-foreground mb-6">
                Start reading and bookmark your favorite verses
              </p>
              <Link to="/read">
                <Button>Start Reading</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookmarks
                .sort((a, b) => b.timestamp - a.timestamp)
                .map((bookmark) => (
                  <div
                    key={bookmark.id}
                    className="bg-card border border-border rounded-xl p-6"
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-sm font-semibold text-primary">
                          {bookmark.surahNumber}
                        </span>
                        <div>
                          <h3 className="font-medium text-foreground">
                            {bookmark.surahName}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            Verse {bookmark.ayahNumber}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link to={`/surah/${bookmark.surahNumber}?ayah=${bookmark.ayahNumber}`}>
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeBookmark(bookmark.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-muted-foreground line-clamp-3">
                      {bookmark.ayahText}
                    </p>

                    <p className="text-xs text-muted-foreground mt-4">
                      Saved on {new Date(bookmark.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
