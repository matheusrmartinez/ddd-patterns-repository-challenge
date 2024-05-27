import Order from '../../../../domain/checkout/entity/order';
import OrderItemModel from './order-item.model';
import OrderModel from './order.model';
import OrderItem from '../../../../domain/checkout/entity/order_item';

export default class OrderRepository {
  async create(entity: Order): Promise<void> {
    await OrderModel.create(
      {
        id: entity.id,
        customer_id: entity.customerId,
        total: entity.total(),
        items: entity.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,
        })),
      },
      {
        include: [{ model: OrderItemModel }],
      },
    );
  }

  async update(entity: Order): Promise<void> {
    await OrderModel.update(
      {
        total: entity.total(),
      },
      {
        where: {
          id: entity.id,
        },
      },
    );
    for (const item of entity.items) {
      const orderItem = await OrderItemModel.findOne({
        where: { id: item.id },
      });

      if (orderItem) {
        await OrderItemModel.update(
          {
            name: item.name,
            price: item.price,
            product_id: item.productId,
            quantity: item.quantity,
          },
          {
            where: {
              id: item.id,
            },
          },
        );
      } else {
        await OrderItemModel.create({
          id: item.id,
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,
          order_id: entity.id,
        });
      }
    }
  }

  async find(id: string): Promise<Order> {
    let orderModel: OrderModel;
    try {
      orderModel = await OrderModel.findOne({
        where: {
          id,
        },
        rejectOnEmpty: true,
        include: ['items'],
      });
    } catch (error) {
      throw new Error('Order not found');
    }

    const orderItems: OrderItem[] = orderModel.items.map((item) => {
      return new OrderItem(
        item.id,
        item.name,
        item.price,
        item.product_id,
        item.quantity,
      );
    });

    const order = new Order(orderModel.id, orderModel.customer_id, orderItems);
    return order;
  }

  async findAll(): Promise<Order[]> {
    let orderModel: OrderModel[];
    try {
      // TO-DO: Add pagination
      orderModel = await OrderModel.findAll({
        include: ['items'],
      });
    } catch (error) {
      throw new Error('Order not found');
    }

    const orders: Order[] = orderModel.map((order) => {
      const orderItems: OrderItem[] = order.items.map((item) => {
        return new OrderItem(
          item.id,
          item.name,
          item.price,
          item.product_id,
          item.quantity,
        );
      });

      return new Order(order.id, order.customer_id, orderItems);
    });

    return orders;
  }
}
