export default {
    translation: {
      title: 'RSS aggregator',
      description: 'Start reading RSS today! It is easy, it is beautiful.',
      form: {
        label: 'RSS link',
        placeholder: 'RSS link',
        example: 'Example: https://lorem-rss.hexlet.app/feed',
        submit: 'Add',
      },
      footer: {
        createdBy: 'created by',
      },
      feedback: {
        success: 'RSS has been loaded',
      },
      sections: {
        feeds: 'Feeds',
        posts: 'Posts',
      },
      errors: {
        required: 'Should not be empty',
        invalidUrl: 'Link must be a valid URL',
        duplicate: 'RSS already exists',
        parse: 'The resource does not contain valid RSS',
        network: 'Network error',
      },
      ui: {
        preview: 'View',
        readFull: 'Read full article',
      },
    },
  };