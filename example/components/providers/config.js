/**
 * This HOC takes the config and passes it to the context
 *
 * This allows other components to access the global configuration without needing
 * to pass props everywhere
 */
export default function ConfigProvider(attributes, context, updateContext) {
  const { config } = attributes;

  updateContext({
    config,
  });

  return attributes.children[0];
}
