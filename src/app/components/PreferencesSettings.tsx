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
  const { theme, toggleTheme, accentColor, setAccentColor } = useTheme();
  const [customColor, setCustomColor] = useState('');

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    if (color.match(/^#[0-9A-Fa-f]{6}$/)) {
      setAccentColor(color);
    }
  };

  return (
    <div className="space-y-8">
      {/* Appearance Section */}
      <div>
        <h3 className="text-5xl font-medium mb-4 text-gray-900 dark:text-gray-100">
          Appearance
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Change how Untitled UI looks and feels in your browser.
        </p>

        {/* Accent Color */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
            Accent color
          </label>
          <div className="flex items-center gap-2">
            {ACCENT_COLORS.map((color) => (
              <button
                key={color.value}
                className={`w-8 h-8 rounded-full border-2 ${
                  accentColor === color.value
                    ? 'border-[var(--accent-color)] ring-2 ring-[var(--accent-color)] ring-offset-2'
                    : 'border-transparent'
                }`}
                style={{ backgroundColor: color.value }}
                onClick={() => setAccentColor(color.value)}
                aria-label={`Select ${color.label} accent color`}
              />
            ))}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Custom</span>
              <input
                type="text"
                value={customColor}
                onChange={handleCustomColorChange}
                placeholder="#F5F5F5"
                className="w-20 px-2 py-1 text-sm border rounded dark:bg-gray-800 dark:text-gray-200"
              />
            </div>
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
            Theme
          </label>
          <div className="flex items-center">
            <button
              onClick={() => toggleTheme('light')}
              className={`px-4 py-2 rounded ${
                theme === 'light' 
                  ? 'bg-[var(--accent-color)] text-white' 
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              Light
            </button>
            <button
              onClick={() => toggleTheme('dark')}
              className={`px-4 py-2 rounded ${
                theme === 'dark' 
                  ? 'bg-[var(--accent-color)] text-white' 
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              Dark
            </button>
          </div>
        </div>

        {/* Interface Theme */}
        <div>
          <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
            Interface theme
          </label>
          <div className="grid grid-cols-3 gap-4">
            <div
              className={`relative rounded-lg border-2 p-2 cursor-pointer ${
                theme === 'system'
                  ? 'border-[var(--accent-color)] ring-2 ring-[var(--accent-color)]'
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
              <p className="text-base font-medium text-gray-900 dark:text-gray-100 text-center">System preference</p>
            </div>
            
            <div
              className={`relative rounded-lg border-2 p-2 cursor-pointer ${
                theme === 'light'
                  ? 'border-[var(--accent-color)] ring-2 ring-[var(--accent-color)]'
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
              <p className="text-base font-medium text-gray-900 dark:text-gray-100 text-center">Light</p>
            </div>

            <div
              className={`relative rounded-lg border-2 p-2 cursor-pointer ${
                theme === 'dark'
                  ? 'border-[var(--accent-color)] ring-2 ring-[var(--accent-color)]'
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
              <p className="text-base font-medium text-gray-900 dark:text-gray-100 text-center">Dark</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferencesSettings; 