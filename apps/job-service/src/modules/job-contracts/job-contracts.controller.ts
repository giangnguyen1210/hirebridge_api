import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { JobContractsService } from './job-contracts.service';
import { CreateJobContractDto } from './dto/create-job-contract.dto';
import { UpdateJobContractDto } from './dto/update-job-contract.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Contracts')
@Controller('contracts')
export class JobContractsController {
  constructor(private readonly jobContractsService: JobContractsService) {}

  @Post()
  create(@Body() createJobContractDto: CreateJobContractDto) {
    return this.jobContractsService.create(createJobContractDto);
  }

  @Get()
  findAll() {
    return this.jobContractsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobContractsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateJobContractDto: UpdateJobContractDto) {
    return this.jobContractsService.update(+id, updateJobContractDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.jobContractsService.remove(+id);
  }
}
