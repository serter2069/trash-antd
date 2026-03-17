'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Layout,
  Card,
  Button,
  Input,
  List,
  Typography,
  Space,
  Pagination,
  Spin,
} from 'antd';
import { LogoutOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

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

  async function handleSubmit() {
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

  function pluralThoughts(n: number) {
    if (n === 1) return 'мысль';
    if (n >= 2 && n <= 4) return 'мысли';
    return 'мыслей';
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        background: '#001529',
      }}>
        <Title level={4} style={{ color: '#fff', margin: 0 }}>
          Мысли в урну
        </Title>
        <Button
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          ghost
          size="small"
        >
          Выйти
        </Button>
      </Header>

      <Content style={{ padding: '24px', maxWidth: 800, margin: '0 auto', width: '100%' }}>
        <Card style={{ marginBottom: 24 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <TextArea
              placeholder="Напишите негативную мысль..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              style={{ resize: 'none' }}
            />
            <Button
              type="primary"
              size="large"
              block
              loading={submitting}
              disabled={!text.trim()}
              onClick={handleSubmit}
            >
              {submitting ? 'Выбрасываем...' : 'Выбросить'}
            </Button>
          </Space>
        </Card>

        <Card
          title={
            <Text strong>
              История ({total} {pluralThoughts(total)})
            </Text>
          }
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: '24px' }}>
              <Spin />
            </div>
          ) : (
            <List
              dataSource={thoughts}
              locale={{ emptyText: 'Пока пусто. Выбросьте первую мысль.' }}
              renderItem={(item) => (
                <List.Item key={item.id} style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Text type="secondary" style={{ fontSize: 12, marginBottom: 4 }}>
                    {new Date(item.created_at).toLocaleString('ru-RU')}
                  </Text>
                  <Text style={{ whiteSpace: 'pre-wrap' }}>{item.text}</Text>
                </List.Item>
              )}
            />
          )}

          {total > 20 && (
            <div style={{ marginTop: 16, textAlign: 'right' }}>
              <Pagination
                current={page}
                total={total}
                pageSize={20}
                onChange={(p) => setPage(p)}
                showSizeChanger={false}
              />
            </div>
          )}
        </Card>
      </Content>
    </Layout>
  );
}
