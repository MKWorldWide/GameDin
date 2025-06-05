import React from 'react';
import { Page, Layout, EmptyState, Button } from '@shopify/polaris';
import { useNavigate } from 'react-router-dom';

/**
 * NotFound component for 404 errors
 * @returns {JSX.Element} NotFound component
 */
export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <EmptyState
            heading="Page not found"
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            action={{
              content: 'Back to dashboard',
              onAction: () => navigate('/'),
            }}
          >
            <p>The page you're looking for couldn't be found.</p>
          </EmptyState>
        </Layout.Section>
      </Layout>
    </Page>
  );
} 