export type ValidationRule<T> = {
  validate: (value: T) => boolean;
  message: string;
};

export type ValidationResult = {
  isValid: boolean;
  errors: string[];
  errorMessage: string;
};

export type ValidatorOptions = {
  stopOnFirstError?: boolean;
};
