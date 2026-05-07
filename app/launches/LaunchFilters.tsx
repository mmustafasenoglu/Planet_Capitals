'use client';

interface LaunchFiltersProps {
  selectedFilter: string;
  setSelectedFilter: (filter: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

export default function LaunchFilters({
  selectedFilter,
  setSelectedFilter,
  selectedCategory,
  setSelectedCategory
}: LaunchFiltersProps) {
  const categories = [
    { id: 'all', name: 'Tüm Kategoriler', icon: 'ri-grid-line' },
    { id: 'metaverse', name: 'Metaverse', icon: 'ri-space-ship-line' },
    { id: 'ai', name: 'AI & ML', icon: 'ri-brain-line' },
    { id: 'gaming', name: 'Gaming', icon: 'ri-gamepad-line' },
    { id: 'defi', name: 'DeFi', icon: 'ri-exchange-line' },
    { id: 'sustainability', name: 'Sürdürülebilirlik', icon: 'ri-leaf-line' },
    { id: 'social', name: 'Sosyal', icon: 'ri-team-line' }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Kategori</h3>
        <div className="flex justify-between md:grid md:grid-cols-4 lg:grid-cols-7 md:gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`p-2 md:p-3 rounded-lg font-medium transition-all cursor-pointer text-center flex-shrink-0 ${
                selectedCategory === category.id
                  ? 'md:bg-blue-600 md:text-white md:shadow-lg text-blue-600'
                  : 'md:bg-gray-100 md:text-gray-700 md:hover:bg-gray-200 text-gray-600'
              }`}
            >
              <div className="w-6 h-6 mx-auto flex items-center justify-center md:mb-1">
                <i className={`${category.icon} text-lg`}></i>
              </div>
              <div className="text-sm hidden md:block">{category.name}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}