import { Box, SimpleGrid, Tooltip } from "@chakra-ui/react";

export default function StreakCalendar({ streak }) {
  const days = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    completed: i < streak,
  }));

  return (
    <Box mt="20px">
      <SimpleGrid columns={7} spacing={2}>
        {days.map(({ day, completed }, i) => (
          <Tooltip key={i} label={`Day ${day}`}>
            <Box
              w="20px"
              h="20px"
              bg={completed ? "green.400" : "gray.200"}
              borderRadius="md"
            />
          </Tooltip>
        ))}
      </SimpleGrid>
    </Box>
  );
}
