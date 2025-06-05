import React, { useState, useEffect, useCallback } from 'react';
import {
  Page,
  Layout,
  Card,
  ResourceList,
  Filters,
  TextStyle,
  Thumbnail,
  EmptyState,
  Banner,
  Button,
  Pagination,
  SkeletonBodyText,
  SkeletonDisplayText,
  Badge,
  LegacyStack,
} from '@shopify/polaris';
import { useNavigate } from 'react-router-dom';

/**
 * Products component that displays a list of games with filtering and search
 * @param {Object} props - Component props
 * @param {Function} props.showToast - Function to show toast notifications
 * @returns {JSX.Element} Products component
 */
export default function Products({ showToast }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [appliedFilters, setAppliedFilters] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [sortValue, setSortValue] = useState('title-asc');
  const [pagination, setPagination] = useState({
    hasNextPage: false,
    hasPreviousPage: false,
    currentPage: 1,
  });

  // Fetch products with filters, search, and pagination
  const fetchProducts = useCallback(async (page = 1) => {
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
        if (filter.key === 'status') {
          params.append('status', filter.value);
        } else if (filter.key === 'genre') {
          params.append('genre', filter.value);
        } else if (filter.key === 'price_range') {
          const [min, max] = filter.value.split('-');
          if (min) params.append('price_min', min);
          if (max) params.append('price_max', max);
        }
      });

      // Fetch products from API
      const response = await fetch(`/api/products?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Products request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update state with fetched data
      setProducts(data.products || []);
      setPagination({
        hasNextPage: data.pagination?.hasNextPage || false,
        hasPreviousPage: data.pagination?.hasPreviousPage || false,
        currentPage: page,
      });
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
      showToast(err.message, { error: true });
    } finally {
      setLoading(false);
    }
  }, [searchValue, sortValue, appliedFilters, showToast]);

  // Fetch products on component mount and when dependencies change
  useEffect(() => {
    fetchProducts(pagination.currentPage);
  }, [fetchProducts, pagination.currentPage]);

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
    fetchProducts(1);
  }, [fetchProducts]);

  // Handle sort value changes
  const handleSortChange = useCallback((value) => {
    setSortValue(value);
    fetchProducts(1);
  }, [fetchProducts]);

  // Handle pagination
  const handlePaginationChange = useCallback((newPage) => {
    fetchProducts(newPage);
  }, [fetchProducts]);

  // Filter configuration
  const filters = [
    {
      key: 'status',
      label: 'Status',
      filter: (
        <Filters.ResourceList
          resourceName={{ singular: 'status', plural: 'statuses' }}
          filterKey="status"
          options={[
            { label: 'Active', value: 'active' },
            { label: 'Draft', value: 'draft' },
            { label: 'Archived', value: 'archived' },
          ]}
        />
      ),
    },
    {
      key: 'genre',
      label: 'Genre',
      filter: (
        <Filters.ResourceList
          resourceName={{ singular: 'genre', plural: 'genres' }}
          filterKey="genre"
          options={[
            { label: 'Action', value: 'action' },
            { label: 'Adventure', value: 'adventure' },
            { label: 'RPG', value: 'rpg' },
            { label: 'Strategy', value: 'strategy' },
            { label: 'Simulation', value: 'simulation' },
            { label: 'Sports', value: 'sports' },
            { label: 'Puzzle', value: 'puzzle' },
          ]}
        />
      ),
    },
    {
      key: 'price_range',
      label: 'Price',
      filter: (
        <Filters.ResourceList
          resourceName={{ singular: 'price range', plural: 'price ranges' }}
          filterKey="price_range"
          options={[
            { label: 'Under $20', value: '0-20' },
            { label: '$20 - $50', value: '20-50' },
            { label: '$50 - $100', value: '50-100' },
            { label: 'Over $100', value: '100-' },
          ]}
        />
      ),
    },
  ];

  // Render loading state
  if (loading && pagination.currentPage === 1) {
    return (
      <Page title="Games">
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
  if (error && products.length === 0) {
    return (
      <Page title="Games">
        <Layout>
          <Layout.Section>
            <Banner
              title="There was an error loading games"
              status="critical"
              action={{ content: 'Try again', onAction: () => fetchProducts(1) }}
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
      title="Games"
      primaryAction={{
        content: 'Add Game',
        onAction: () => navigate('/products/new'),
      }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <ResourceList
              resourceName={{ singular: 'game', plural: 'games' }}
              items={products}
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
                { label: 'Title (A-Z)', value: 'title-asc' },
                { label: 'Title (Z-A)', value: 'title-desc' },
                { label: 'Price (low to high)', value: 'price-asc' },
                { label: 'Price (high to low)', value: 'price-desc' },
                { label: 'Created (newest)', value: 'created_at-desc' },
                { label: 'Created (oldest)', value: 'created_at-asc' },
              ]}
              onSortChange={handleSortChange}
              emptyState={
                <EmptyState
                  heading="No games found"
                  image=""
                  action={{ content: 'Add Game', onAction: () => navigate('/products/new') }}
                >
                  <p>Add games to your store or try changing your search filters.</p>
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
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );

  // Helper function to render each product item
  function renderItem(item) {
    const { id, title, images, status, product_type, variants, metafields } = item;
    const media = (
      <Thumbnail
        source={images && images.length > 0 ? images[0].src : ''}
        alt={title}
      />
    );

    // Extract price from variants
    const price = variants && variants.length > 0 ? variants[0].price : '0.00';
    
    // Extract genre from metafields
    const genre = metafields?.find(m => m.key === 'genre')?.value || '';

    // Determine status badge color
    let statusBadgeStatus = 'new';
    if (status === 'active') statusBadgeStatus = 'success';
    if (status === 'draft') statusBadgeStatus = 'attention';
    if (status === 'archived') statusBadgeStatus = 'critical';

    return (
      <ResourceList.Item
        id={id}
        media={media}
        accessibilityLabel={`View details for ${title}`}
        onClick={() => navigate(`/products/${id}`)}
      >
        <LegacyStack>
          <LegacyStack.Item fill>
            <h3>
              <TextStyle variation="strong">{title}</TextStyle>
            </h3>
            <div>
              {product_type && <TextStyle variation="subdued">{product_type}</TextStyle>}
              {genre && (
                <>
                  <span style={{ margin: '0 0.5em' }}>•</span>
                  <TextStyle variation="subdued">{genre}</TextStyle>
                </>
              )}
            </div>
          </LegacyStack.Item>
          <LegacyStack.Item>
            <LegacyStack vertical spacing="tight">
              <Badge status={statusBadgeStatus}>{status}</Badge>
              <TextStyle variation="strong">${price}</TextStyle>
            </LegacyStack>
          </LegacyStack.Item>
        </LegacyStack>
      </ResourceList.Item>
    );
  }
} 