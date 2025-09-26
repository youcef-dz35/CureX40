import React from 'react';

export default function CSSTest() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-600 mb-8 text-center">
          🎨 CSS & Tailwind Test Page
        </h1>

        {/* Basic Colors Test */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Basic Colors</h2>
            <div className="space-y-2">
              <div className="bg-red-500 text-white p-2 rounded">Red Background</div>
              <div className="bg-green-500 text-white p-2 rounded">Green Background</div>
              <div className="bg-blue-500 text-white p-2 rounded">Blue Background</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Typography</h2>
            <div className="space-y-2">
              <p className="text-xs text-gray-600">Extra Small Text</p>
              <p className="text-sm text-gray-700">Small Text</p>
              <p className="text-base text-gray-800">Base Text</p>
              <p className="text-lg text-gray-900">Large Text</p>
              <p className="text-xl font-bold text-blue-600">Extra Large Bold</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Buttons</h2>
            <div className="space-y-3">
              <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-colors">
                Primary Button
              </button>
              <button className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition-colors">
                Success Button
              </button>
              <button className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2 px-4 rounded transition-colors">
                Outline Button
              </button>
            </div>
          </div>
        </div>

        {/* Responsive Grid Test */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Responsive Grid</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
              <div key={num} className="bg-gradient-to-br from-blue-400 to-purple-500 text-white p-4 rounded-lg text-center font-semibold">
                Item {num}
              </div>
            ))}
          </div>
        </div>

        {/* Form Elements Test */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Form Elements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Input
                </label>
                <input
                  type="text"
                  placeholder="Enter text here..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option>Option 1</option>
                  <option>Option 2</option>
                  <option>Option 3</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Textarea
                </label>
                <textarea
                  rows={4}
                  placeholder="Enter description..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
                  <span className="ml-2 text-sm text-gray-700">Checkbox</span>
                </label>

                <label className="flex items-center">
                  <input type="radio" name="radio" className="border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
                  <span className="ml-2 text-sm text-gray-700">Radio</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Animation Test */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Animations & Effects</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-3 animate-bounce"></div>
              <p className="text-sm text-gray-600">Bounce Animation</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-3 animate-spin"></div>
              <p className="text-sm text-gray-600">Spin Animation</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-full mx-auto mb-3 animate-pulse"></div>
              <p className="text-sm text-gray-600">Pulse Animation</p>
            </div>
          </div>
        </div>

        {/* Shadows & Borders Test */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Shadows & Borders</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
              <p className="text-sm font-medium">Small Shadow</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md border text-center">
              <p className="text-sm font-medium">Medium Shadow</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-lg border text-center">
              <p className="text-sm font-medium">Large Shadow</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-xl border text-center">
              <p className="text-sm font-medium">Extra Large</p>
            </div>
          </div>
        </div>

        {/* Dark Mode Test */}
        <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-2xl font-semibold mb-4">Dark Mode Preview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-300 mb-4">This section demonstrates how content looks with dark backgrounds.</p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors mr-2">
                Primary
              </button>
              <button className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded transition-colors">
                Secondary
              </button>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2">Card in Dark Mode</h3>
              <p className="text-gray-300 text-sm">Content inside a dark card with proper contrast.</p>
            </div>
          </div>
        </div>

        {/* Status Check */}
        <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-green-500 text-2xl">✅</span>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-green-800">
                CSS Test Status
              </h3>
              <p className="text-green-700 text-sm">
                If you can see this page with proper styling, colors, shadows, and responsive layout,
                then Tailwind CSS is working correctly!
              </p>
              <div className="mt-3 space-x-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✓ Tailwind Loaded
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  ✓ Responsive Design
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  ✓ Animations Working
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center mt-8">
          <button
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
