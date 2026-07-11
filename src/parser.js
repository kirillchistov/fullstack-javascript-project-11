const getElementText = (parent, selector) => {
  const element = parent.querySelector(selector);
  return element ? element.textContent.trim() : '';
};

export const parseErrorMessage = 'errors.parse';

const parseRss = (xml) => {
  const parser = new DOMParser();
  const document = parser.parseFromString(xml, 'application/xml');

  if (document.querySelector('parsererror')) {
    throw new Error(parseErrorMessage);
  }

  const channel = document.querySelector('channel');

  if (!channel) {
    throw new Error(parseErrorMessage);
  }

  const feed = {
    title: getElementText(channel, 'title'),
    description: getElementText(channel, 'description'),
  };

  const posts = Array.from(document.querySelectorAll('item')).map((item) => ({
    title: getElementText(item, 'title'),
    description: getElementText(item, 'description'),
    link: getElementText(item, 'link'),
  }));

  return { feed, posts };
};

export default parseRss;