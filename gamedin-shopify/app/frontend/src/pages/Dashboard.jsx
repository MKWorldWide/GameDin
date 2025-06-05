import React, { useState, useEffect, useCallback } from 'react';
import {
  Page,
  Layout,
  Card,
  SkeletonBodyText,
  SkeletonDisplayText,
  TextContainer,
  EmptyState,
  Banner,
  Button,
  LegacyStack,
  Text,
  DataTable,
  Tabs,
} from '@shopify/polaris';
import { BarChart, LineChart } from '@shopify/polaris-viz';
import { useNavigate } from 'react-router-dom';

/**
 * Dashboard component that displays key metrics and recent activity
 * @param {Object} props - Component props
 * @param {Function} props.showToast - Function to show toast notifications
 * @returns {JSX.Element} Dashboard component
 */
export default function Dashboard({ showToast }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch analytics data
      const analyticsResponse = await fetch('/api/analytics');
      if (!analyticsResponse.ok) {
        throw new Error(`Analytics request failed with status ${analyticsResponse.status}`);
      }
      const analyticsData = await analyticsResponse.json();

      // Fetch recent orders
      const ordersResponse = await fetch('/api/orders?limit=5');
      if (!ordersResponse.ok) {
        throw new Error(`Orders request failed with status ${ordersResponse.status}`);
      }
      const ordersData = await ordersResponse.json();

      // Fetch recent products
      const productsResponse = await fetch('/api/products?limit=5&sort=created_at');
      if (!productsResponse.ok) {
        throw new Error(`Products request failed with status ${productsResponse.status}`);
      }
      const productsData = await productsResponse.json();

      // Update state with fetched data
      setAnalytics(analyticsData);
      setRecentOrders(ordersData.orders || []);
      setRecentProducts(productsData.products || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
      showToast(err.message, { error: true });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Handle tab change
  const handleTabChange = useCallback((selectedTabIndex) => {
    setSelectedTab(selectedTabIndex);
  }, []);

  // Tabs for recent activity
  const tabs = [
    {
      id: 'recent-orders',
      content: 'Recent Orders',
      accessibilityLabel: 'Recent Orders',
      panelID: 'recent-orders-panel',
    },
    {
      id: 'recent-products',
      content: 'Recent Games',
      accessibilityLabel: 'Recent Games',
      panelID: 'recent-products-panel',
    },
  ];

  // Render loading state
  if (loading) {
    return (
      <Page title="Dashboard">
        <Layout>
          <Layout.Section oneHalf>
            <Card>
              <Card.Section>
                <SkeletonDisplayText size="small" />
                <SkeletonBodyText lines={2} />
              </Card.Section>
            </Card>
          </Layout.Section>
          <Layout.Section oneHalf>
            <Card>
              <Card.Section>
                <SkeletonDisplayText size="small" />
                <SkeletonBodyText lines={2} />
              </Card.Section>
            </Card>
          </Layout.Section>
          <Layout.Section>
            <Card>
              <Card.Section>
                <SkeletonDisplayText size="small" />
                <SkeletonBodyText lines={6} />
              </Card.Section>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  // Render error state
  if (error) {
    return (
      <Page title="Dashboard">
        <Layout>
          <Layout.Section>
            <Banner
              title="There was an error loading the dashboard"
              status="critical"
              action={{ content: 'Try again', onAction: fetchDashboardData }}
            >
              <p>{error}</p>
            </Banner>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  // Prepare data for charts
  const salesData = analytics?.salesOverTime?.map(item => ({
    name: item.date,
    data: [{ key: 'Sales', value: item.amount }]
  })) || [];

  const topGamesData = {
    data: analytics?.topGames?.map(game => ({
      name: game.title,
      data: [{ key: 'Sales', value: game.sales }]
    })) || [],
    showLegend: false,
  };

  // Prepare data for tables
  const ordersTableRows = recentOrders.map(order => [
    order.name,
    order.customer?.name || 'Guest',
    new Date(order.created_at).toLocaleDateString(),
    `$${order.total_price}`,
    order.fulfillment_status || 'Unfulfilled'
  ]);

  const productsTableRows = recentProducts.map(product => [
    product.title,
    product.product_type || 'Game',
    new Date(product.created_at).toLocaleDateString(),
    product.status,
    `$${product.variants[0]?.price || '0.00'}`
  ]);

  return (
    <Page
      title="Dashboard"
      primaryAction={{
        content: 'View All Games',
        onAction: () => navigate('/products'),
      }}
    >
      {/* Key Metrics */}
      <Layout>
        <Layout.Section oneHalf>
          <Card>
            <Card.Section>
              <TextContainer>
                <Text variant="headingMd" as="h2">Sales Overview</Text>
                <LegacyStack distribution="fillEvenly">
                  <LegacyStack vertical>
                    <Text variant="headingXl" as="p">${analytics?.totalSales?.toFixed(2) || '0.00'}</Text>
                    <Text variant="bodySm" as="p">Total Sales</Text>
                  </LegacyStack>
                  <LegacyStack vertical>
                    <Text variant="headingXl" as="p">{analytics?.totalOrders || 0}</Text>
                    <Text variant="bodySm" as="p">Total Orders</Text>
                  </LegacyStack>
                </LegacyStack>
              </TextContainer>
            </Card.Section>
            <Card.Section title="Sales Over Time">
              {salesData.length > 0 ? (
                <LineChart data={salesData} theme="Light" />
              ) : (
                <EmptyState
                  heading="No sales data available"
                  image=""
                >
                  <p>Start selling to see your sales data here.</p>
                </EmptyState>
              )}
            </Card.Section>
          </Card>
        </Layout.Section>

        <Layout.Section oneHalf>
          <Card>
            <Card.Section>
              <TextContainer>
                <Text variant="headingMd" as="h2">Game Metrics</Text>
                <LegacyStack distribution="fillEvenly">
                  <LegacyStack vertical>
                    <Text variant="headingXl" as="p">{analytics?.totalGames || 0}</Text>
                    <Text variant="bodySm" as="p">Total Games</Text>
                  </LegacyStack>
                  <LegacyStack vertical>
                    <Text variant="headingXl" as="p">{analytics?.totalCustomers || 0}</Text>
                    <Text variant="bodySm" as="p">Total Customers</Text>
                  </LegacyStack>
                </LegacyStack>
              </TextContainer>
            </Card.Section>
            <Card.Section title="Top Selling Games">
              {topGamesData.data.length > 0 ? (
                <BarChart data={topGamesData.data} theme="Light" />
              ) : (
                <EmptyState
                  heading="No game sales data available"
                  image=""
                >
                  <p>Start selling games to see your top performers here.</p>
                </EmptyState>
              )}
            </Card.Section>
          </Card>
        </Layout.Section>

        {/* Recent Activity */}
        <Layout.Section>
          <Card>
            <Tabs tabs={tabs} selected={selectedTab} onSelect={handleTabChange}>
              <Card.Section title={tabs[selectedTab].content}>
                {selectedTab === 0 && (
                  ordersTableRows.length > 0 ? (
                    <DataTable
                      columnContentTypes={['text', 'text', 'text', 'text', 'text']}
                      headings={['Order', 'Customer', 'Date', 'Total', 'Status']}
                      rows={ordersTableRows}
                    />
                  ) : (
                    <EmptyState
                      heading="No orders yet"
                      image=""
                      action={{ content: 'View Store', url: 'https://admin.shopify.com' }}
                    >
                      <p>When you receive orders, they will appear here.</p>
                    </EmptyState>
                  )
                )}
                {selectedTab === 1 && (
                  productsTableRows.length > 0 ? (
                    <DataTable
                      columnContentTypes={['text', 'text', 'text', 'text', 'text']}
                      headings={['Game', 'Type', 'Added', 'Status', 'Price']}
                      rows={productsTableRows}
                    />
                  ) : (
                    <EmptyState
                      heading="No games added yet"
                      image=""
                      action={{ content: 'Add Game', onAction: () => navigate('/products/new') }}
                    >
                      <p>Add games to your store to see them here.</p>
                    </EmptyState>
                  )
                )}
              </Card.Section>
              <Card.Section>
                <div style={{ textAlign: 'right' }}>
                  <Button onClick={() => navigate(selectedTab === 0 ? '/orders' : '/products')}>
                    View All {selectedTab === 0 ? 'Orders' : 'Games'}
                  </Button>
                </div>
              </Card.Section>
            </Tabs>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
} 