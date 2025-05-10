import { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  VStack, 
  Heading, 
  Text,
  useToast,
  Flex,
  useColorModeValue,
  useColorMode,
  IconButton,
  Link,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon
} from '@chakra-ui/react';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';
import SchemaVisualizer from '../components/SchemaVisualizer';

// Inline ColorModeToggle component
const ColorModeToggle = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <IconButton
      aria-label={colorMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
      onClick={toggleColorMode}
      variant="ghost"
      color="current"
      fontSize="xl"
      ml={2}
    />
  );
};

import ChatInterface from '../components/ChatInterface';
import SqlDisplay from '../components/SqlDisplay';
import ResultsTable from '../components/ResultsTable';
import { getSchema } from '../utils/schema';


export default function Home() {
  // Color mode values for background and text
  const bg = useColorModeValue('gray.100', 'gray.900');
  const headingColor = useColorModeValue('gray.600', 'gray.100');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const [schema, setSchema] = useState(null);
  const [question, setQuestion] = useState('');
  const [sqlQuery, setSqlQuery] = useState('');
  const [results, setResults] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  // Load schema on component mount
  useEffect(() => {
    async function loadSchema() {
      try {
        const schemaData = await getSchema();
        setSchema(schemaData);
      } catch (err) {
        console.error('Error loading schema:', err);
        toast({
          title: 'Error loading database schema',
          status: 'error',
          colorScheme: "red",
          duration: 5000,
          isClosable: true,
        });
      }
    }
    
    loadSchema();
  }, [toast]);

  // Handle question submission
  const handleQuestionSubmit = async (questionText) => {
    setQuestion(questionText);
    setIsGenerating(true);
    setError(null);
    setResults(null);
    
    try {
      const response = await fetch('/api/generate-sql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          question: questionText,
          schema: schema
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate SQL');
      }
      
      const data = await response.json();
      setSqlQuery(data.sqlQuery);
    } catch (err) {
      console.error('Error generating SQL:', err);
      setError(err.message);
      toast({
        title: 'Error generating SQL',
        description: err.message,
        status: 'error',
        colorScheme: "red",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle SQL execution
  const handleExecuteQuery = async (sql) => {
    setIsExecuting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/execute-sql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sqlQuery: sql }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to execute SQL');
      }
      
      const data = await response.json();
      setResults(data.results);
    } catch (err) {
      console.error('Error executing SQL:', err);
      setError(err.message);
      toast({
        title: 'Error executing SQL',
        description: err.message,
        status: 'error',
        colorScheme: "red",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <Box minH="100vh" bg={bg}>
      <Container maxW="4xl" py={8}>
        <Flex justify="flex-end" align="center" mb={2}>
          <ColorModeToggle />
        </Flex>
        <VStack spacing={8} align="stretch">
          <Box textAlign="center">
            <Heading size="lg" color={headingColor} mb={2}>
              Natural Language to SQL Query Generator
            </Heading>
            <Text color={textColor}>
              Powered by a large language model through Together.ai, this app lets you query the <Link href="https://www.postgresql.org/ftp/projects/pgFoundry/dbsamples/world/world-1.0/" isExternal color="blue.400" fontWeight="bold">World</Link> PostgreSQL database stored in Supabase using natural language. Example: "How many cities are there in each country?"
            </Text>
          </Box>
          <ChatInterface 
            onSubmit={handleQuestionSubmit} 
            isLoading={isGenerating} 
          />
          
          <SqlDisplay 
            sql={sqlQuery} 
            onExecute={handleExecuteQuery}
            isExecuting={isExecuting}
            onSqlUpdate={setSqlQuery}
          />
          <ResultsTable 
            results={results} 
            isLoading={isExecuting}
            error={error}
          />
          
          {/* Database Schema Section */}
          <Box mt={6} borderWidth="1px" borderRadius="lg" overflow="hidden" borderColor={borderColor} boxShadow="md">
            <Box p={4} bg={useColorModeValue('gray.50', 'gray.800')}>
              <Flex align="center" mb={3}>
                <Heading size="sm" color={headingColor}>Database Schema</Heading>
              </Flex>
              
              <Box 
                bg={useColorModeValue('white', 'gray.800')} 
                borderRadius="md" 
                borderWidth="1px"
                borderColor={borderColor}
                boxShadow="sm"
                overflow="hidden"
              >
                <SchemaVisualizer schema={schema} />
              </Box>
            </Box>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
