import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BackToTop from '../../src/app/components/BackToTop';

// Mock window.scrollTo
const mockScrollTo = jest.fn();
Object.defineProperty(window, 'scrollTo', { value: mockScrollTo });

describe('BackToTop Component', () => {
    beforeEach(() => {
        // Reset scroll position before each test
        window.pageYOffset = 0;
        mockScrollTo.mockClear();
    });

    it('renders the back to top button', () => {
        render(<BackToTop />);
        const button = screen.getByRole('button', { name: /back to top/i });
        expect(button).toBeInTheDocument();
    });

    it('button is initially hidden', () => {
        render(<BackToTop />);
        const button = screen.getByRole('button', { name: /back to top/i });
        expect(button).toHaveClass('opacity-0');
    });

    it('shows button when scrolling past 300px', () => {
        render(<BackToTop />);
        const button = screen.getByRole('button', { name: /back to top/i });
        
        // Simulate scroll past 300px
        window.pageYOffset = 301;
        fireEvent.scroll(window);
        
        expect(button).toHaveClass('opacity-100');
    });

    it('hides button when scrolling back to top', () => {
        render(<BackToTop />);
        const button = screen.getByRole('button', { name: /back to top/i });
        
        // First scroll down
        window.pageYOffset = 301;
        fireEvent.scroll(window);
        expect(button).toHaveClass('opacity-100');
        
        // Then scroll back up
        window.pageYOffset = 0;
        fireEvent.scroll(window);
        expect(button).toHaveClass('opacity-0');
    });

    it('scrolls to top when button is clicked', () => {
        render(<BackToTop />);
        const button = screen.getByRole('button', { name: /back to top/i });
        
        // Make button visible first
        window.pageYOffset = 301;
        fireEvent.scroll(window);
        
        fireEvent.click(button);
        expect(mockScrollTo).toHaveBeenCalledWith({
            top: 0,
            behavior: 'smooth'
        });
    });
}); 