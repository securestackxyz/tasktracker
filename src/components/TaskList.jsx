import { useState, useEffect } from "react";
import {
  Box,
  Input,
  Button,
  Checkbox,
  VStack,
  HStack,
  Text,
} from "@chakra-ui/react";

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [streak, setStreak] = useState(0);

  // Handle adding a new task
  const addTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, { text: newTask, done: false }]);
      setNewTask("");
    }
  };

  // Handle checkbox toggle
  const toggleTask = (index) => {
    setTasks((prevTasks) =>
      prevTasks.map((task, i) =>
        i === index ? { ...task, done: !task.done } : task
      )
    );
  };

  // Reset tasks every 24 hours
  useEffect(() => {
    const resetTasks = () => {
      setTasks((prevTasks) =>
        prevTasks.map((task) => ({ ...task, done: false }))
      );
    };

    const interval = setInterval(resetTasks, 24 * 60 * 60 * 1000); // 24h
    return () => clearInterval(interval);
  }, []);

  // Update streak when all tasks are marked done
  useEffect(() => {
    if (tasks.length > 0 && tasks.every((task) => task.done)) {
      setStreak((prev) => prev + 1);
    }
  }, [tasks]);

  return (
    <Box
      w="400px"
      mx="auto"
      mt="50px"
      p="4"
      borderWidth="1px"
      borderRadius="lg"
    >
      <VStack spacing={4}>
        <HStack>
          <Input
            placeholder="Add a new task"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
          />
          <Button onClick={addTask}>Add</Button>
        </HStack>

        {tasks.map((task, index) => (
          <Checkbox
            key={index}
            isChecked={task.done}
            onChange={() => toggleTask(index)}
          >
            {task.text}
          </Checkbox>
        ))}

        <Text fontWeight="bold">Streak: {streak} days</Text>
      </VStack>
    </Box>
  );
}
