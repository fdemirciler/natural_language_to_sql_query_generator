import React from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Heading,
  Spinner,
  Center,
  Flex,
  Button,
  Text,
  useColorModeValue,
  Tooltip,
  HStack,
  Badge
} from '@chakra-ui/react';
import { DownloadIcon, CopyIcon, ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';

const ResultsTable = ({ results, isLoading, error }) => {
  // State hooks
  const [sortConfig, setSortConfig] = React.useState({ key: null, direction: 'asc' });
  const [page, setPage] = React.useState(0);
  
  // Theme hooks
  const boxBg = useColorModeValue('gray.50', 'gray.800');
  const textColor = useColorModeValue('gray.900', 'gray.100');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const headerColor = useColorModeValue('gray.600', 'gray.100');
  const rowCountColor = useColorModeValue('gray.600', 'gray.300');
  const emptyTextColor = useColorModeValue('gray.500', 'gray.400');
  const tableBg = useColorModeValue('white', 'gray.800');
  const headerBg = useColorModeValue('gray.50', 'gray.700');
  const tableTextColor = useColorModeValue('gray.900', 'gray.100');

  // Sorting logic
  const sortedResults = React.useMemo(() => {
    if (!results || !Array.isArray(results) || !sortConfig.key) return results;
    const sorted = [...results].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortConfig.direction === 'asc'
        ? aVal.toString().localeCompare(bVal.toString())
        : bVal.toString().localeCompare(aVal.toString());
    });
    return sorted;
  }, [results, sortConfig]);

  const handleSort = (col) => {
    setSortConfig((prev) => {
      if (prev.key === col) {
        return { key: col, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key: col, direction: 'asc' };
    });
  };


  if (isLoading) {
    return (
      <Center p={8}>
        <Spinner size="xl" />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert status="error" mt={4} borderRadius="md">
        <AlertIcon />
        <AlertTitle>Error executing query:</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Prepare empty state display
  const isEmpty = results === null || results === undefined || (Array.isArray(results) && results.length === 0);

  // Extract column headers from the first result or use empty array if no results
  const columns = !isEmpty ? Object.keys(results[0]) : [];

  // Utility function to convert results to CSV
const downloadCSV = () => {
  if (!results || results.length === 0) return;
  const csvRows = [];
  csvRows.push(columns.join(","));
  results.forEach(row => {
    const values = columns.map(col => {
      let val = row[col];
      if (val === null || val === undefined) return '';
      // Escape quotes and commas
      val = val.toString().replace(/"/g, '""');
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        val = `"${val}"`;
      }
      return val;
    });
    csvRows.push(values.join(","));
  });
  const csvContent = csvRows.join("\n");
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'query_results.csv';
  a.click();
  URL.revokeObjectURL(url);
};

  // Pagination logic
const rowsPerPage = 10;
const pageCount = results && results.length ? Math.ceil(results.length / rowsPerPage) : 1;
const paginatedResults = !isEmpty ? (sortedResults || []).slice(page * rowsPerPage, (page + 1) * rowsPerPage) : [];

// Copy to clipboard as CSV
const copyTable = () => {
  if (!results || results.length === 0) return;
  const csvRows = [];
  csvRows.push(columns.join(","));
  results.forEach(row => {
    const values = columns.map(col => {
      let val = row[col];
      if (val === null || val === undefined) return '';
      val = val.toString().replace(/"/g, '""');
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        val = `"${val}"`;
      }
      return val;
    });
    csvRows.push(values.join(","));
  });
  navigator.clipboard.writeText(csvRows.join("\n"));
};


  
  return (
    <Box mt={6} borderWidth="1px" borderRadius="lg" overflow="hidden" borderColor={borderColor} boxShadow="md">
      <Box p={4} bg={boxBg} color={textColor}>
        <Flex align="center" justify="space-between" mb={3}>
          <Flex align="center">
            <Heading size="sm" color={headerColor}>Query Results</Heading>
            {!isEmpty && (
              <Text ml={2} fontSize="xs" color={rowCountColor}>{results.length} rows</Text>
            )}
          </Flex>
          <HStack spacing={2}>
            <Tooltip label="Copy results table to clipboard" hasArrow>
              <Button size="sm" variant="ghost" onClick={copyTable}>
                <CopyIcon />
              </Button>
            </Tooltip>
            <Tooltip label="Download results as CSV" hasArrow>
              <Button size="sm" variant="ghost" onClick={downloadCSV}>
                <DownloadIcon />
              </Button>
            </Tooltip>
          </HStack>
        </Flex>
        
        {isEmpty ? (
          <Box p={6} bg={tableBg} textAlign="center" borderWidth="1px" borderRadius="md" borderColor={borderColor}>
            <Text color={emptyTextColor}>
              {results && Array.isArray(results) ? 'No rows returned for this query.' : 'No results yet. Run a query to see data here.'}
            </Text>
          </Box>
        ) : (
          <TableContainer 
            bg={tableBg}
            borderRadius="md" 
            overflowX="auto"
            borderWidth="1px"
            borderColor={borderColor}
            boxShadow="sm"
          >
            <Table variant="simple" size="sm" aria-label="Query Results Table" color={tableTextColor} minW="100%">
              <Thead bg={headerBg}>
                <Tr>
                  {columns.map((column) => (
                    <Th
                      key={column}
                      cursor="pointer"
                      onClick={() => handleSort(column)}
                      userSelect="none"
                      color={sortConfig.key === column ? 'blue.500' : undefined}
                      py={3}
                      fontSize="xs"
                    >
                      <Flex align="center">
                        {column}
                        {sortConfig.key === column && (
                          <Text ml={1} color="blue.500">
                            {sortConfig.direction === 'asc' ? '▲' : '▼'}
                          </Text>
                        )}
                      </Flex>
                    </Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {paginatedResults.map((row, rowIndex) => (
                  <Tr key={rowIndex} _hover={{ bg: hoverBg }}>
                    {columns.map((column) => (
                      <Td key={`${rowIndex}-${column}`} py={2} fontSize="sm">{row[column]?.toString() || 'null'}</Td>
                    ))}
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        )}
        
        {/* Pagination Controls */}
        {!isEmpty && (
          <Flex justify="space-between" align="center" mt={4}>
            <Text fontSize="sm" color={textColor}>Showing {page * rowsPerPage + 1} to {Math.min((page + 1) * rowsPerPage, results.length)} of {results.length} results</Text>
            
            <HStack spacing={1}>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setPage(0)} 
                isDisabled={page === 0}
                fontSize="sm"
              >
                <ChevronLeftIcon />
                <ChevronLeftIcon ml="-1.5" />
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setPage(page - 1)} 
                isDisabled={page === 0}
                fontSize="sm"
              >
                <ChevronLeftIcon />
              </Button>
              
              <Text fontSize="sm" mx={2}>
                Page {page + 1} of {pageCount}
              </Text>
              
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setPage(page + 1)} 
                isDisabled={page >= pageCount - 1}
                fontSize="sm"
              >
                <ChevronRightIcon />
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setPage(pageCount - 1)} 
                isDisabled={page >= pageCount - 1}
                fontSize="sm"
              >
                <ChevronRightIcon />
                <ChevronRightIcon ml="-1.5" />
              </Button>
            </HStack>
          </Flex>
        )}
      </Box>
    </Box>
);
};

export default ResultsTable;
