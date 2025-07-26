import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  UserGroupIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  ArrowTrendingUpIcon,
  CalendarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell
} from 'recharts';
import { Button, Card, Select, DateRangePicker, Spinner, Alert } from '../../components/ui';
import { useApi } from '../../lib/api';

// Sample data - replace with actual API data
const sampleData = {
  overview: {
    totalUsers: 1248,
    newUsers: 124,
    completionRate: 0.68,
    avgTimeToComplete: 8.5,
  },
  completionRates: [
    { name: 'Welcome', value: 95 },
    { name: 'Profile', value: 78 },
    { name: 'Preferences', value: 65 },
    { name: 'Verification', value: 58 },
    { name: 'Complete', value: 48 },
  ],
  userGrowth: [
    { date: 'Jan', users: 400 },
    { date: 'Feb', users: 600 },
    { date: 'Mar', users: 850 },
    { date: 'Apr', users: 1000 },
    { date: 'May', users: 1150 },
    { date: 'Jun', users: 1248 },
  ],
  dropOffPoints: [
    { name: 'Welcome', value: 5 },
    { name: 'Profile', value: 17 },
    { name: 'Preferences', value: 13 },
    { name: 'Verification', value: 7 },
    { name: 'Complete', value: 0 },
  ],
  timeToComplete: [
    { name: '0-2 min', value: 15 },
    { name: '2-5 min', value: 35 },
    { name: '5-10 min', value: 30 },
    { name: '10-15 min', value: 15 },
    { name: '15+ min', value: 5 },
  ],
};

