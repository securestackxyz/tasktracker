import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  format,
  eachDayOfInterval,
  subDays,
  isEqual,
  startOfWeek,
  isSameDay,
  startOfDay,
} from "date-fns";
import {
  AlertCircle,
  ChevronDown,
  PlusCircle,
  RotateCw,
  Trash2,
  Moon,
  Sun,
  Edit2,
  Check,
  X,
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
  useColorMode,
  Switch,
  IconButton,
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
                  borderRadius="5px"
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
  const [isTaskDaily, setIsTaskDaily] = useState(true);
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
  const [lastCheckedDate, setLastCheckedDate] = useState(() => {
    const saved = localStorage.getItem("lastCheckedDate");
    return saved ? new Date(JSON.parse(saved)) : new Date();
  });
  const [deletedTasks, setDeletedTasks] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const { colorMode, toggleColorMode } = useColorMode();

  useEffect(() => {
    const currentDate = startOfDay(new Date());
    const lastChecked = startOfDay(new Date(lastCheckedDate));

    if (!isSameDay(currentDate, lastChecked)) {
      setTasks((prevTasks) =>
        prevTasks.map((task) => ({
          ...task,
          completed: task.isDaily ? false : task.completed,
        }))
      );
      setLastCheckedDate(currentDate);
    }
  }, [lastCheckedDate]);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    localStorage.setItem("streak", JSON.stringify(streak));
    localStorage.setItem(
      "lastCompletedDate",
      JSON.stringify(lastCompletedDate)
    );
    localStorage.setItem("streakData", JSON.stringify(streakData));
    localStorage.setItem("lastCheckedDate", JSON.stringify(lastCheckedDate));
  }, [tasks, streak, lastCompletedDate, streakData, lastCheckedDate]);

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
          isDaily: isTaskDaily,
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

  const startEditing = (taskId, taskText) => {
    setEditingTaskId(taskId);
    setEditingText(taskText);
  };

  const saveEdit = (taskId) => {
    if (editingText.trim()) {
      setTasks(
        tasks.map((task) =>
          task.id === taskId ? { ...task, text: editingText.trim() } : task
        )
      );
    }
    setEditingTaskId(null);
    setEditingText("");
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditingText("");
  };

  const updateTaskDetails = (taskId, updates) => {
    setTasks(
      tasks.map((task) => (task.id === taskId ? { ...task, ...updates } : task))
    );
  };

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Box minH="100vh" w="100%" bg={useColorModeValue("gray.50", "gray.900")}>
      <Box maxW="2xl" mx="auto">
        <Card w="100%">
          <CardHeader>
            <VStack spacing={4}>
              <Flex justify="space-between" w="full" align="center">
                <Text fontSize="2xl" fontWeight="bold">
                  Daily Tasks
                </Text>
                <HStack spacing={4}>
                  <Text fontSize="sm" color="gray.500">
                    Streak: {streak} days
                  </Text>
                  <Button onClick={toggleColorMode} variant="ghost" size="sm">
                    {colorMode === "light" ? (
                      <Moon size={16} />
                    ) : (
                      <Sun size={16} />
                    )}
                  </Button>
                </HStack>
              </Flex>
              <StreakCalendar streakData={streakData} />
              <StatisticsPanel tasks={tasks} streak={streak} />
            </VStack>
          </CardHeader>

          <CardBody>
            <VStack spacing={4}>
              <VStack w="full" spacing={2}>
                <Input
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addTask()}
                  placeholder="Add a new task..."
                  _focus={{
                    borderColor: "black",
                    boxShadow: "0 0 0 1px black",
                  }}
                />
                <Flex w="full" justify="space-between" align="center">
                  <HStack>
                    <Switch
                      isChecked={isTaskDaily}
                      onChange={(e) => setIsTaskDaily(e.target.checked)}
                      sx={{
                        "& .chakra-switch__track": {
                          bg: "gray.200",
                        },
                        "& .chakra-switch__track[data-checked]": {
                          bg: "black",
                        },
                      }}
                    />
                    <Text fontSize="sm" color="gray.500">
                      Reset daily
                    </Text>
                  </HStack>
                  <Button
                    onClick={addTask}
                    bg="black"
                    color="white"
                    _hover={{ bg: "gray.800" }}
                    leftIcon={<PlusCircle size={16} />}
                  >
                    Add
                  </Button>
                </Flex>
              </VStack>

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
                    width="100%"
                  >
                    <Flex w="100%" align="center" gap={3}>
                      <Checkbox
                        isChecked={task.completed}
                        onChange={() => toggleTask(task.id)}
                        _hover={{ transform: "scale(1.1)" }}
                        sx={{
                          "& .chakra-checkbox__control": {
                            bg: "gray.200",
                            borderRadius: "3px",
                          },
                          "& .chakra-checkbox__control[data-checked]": {
                            bg: "black",
                            borderColor: "black",
                            borderRadius: "3px",
                          },
                        }}
                      />

                      <Box flex={1} minW={0} w="100%">
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
                          {task.isDaily && (
                            <Box
                              px={2}
                              py={0.5}
                              rounded="full"
                              bg="gray.100"
                              color="gray.700"
                              fontSize="sm"
                            >
                              Daily
                            </Box>
                          )}
                        </HStack>

                        {editingTaskId === task.id ? (
                          <Flex mt={1} gap={2} align="center">
                            <Input
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              onKeyPress={(e) =>
                                e.key === "Enter" && saveEdit(task.id)
                              }
                              autoFocus
                              size="sm"
                            />
                            <IconButton
                              icon={<Check size={16} />}
                              size="sm"
                              colorScheme="green"
                              onClick={() => saveEdit(task.id)}
                              aria-label="Save edit"
                            />
                            <IconButton
                              icon={<X size={16} />}
                              size="sm"
                              colorScheme="red"
                              onClick={cancelEdit}
                              aria-label="Cancel edit"
                            />
                          </Flex>
                        ) : (
                          <Text
                            mt={1}
                            textAlign="left"
                            textDecoration={
                              task.completed ? "line-through" : "none"
                            }
                            color={task.completed ? "gray.500" : "inherit"}
                          >
                            {task.text}
                          </Text>
                        )}

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
                        {editingTaskId !== task.id && (
                          <IconButton
                            variant="ghost"
                            size="sm"
                            icon={<Edit2 size={16} />}
                            onClick={() => startEditing(task.id, task.text)}
                            aria-label="Edit task"
                          />
                        )}
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
                            <MenuItem
                              onClick={() =>
                                updateTaskDetails(task.id, {
                                  isDaily: !task.isDaily,
                                })
                              }
                            >
                              {task.isDaily
                                ? "Remove Daily Reset"
                                : "Set as Daily Reset"}
                            </MenuItem>
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
                <Alert borderRadius="10px" status="info">
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
