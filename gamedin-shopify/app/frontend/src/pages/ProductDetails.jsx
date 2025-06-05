import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Page,
  Layout,
  Card,
  SkeletonBodyText,
  SkeletonDisplayText,
  Banner,
  Button,
  Tabs,
  TextContainer,
  Text,
  Badge,
  Thumbnail,
  LegacyStack,
  LegacyCard,
  ResourceList,
  EmptyState,
} from '@shopify/polaris';

/**
 * ProductDetails component that displays detailed information about a game
 * @param {Object} props - Component props
 * @param {Function} props.showToast - Function to show toast notifications
 * @returns {JSX.Element} ProductDetails component
 */
export default function ProductDetails({ showToast }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [product, setProduct] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);

  // Fetch product details
  const fetchProductDetails = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch product data
      const productResponse = await fetch(`/api/products/${id}`);
      if (!productResponse.ok) {
        throw new Error(`Product request failed with status ${productResponse.status}`);
      }
      const productData = await productResponse.json();

      // Fetch recommendations
      const recommendationsResponse = await fetch(`/api/products/${id}/recommendations`);
      if (!recommendationsResponse.ok) {
        throw new Error(`Recommendations request failed with status ${recommendationsResponse.status}`);
      }
      const recommendationsData = await recommendationsResponse.json();

      // Fetch reviews
      const reviewsResponse = await fetch(`/api/products/${id}/reviews`);
      if (!reviewsResponse.ok) {
        throw new Error(`Reviews request failed with status ${reviewsResponse.status}`);
      }
      const reviewsData = await reviewsResponse.json();

      // Update state with fetched data
      setProduct(productData.product);
      setRecommendations(recommendationsData.recommendations || []);
      setReviews(reviewsData.reviews || []);
    } catch (err) {
      console.error('Error fetching product details:', err);
      setError(err.message);
      showToast(err.message, { error: true });
    } finally {
      setLoading(false);
    }
  }, [id, showToast]);

  // Fetch data on component mount
  useEffect(() => {
    fetchProductDetails();
  }, [fetchProductDetails]);

  // Handle tab change
  const handleTabChange = useCallback((selectedTabIndex) => {
    setSelectedTab(selectedTabIndex);
  }, []);

  // Tabs for product details
  const tabs = [
    {
      id: 'details',
      content: 'Game Details',
      accessibilityLabel: 'Game Details',
      panelID: 'details-panel',
    },
    {
      id: 'recommendations',
      content: 'Recommendations',
      accessibilityLabel: 'Game Recommendations',
      panelID: 'recommendations-panel',
    },
    {
      id: 'reviews',
      content: 'Reviews',
      accessibilityLabel: 'Game Reviews',
      panelID: 'reviews-panel',
    },
  ];

  // Render loading state
  if (loading) {
    return (
      <Page
        title="Game Details"
        breadcrumbs={[{ content: 'Games', url: '/products' }]}
      >
        <Layout>
          <Layout.Section>
            <Card>
              <Card.Section>
                <SkeletonDisplayText size="large" />
                <SkeletonBodyText lines={10} />
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
      <Page
        title="Game Details"
        breadcrumbs={[{ content: 'Games', url: '/products' }]}
      >
        <Layout>
          <Layout.Section>
            <Banner
              title="There was an error loading the game details"
              status="critical"
              action={{ content: 'Try again', onAction: fetchProductDetails }}
            >
              <p>{error}</p>
            </Banner>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  // Render not found state
  if (!product) {
    return (
      <Page
        title="Game Not Found"
        breadcrumbs={[{ content: 'Games', url: '/products' }]}
      >
        <Layout>
          <Layout.Section>
            <EmptyState
              heading="Game not found"
              image=""
              action={{ content: 'Back to Games', onAction: () => navigate('/products') }}
            >
              <p>The game you're looking for doesn't exist or has been removed.</p>
            </EmptyState>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  // Extract product details
  const {
    title,
    description,
    images,
    status,
    product_type,
    variants,
    metafields = [],
  } = product;

  // Extract price from variants
  const price = variants && variants.length > 0 ? variants[0].price : '0.00';
  
  // Extract metafields
  const genre = metafields.find(m => m.key === 'genre')?.value || '';
  const developer = metafields.find(m => m.key === 'developer')?.value || '';
  const publisher = metafields.find(m => m.key === 'publisher')?.value || '';
  const releaseDate = metafields.find(m => m.key === 'release_date')?.value || '';
  const platforms = metafields.find(m => m.key === 'platforms')?.value || '';
  const features = metafields.find(m => m.key === 'features')?.value || '';
  const rating = metafields.find(m => m.key === 'rating')?.value || '';

  // Determine status badge color
  let statusBadgeStatus = 'new';
  if (status === 'active') statusBadgeStatus = 'success';
  if (status === 'draft') statusBadgeStatus = 'attention';
  if (status === 'archived') statusBadgeStatus = 'critical';

  return (
    <Page
      title={title}
      breadcrumbs={[{ content: 'Games', url: '/products' }]}
      primaryAction={{
        content: 'Edit Game',
        onAction: () => navigate(`/products/${id}/edit`),
      }}
      secondaryActions={[
        {
          content: 'View in Store',
          onAction: () => window.open(`https://${window.location.host}/products/${product.handle}`, '_blank'),
        },
      ]}
    >
      <Layout>
        {/* Game Overview */}
        <Layout.Section>
          <LegacyCard>
            <LegacyCard.Section>
              <LegacyStack wrap={false} alignment="center">
                <LegacyStack.Item>
                  <div style={{ width: '150px', height: '150px' }}>
                    <Thumbnail
                      source={images && images.length > 0 ? images[0].src : ''}
                      alt={title}
                      size="large"
                    />
                  </div>
                </LegacyStack.Item>
                <LegacyStack.Item fill>
                  <LegacyStack vertical spacing="tight">
                    <TextContainer>
                      <LegacyStack alignment="center" spacing="tight">
                        <Text variant="headingLg" as="h2">{title}</Text>
                        <Badge status={statusBadgeStatus}>{status}</Badge>
                      </LegacyStack>
                      <LegacyStack spacing="tight">
                        {product_type && <Badge>{product_type}</Badge>}
                        {genre && <Badge>{genre}</Badge>}
                        {rating && <Badge>{rating}</Badge>}
                      </LegacyStack>
                      <Text variant="headingMd" as="h3">${price}</Text>
                      <LegacyStack spacing="tight">
                        {developer && (
                          <Text variant="bodySm">Developer: {developer}</Text>
                        )}
                        {publisher && (
                          <Text variant="bodySm">Publisher: {publisher}</Text>
                        )}
                        {releaseDate && (
                          <Text variant="bodySm">Released: {releaseDate}</Text>
                        )}
                      </LegacyStack>
                    </TextContainer>
                  </LegacyStack>
                </LegacyStack.Item>
              </LegacyStack>
            </LegacyCard.Section>
          </LegacyCard>
        </Layout.Section>

        {/* Tabs for Details, Recommendations, and Reviews */}
        <Layout.Section>
          <Card>
            <Tabs tabs={tabs} selected={selectedTab} onSelect={handleTabChange}>
              {/* Game Details Tab */}
              {selectedTab === 0 && (
                <Card.Section title="Game Details">
                  <TextContainer>
                    <div dangerouslySetInnerHTML={{ __html: description }} />
                    
                    {platforms && (
                      <>
                        <Text variant="headingSm" as="h4">Platforms</Text>
                        <p>{platforms}</p>
                      </>
                    )}
                    
                    {features && (
                      <>
                        <Text variant="headingSm" as="h4">Features</Text>
                        <p>{features}</p>
                      </>
                    )}
                  </TextContainer>
                </Card.Section>
              )}

              {/* Recommendations Tab */}
              {selectedTab === 1 && (
                <Card.Section title="Similar Games">
                  {recommendations.length > 0 ? (
                    <ResourceList
                      resourceName={{ singular: 'game', plural: 'games' }}
                      items={recommendations}
                      renderItem={(item) => {
                        const { id, title, images, price } = item;
                        return (
                          <ResourceList.Item
                            id={id}
                            media={
                              <Thumbnail
                                source={images && images.length > 0 ? images[0].src : ''}
                                alt={title}
                              />
                            }
                            accessibilityLabel={`View details for ${title}`}
                            onClick={() => navigate(`/products/${id}`)}
                          >
                            <LegacyStack>
                              <LegacyStack.Item fill>
                                <h3>
                                  <TextContainer>
                                    <Text variant="bodyMd" fontWeight="bold">{title}</Text>
                                  </TextContainer>
                                </h3>
                              </LegacyStack.Item>
                              <LegacyStack.Item>
                                <Text variant="bodyMd" fontWeight="bold">${price}</Text>
                              </LegacyStack.Item>
                            </LegacyStack>
                          </ResourceList.Item>
                        );
                      }}
                    />
                  ) : (
                    <EmptyState
                      heading="No recommendations available"
                      image=""
                    >
                      <p>There are no similar games to recommend at this time.</p>
                    </EmptyState>
                  )}
                </Card.Section>
              )}

              {/* Reviews Tab */}
              {selectedTab === 2 && (
                <Card.Section title="Customer Reviews">
                  {reviews.length > 0 ? (
                    <ResourceList
                      resourceName={{ singular: 'review', plural: 'reviews' }}
                      items={reviews}
                      renderItem={(review) => {
                        const { id, customer_name, rating, content, created_at } = review;
                        return (
                          <ResourceList.Item id={id}>
                            <LegacyStack vertical spacing="tight">
                              <LegacyStack>
                                <LegacyStack.Item fill>
                                  <Text variant="bodyMd" fontWeight="bold">{customer_name}</Text>
                                </LegacyStack.Item>
                                <LegacyStack.Item>
                                  <Text variant="bodySm">{new Date(created_at).toLocaleDateString()}</Text>
                                </LegacyStack.Item>
                              </LegacyStack>
                              <div>
                                <Badge>{rating} ★</Badge>
                              </div>
                              <p>{content}</p>
                            </LegacyStack>
                          </ResourceList.Item>
                        );
                      }}
                    />
                  ) : (
                    <EmptyState
                      heading="No reviews yet"
                      image=""
                    >
                      <p>This game hasn't received any reviews yet.</p>
                    </EmptyState>
                  )}
                </Card.Section>
              )}
            </Tabs>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
} 