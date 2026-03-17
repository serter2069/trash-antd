'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, Form, Input, Button, Typography, Alert } from 'antd';

const { Title, Text } = Typography;

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(values: { code: string }) {
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code: values.code }),
    });

    if (res.ok) {
      router.push('/app');
    } else {
      const data = await res.json();
      setError(data.error || 'Неверный код');
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
          <Title level={3} style={{ margin: 0 }}>Введите код</Title>
          <Text type="secondary">
            Код отправлен на {email}. Подсказка: всегда <Text strong>1234</Text>
          </Text>
        </div>

        {error && (
          <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />
        )}

        <Form layout="vertical" onFinish={handleSubmit} autoComplete="off">
          <Form.Item
            label="4-значный код"
            name="code"
            rules={[{ required: true, message: 'Введите код' }]}
          >
            <Input
              id="code-input"
              type="text"
              placeholder="1234"
              maxLength={4}
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              id="verify-btn"
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
            >
              {loading ? 'Проверяем...' : 'Войти'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyForm />
    </Suspense>
  );
}
