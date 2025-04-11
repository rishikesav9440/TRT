import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Monitor, Laptop, Wind } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Category {
  id: string;
  name: string;
  slug: string;
}

const categoryIcons = {
  laptop: Laptop,
  tv: Monitor,
  ac: Wind,
};

export function Home() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase.from('categories').select('*');
      if (data) setCategories(data);
    }
    fetchCategories();
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-gray-900">Find Your Perfect Product</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((category) => {
          const Icon = categoryIcons[category.slug as keyof typeof categoryIcons];
          return (
            <Link
              key={category.id}
              to={`/flow/${category.slug}`}
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{category.name}</h2>
                  <p className="text-gray-500">Find the perfect {category.name.toLowerCase()}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}