// Color palette for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate: new Date(),
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState(sampleData);
  
  const api = useApi();
  
  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, you would fetch this data from your API
      // const response = await api.get('/analytics/onboarding', {
      //   params: {
      //     startDate: dateRange.startDate.toISOString(),
      //     endDate: dateRange.endDate.toISOString(),
      //   },
      // });
      // setData(response.data);
      
      // Simulate API call
      setTimeout(() => {
        setData(sampleData);
        setLoading(false);
      }, 1000);
      
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data. Please try again.');
      setLoading(false);
    }
  };
  
  // Fetch data when component mounts or filters change
  useEffect(() => {
    fetchAnalytics();
  }, [timeRange, dateRange]);
  
  // Handle time range change
  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
    
    // Update date range based on selection
    const now = new Date();
    let startDate = new Date();
    
    switch (value) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '12m':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'custom':
        // Keep current date range
        return;
      default:
        startDate.setDate(now.getDate() - 30);
    }
    
    setDateRange({
      startDate,
      endDate: now,
    });
  };
  
  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };
  
  // Format percentage
  const formatPercent = (value: number) => {
    return `${Math.round(value * 100)}%`;
  };
  
  // Format minutes to human-readable time
  const formatMinutes = (minutes: number) => {
    if (minutes < 1) return '< 1 min';
    if (minutes < 60) return `${Math.round(minutes)} min`;
    
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };
  
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Onboarding Analytics</h1>
          <p className="mt-2 text-sm text-gray-700">
            Track and analyze user onboarding metrics to improve the signup experience.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none flex items-center space-x-4">
          <div className="w-40">
            <Select
              value={timeRange}
              onChange={(e) => handleTimeRangeChange(e.target.value)}
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="12m">Last 12 months</option>
              <option value="custom">Custom range</option>
            </Select>
          </div>
          
          {timeRange === 'custom' && (
            <div className="w-64">
              <DateRangePicker
                startDate={dateRange.startDate}
                endDate={dateRange.endDate}
                onChange={(start, end) => setDateRange({ startDate: start, endDate: end })}
              />
            </div>
          )}
          
          <Button
            variant="secondary"
            icon={ArrowPathIcon}
            onClick={fetchAnalytics}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="mt-4">
          <Alert type="error" message={error} />
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-96">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-indigo-100">
                  <UserGroupIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Users</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatNumber(data.overview.totalUsers)}
                  </p>
                  <p className="text-xs text-green-600 flex items-center">
                    <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                    +12.5% from last period
                  </p>
                </div>
              </div>
            </Card>
            
            <Card>
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-100">
                  <UserGroupIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">New Users (30d)</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatNumber(data.overview.newUsers)}
                  </p>
                  <p className="text-xs text-green-600 flex items-center">
                    <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                    +8.2% from last period
                  </p>
                </div>
              </div>
            </Card>
            
            <Card>
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-yellow-100">
                  <CheckCircleIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Completion Rate</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatPercent(data.overview.completionRate)}
                  </p>
                  <p className="text-xs text-green-600 flex items-center">
                    <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                    +5.2% from last period
                  </p>
                </div>
              </div>
            </Card>
            
            <Card>
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-100">
                  <ClockIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Avg. Time to Complete</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatMinutes(data.overview.avgTimeToComplete)}
                  </p>
                  <p className="text-xs text-red-600 flex items-center">
                    <ArrowTrendingUpIcon className="h-4 w-4 mr-1 transform rotate-180" />
                    +1.2 min from last period
                  </p>
                </div>
              </div>
            </Card>
          </div>
          
          {/* User Growth Chart */}
          <div className="mt-6">
            <Card>
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">User Growth</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Number of new users over time
                </p>
              </div>
              <div className="px-6 py-5 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data.userGrowth}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: '#6b7280' }}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fill: '#6b7280' }}
                      tickLine={false}
                      tickFormatter={(value) => (value >= 1000 ? `${value / 1000}k` : value)}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                      }}
                      formatter={(value: number) => [value, 'Users']}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="users" 
                      name="Users"
                      stroke="#4f46e5" 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6, stroke: '#4f46e5', strokeWidth: 2, fill: '#ffffff' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
          
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Completion Rate by Step */}
            <Card>
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Completion Rate by Step</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Percentage of users who complete each onboarding step
                </p>
              </div>
              <div className="px-6 py-5 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={data.completionRates}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      type="number" 
                      domain={[0, 100]}
                      tickFormatter={(value) => `${value}%`}
                      tick={{ fill: '#6b7280' }}
                      tickLine={false}
                    />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      tick={{ fill: '#6b7280' }}
                      tickLine={false}
                      width={100}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`${value}%`, 'Completion Rate']}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                      }}
                    />
                    <Bar 
                      dataKey="value" 
                      name="Completion Rate"
                      fill="#4f46e5" 
                      radius={[0, 4, 4, 0]}
                    >
                      {data.completionRates.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            
            {/* Drop-off Points */}
            <Card>
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Drop-off Points</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Where users are dropping off during onboarding
                </p>
              </div>
              <div className="px-6 py-5 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.dropOffPoints}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {data.dropOffPoints.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`${value}%`, 'Drop-off Rate']}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
          
          {/* Time to Complete Distribution */}
          <div className="mt-6">
            <Card>
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Time to Complete Distribution</h3>
                <p className="mt-1 text-sm text-gray-500">
                  How long it takes users to complete the onboarding process
                </p>
              </div>
              <div className="px-6 py-5 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.timeToComplete}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#6b7280' }}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fill: '#6b7280' }}
                      tickLine={false}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`${value}%`, 'of Users']}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                      }}
                    />
                    <Bar 
                      dataKey="value" 
                      name="% of Users"
                      fill="#4f46e5"
                      radius={[4, 4, 0, 0]}
                    >
                      {data.timeToComplete.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
          
          {/* Recommendations */}
          <div className="mt-6">
            <Card>
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recommendations</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Suggestions to improve your onboarding flow
                </p>
              </div>
              <div className="px-6 py-5">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <CheckCircleIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-medium text-gray-900">High Drop-off at Profile Step</h4>
                      <p className="mt-1 text-sm text-gray-500">
                        17% of users drop off at the profile creation step. Consider making this step optional or 
                        pre-filling information where possible.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                      <ClockIcon className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-medium text-gray-900">Long Completion Time</h4>
                      <p className="mt-1 text-sm text-gray-500">
                        The average time to complete onboarding is 8.5 minutes. Consider breaking down longer steps 
                        into smaller, more manageable parts.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <UserGroupIcon className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-medium text-gray-900">Low Verification Rate</h4>
                      <p className="mt-1 text-sm text-gray-500">
                        Only 58% of users complete email verification. Consider sending a reminder email to users 
                        who haven't verified their email within 24 hours.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button variant="primary">
                    View Detailed Recommendations
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;
