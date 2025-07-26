import { UserSegment, SegmentFilter, SortConfig } from '../types/segment';

/**
 * Filters segments based on search query and selected tags
 */
export const filterSegments = (
  segments: UserSegment[], 
  filter: SegmentFilter
): UserSegment[] => {
  return segments.filter(segment => {
    // Filter by search query
    const matchesSearch = 
      !filter.searchQuery ||
      segment.name.toLowerCase().includes(filter.searchQuery.toLowerCase()) ||
      segment.description.toLowerCase().includes(filter.searchQuery.toLowerCase());

    // Filter by status
    const matchesStatus = 
      filter.status === 'all' || 
      (filter.status === 'active' ? segment.isActive : !segment.isActive);

    // Filter by tag
    const matchesTag = 
      !filter.tag || 
      filter.tag === 'all' || 
      segment.tags.includes(filter.tag);

    return matchesSearch && matchesStatus && matchesTag;
  });
};

/**
 * Sorts segments based on sort configuration
 */
export const sortSegments = (
  segments: UserSegment[], 
  sortConfig: SortConfig
): UserSegment[] => {
  return [...segments].sort((a, b) => {
    const aValue = a[sortConfig.field];
    const bValue = b[sortConfig.field];

    // Handle different value types
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.direction === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortConfig.direction === 'asc' 
        ? aValue - bValue 
        : bValue - aValue;
    }
    
    if (aValue instanceof Date && bValue instanceof Date) {
      return sortConfig.direction === 'asc'
        ? aValue.getTime() - bValue.getTime()
        : bValue.getTime() - aValue.getTime();
    }
    
    return 0;
  });
};

/**
 * Paginates segments array
 */
export const paginateSegments = (
  segments: UserSegment[], 
  page: number, 
  rowsPerPage: number
): UserSegment[] => {
  const startIndex = page * rowsPerPage;
  return segments.slice(startIndex, startIndex + rowsPerPage);
};

/**
 * Extracts unique tags from segments
 */
export const extractUniqueTags = (segments: UserSegment[]): string[] => {
  const tags = new Set<string>();
  segments.forEach(segment => {
    segment.tags?.forEach(tag => tags.add(tag));
  });
  return Array.from(tags).sort();
};

/**
 * Validates segment conditions
 */
export const validateSegmentConditions = (conditions: any[]): boolean => {
  if (!Array.isArray(conditions)) return false;
  
  return conditions.every(condition => {
    return (
      condition &&
      typeof condition === 'object' &&
      'field' in condition &&
      'operator' in condition &&
      'value' in condition
    );
  });
};
