import { useState } from 'react';
import { 
  Box, 
  Input, 
  Button, 
  VStack, 
  HStack, 
  Text, 
  useColorModeValue
} from '@chakra-ui/react';

const ChatInterface = ({ onSubmit, isLoading, error, success }) => {
  const [question, setQuestion] = useState('');
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (question.trim()) {
      onSubmit(question);
      setQuestion('');
    }
  };

  return (
    <Box w={{ base: '100%', md: '80%', lg: '60%' }} mx="auto" mt={4}>
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
      <form onSubmit={handleSubmit}>
        <HStack spacing={2} align="stretch">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your question here..."
            isDisabled={isLoading}
            size="md"
            flex={1}
            borderColor={useColorModeValue('lightgray.500', 'gray.300')}
          />
          <Button
            type="submit"
            colorScheme="blue"
            isLoading={isLoading}
            loadingText="Generating"
            size="md"
            px={6}
          >
            Ask
          </Button>
        </HStack>
      </form>
    </Box>
  );
};

export default ChatInterface;
