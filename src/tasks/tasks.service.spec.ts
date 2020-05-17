import { Test } from '@nestjs/testing'
import { TasksService } from './tasks.service'
import { TaskRepository } from './task.repository'
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto'
import { TaskStatus } from './task-status.enum'
import { NotFoundException } from '@nestjs/common'
import { CreateTaskDto } from './dto/create-task.dto'

const mockUser = { id: 1, username: 'Test user' }

const mockTaskRepository = () =>({
  getTasks: jest.fn(),
  findOne: jest.fn(),
  createTask: jest.fn(),
  delete: jest.fn(),
  save: jest.fn(),
})

describe('Task Service', () => {
  let tasksService
  let taskRepository

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TaskRepository,
          useFactory: mockTaskRepository }
        ]
    }).compile()

    tasksService = await module.get<TasksService>(TasksService)
    taskRepository = await module.get<TaskRepository>(TaskRepository)
  })

  describe('getTasks ', () => {
    it('gets all tasks from the repository', async () => {
      taskRepository.getTasks.mockResolvedValue('somevalue')

      expect(taskRepository.getTasks).not.toHaveBeenCalled()
      const filters: GetTasksFilterDto = { status: TaskStatus.OPEN, search: 'Some search' }
      const result = await tasksService.getTasks(filters, mockUser)
      expect(taskRepository.getTasks).toHaveBeenCalled()
      expect(result).toEqual('somevalue')
    })
  })

  describe('getTaskById ', () => {
    it('calls taskRepository.findOne() and successfully return the result', async () => {
      const mockTask = { title: 'Title', description: 'Description' }
      taskRepository.findOne.mockResolvedValue(mockTask)

      const result = await tasksService.getTaskById(1, mockUser)
      expect(result).toEqual(mockTask)

      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: 1,
          userId: mockUser.id
        }
      })
    })

    it('calls taskRepository.findOne() and failed return the result', async () => {
      taskRepository.findOne.mockResolvedValue(null)
      await expect(tasksService.getTaskById(1, mockUser))
        .rejects
        .toThrow(NotFoundException)
    })
  })

  describe('createTask ', () => {
    it('create new task with taskRepository.createTask()', async () => {
      const task: CreateTaskDto = { title: 'Title', description: 'Description' }
      taskRepository.createTask.mockResolvedValue(task)

      const result = await tasksService.createTask(task, mockUser)
      expect(result).toEqual(task)
    })
  })

  describe('deleteTask ', () => {
    it('delete task with taskRepository.delete() successfully', async () => {
      taskRepository.delete.mockResolvedValue({ affected: 1 })
      await tasksService.deleteTask(1, mockUser)
      expect(taskRepository.delete).toHaveBeenCalledWith({ id: 1, userId: mockUser.id })
    })

    it('delete task with taskRepository.delete() failed', async () => {
      taskRepository.delete.mockResolvedValue({ affected: 0 })
      await expect(tasksService.deleteTask(1, mockUser))
        .rejects
        .toThrow(NotFoundException)
    })
  })

  describe('updateTaskStatus ', () => {
    it('update new task status', async () => {
      const save = jest.fn().mockResolvedValue(true)
      tasksService.getTaskById = jest.fn().mockResolvedValue({
        status: TaskStatus.DONE,
        save,
      })

      expect(tasksService.getTaskById).not.toHaveBeenCalled()
      expect(save).not.toHaveBeenCalled()
      const result = await tasksService.updateTaskStatus(1, TaskStatus.DONE, mockUser)
      expect(tasksService.getTaskById).toHaveBeenCalled()
      expect(save).toHaveBeenCalled()
      expect(result.status).toEqual(TaskStatus.DONE)
    })
  })
})

