import { 
  Box, 
  Heading, 
  Button, 
  useToast,
  Flex,
  useColorModeValue,
  Tooltip,
  HStack,
  Icon,
  Textarea
} from '@chakra-ui/react';
import { CopyIcon, ChevronRightIcon, EditIcon } from '@chakra-ui/icons';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco, a11yDark } from 'react-syntax-highlighter/dist/cjs/styles/hljs';
import { sql as formatSQL } from 'sql-formatter';

import { useState, useEffect, useRef } from 'react';

const SqlDisplay = ({ sql, onExecute, isExecuting, onSqlUpdate }) => {
  const toast = useToast();
  const [isEditable, setIsEditable] = useState(false);
  const [editedSql, setEditedSql] = useState('');
  const [showSQL, setShowSQL] = useState(true);
  const textareaRef = useRef(null);
  
  // Update editedSql when sql prop changes
  useEffect(() => {
    setEditedSql(sql);
  }, [sql]);
  
  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current && isEditable) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [editedSql, isEditable]);
  
  const handleCopy = () => {
    if (!sql) return;
    navigator.clipboard.writeText(isEditable ? editedSql : sql);
    toast({
      title: "SQL copied to clipboard",
      status: "info",
      colorScheme: "blue",
      backgroundColor: "blue.100",
      color: "blue.800",
      duration: 2000,
      isClosable: true,
    });
  };
  
  const handleEdit = () => {
    // Format the SQL before making it editable
    setEditedSql(formatSqlQuery(sql));
    setIsEditable(true);
    
    // Allow time for the state to update before resizing
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }, 0);
  };
  
  const handleSaveQuery = () => {
    // Format the edited SQL
    const formattedSql = formatSqlQuery(editedSql);
    setEditedSql(formattedSql);
    setIsEditable(false);
    
    // Update parent component with the edited SQL
    if (onSqlUpdate) {
      onSqlUpdate(formattedSql);
    }
    
    toast({
      title: "Query saved",
      description: "Your edited query is ready to run",
      status: "info",
      colorScheme: "blue",
      backgroundColor: "blue.100",
      color: "blue.800",
      duration: 2000,
      isClosable: true,
    });
  };
  


  // Format SQL for readability
  const formatSqlQuery = (sqlText) => {
    try {
      let formatted = formatSQL(sqlText, {
        language: 'postgresql',
        indent: '  ',
        linesBetweenQueries: 2,
      });
      
      // Fallback: if the result is still a single line, force a split by keywords
      if (formatted.split('\n').length < 2) {
        formatted = sqlText.replace(/\b(FROM|WHERE|GROUP BY|ORDER BY|HAVING|INNER JOIN|LEFT JOIN|RIGHT JOIN|JOIN|ON|VALUES|SET|LIMIT|OFFSET|UNION|RETURNING|AND|OR)\b/gi, '\n$1');
      }
      
      // Further split WHERE and HAVING conditions by AND/OR for multi-line
      formatted = formatted.replace(/(WHERE|HAVING)([\s\S]*?)(GROUP BY|ORDER BY|LIMIT|OFFSET|$)/gi, (match, clause, conditions, next) => {
        if (!conditions) return match;
        // Split by AND/OR, keep the operator at the start of the line
        const condLines = conditions
          .replace(/\s+AND\s+/gi, '\n  AND ')
          .replace(/\s+OR\s+/gi, '\n  OR ');
        return `${clause}${condLines}${next}`;
      });
      
      return formatted;
    } catch (e) {
      // fallback to raw SQL if formatting fails
      return sqlText;
    }
  };
  
  // Format the display SQL
  let formattedSQL = isEditable ? editedSql : formatSqlQuery(sql);

  // Color mode values for buttons and background
  const buttonColor = useColorModeValue('gray.700', 'gray.200');
  const buttonBg = useColorModeValue('gray.200', 'gray.700');
  const buttonHoverBg = useColorModeValue('gray.300', 'gray.600');
  const boxBg = useColorModeValue('gray.50', 'gray.800');
  const sqlBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.100');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box mt={6} borderWidth="1px" borderRadius="lg" overflow="hidden" borderColor={borderColor} boxShadow="md">
      <Box p={4} bg={boxBg} color={textColor}>
        <Flex justify="space-between" align="center" mb={3}>
          <Flex align="center">
            <Heading size="sm" color={textColor}>Generated SQL</Heading>
          </Flex>
          <HStack spacing={2}>
            {isEditable ? (
              <Tooltip label="Save Query" hasArrow>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={handleSaveQuery}
                >
                  <Icon as={() => (
                    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V7L17 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M17 3V7H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8 16H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )} />
                </Button>
              </Tooltip>
            ) : (
              <Tooltip label="Edit SQL" hasArrow>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={handleEdit}
                >
                  <EditIcon />
                </Button>
              </Tooltip>
            )}

            <Tooltip label="Copy SQL to clipboard" hasArrow>
              <Button size="sm" variant="ghost" onClick={handleCopy}>
                <CopyIcon />
              </Button>
            </Tooltip>
            <Tooltip label="Run this query" hasArrow>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => onExecute(isEditable ? editedSql : (editedSql || sql))} 
                isLoading={isExecuting} 
                loadingText="Executing"
              >
                <Icon as={() => (
                  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 3L19 12L5 21V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )} />
              </Button>
            </Tooltip>
          </HStack>
        </Flex>
        {showSQL && (
          <Box 
            borderWidth="1px" 
            borderRadius="md" 
            mt={2} 
            p={3} 
            bg={sqlBg} 
            color={textColor}
            borderColor={borderColor}
            boxShadow="inner"
            width="100%"
          >
            {isEditable ? (
              <Textarea
                ref={textareaRef}
                value={editedSql}
                onChange={(e) => setEditedSql(e.target.value)}
                height="auto"
                resize="none"
                fontFamily='"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace'
                fontSize="15px"
                bg={useColorModeValue('white', 'gray.800')}
                border="none"
                _focus={{ boxShadow: 'none' }}
                placeholder="Edit your SQL query here..."
                spellCheck="false"
                style={{
                  color: textColor,
                  lineHeight: 1.5,
                  tabSize: 2,
                  padding: '10px',
                  whiteSpace: 'pre',
                  overflow: 'hidden'
                }}
              />
            ) : (
              <Box
                style={{
                  whiteSpace: 'pre',
                  fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
                  fontSize: '15px',
                  lineHeight: 1.5,
                  padding: '10px',
                  color: textColor,
                  width: '100%'
                }}
              >
                <SyntaxHighlighter 
                  language="sql" 
                  style={useColorModeValue(docco, a11yDark)} 
                  customStyle={{ 
                    background: 'transparent', 
                    margin: 0,
                    padding: 0,
                    overflow: 'visible',
                    lineHeight: 'inherit',
                    fontSize: 'inherit',
                    fontFamily: 'inherit'
                  }}
                  wrapLongLines={true}
                >
                  {formatSqlQuery(sql)}
                </SyntaxHighlighter>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default SqlDisplay;
