import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  format,
  eachDayOfInterval,
  subDays,
  isEqual,
  startOfWeek,
} from "date-fns";
import {
  AlertCircle,
  ChevronDown,
  PlusCircle,
  RotateCw,
  Trash2,
} from "lucide-react";
import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Input,
  Tooltip,
  Box,
  Text,
  Flex,
  Grid,
  VStack,
  HStack,
  useColorModeValue,
} from "@chakra-ui/react";

const MotionBox = motion(Box);

const priorities = {
  low: { label: "Low", color: "blue.100", textColor: "blue.700" },
  medium: { label: "Medium", color: "yellow.100", textColor: "yellow.700" },
  high: { label: "High", color: "red.100", textColor: "red.700" },
};

const categories = [
  { id: "work", label: "Work", color: "purple.100", textColor: "purple.700" },
  {
    id: "personal",
    label: "Personal",
    color: "green.100",
    textColor: "green.700",
  },
  {
    id: "health",
    label: "Health",
    color: "orange.100",
    textColor: "orange.700",
  },
];

const StreakCalendar = ({ streakData }) => {
  const today = new Date();
  const daysToShow = 70;
  const dates = eachDayOfInterval({
    start: subDays(today, daysToShow - 1),
    end: today,
  });

  const monthGroups = dates.reduce((acc, date) => {
    const month = format(date, "MMM");
    if (!acc[month]) acc[month] = [];
    acc[month].push(date);
    return acc;
  }, {});

  const weekDays = eachDayOfInterval({
    start: startOfWeek(dates[0]),
    end: subDays(startOfWeek(dates[0]), -6),
  }).map((date) => format(date, "EEE"));

  const squareBg = useColorModeValue("gray.100", "gray.800");

  return (
    <VStack spacing={2} align="stretch">
      <Grid templateColumns="50px repeat(14, 1fr)" gap={1}>
        <Box />
        {weekDays.map((day) => (
          <Text key={day} fontSize="xs" color="gray.500" textAlign="center">
            {day}
          </Text>
        ))}
      </Grid>

      {Object.entries(monthGroups).map(([month, monthDates]) => (
        <Flex key={month} align="center">
          <Text w="50px" fontSize="xs" color="gray.500">
            {month}
          </Text>
          <Grid templateColumns="repeat(14, 1fr)" gap={1} flex={1}>
            {monthDates.map((date) => (
              <Tooltip
                key={date.toISOString()}
                label={`${format(date, "MMM d, yyyy")}: ${
                  streakData.some((d) => isEqual(new Date(d), date))
                    ? "Completed"
                    : "Not completed"
                }`}
              >
                <Box
                  aspectRatio={1}
                  rounded="sm"
                  transition="all 0.2s"
                  _hover={{ transform: "scale(1.5)" }}
                  bg={
                    streakData.some((d) => isEqual(new Date(d), date))
                      ? "linear-gradient(to bottom right, green.400, green.500)"
                      : squareBg
                  }
                />
              </Tooltip>
            ))}
          </Grid>
        </Flex>
      ))}
    </VStack>
  );
};

const StatisticsPanel = ({ tasks, streak }) => (
  <Grid templateColumns="repeat(3, 1fr)" gap={4} mt={4}>
    <Box bg={useColorModeValue("gray.50", "gray.800")} p={4} rounded="lg">
      <Text fontSize="sm" color="gray.500">
        Total
      </Text>
      <Text fontSize="2xl" fontWeight="bold">
        {tasks.length}
      </Text>
    </Box>
    <Box bg={useColorModeValue("gray.50", "gray.800")} p={4} rounded="lg">
      <Text fontSize="sm" color="gray.500">
        Completed
      </Text>
      <Text fontSize="2xl" fontWeight="bold">
        {tasks.filter((t) => t.completed).length}
      </Text>
    </Box>
    <Box bg={useColorModeValue("gray.50", "gray.800")} p={4} rounded="lg">
      <Text fontSize="sm" color="gray.500">
        Streak
      </Text>
      <Text fontSize="2xl" fontWeight="bold">
        {streak}
      </Text>
    </Box>
  </Grid>
);

