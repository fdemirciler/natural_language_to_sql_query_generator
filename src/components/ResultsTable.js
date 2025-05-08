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
  Tooltip
} from '@chakra-ui/react';

const ResultsTable = ({ results, isLoading, error }) => {
  // All hooks must be at the top!
  const [sortConfig, setSortConfig] = React.useState({ key: null, direction: 'asc' });
  const [page, setPage] = React.useState(0);

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

  if (results === null || results === undefined) {
    return null;
  }
  if (Array.isArray(results) && results.length === 0) {
    return (
      <Box mt={6} borderWidth="1px" borderRadius="lg" overflow="hidden">
        <Box p={6} bg="gray.50" textAlign="center">
          <Heading size="sm" color="gray.500">No results found for this query.</Heading>
        </Box>
      </Box>
    );
  }

  // Extract column headers from the first result
  const columns = Object.keys(results[0]);

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
const paginatedResults = (sortedResults || []).slice(page * rowsPerPage, (page + 1) * rowsPerPage);

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

  const boxBg = useColorModeValue('gray.50', 'gray.800');
  const textColor = useColorModeValue('gray.900', 'gray.100');

  return (
    <Box mt={6} borderWidth="1px" borderRadius="lg" overflow="hidden">
      <Box p={4} bg={boxBg} color={textColor} borderRadius="lg" boxShadow="sm">
        <Flex align="center" justify="space-between" mb={2} wrap="wrap" gap={2}>
          <Heading size="sm" color={textColor}>Query Results ({results.length} rows)</Heading>
        <Flex gap={2}>
          <Tooltip label="Copy results table to clipboard" hasArrow>
            <Button size="sm" colorScheme="blue" onClick={copyTable}>Copy Table</Button>
          </Tooltip>
          <Tooltip label="Download results as CSV" hasArrow>
            <Button size="sm" colorScheme="blue" onClick={downloadCSV}>Download CSV</Button>
          </Tooltip>
        </Flex>
      </Flex>
      <TableContainer bg={useColorModeValue('white', 'gray.800')} borderRadius="md" boxShadow="sm" overflowX="auto">
        <Table variant="simple" size="sm" aria-label="Query Results Table" bg={useColorModeValue('white', 'gray.800')} color={useColorModeValue('gray.900', 'gray.100')} minW="100%">
          <Thead>
            <Tr>
              {columns.map((column) => (
                <Th
                  key={column}
                  cursor="pointer"
                  onClick={() => handleSort(column)}
                  userSelect="none"
                  color={sortConfig.key === column ? 'blue.600' : undefined}
                >
                  {column}
                  {sortConfig.key === column && (
                    <span style={{ marginLeft: 4 }}>
                      {sortConfig.direction === 'asc' ? '▲' : '▼'}
                    </span>
                  )}
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {paginatedResults.map((row, rowIndex) => (
              <Tr key={rowIndex}>
                {columns.map((column) => (
                  <Td key={`${rowIndex}-${column}`}>{row[column]?.toString() || 'null'}</Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      {/* Pagination Controls */}
      <Flex justify="flex-end" align="center" mt={3} gap={2}>
        <Button size="xs" onClick={() => setPage(0)} isDisabled={page === 0}>First</Button>
        <Button size="xs" onClick={() => setPage(page - 1)} isDisabled={page === 0}>Prev</Button>
        <Text fontSize="sm">Page {page + 1} of {pageCount}</Text>
        <Button size="xs" onClick={() => setPage(page + 1)} isDisabled={page >= pageCount - 1}>Next</Button>
        <Button size="xs" onClick={() => setPage(pageCount - 1)} isDisabled={page >= pageCount - 1}>Last</Button>
      </Flex>
    </Box>
  </Box>
);
};

export default ResultsTable;
