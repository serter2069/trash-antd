'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Thought {
  id: number;
  text: string;
  created_at: string;
}

export default function AppPage() {
  const router = useRouter();
  const [text, setText] = useState('');
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadThoughts = useCallback(async (p: number) => {
    setLoading(true);
    const res = await fetch(`/api/thoughts?page=${p}`);
    if (res.status === 401) {
      router.push('/login');
      return;
    }
    const data = await res.json();
    setThoughts(data.thoughts);
    setTotal(data.total);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadThoughts(page);
  }, [page, loadThoughts]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);

    const res = await fetch('/api/thoughts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (res.status === 401) {
      router.push('/login');
      return;
    }

    if (res.ok) {
      setText('');
      setPage(1);
      await loadThoughts(1);
    }
    setSubmitting(false);
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Мысли в урну</h1>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Выйти
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-3">
            <Textarea
              placeholder="Напишите негативную мысль..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <Button type="submit" className="w-full" disabled={submitting || !text.trim()}>
              {submitting ? 'Выбрасываем...' : 'Выбросить'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">
          История ({total} {total === 1 ? 'мысль' : total >= 2 && total <= 4 ? 'мысли' : 'мыслей'})
        </h2>

        {loading ? (
          <p className="text-muted-foreground text-sm">Загрузка...</p>
        ) : thoughts.length === 0 ? (
          <p className="text-muted-foreground text-sm">Пока пусто. Выбросьте первую мысль.</p>
        ) : (
          thoughts.map((t) => (
            <Card key={t.id}>
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-sm font-normal text-muted-foreground">
                  {new Date(t.created_at).toLocaleString('ru-RU')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-sm whitespace-pre-wrap">{t.text}</p>
              </CardContent>
            </Card>
          ))
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Назад
            </Button>
            <span className="text-sm text-muted-foreground">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Вперёд
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
