import * as yup from 'yup';

export const errorKeys = {
  required: 'errors.required',
  invalidUrl: 'errors.invalidUrl',
  duplicate: 'errors.duplicate',
};

yup.setLocale({
  mixed: {
    required: errorKeys.required,
    notOneOf: errorKeys.duplicate,
  },
  string: {
    url: errorKeys.invalidUrl,
  },
});

const buildSchema = (existingUrls) => yup.object({
  url: yup
    .string()
    .required()
    .url()
    .notOneOf(existingUrls),
});

export default (url, existingUrls) => buildSchema(existingUrls)
  .validate({ url }, { abortEarly: false });