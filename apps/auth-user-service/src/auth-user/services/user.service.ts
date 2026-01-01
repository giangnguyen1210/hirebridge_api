import { BadRequestException, Inject, Injectable, NotFoundException, OnModuleInit } from "@nestjs/common";
import { UsersRepository } from "../repositories/user.repository";
import { DataSource } from "typeorm";
import { RegisterUserDto } from "../dtos/register-user.dto";
import { User } from "../entities/user.entity";
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from "../dtos/update-user.dto";
import { UserStatus } from "@app/common";
import { generateRandomActiveCode } from "../../helpers/string.helper";
import { ClientKafka } from "@nestjs/microservices";

@Injectable()
export class UsersService implements OnModuleInit{
  constructor(
    private dataSource: DataSource,
    private usersRepository: UsersRepository,
    @Inject('NOTIFICATION_SERVICE') private readonly notificationClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.notificationClient.subscribeToResponseOf('user_created'); // Only needed for Request/Response, not Event
    await this.notificationClient.connect();
  }

  async registerUser(registerUserDto: RegisterUserDto) {
    const { email, username } = registerUserDto;

    const existingUser = await this.usersRepository.existsByEmailOrUsername(email, username);

    if (existingUser) {
      if (existingUser.email === email) {
        throw new BadRequestException(`User ${email} already exists`);
      }
      throw new BadRequestException(`User ${username} already exists`);
    }

    const hash = await bcrypt.hash(registerUserDto.password, 10);
    registerUserDto.password = hash;
    const newUser = this.usersRepository.create(registerUserDto);
    newUser.activateToken = generateRandomActiveCode(6);
    newUser.tokenExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    await this.usersRepository.save(newUser);

    // TODO: Send activation email with the activateToken
    this.notificationClient.emit('user_created', {
      email: newUser.email,
      name: newUser.firstname + ' ' + newUser.lastname,
      token: newUser.activateToken,
    });
    return {
      message: `Successfully register user`,
      result: "success"
    }
  }

  async verifyUser(email: string, code: string) {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new BadRequestException(`User with email ${email} not found`);
    }
    if (user.status === UserStatus.ACTIVE) {
      throw new BadRequestException(`User is already active`);
    }
    if (user.activateToken !== code) {
      throw new BadRequestException(`Invalid activation code`);
    }
    if (user.tokenExpire && user.tokenExpire < new Date()) {
      throw new BadRequestException(`Activation code has expired`);
    }

    user.status = UserStatus.ACTIVE;
    user.activateToken = null;
    user.tokenExpire = null;

    await this.usersRepository.save(user);
    return {
      message: "Verify successfully",
      data: user
    };
  }
  
  async findOne(id: string) {
    const user = await this.usersRepository.findOne({
      where: { id }
    });
    console.log("🚀 ~ UsersService ~ findOne ~ user:", user)

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return {
      data: user,
      message: "Get data success"
    }
  }

  async resendActivateCode(id: string) {

  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { email } });
  }

  async update(id: string, updateDto: UpdateUserDto) {
    const user = await this.usersRepository.findOne({
      where: { id, }
    })
  }

  async findAll(page: number = 1, take: number = 10) {
    const [result, total] = await this.usersRepository.findAndCount({
      skip: (page - 1) * take,
      take: take,
    });

    // const meta = new PageMetaDto({ page, take }, total);
    
    // Return an object with 'result' so our Interceptor picks it up cleanly
    return { 
      result: result, 
      // meta: meta 
    };
  }
}
