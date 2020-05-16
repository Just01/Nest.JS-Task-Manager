import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { AuthService } from './auth.service';
import { Logger } from '@nestjs/common'

const logger = new Logger('Auth Controller Logger')

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
  ) {}


  @Post('signup')
  signUp(@Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto): Promise<void> {
    return this.authService.signUp(authCredentialsDto);
  }

  @Post('signin')
  signIn(@Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto): Promise<{ token: string }> {
    logger.verbose(`Singing in user with user name ${authCredentialsDto.username}`)
    return this.authService.signIn(authCredentialsDto);
  }
}
