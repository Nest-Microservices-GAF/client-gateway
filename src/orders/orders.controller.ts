import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, Query, ParseUUIDPipe } from '@nestjs/common';


import { NATS_SERVICE } from 'src/config';
import { ClientProxy, Payload, RpcException } from '@nestjs/microservices';
import { PaginationDto } from 'src/common';
import { catchError, firstValueFrom } from 'rxjs';
import { CreateOrderDto, OrderPaginationDto, StatusDto } from './dto';

@Controller('orders')
export class OrdersController {
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) { }


  @Post()
  createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.client.send('createOrder', createOrderDto)
  }

  @Get()
  async findAllOrders(@Query() orderPaginationDto: OrderPaginationDto) {
   try {
    const orders = await firstValueFrom(

       this.client.send('findAllOrders', orderPaginationDto)
    )
    return orders
   } catch (error) {
    throw new RpcException(error)
   }
  }

  @Get('id/:id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.client.send('findOneOrder', { id })
      .pipe(
        catchError(err => { throw new RpcException(err) })
      )
  }
  @Get(':status')
  async findAllByStatus(
    @Param() statusDto: StatusDto,
    @Query()paginationDto: PaginationDto) {
   

   
    return this.client.send('findAllOrders', { ...paginationDto, status: statusDto.status })
      .pipe(
        catchError(err => { throw new RpcException(err) })
      )
  }

  
  @Patch(':id')
  changeStatus(
    @Param('id',ParseUUIDPipe) id: string,
    @Body()  statusDto: StatusDto,
  ){
    // return {
    //   id, ...statusDto
    // }
    try {
      return this.client.send('changeOrderStatus', {id, status: statusDto.status})
    } catch (error) {
      throw new RpcException(error)
    }

  }



}
