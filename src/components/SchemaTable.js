import React from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useColorModeValue,
  Box,
  Text,
} from "@chakra-ui/react";

/**
 * Parses a markdown table string into an array of objects.
 * Only works for simple tables with a header row and pipes.
 * @param {string} markdown
 * @returns {{ columns: string[], rows: object[] }}
 */
function parseMarkdownTable(markdown) {
  const lines = markdown
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("|") && l.endsWith("|"));
  if (lines.length < 2) return null;
  const columns = lines[0]
    .split("|")
    .map((c) => c.trim())
    .filter((c) => c);
  const rows = lines.slice(2).map((line) => {
    const cells = line
      .split("|")
      .map((c) => c.trim())
      .filter((c) => c);
    const row = {};
    columns.forEach((col, i) => {
      row[col] = cells[i] || "";
    });
    return row;
  });
  return { columns, rows };
}

/**
 * Renders a schema markdown table as a Chakra UI table.
 * @param {string} markdownTable
 */
const SchemaTable = ({ markdownTable }) => {
  const parsed = parseMarkdownTable(markdownTable);
  const boxBg = useColorModeValue("gray.50", "gray.800");
  const textColor = useColorModeValue("gray.900", "gray.100");

  if (!parsed || parsed.rows.length === 0) {
    return (
      <Box bg={boxBg} color={textColor} p={4} borderRadius="md" mt={4}>
        <Text>No schema table found or unable to parse schema.</Text>
      </Box>
    );
  }

  return (
    <TableContainer bg={boxBg} borderRadius="md" boxShadow="sm" mt={4}>
      <Table variant="simple" size="sm" aria-label="Schema Table">
        <Thead>
          <Tr>
            {parsed.columns.map((col) => (
              <Th key={col}>{col}</Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {parsed.rows.map((row, idx) => (
            <Tr key={idx}>
              {parsed.columns.map((col) => (
                <Td key={col}>{row[col]}</Td>
              ))}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

export default SchemaTable;
