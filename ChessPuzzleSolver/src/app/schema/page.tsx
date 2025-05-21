'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2 } from 'lucide-react';

export default function SchemaPage() {
  const [schema, setSchema] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchema = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/schema');
      
      if (!response.ok) {
        throw new Error('Failed to fetch schema');
      }
      
      const data = await response.json();
      setSchema(data);
    } catch (err) {
      console.error('Error fetching schema:', err);
      setError('Failed to load schema. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchema();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="mt-4">Loading schema...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchSchema}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Table Schema</h1>
        
        <div className="bg-card rounded-lg shadow-sm border p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Column Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Data Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Nullable
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Default
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {schema.map((column: any, index: number) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                      {column.column_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {column.data_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {column.is_nullable}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {column.column_default || 'NULL'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6">
          <Button onClick={fetchSchema}>
            Refresh Schema
          </Button>
        </div>
      </div>
    </div>
  );
}
