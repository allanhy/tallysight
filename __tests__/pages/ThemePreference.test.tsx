import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PreferencesSettings from '../../src/app/components/PreferencesSettings';
import { ThemeProvider } from '../../src/context/ThemeContext';

// Mock localStorage
const localStorageMock = (function() {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Helper function to render component with ThemeProvider
const renderWithThemeProvider = (component: React.ReactNode) => {
  return render(
    <ThemeProvider>{component}</ThemeProvider>
  );
};

describe('Theme Preference', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.documentElement.style.setProperty = jest.fn();
    document.documentElement.classList.toggle = jest.fn();
    document.documentElement.setAttribute = jest.fn();
  });

  it('renders theme preferences component correctly', () => {
    renderWithThemeProvider(<PreferencesSettings />);
    
    expect(screen.getByText('Appearance')).toBeInTheDocument();
    expect(screen.getByText('Accent color')).toBeInTheDocument();
    expect(screen.getByText('Theme')).toBeInTheDocument();
    expect(screen.getByText('Interface theme')).toBeInTheDocument();
  });

  it('allows changing accent colors', () => {
    renderWithThemeProvider(<PreferencesSettings />);
    
    // Find all accent color buttons (6 predefined colors)
    const colorButtons = screen.getAllByRole('button').filter(
      button => button.getAttribute('aria-label')?.includes('Select') && 
                button.getAttribute('aria-label')?.includes('accent color')
    );
    
    expect(colorButtons.length).toBe(6);
    
    // Click the purple accent color button
    const purpleButton = colorButtons.find(
      button => button.getAttribute('aria-label') === 'Select Purple accent color'
    );
    fireEvent.click(purpleButton!);
    
    // Verify localStorage was updated
    expect(localStorageMock.setItem).toHaveBeenCalledWith('accentColor', '#6E41E2');
    
    // Verify CSS variable was updated
    expect(document.documentElement.style.setProperty).toHaveBeenCalledWith('--accent-color', '#6E41E2');
  });

  it('allows setting custom accent color', async () => {
    renderWithThemeProvider(<PreferencesSettings />);
    
    // Find custom color input
    const customInput = screen.getByPlaceholderText('#F5F5F5');
    
    // Type a valid hex color
    fireEvent.change(customInput, { target: { value: '#FF5500' } });
    
    // Verify localStorage was updated
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('accentColor', '#FF5500');
    });
    
    // Verify CSS variable was updated
    expect(document.documentElement.style.setProperty).toHaveBeenCalledWith('--accent-color', '#FF5500');
  });

  it('validates custom accent color input', () => {
    renderWithThemeProvider(<PreferencesSettings />);
    
    const customInput = screen.getByPlaceholderText('#F5F5F5');
    
    // Type an invalid color
    fireEvent.change(customInput, { target: { value: 'invalid' } });
    
    // The setAccentColor should not be called with invalid input
    expect(localStorageMock.setItem).not.toHaveBeenCalledWith('accentColor', 'invalid');
    
    // Now type a valid color
    fireEvent.change(customInput, { target: { value: '#FF5500' } });
    
    // Verify localStorage was updated with valid color
    expect(localStorageMock.setItem).toHaveBeenCalledWith('accentColor', '#FF5500');
  });

  it('allows switching between light and dark themes', () => {
    renderWithThemeProvider(<PreferencesSettings />);
    
    // Find theme toggle buttons - using a more specific selector now
    const lightButton = screen.getAllByText('Light').find(
      element => element.tagName.toLowerCase() === 'button'
    )!;
    const darkButton = screen.getAllByText('Dark').find(
      element => element.tagName.toLowerCase() === 'button'
    )!;
    
    // Click light theme button
    fireEvent.click(lightButton);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');
    expect(document.documentElement.classList.toggle).toHaveBeenCalledWith('dark', false);
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Click dark theme button
    fireEvent.click(darkButton);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
    expect(document.documentElement.classList.toggle).toHaveBeenCalledWith('dark', true);
  });

  it('allows selecting system theme preference', () => {
    renderWithThemeProvider(<PreferencesSettings />);
    
    // Find the system preference theme option
    const systemThemeOption = screen.getByText('System preference');
    
    // Click system theme option
    fireEvent.click(systemThemeOption);
    
    // Verify localStorage was updated
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'system');
  });
}); 