import { isValidImageFile } from '../imageCropper';

describe('isValidImageFile', () => {
  // Mock the alert function
  const mockAlert = jest.fn();
  beforeAll(() => {
    window.alert = mockAlert;
  });

  beforeEach(() => {
    mockAlert.mockClear();
  });

  test('should return true for valid JPG files', () => {
    // Create a mock File object for a valid JPG
    const validJpgFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    expect(isValidImageFile(validJpgFile)).toBe(true);
    expect(mockAlert).not.toHaveBeenCalled();
  });

  test('should return true for valid JPEG files', () => {
    // Create a mock File object for a valid JPEG
    const validJpegFile = new File([''], 'test.jpeg', { type: 'image/jpeg' });
    expect(isValidImageFile(validJpegFile)).toBe(true);
    expect(mockAlert).not.toHaveBeenCalled();
  });

  test('should return false for PNG files', () => {
    // Create a mock File object for a PNG
    const pngFile = new File([''], 'test.png', { type: 'image/png' });
    expect(isValidImageFile(pngFile)).toBe(false);
    expect(mockAlert).toHaveBeenCalledWith('Only JPG/JPEG images are allowed');
  });

  test('should return false for files with incorrect extension but correct MIME type', () => {
    // Create a mock File object with correct MIME type but wrong extension
    const fileWithWrongExt = new File([''], 'test.png', { type: 'image/jpeg' });
    expect(isValidImageFile(fileWithWrongExt)).toBe(false);
    expect(mockAlert).toHaveBeenCalledWith('File must have a .jpg or .jpeg extension');
  });

  test('should return false for files larger than 5MB', () => {
    // Create a mock File object larger than 5MB
    const largeFile = new File([''], 'large.jpg', { type: 'image/jpeg' });
    // Mock the size property
    Object.defineProperty(largeFile, 'size', { value: 6 * 1024 * 1024 });
    
    expect(isValidImageFile(largeFile)).toBe(false);
    expect(mockAlert).toHaveBeenCalledWith('Image file is too large. Maximum size is 5MB');
  });
}); 