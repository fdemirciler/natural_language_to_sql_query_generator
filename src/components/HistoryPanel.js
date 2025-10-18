import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import {
  Box,
  VStack,
  IconButton,
  Heading,
  useColorModeValue,
  Icon,
  Text,
  useToast,
  Flex
} from '@chakra-ui/react';
import { FiX, FiClock } from 'react-icons/fi';
import HistoryItem from './HistoryItem';

const HISTORY_STORAGE_KEY = 'sqlQueryHistory';
const MAX_HISTORY_ITEMS = 10;

const HistoryPanel = forwardRef(({ onSelectQuery, onExecuteQuery, currentQuery, isOpen, onClose }, ref) => {
  const [history, setHistory] = useState([]);
  const toast = useToast();
  
  // Theme colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const headerBg = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.200');
  const mutedText = useColorModeValue('gray.500', 'gray.400');

  // Add missing function implementations
  const addToHistory = (queryData) => {
    console.log('addToHistory called with:', queryData);
    if (!queryData || !queryData.sql) {
      console.warn('Invalid query data provided to addToHistory');
      return;
    }
    
    // Don't add if the same as the last query
    const lastQuery = history[0];
    if (lastQuery && lastQuery.sql === queryData.sql) {
      console.log('Skipping duplicate query');
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      question: queryData.question || '',
      sql: queryData.sql,
      timestamp: Date.now(),
      rowCount: queryData.rowCount || 0
    };

    console.log('Adding new history item:', newItem);
    setHistory(prev => {
      const newHistory = [newItem, ...prev].slice(0, MAX_HISTORY_ITEMS);
      console.log('New history state:', newHistory);
      return newHistory;
    });
  };

  const updateLastHistoryItem = (updates) => {
    setHistory(prev => {
      if (prev.length === 0) return prev;
      const updated = { ...prev[0], ...updates };
      return [updated, ...prev.slice(1)];
    });
  };

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setHistory(parsed);
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }, []);

  // Save history to localStorage when it changes
  useEffect(() => {
    console.log('History changed, saving to localStorage:', history);
    if (history.length > 0) {
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
        console.log('Successfully saved to localStorage');
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    } else {
      console.log('History is empty, not saving to localStorage');
    }
  }, [history]);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    addToHistory,
    updateLastHistoryItem
  }));

  // Remove a query from history
  const removeFromHistory = (id) => {
    setHistory(prev => prev.filter(item => item.id !== id));
    toast({
      title: 'Query removed from history',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  // Handle query selection
  const handleSelectQuery = (queryData) => {
    onSelectQuery?.(queryData);
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      bottom="0"
      width="300px"
      bg={bgColor}
      borderRightWidth="1px"
      borderColor={borderColor}
      boxShadow="lg"
      zIndex="sticky"
      display="flex"
      flexDirection="column"
      transform={isOpen ? 'translateX(0)' : 'translateX(-100%)'}
      transition='transform 0.3s ease-in-out'
    >
      {/* Header */}
      <Box p={3} borderBottomWidth="1px" borderColor={borderColor} bg={headerBg}>
        <Flex align="center" justify="space-between" mb={2}>
          <Heading size="md" color={textColor} display="flex" alignItems="center">
            <Icon as={FiClock} mr={2} />
            Query History
          </Heading>
          <IconButton
            size="sm"
            variant="ghost"
            aria-label="Close history"
            icon={<Icon as={FiX} />}
            onClick={onClose}
          />
        </Flex>
        <Text fontSize="sm" color={mutedText} mt={2}>
          {history.length} {history.length === 1 ? 'query' : 'queries'} in history
        </Text>
      </Box>

      {/* History List */}
      <Box flex="1" overflowY="auto" p={4}>
        {history.length > 0 ? (
          history.map((item) => (
            <HistoryItem
              key={item.id}
              {...item}
              onDelete={removeFromHistory}
              onSelect={handleSelectQuery}
              isActive={currentQuery === item.sql}
            />
          ))
        ) : (
          <Text color={mutedText} textAlign="center" py={8}>
            No history yet. Your queries will appear here.
          </Text>
        )}
      </Box>
    </Box>
  );
});

// Add display name for better debugging
HistoryPanel.displayName = 'HistoryPanel';

export default React.memo(HistoryPanel);