const TaskTracker = () => {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("tasks");
    return saved ? JSON.parse(saved) : [];
  });
  const [newTask, setNewTask] = useState("");
  const [streak, setStreak] = useState(() => {
    const saved = localStorage.getItem("streak");
    return saved ? JSON.parse(saved) : 0;
  });
  const [streakData, setStreakData] = useState(() => {
    const saved = localStorage.getItem("streakData");
    return saved ? JSON.parse(saved) : [];
  });
  const [lastCompletedDate, setLastCompletedDate] = useState(() => {
    const saved = localStorage.getItem("lastCompletedDate");
    return saved ? JSON.parse(saved) : null;
  });
  const [deletedTasks, setDeletedTasks] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    localStorage.setItem("streak", JSON.stringify(streak));
    localStorage.setItem(
      "lastCompletedDate",
      JSON.stringify(lastCompletedDate)
    );
    localStorage.setItem("streakData", JSON.stringify(streakData));
  }, [tasks, streak, lastCompletedDate, streakData]);

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([
        ...tasks,
        {
          id: Date.now(),
          text: newTask,
          completed: false,
          priority: "medium",
          category: "personal",
          dueTime: null,
          notes: "",
          createdAt: new Date().toISOString(),
        },
      ]);
      setNewTask("");
    }
  };

  const toggleTask = (taskId) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);

    const allCompleted = updatedTasks.every((task) => task.completed);
    if (allCompleted) {
      const today = new Date();
      const todayString = today.toDateString();
      if (lastCompletedDate !== todayString) {
        setStreak((prev) => prev + 1);
        setLastCompletedDate(todayString);
        setStreakData((prev) => [...prev, today.toISOString()]);
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
      }
    }
  };

  const deleteTask = (taskId) => {
    const taskToDelete = tasks.find((t) => t.id === taskId);
    setDeletedTasks((prev) => [...prev.slice(-4), taskToDelete]);
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const undoDelete = () => {
    if (deletedTasks.length) {
      const taskToRestore = deletedTasks[deletedTasks.length - 1];
      setTasks((prev) => [...prev, taskToRestore]);
      setDeletedTasks((prev) => prev.slice(0, -1));
    }
  };

  const updateTaskDetails = (taskId, updates) => {
    setTasks(
      tasks.map((task) => (task.id === taskId ? { ...task, ...updates } : task))
    );
  };

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Box
      minH="100vh"
      w="100%"
      bg={useColorModeValue("gray.50", "gray.900")}
      /*  p={8} */
    >
      <Box maxW="2xl" mx="auto">
        <Card w="100%">
          <CardHeader>
            <VStack spacing={4}>
              <Flex justify="space-between" w="full" align="center">
                <Text fontSize="2xl" fontWeight="bold">
                  Daily Tasks
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Streak: {streak} days
                </Text>
              </Flex>
              <StreakCalendar streakData={streakData} />
              <StatisticsPanel tasks={tasks} streak={streak} />
            </VStack>
          </CardHeader>

          <CardBody>
            <VStack spacing={4}>
              <HStack w="full">
                <Input
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addTask()}
                  placeholder="Add a new task..."
                  flex={1}
                />
                <Button
                  onClick={addTask}
                  bg="black"
                  color="white"
                  _hover={{ bg: "gray.800" }}
                  leftIcon={<PlusCircle size={16} />}
                >
                  Add
                </Button>
              </HStack>

              <AnimatePresence>
                {tasks.map((task) => (
                  <MotionBox
                    key={task.id}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    role="group"
                    p={4}
                    bg={cardBg}
                    rounded="lg"
                    shadow="sm"
                    borderWidth={1}
                    borderColor={borderColor}
                    _hover={{ shadow: "md" }}
                    transition="all 0.2s"
                  >
                    <Flex align="center" gap={3}>
                      <Checkbox
                        isChecked={task.completed}
                        onChange={() => toggleTask(task.id)}
                        _hover={{ transform: "scale(1.1)" }}
                      />

                      <Box flex={1} minW={0}>
                        <HStack>
                          <Box
                            px={2}
                            py={0.5}
                            rounded="full"
                            bg={priorities[task.priority].color}
                            color={priorities[task.priority].textColor}
                            fontSize="sm"
                          >
                            {priorities[task.priority].label}
                          </Box>
                          <Box
                            px={2}
                            py={0.5}
                            rounded="full"
                            bg={
                              categories.find((c) => c.id === task.category)
                                .color
                            }
                            color={
                              categories.find((c) => c.id === task.category)
                                .textColor
                            }
                            fontSize="sm"
                          >
                            {
                              categories.find((c) => c.id === task.category)
                                .label
                            }
                          </Box>
                        </HStack>
                        <Text
                          mt={1}
                          textDecoration={
                            task.completed ? "line-through" : "none"
                          }
                          color={task.completed ? "gray.500" : "inherit"}
                        >
                          {task.text}
                        </Text>
                        {task.notes && (
                          <Text mt={1} fontSize="sm" color="gray.500">
                            {task.notes}
                          </Text>
                        )}
                      </Box>

                      <HStack
                        opacity={0}
                        _groupHover={{ opacity: 1 }}
                        transition="opacity 0.2s"
                      >
                        <Menu>
                          <MenuButton as={Button} variant="ghost" size="sm">
                            <ChevronDown size={16} />
                          </MenuButton>
                          <MenuList>
                            {Object.entries(priorities).map(
                              ([key, { label }]) => (
                                <MenuItem
                                  key={key}
                                  onClick={() =>
                                    updateTaskDetails(task.id, {
                                      priority: key,
                                    })
                                  }
                                >
                                  Set Priority: {label}
                                </MenuItem>
                              )
                            )}
                            {categories.map((category) => (
                              <MenuItem
                                key={category.id}
                                onClick={() =>
                                  updateTaskDetails(task.id, {
                                    category: category.id,
                                  })
                                }
                              >
                                Set Category: {category.label}
                              </MenuItem>
                            ))}
                          </MenuList>
                        </Menu>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTask(task.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </HStack>
                    </Flex>
                  </MotionBox>
                ))}
              </AnimatePresence>

              {deletedTasks.length > 0 && (
                <Alert status="info">
                  <AlertCircle size={16} />
                  <AlertDescription display="flex" alignItems="center" gap={2}>
                    Task deleted
                    <Button
                      variant="link"
                      size="sm"
                      p={0}
                      h="auto"
                      fontWeight="normal"
                      onClick={undoDelete}
                      leftIcon={<RotateCw size={16} />}
                    >
                      Undo
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              {tasks.length === 0 && (
                <Text textAlign="center" color="gray.500" py={4}>
                  No tasks added yet. Add your first task above!
                </Text>
              )}
            </VStack>
          </CardBody>
        </Card>

        <AnimatePresence>
          {showCelebration && (
            <MotionBox
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              position="fixed"
              bottom={4}
              right={4}
              bg="green.500"
              color="white"
              p={4}
              rounded="lg"
              shadow="lg"
            >
              🎉 Congratulations! All tasks completed!
            </MotionBox>
          )}
        </AnimatePresence>
      </Box>
    </Box>
  );
};

export default TaskTracker;
