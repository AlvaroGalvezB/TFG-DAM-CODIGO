import { Platform } from 'react-native';

export const globalStyles = {
  fontFamily: {
    primary: Platform.select({
      ios: 'Inter',
      android: 'Inter',
      web: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", sans-serif'
    }),
  },
  text: {
    regular: {
      fontFamily: Platform.select({
        ios: 'Inter',
        android: 'Inter',
        web: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", sans-serif'
      }),
      fontSize: 16,
    },
    title: {
      fontFamily: Platform.select({
        ios: 'Inter',
        android: 'Inter',
        web: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", sans-serif'
      }),
      fontSize: 24,
      fontWeight: 'bold',
    },
    subtitle: {
      fontFamily: Platform.select({
        ios: 'Inter',
        android: 'Inter',
        web: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", sans-serif'
      }),
      fontSize: 18,
      fontWeight: '500',
    }
  }
};