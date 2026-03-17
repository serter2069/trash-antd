'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Form, Input, Button, Typography, Alert } from 'antd';

const { Title, Text } = Typography;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(values: { email: string }) {
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: values.email }),
    });

    if (res.ok) {
      router.push(`/verify?email=${encodeURIComponent(values.email)}`);
    } else {
      const data = await res.json();
      setError(data.error || 'Что-то пошло не так');
    }
    setLoading(false);
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f0f2f5',
      padding: '16px',
    }}>
      <Card style={{ width: '100%', maxWidth: 400 }} variant="borderless">
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0 }}>Мысли в урну</Title>
          <Text type="secondary">Введите email для входа</Text>
        </div>

        {error && (
          <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />
        )}

        <Form layout="vertical" onFinish={handleSubmit} autoComplete="off">
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Введите email' },
              { type: 'email', message: 'Неверный формат email' },
            ]}
          >
            <Input
              id="email-input"
              type="email"
              placeholder="you@example.com"
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              id="send-btn"
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
            >
              {loading ? 'Отправляем...' : 'Получить код'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
