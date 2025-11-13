const validators = require('../../../middleware/validators');

describe('Validators Index', () => {
  it('should export product validator', () => {
    expect(validators.product).toBeDefined();
    expect(typeof validators.product).toBe('object');
  });

  it('should export auth validator', () => {
    expect(validators.auth).toBeDefined();
    expect(typeof validators.auth).toBe('object');
  });

  it('should export brief validator', () => {
    expect(validators.brief).toBeDefined();
    expect(typeof validators.brief).toBe('object');
  });

  it('should export admin validator', () => {
    expect(validators.admin).toBeDefined();
    expect(typeof validators.admin).toBe('object');
  });
});

