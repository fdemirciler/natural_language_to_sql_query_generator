import React, { useState } from 'react';
import { 
  Box, 
  Text, 
  IconButton, 
  HStack, 
  VStack, 
  useColorModeValue,
  Tooltip,
  Flex,
  useClipboard,
  useToast,
  Code,
  useColorMode
} from '@chakra-ui/react';
import { CopyIcon, DeleteIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { formatDistanceToNow } from 'date-fns';

const HistoryItem = ({ 
  id, 
  question, 
  sql, 
  timestamp, 
  rowCount, 
  onDelete,
  onSelect,
  isActive
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { onCopy } = useClipboard(sql);
  const toast = useToast();
  
  const { colorMode } = useColorMode();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const mutedText = useColorModeValue('gray.500', 'gray.400');
  const codeBg = colorMode === 'dark' ? 'gray.700' : 'gray.100';

  const handleCopy = () => {
    onCopy();
    toast({
      title: 'Query copied to clipboard',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleClick = () => {
    onSelect({ question, sql });
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(id);
  };

  return (
    <Box
      p={3}
      mb={3}
      borderRadius="md"
      borderWidth="1px"
      borderColor={borderColor}
      bg={bgColor}
      _hover={{ 
        bg: hoverBg,
      }}
      cursor="pointer"
      onClick={() => setIsExpanded(!isExpanded)}
      fontFamily="Inter, sans-serif"
    >
      <VStack align="stretch" spacing={2}>
        <Flex align="flex-start">
          <Box flex="1" overflow="hidden">
            <Text 
              noOfLines={isExpanded ? 100 : 2}
              color={textColor}
              fontSize="sm"
              mb={isExpanded ? 2 : 0}
            >
              {question || 'No question provided'}
            </Text>
            {isExpanded && (
              <Box 
                mt={2}
                p={2} 
                bg={codeBg}
                borderRadius="md"
                fontSize="xs"
                fontFamily="mono"
                overflowX="auto"
                borderWidth="1px"
                borderColor={borderColor}
              >
                <Code 
                  variant="unstyled" 
                  whiteSpace="pre-wrap"
                  wordBreak="break-word"
                  fontFamily="inherit"
                >
                  {sql}
                </Code>
              </Box>
            )}
          </Box>
          <IconButton
            size="xs"
            variant="ghost"
            aria-label={isExpanded ? 'Show less' : 'Show more'}
            icon={isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
            ml={2}
            color={mutedText}
            _hover={{ bg: 'transparent', color: textColor }}
          />
        </Flex>
        
        <HStack justify="space-between" mt={1} spacing={4}>
          <HStack spacing={2}>
            <Text fontSize="xs" color={mutedText}>
              {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
            </Text>
            {rowCount !== undefined && (
              <Text fontSize="xs" color={mutedText}>
                • {rowCount} {rowCount === 1 ? 'row' : 'rows'}
              </Text>
            )}
          </HStack>
          <HStack spacing={1}>
            <Tooltip label="Copy query" hasArrow>
              <IconButton
                size="xs"
                variant="ghost"
                aria-label="Copy query"
                icon={<CopyIcon />}
                onClick={(e) => { e.stopPropagation(); handleCopy(); }}
                color={mutedText}
                _hover={{ color: textColor, bg: 'transparent' }}
              />
            </Tooltip>
            <Tooltip label="Delete from history" hasArrow>
              <IconButton
                size="xs"
                variant="ghost"
                aria-label="Delete query"
                icon={<DeleteIcon />}
                color={mutedText}
                _hover={{ color: 'red.500', bg: 'transparent' }}
                onClick={handleDelete}
              />
            </Tooltip>
          </HStack>
        </HStack>
      </VStack>
    </Box>
  );
};

export default HistoryItem;
