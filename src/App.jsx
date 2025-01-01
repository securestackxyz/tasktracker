import { Box } from "@chakra-ui/react";

import TaskList from "./components/TaskList";
import StreakCalendar from "./components/StreakCalendar";
import TaskTracker from "./components/TaskTracker";

export default function App() {
  return (
    <Box textAlign="center" p="4">
      <TaskTracker />
    </Box>
  );
}
