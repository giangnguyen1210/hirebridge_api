import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { JobBidsService } from './job-bids.service';
import { CreateJobBidDto } from './dto/create-job-bid.dto';
import { UpdateJobBidDto } from './dto/update-job-bid.dto';
import { ApiTags } from '@nestjs/swagger';
import { FilterJobBidDto } from './dto/filter-job-bid.dto';

@ApiTags('Bids')
@Controller('bids')
export class JobBidsController {
  constructor(private readonly bidsService: JobBidsService) {}

  @Post()
  create(@Body() createBidDto: CreateJobBidDto) {
    return this.bidsService.create(createBidDto);
  }

  @Get()
  findAll(@Query() filterJobBidDto: FilterJobBidDto) {
    return this.bidsService.findAll(filterJobBidDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bidsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBidDto: UpdateJobBidDto) {
    return this.bidsService.update(id, updateBidDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bidsService.remove(id);
  }
}
