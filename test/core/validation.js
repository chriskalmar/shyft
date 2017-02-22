
import validation from '../../lib/validation/base';



describe('validation', () => {

  describe('system name pattern generator', () => {

    it('should create a valid pattern if min and max length are provided', () => {
      const result = validation.buildSytemNamePattern(1, 20)
      expect(result).to.equal('^[a-z][a-z0-9_]{0,19}$')
    })


    it('should create a valid pattern if min length is provided', () => {
      const result = validation.buildSytemNamePattern(5)
      expect(result).to.equal('^[a-z][a-z0-9_]{4,}$')
    })


    it('should create a valid pattern if no range length is provided', () => {
      const result = validation.buildSytemNamePattern()
      expect(result).to.equal('^[a-z][a-z0-9_]*$')
    })


    it('should fail if min length is greater than max length', () => {

      function fn() {
        validation.buildSytemNamePattern(5, 4)
      }

      expect(fn).to.throw(/expects maxLength to be >= minLength/);
    })


    it('should fail if min length is less then 0', () => {

      function fn() {
        validation.buildSytemNamePattern(-1)
      }

      expect(fn).to.throw(/minLength to be a positive/);
    })

  })
})
