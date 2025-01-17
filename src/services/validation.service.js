export class ValidationService {
  #validators = new Map();

  register(schema) {
    this.#validators.set(schema.name, schema);
  }

  validate(schemaName, data) {
    const schema = this.#validators.get(schemaName);
    if (!schema) {
      throw new Error(`Validation schema ${schemaName} not found`);
    }

    const errors = [];
    for (const [field, rules] of Object.entries(schema.rules)) {
      for (const [rule, config] of Object.entries(rules)) {
        const error = this.#validateRule(rule, data[field], config);
        if (error) errors.push({ field, error });
      }
    }

    return errors;
  }

  #validateRule(rule, value, config) {
    switch (rule) {
      case 'required':
        return !value ? 'Field is required' : null;
      case 'minLength':
        return value?.length < config ? `Minimum length is ${config}` : null;
      case 'maxLength':
        return value?.length > config ? `Maximum length is ${config}` : null;
      case 'pattern':
        return !config.test(value) ? 'Invalid format' : null;
      default:
        return null;
    }
  }
}
