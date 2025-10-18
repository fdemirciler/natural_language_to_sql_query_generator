import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Badge,
  useColorModeValue,
  SimpleGrid,
  Tooltip,
  HStack,
  Icon,
  VStack,
} from '@chakra-ui/react';
import { InfoIcon } from '@chakra-ui/icons';

// Custom relationship lines renderer component
const RelationshipLine = ({ from, to, fromTable, toTable }) => {
  const lineColor = useColorModeValue('gray.300', 'gray.600');
  const [path, setPath] = useState(null);
  
  useEffect(() => {
    if (from && to) {
      const fromRect = from.getBoundingClientRect();
      const toRect = to.getBoundingClientRect();
      
      // Calculate start and end points
      const fromX = fromRect.left + fromRect.width;
      const fromY = fromRect.top + fromRect.height / 2;
      const toX = toRect.left;
      const toY = toRect.top + toRect.height / 2;
      
      // Adjust for scroll
      const scrollX = window.pageXOffset;
      const scrollY = window.pageYOffset;
      
      // Create SVG path
      setPath(`M${fromX + scrollX},${fromY + scrollY} C${fromX + 40 + scrollX},${fromY + scrollY} ${toX - 40 + scrollX},${toY + scrollY} ${toX + scrollX},${toY + scrollY}`);
    }
  }, [from, to]);
  
  if (!path) return null;
  
  return (
    <svg 
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        pointerEvents: 'none',
        zIndex: 1
      }}
    >
      <path 
        d={path} 
        stroke={lineColor} 
        strokeWidth="1" 
        fill="none" 
        strokeDasharray="3 3"
      />
    </svg>
  );
};

// Schema table card component
const TableCard = ({ table, columns, expanded, onClick, cardRef }) => {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const headerBg = useColorModeValue('gray.50', 'gray.800');
  const headerColor = useColorModeValue('gray.600', 'gray.100');
  const activeHeaderBg = useColorModeValue('gray.100', 'gray.700');
  const typeColor = useColorModeValue('gray.500', 'gray.400');
  
  return (
    <Box 
      ref={cardRef}
      borderWidth="1px" 
      borderRadius="lg" 
      overflow="hidden" 
      borderColor={expanded ? borderColor : borderColor}
      bg={bg}
      boxShadow={expanded ? "md" : "sm"}
      transition="all 0.2s"
      cursor="pointer"
      onClick={onClick}
      position="relative"
      zIndex={expanded ? 10 : 1}
      _hover={{ boxShadow: expanded ? "md" : "md" }}
      height={expanded ? "auto" : "auto"}
    >
      <Box p={3} bg={expanded ? activeHeaderBg : headerBg}>
        <Heading size="sm" color={headerColor}>
          {table}
        </Heading>
      </Box>
      
      {expanded && (
        <VStack p={3} align="stretch" spacing={1} divider={<Box borderBottom="1px" borderColor={borderColor} />}>
          {columns.map((col, index) => (
            <Flex key={index} justify="space-between" py={1}>
              <Text>{col.name}</Text>
              <Text fontSize="sm" color={typeColor}>{col.type}</Text>
            </Flex>
          ))}
        </VStack>
      )}
    </Box>
  );
};

const SchemaVisualizer = ({ schema }) => {
  const [expandedTable, setExpandedTable] = useState(null);
  const tableRefs = useRef({});
  const [relationships, setRelationships] = useState([]);

  // Process schema to identify relationships
  useEffect(() => {
    if (!schema) return;

    const rels = [];

    // For the World database, add known relationships
    rels.push({
      from: 'city',
      fromColumn: 'countrycode',
      to: 'country',
      toColumn: 'code'
    });

    rels.push({
      from: 'countrylanguage',
      fromColumn: 'countrycode',
      to: 'country',
      toColumn: 'code'
    });

    setRelationships(rels);
  }, [schema]);

  // Process the schema from props into the format needed by TableCard
  const processedSchema = {};
  if (schema && schema.tables) {
    schema.tables.forEach(table => {
      processedSchema[table.name] = table.columns.map(column => ({
        name: column.name,
        type: column.data_type
      }));
    });
  }

  // Function to handle card click
  const handleCardClick = (tableName) => {
    setExpandedTable(expandedTable === tableName ? null : tableName);
  };
  
  return (
    <Box position="relative" p={3} pb={2}>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
        {Object.keys(processedSchema).map((tableName) => (
          <TableCard
            key={tableName}
            table={tableName}
            columns={processedSchema[tableName]}
            expanded={expandedTable === tableName}
            onClick={() => handleCardClick(tableName)}
            cardRef={(el) => (tableRefs.current[tableName] = el)}
          />
        ))}
      </SimpleGrid>
      
      {/* Render relationship lines */}
      {expandedTable && relationships
        .filter(rel => rel.from === expandedTable || rel.to === expandedTable)
        .map((rel, index) => {
          if (!tableRefs.current[rel.from] || !tableRefs.current[rel.to]) return null;
          
          return (
            <RelationshipLine
              key={index}
              from={tableRefs.current[rel.from]}
              to={tableRefs.current[rel.to]}
              fromTable={rel.from}
              toTable={rel.to}
            />
          );
        })
      }
    </Box>
  );
};

export default SchemaVisualizer;
