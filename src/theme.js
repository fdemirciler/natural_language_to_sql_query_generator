import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  fonts: {
    heading: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
    body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
  },
  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 500, // Reduced from default 600
    bold: 600,     // Reduced from default 700
  },
  components: {
    Heading: {
      baseStyle: {
        fontWeight: 'semibold', // Using our reduced semibold weight
      }
    },
  },
});

export default theme;
