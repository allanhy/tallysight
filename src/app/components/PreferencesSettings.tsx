"use client";

import React, { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';

const ACCENT_COLORS = [
  { value: '#000000', label: 'Black' },
  { value: '#6E41E2', label: 'Purple' },
  { value: '#3B82F6', label: 'Blue' },
  { value: '#0EA5E9', label: 'Light Blue' },
  { value: '#06B6D4', label: 'Cyan' },
  { value: '#10B981', label: 'Green' },
];

const PreferencesSettings = () => {
  const { theme, toggleTheme } = useTheme();
  const [accentColor, setAccentColor] = useState('#3B82F6');
  const [customColor, setCustomColor] = useState('');

  return (
    <div className="space-y-8">
      {/* Appearance Section */}
      <div>
        <h3 className="text-5xl font-medium text-gray-900 dark:text-black-400 mb-4">
          Appearance
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-900 mb-4">
          Change how Untitled UI looks and feels in your browser.
        </p>

        {/* Accent Color */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-800 dark:text-gray-400 mb-2">
            Accent color
          </label>
          <div className="flex items-center gap-2">
            {ACCENT_COLORS.map((color) => (
              <button
                key={color.value}
                className={`w-8 h-8 rounded-full border-2 ${
                  accentColor === color.value
                    ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-2'
                    : 'border-transparent'
                }`}
                style={{ backgroundColor: color.value }}
                onClick={() => setAccentColor(color.value)}
                aria-label={`Select ${color.label} accent color`}
              />
            ))}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Custom</span>
              <input
                type="text"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                placeholder="#F5F5F5"
                className="w-20 px-2 py-1 text-sm border rounded"
              />
            </div>
          </div>
        </div>

        {/* Interface Theme */}
        <div>
          <label className="block text-sm font-medium text-gray-800 dark:text-gray-400 mb-2">
            Interface theme
          </label>
          <div className="grid grid-cols-3 gap-4">
            <div
              className={`relative rounded-lg border-2 p-2 cursor-pointer ${
                theme === 'system'
                  ? 'border-blue-500 ring-2 ring-blue-500'
                  : 'border-gray-200'
              }`}
              onClick={() => toggleTheme('system')}
            >
              <div className="aspect-video bg-gray-100 rounded mb-2">
                <img
                  src="/system-theme-preview.png"
                  alt="System theme"
                  className="w-full h-full object-cover rounded"
                />
              </div>
              <p className="text-base font-medium text-gray-900 dark:text-gray-400 text-center">System preference</p>
            </div>
            
            <div
              className={`relative rounded-lg border-2 p-2 cursor-pointer ${
                theme === 'light'
                  ? 'border-blue-500 ring-2 ring-blue-500'
                  : 'border-gray-200'
              }`}
              onClick={() => toggleTheme('light')}
            >
              <div className="aspect-video bg-white rounded mb-2">
                <img
                  src="/light-theme-preview.png"
                  alt="Light theme"
                  className="w-full h-full object-cover rounded"
                />
              </div>
              <p className="text-base font-medium text-gray-900 dark:text-gray-400 text-center">Light</p>
            </div>

            <div
              className={`relative rounded-lg border-2 p-2 cursor-pointer ${
                theme === 'dark'
                  ? 'border-blue-500 ring-2 ring-blue-500'
                  : 'border-gray-200'
              }`}
              onClick={() => toggleTheme('dark')}
            >
              <div className="aspect-video bg-gray-900 rounded mb-2">
                <img
                  src="/dark-theme-preview.png"
                  alt="Dark theme"
                  className="w-full h-full object-cover rounded"
                />
              </div>
              <p className="text-base font-medium text-gray-900 dark:text-gray-400 text-center">Dark</p>
            </div>
          </div>
        </div>

        

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end space-x-4">
          <button
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            onClick={() => {
              // Reset logic here
            }}
          >
            Reset to default
          </button>
          <button
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            onClick={() => {
              // Save changes logic here
            }}
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreferencesSettings;