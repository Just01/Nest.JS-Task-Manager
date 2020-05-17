import * as bcrypt from 'bcryptjs'
import { Test } from '@nestjs/testing'
import { UserRepository } from './user.repository'
import { ConflictException, InternalServerErrorException } from '@nestjs/common'
import { User } from './user.entity'

const credentials = { username: 'TestUser', password: 'TestPassword' }

describe('User Repository', () => {
  let userRepository

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ UserRepository ]
    }).compile()

    userRepository = await module.get<UserRepository>(UserRepository)
  })

  describe('signUp ', () => {
    let save

    beforeEach(() => {
      save = jest.fn()
      userRepository.create = jest.fn().mockResolvedValue({ save })
    })

    it('Successfully signs up new user',  () => {
      save.mockResolvedValue(undefined)
      expect(userRepository.signUp(credentials)).resolves.not.toThrow()
    })

    it('Throw an error, user exist. ConflictException', () => {
      save.mockRejectedValue({ code: '23505' })
      expect(userRepository.signUp(credentials)).rejects.toThrow(ConflictException)
    })

    it('Throw an error. InternalServerErrorException', () => {
      save.mockRejectedValue({ code: '2345456' })
      expect(userRepository.signUp(credentials)).rejects.toThrow(InternalServerErrorException)
    })
  })

  describe('validateUserPassword', () => {
    let user

    beforeEach(() => {
      userRepository.findOne = jest.fn()

      user = new User()
      user.username = 'TestUser'
      user.validatePassword = jest.fn()
    })


    it('Success. User exist. Returns username', async () => {
      userRepository.findOne.mockResolvedValue(user)
      user.validatePassword.mockResolvedValue(true)

      const result = await userRepository.validateUserPassword(credentials)
      expect(result).toEqual('TestUser')
    })

    it('Error. User does not exist. Returns null', async () => {
      userRepository.findOne.mockResolvedValue(null)

      const result = await userRepository.validateUserPassword(credentials)
      expect(user.validatePassword).not.toHaveBeenCalled()
      expect(result).toBeNull()
    })

    it('Error. Password does not exist. Returns null', async () => {
      userRepository.findOne.mockResolvedValue(user)
      user.validatePassword.mockResolvedValue(false)
      const result = await userRepository.validateUserPassword(credentials)
      expect(user.validatePassword).toHaveBeenCalled()
      expect(result).toBeNull()
    })
  })

  describe('hashPassword', () => {
    it('calls bcrypt.hash to generate a hash', async () => {
      bcrypt.hash = jest.fn().mockResolvedValue('testHash')
      expect(bcrypt.hash).not.toHaveBeenCalled()
      const result = await userRepository.hashPassword('testPassword', 'testSalt')
      expect(bcrypt.hash).toHaveBeenCalledWith('testPassword', 'testSalt')
      expect(result).toEqual('testHash')
    })
  })
})

