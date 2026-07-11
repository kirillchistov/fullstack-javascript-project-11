const getElementText = (parent, selector) => {
    const element = parent.querySelector(selector);
    return element ? element.textContent.trim() : '';
  };
  
  const parseError = new Error('errors.parse');
  
  const parseRss = (xml) => {
    const parser = new DOMParser();
    const document = parser.parseFromString(xml, 'application/xml');
  
    if (document.querySelector('parsererror')) {
      throw parseError;
    }
  
    const channel = document.querySelector('channel');
  
    if (!channel) {
      throw parseError;
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