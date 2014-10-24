# Serialization

The serialization layer is responsible for translating what is sent from the server into something that can be understood by the client. Coalesce makes it easy to customize how some or all models are serialized.

## Customizing Fields

Model serializers can be customized on a per-field basis. Consider the following rest payload sent from the server:

```javascript
{
  post: {
    id: 1,
    LEGACY_TITLE: 'To serialize or not to serialize?',
    body: 'That is a good question'
  }
}
```

And the following model definition:

```javascript
class Post extends Model {};
Post.defineSchema({
  typeKey: 'post',
  attributes: {
    title: {type: 'string'},
    body: {type: 'string'}
  }
});
```

In order to make the the `LEGACY_TITLE` property match up to the `title` field on the `Post` type, the serializer for the post must be properly configured on the context:

```javascript
var Context = new Context({
  types: {
    post: {
      class: Post,
      serializer: {
        attributes: {
          title: {
            key: 'LEGACY_TITLE'
          }
        }
      }
    }
  }
});
