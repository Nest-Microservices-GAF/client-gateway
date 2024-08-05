import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, Query, ParseUUIDPipe } from '@nestjs/common';


import { ORDER_SERVICE } from 'src/config';
import { ClientProxy, Payload, RpcException } from '@nestjs/microservices';
import { PaginationDto } from 'src/common';
import { catchError } from 'rxjs';
import { CreateOrderDto, OrderPaginationDto, StatusDto } from './dto';

@Controller('orders')
export class OrdersController {
  constructor(@Inject(ORDER_SERVICE) private readonly ordersClient: ClientProxy) { }


  @Post()
  createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersClient.send('createOrder', createOrderDto)
  }

  @Get()
  findAllOrders(@Query() orderPaginationDto: OrderPaginationDto) {
    return this.ordersClient.send('findAllOrders', orderPaginationDto);
  }

  @Get('id/:id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersClient.send('findOneOrder', { id })
      .pipe(
        catchError(err => { throw new RpcException(err) })
      )
  }
  @Get(':status')
  async findAllByStatus(
    @Param() statusDto: StatusDto,
    @Query()paginationDto: PaginationDto) {
   

   
    return this.ordersClient.send('findAllOrders', { ...paginationDto, status: statusDto.status })
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
      return this.ordersClient.send('changeOrderStatus', {id, status: statusDto.status})
    } catch (error) {
      throw new RpcException(error)
    }

  }



}
