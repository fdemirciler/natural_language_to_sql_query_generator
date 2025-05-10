import { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Textarea, 
  Button, 
  VStack, 
  HStack, 
  Text, 
  useColorModeValue,
  InputGroup,
  Flex,
  Heading,
  Icon
} from '@chakra-ui/react';

const ChatInterface = ({ onSubmit, isLoading, error, success }) => {
  const [question, setQuestion] = useState('');
  const [lineCount, setLineCount] = useState(1);
  const textareaRef = useRef(null);
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const inputBg = useColorModeValue('white', 'gray.800');
  const hintColor = useColorModeValue('gray.500', 'gray.400');
  
  // Auto-resize the textarea based on content
  const resizeTextarea = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(40, textarea.scrollHeight)}px`;
      
      // Calculate approximate line count
      const lineHeight = 20; // Approximate line height in pixels
      const newLineCount = Math.max(1, Math.floor(textarea.scrollHeight / lineHeight));
      setLineCount(newLineCount);
    }
  };
  
  useEffect(() => {
    resizeTextarea();
  }, [question]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (question.trim()) {
      onSubmit(question);
      setQuestion('');
    }
  };

  return (
    <Box w="100%" mx="auto" mt={4}>
      <VStack spacing={4} align="stretch" mb={4}>
        {error && (
          <Box bg="red.100" borderRadius="md" p={2} color="red.700" fontSize="sm">
            {error}
          </Box>
        )}
        {success && (
          <Box bg="green.100" borderRadius="md" p={2} color="green.700" fontSize="sm">
            {success}
          </Box>
        )}
      </VStack>
      
      <Box borderWidth="1px" borderRadius="lg" overflow="hidden" borderColor={useColorModeValue('gray.200', 'gray.700')} boxShadow="md">
        <Box p={4} bg={useColorModeValue('gray.50', 'gray.800')}>
          <Flex align="center">
            <Heading size="sm" color={useColorModeValue('gray.600', 'gray.100')}>Ask a question</Heading>
          </Flex>
        </Box>
        
        <Box p={4} bg={useColorModeValue('gray.50', 'gray.800')}>
          <form onSubmit={handleSubmit}>
            <Box position="relative" width="100%">
              <Textarea
                ref={textareaRef}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder=""
                isDisabled={isLoading}
                size="md"
                border="1px"
                borderColor={useColorModeValue('gray.200', 'gray.600')}
                borderRadius="md"
                pl={4}
                py={2}
                pr={20}
                _hover={{ borderColor: useColorModeValue('gray.300', 'gray.500') }}
                _focus={{ 
                  outline: 'none',
                  borderColor: useColorModeValue('gray.300', 'gray.600'), 
                  boxShadow: useColorModeValue(
                    '0 0 2px 1px rgba(0, 0, 0, 0.05)', 
                    '0 0 2px 1px rgba(255, 255, 255, 0.05)'
                  )
                }}
                bg={useColorModeValue('white', 'gray.800')}
                width="100%"
                resize="none"
                minH="40px"
                overflow="hidden"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  } else if (e.key === 'Enter' && e.shiftKey) {
                    // Allow shift+enter for new lines
                    setTimeout(resizeTextarea, 0);
                  }
                }}
              />
              <Button
                type="submit"
                variant="ghost"
                isLoading={isLoading}
                loadingText=""
                size="sm"
                position="absolute"
                right={0}
                top={lineCount > 2 ? 'auto' : '50%'}
                bottom={lineCount > 2 ? 0 : 'auto'}
                transform={lineCount > 2 ? 'none' : 'translateY(-50%)'}
                px={4}
                borderRadius="0 0.375rem 0.375rem 0"
                zIndex={2}
                display="flex"
                alignItems="center"
                aria-label="Ask question"
                bg="transparent"
                _hover={{ bg: "transparent", color: useColorModeValue('blue.500', 'blue.300') }}
              >
                <Icon as={() => (
                  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )} />
              </Button>
            </Box>
          </form>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatInterface;
