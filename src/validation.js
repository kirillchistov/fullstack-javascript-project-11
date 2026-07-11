import * as yup from 'yup';

const buildSchema = (existingUrls) => yup.object({
  url: yup
    .string()
    .required('Не должно быть пустым')
    .url('Ссылка должна быть валидным URL')
    .notOneOf(existingUrls, 'RSS уже существует'),
});

export default (url, existingUrls) => buildSchema(existingUrls)
  .validate({ url }, { abortEarly: false });