import { 
  Box, 
  Heading, 
  Button, 
  useToast,
  Flex,
  useColorModeValue,
  Tooltip
} from '@chakra-ui/react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/cjs/styles/hljs';
import { sql as formatSQL } from 'sql-formatter';

import { useState } from 'react';

const SqlDisplay = ({ sql, onExecute, isExecuting }) => {
  const toast = useToast();
  
  const handleCopy = () => {
    navigator.clipboard.writeText(sql);
    toast({
      title: "SQL copied to clipboard",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const [showSQL, setShowSQL] = useState(true);
  if (!sql) return null;

  // Format SQL for readability
  let formattedSQL = sql;
  try {
    formattedSQL = formatSQL(sql, {
      language: 'postgresql',
      indent: '  ',
      linesBetweenQueries: 2,
    });
    // Fallback: if the result is still a single line, force a split by keywords
    if (formattedSQL.split('\n').length < 2) {
      formattedSQL = sql.replace(/\b(FROM|WHERE|GROUP BY|ORDER BY|HAVING|INNER JOIN|LEFT JOIN|RIGHT JOIN|JOIN|ON|VALUES|SET|LIMIT|OFFSET|UNION|RETURNING|AND|OR)\b/gi, '\n$1');
    }
    // Further split WHERE and HAVING conditions by AND/OR for multi-line
    formattedSQL = formattedSQL.replace(/(WHERE|HAVING)([\s\S]*?)(GROUP BY|ORDER BY|LIMIT|OFFSET|$)/gi, (match, clause, conditions, next) => {
      if (!conditions) return match;
      // Split by AND/OR, keep the operator at the start of the line
      const condLines = conditions
        .replace(/\s+AND\s+/gi, '\n  AND ')
        .replace(/\s+OR\s+/gi, '\n  OR ');
      return `${clause}${condLines}${next}`;
    });
  } catch (e) {
    // fallback to raw SQL if formatting fails
    formattedSQL = sql;
  }

  // Color mode values for buttons and background
  const buttonColor = useColorModeValue('gray.700', 'gray.200');
  const buttonBg = useColorModeValue('gray.200', 'gray.700');
  const buttonHoverBg = useColorModeValue('gray.300', 'gray.600');
  const boxBg = useColorModeValue('gray.50', 'gray.800');
  const sqlBg = useColorModeValue('white', 'gray.900');
  const textColor = useColorModeValue('gray.900', 'gray.100');

  return (
    <Box mt={6} borderWidth="1px" borderRadius="lg" boxShadow="md" overflow="hidden">
      <Box p={4} bg={boxBg} color={textColor} borderRadius="lg" boxShadow="sm">
        <Flex justify="space-between" align="center" mb={2}>
          <Heading size="sm" color={textColor}>Generated SQL Query</Heading>
          <Box>
            <Tooltip label="Execute this SQL query" hasArrow>
              <Button size="sm" colorScheme="blue" mr={2} onClick={() => onExecute(sql)} isLoading={isExecuting} loadingText="Executing">Execute Query</Button>
            </Tooltip>
            <Tooltip label="Copy SQL to clipboard" hasArrow>
              <Button size="sm" colorScheme="blue" mr={2} onClick={handleCopy}>Copy</Button>
            </Tooltip>
            <Tooltip label={showSQL ? 'Hide SQL' : 'Show SQL'} hasArrow>
              <Button size="sm" colorScheme="blue" onClick={() => setShowSQL((v) => !v)}>{showSQL ? 'Hide SQL' : 'Show SQL'}</Button>
            </Tooltip>
          </Box>
        </Flex>
        {showSQL && (
          <Box borderWidth="1px" borderRadius="md" overflow="auto" mt={2} minH="180px" p={2} bg={sqlBg} color={textColor}>
            <SyntaxHighlighter language="sql" style={docco} customStyle={{ background: 'transparent', fontSize: 15, minHeight: 150, padding: 10, whiteSpace: 'pre', wordBreak: 'break-all', color: textColor }}>
              {formattedSQL}
            </SyntaxHighlighter>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default SqlDisplay;
