import { useState, useEffect, useCallback, useRef } from 'react';
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
  useDisclosure,
  Icon
} from '@chakra-ui/react';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';
import { FiClock, FiChevronLeft } from 'react-icons/fi';
import { FiRefreshCw } from 'react-icons/fi';
import { FaGithub } from 'react-icons/fa';
import SchemaVisualizer from '../components/SchemaVisualizer';
import HistoryPanel from '../components/HistoryPanel';

// Custom Moon icon component with the provided SVG
const CustomMoonIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="size-6"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
    />
  </svg>
);

// Inline ColorModeToggle component
const ColorModeToggle = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <IconButton
      aria-label={colorMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      icon={colorMode === 'light' ? <CustomMoonIcon width="1.25rem" height="1.25rem" /> : <SunIcon />}
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
  const historyPanelDisclosure = useDisclosure({ defaultIsOpen: false });
  const historyPanelRef = useRef(null);

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

      // Add to history when a new query is generated
      if (historyPanelRef.current) {
        console.log('Adding to history:', { question: questionText, sql: data.sqlQuery });
        try {
          historyPanelRef.current.addToHistory({
            question: questionText,
            sql: data.sqlQuery,
            rowCount: 0 // Will be updated when executed
          });
          console.log('Successfully added to history');
        } catch (error) {
          console.error('Error adding to history:', error);
        }
      } else {
        console.warn('historyPanelRef.current is null');
      }
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
      setResults(data.results.data);

      // Update the history item with the row count
      if (historyPanelRef.current) {
        historyPanelRef.current.updateLastHistoryItem({
          rowCount: data.results.data ? data.results.data.length : 0
        });
      }

      return data.results.data ? data.results.data.length : 0;
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
      throw err;
    } finally {
      setIsExecuting(false);
    }
  };

  // Handle loading a query from history
  const handleLoadQuery = useCallback(({ question, sql }) => {
    setQuestion(question);
    setSqlQuery(sql);
    setResults(null);
    setError(null);
    // Don't execute automatically, let the user click run
  }, []);

  return (
    <Box minH="100vh" bg={bg}>
      {/* History Panel */}
      <HistoryPanel
        ref={historyPanelRef}
        onSelectQuery={handleLoadQuery}
        onExecuteQuery={handleExecuteQuery}
        currentQuery={sqlQuery}
        isOpen={historyPanelDisclosure.isOpen}
        onClose={historyPanelDisclosure.onClose}
      />

      <Box
        width="100%"
        display="flex"
        justifyContent="center"
        pl={historyPanelDisclosure.isOpen ? '300px' : 0}
        transition="padding-left 0.3s ease-in-out"
      >
        <Container
          maxW="4xl"
          py={8}
          px={4}
        >
          <Box position="relative" width="100%" mb={6}>
            <Flex justify="center" align="center" position="relative">
              <Heading size="lg" color={headingColor} textAlign="center">
                Natural Language to SQL Query Generator
              </Heading>
              <Box position="absolute" right={0} display="flex" alignItems="center" gap={1}>
                {/* Refresh IconButton (first in order) */}
                <IconButton
                  aria-label="Refresh"
                  icon={<Icon as={FiRefreshCw} />}
                  variant="ghost"
                  color="current"
                  fontSize="xl"
                  mr={0.5}
                  onClick={() => window.location.reload()}
                />
                {/* Dark Mode Toggle (second in order) */}
                <Box mr={0.5}><ColorModeToggle /></Box>
                {/* GitHub IconButton (third in order) */}
                <IconButton
                  as={Link}
                  href="https://github.com/fdemirciler/natural_language_to_sql_query_generator"
                  aria-label="GitHub Repository"
                  icon={<Icon as={FaGithub} />}
                  variant="ghost"
                  color="current"
                  fontSize="xl"
                  isExternal
                />
              </Box>
            </Flex>
            <Box position="absolute" left={0} top="50%" transform="translateY(-50%)">
              <IconButton
                aria-label={historyPanelDisclosure.isOpen ? 'Hide history' : 'Show history'}
                icon={historyPanelDisclosure.isOpen ? <Icon as={FiChevronLeft} /> : <Icon as={FiClock} />}
                onClick={() => {
                  if (historyPanelDisclosure.isOpen) {
                    historyPanelDisclosure.onClose();
                  } else {
                    historyPanelDisclosure.onOpen();
                  }
                }}
                variant="ghost"
              />
            </Box>
          </Box>
          <VStack spacing={8} align="stretch">
            <Box textAlign="center" mb={6}>
              <Text color={textColor}>
                Powered by a large language model through Together.ai, this app lets you query the <Link href="https://www.postgresql.org/ftp/projects/pgFoundry/dbsamples/world/world-1.0/" isExternal color="blue.400" fontWeight="bold">World</Link> PostgreSQL database stored in Neon using natural language. Example: "How many cities are there in each country?"
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
    </Box>
  );
}
