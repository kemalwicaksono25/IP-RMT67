const bcrypt = require('../../helpers/bcrypt');

describe('Bcrypt Helper', () => {
  describe('hashPassword', () => {
    it('should hash a password', () => {
      const password = 'testPassword123';
      const hashed = bcrypt.hashPassword(password);

      expect(hashed).toBeDefined();
      expect(typeof hashed).toBe('string');
      expect(hashed).not.toBe(password);
      expect(hashed.length).toBeGreaterThan(0);
    });

    it('should generate different hashes for the same password', () => {
      const password = 'testPassword123';
      const hash1 = bcrypt.hashPassword(password);
      const hash2 = bcrypt.hashPassword(password);

      // Bcrypt generates different hashes each time due to salt
      expect(hash1).not.toBe(hash2);
    });

    it('should hash empty string', () => {
      const hashed = bcrypt.hashPassword('');
      expect(hashed).toBeDefined();
      expect(typeof hashed).toBe('string');
    });

    it('should hash special characters', () => {
      const password = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const hashed = bcrypt.hashPassword(password);
      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(password);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password and hash', () => {
      const password = 'testPassword123';
      const hashed = bcrypt.hashPassword(password);
      const result = bcrypt.comparePassword(password, hashed);

      expect(result).toBe(true);
    });

    it('should return false for non-matching password and hash', () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword456';
      const hashed = bcrypt.hashPassword(password);
      const result = bcrypt.comparePassword(wrongPassword, hashed);

      expect(result).toBe(false);
    });

    it('should return false for empty password with valid hash', () => {
      const password = 'testPassword123';
      const hashed = bcrypt.hashPassword(password);
      const result = bcrypt.comparePassword('', hashed);

      expect(result).toBe(false);
    });

    it('should return false for valid password with empty hash', () => {
      const password = 'testPassword123';
      const result = bcrypt.comparePassword(password, '');

      expect(result).toBe(false);
    });

    it('should handle special characters correctly', () => {
      const password = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const hashed = bcrypt.hashPassword(password);
      const result = bcrypt.comparePassword(password, hashed);

      expect(result).toBe(true);
    });

    it('should be case sensitive', () => {
      const password = 'testPassword123';
      const hashed = bcrypt.hashPassword(password);
      const result = bcrypt.comparePassword('TestPassword123', hashed);

      expect(result).toBe(false);
    });
  });
});

