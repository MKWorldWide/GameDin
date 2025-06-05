import React, { useState, useEffect, useCallback } from 'react';
import {
  Page,
  Layout,
  Card,
  ResourceList,
  Filters,
  TextStyle,
  Avatar,
  EmptyState,
  Banner,
  Button,
  Pagination,
  SkeletonBodyText,
  SkeletonDisplayText,
  Badge,
  LegacyStack,
  Tabs,
} from '@shopify/polaris';
import { useNavigate } from 'react-router-dom';

/**
 * Customers component that displays a list of customers with filtering and search
 * @param {Object} props - Component props
 * @param {Function} props.showToast - Function to show toast notifications
 * @returns {JSX.Element} Customers component
 */
export default function Customers({ showToast }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [appliedFilters, setAppliedFilters] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [sortValue, setSortValue] = useState('name-asc');
  const [selectedTab, setSelectedTab] = useState(0);
  const [pagination, setPagination] = useState({
    hasNextPage: false,
    hasPreviousPage: false,
    currentPage: 1,
  });

  // Fetch customers with filters, search, and pagination
  const fetchCustomers = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);

    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 10);
      
      // Add search query if present
      if (searchValue) {
        params.append('query', searchValue);
      }
      
      // Add sort parameter
      if (sortValue) {
        const [field, direction] = sortValue.split('-');
        params.append('sort_by', field);
        params.append('sort_order', direction);
      }
      
      // Add filters
      appliedFilters.forEach(filter => {
        if (filter.key === 'account_status') {
          params.append('status', filter.value);
        } else if (filter.key === 'customer_type') {
          params.append('type', filter.value);
        } else if (filter.key === 'spent_range') {
          const [min, max] = filter.value.split('-');
          if (min) params.append('spent_min', min);
          if (max) params.append('spent_max', max);
        }
      });

      // Fetch customers from API
      const response = await fetch(`/api/customers?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Customers request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update state with fetched data
      setCustomers(data.customers || []);
      setPagination({
        hasNextPage: data.pagination?.hasNextPage || false,
        hasPreviousPage: data.pagination?.hasPreviousPage || false,
        currentPage: page,
      });
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError(err.message);
      showToast(err.message, { error: true });
    } finally {
      setLoading(false);
    }
  }, [searchValue, sortValue, appliedFilters, showToast]);

  // Fetch customers on component mount and when dependencies change
  useEffect(() => {
    fetchCustomers(pagination.currentPage);
  }, [fetchCustomers, pagination.currentPage]);

  // Handle filter changes
  const handleFiltersChange = useCallback((filters) => {
    setAppliedFilters(filters);
  }, []);

  // Handle search value changes
  const handleSearchChange = useCallback((value) => {
    setSearchValue(value);
  }, []);

  // Handle search submit
  const handleSearchSubmit = useCallback(() => {
    fetchCustomers(1);
  }, [fetchCustomers]);

  // Handle sort value changes
  const handleSortChange = useCallback((value) => {
    setSortValue(value);
    fetchCustomers(1);
  }, [fetchCustomers]);

  // Handle pagination
  const handlePaginationChange = useCallback((newPage) => {
    fetchCustomers(newPage);
  }, [fetchCustomers]);

  // Handle tab change
  const handleTabChange = useCallback((selectedTabIndex) => {
    setSelectedTab(selectedTabIndex);
  }, []);

  // Tabs for customer views
  const tabs = [
    {
      id: 'all-customers',
      content: 'All Customers',
      accessibilityLabel: 'All Customers',
      panelID: 'all-customers-panel',
    },
    {
      id: 'active-customers',
      content: 'Active Gamers',
      accessibilityLabel: 'Active Gamers',
      panelID: 'active-gamers-panel',
    },
  ];

  // Filter configuration
  const filters = [
    {
      key: 'account_status',
      label: 'Account Status',
      filter: (
        <Filters.ResourceList
          resourceName={{ singular: 'status', plural: 'statuses' }}
          filterKey="account_status"
          options={[
            { label: 'Active', value: 'active' },
            { label: 'Disabled', value: 'disabled' },
            { label: 'Invited', value: 'invited' },
          ]}
        />
      ),
    },
    {
      key: 'customer_type',
      label: 'Customer Type',
      filter: (
        <Filters.ResourceList
          resourceName={{ singular: 'type', plural: 'types' }}
          filterKey="customer_type"
          options={[
            { label: 'Regular', value: 'regular' },
            { label: 'VIP', value: 'vip' },
            { label: 'Wholesale', value: 'wholesale' },
          ]}
        />
      ),
    },
    {
      key: 'spent_range',
      label: 'Total Spent',
      filter: (
        <Filters.ResourceList
          resourceName={{ singular: 'spent range', plural: 'spent ranges' }}
          filterKey="spent_range"
          options={[
            { label: 'Under $50', value: '0-50' },
            { label: '$50 - $200', value: '50-200' },
            { label: '$200 - $500', value: '200-500' },
            { label: 'Over $500', value: '500-' },
          ]}
        />
      ),
    },
  ];

  // Render loading state
  if (loading && pagination.currentPage === 1) {
    return (
      <Page title="Customers">
        <Layout>
          <Layout.Section>
            <Card>
              <Card.Section>
                <SkeletonDisplayText size="small" />
                <SkeletonBodyText lines={8} />
              </Card.Section>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  // Render error state
  if (error && customers.length === 0) {
    return (
      <Page title="Customers">
        <Layout>
          <Layout.Section>
            <Banner
              title="There was an error loading customers"
              status="critical"
              action={{ content: 'Try again', onAction: () => fetchCustomers(1) }}
            >
              <p>{error}</p>
            </Banner>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return (
    <Page
      title="Customers"
      primaryAction={{
        content: 'Add Customer',
        onAction: () => navigate('/customers/new'),
      }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <Tabs tabs={tabs} selected={selectedTab} onSelect={handleTabChange}>
              <ResourceList
                resourceName={{ singular: 'customer', plural: 'customers' }}
                items={customers}
                renderItem={renderItem}
                loading={loading}
                filterControl={
                  <Filters
                    queryValue={searchValue}
                    filters={filters}
                    appliedFilters={appliedFilters}
                    onQueryChange={handleSearchChange}
                    onQueryClear={() => setSearchValue('')}
                    onClearAll={() => {
                      setAppliedFilters([]);
                      setSearchValue('');
                    }}
                    onFiltersChange={handleFiltersChange}
                    onQuerySubmit={handleSearchSubmit}
                  />
                }
                sortValue={sortValue}
                sortOptions={[
                  { label: 'Name (A-Z)', value: 'name-asc' },
                  { label: 'Name (Z-A)', value: 'name-desc' },
                  { label: 'Email (A-Z)', value: 'email-asc' },
                  { label: 'Email (Z-A)', value: 'email-desc' },
                  { label: 'Total spent (high to low)', value: 'total_spent-desc' },
                  { label: 'Total spent (low to high)', value: 'total_spent-asc' },
                  { label: 'Created (newest)', value: 'created_at-desc' },
                  { label: 'Created (oldest)', value: 'created_at-asc' },
                ]}
                onSortChange={handleSortChange}
                emptyState={
                  <EmptyState
                    heading="No customers found"
                    image=""
                    action={{ content: 'Add Customer', onAction: () => navigate('/customers/new') }}
                  >
                    <p>Add customers to your store or try changing your search filters.</p>
                  </EmptyState>
                }
              />
              {(pagination.hasNextPage || pagination.hasPreviousPage) && (
                <div style={{ padding: '16px', textAlign: 'center' }}>
                  <Pagination
                    hasPrevious={pagination.hasPreviousPage}
                    onPrevious={() => handlePaginationChange(pagination.currentPage - 1)}
                    hasNext={pagination.hasNextPage}
                    onNext={() => handlePaginationChange(pagination.currentPage + 1)}
                  />
                </div>
              )}
            </Tabs>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );

  // Helper function to render each customer item
  function renderItem(item) {
    const { id, first_name, last_name, email, total_spent, orders_count, tags, accepts_marketing, created_at } = item;
    
    // Create full name
    const name = `${first_name || ''} ${last_name || ''}`.trim() || 'Customer';
    
    // Get initials for avatar
    const initials = name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
    
    // Format total spent
    const formattedTotalSpent = parseFloat(total_spent || 0).toFixed(2);
    
    // Check if customer is a gamer (has gaming-related tags)
    const isGamer = tags?.some(tag => 
      ['gamer', 'player', 'gaming', 'console', 'pc-gamer'].includes(tag.toLowerCase())
    );

    return (
      <ResourceList.Item
        id={id}
        media={<Avatar customer size="medium" name={name} initials={initials} />}
        accessibilityLabel={`View details for ${name}`}
        onClick={() => navigate(`/customers/${id}`)}
      >
        <LegacyStack>
          <LegacyStack.Item fill>
            <h3>
              <TextStyle variation="strong">{name}</TextStyle>
            </h3>
            <div>
              <TextStyle variation="subdued">{email}</TextStyle>
            </div>
            <div>
              {isGamer && <Badge status="success">Gamer</Badge>}
              {accepts_marketing && <Badge>Marketing</Badge>}
              <TextStyle variation="subdued">
                {orders_count || 0} orders • Created {new Date(created_at).toLocaleDateString()}
              </TextStyle>
            </div>
          </LegacyStack.Item>
          <LegacyStack.Item>
            <TextStyle variation="strong">${formattedTotalSpent}</TextStyle>
          </LegacyStack.Item>
        </LegacyStack>
      </ResourceList.Item>
    );
  }
} 