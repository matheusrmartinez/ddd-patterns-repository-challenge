import { Sequelize } from 'sequelize-typescript';
import Order from '../../../../domain/checkout/entity/order';
import OrderItem from '../../../../domain/checkout/entity/order_item';
import Customer from '../../../../domain/customer/entity/customer';
import Address from '../../../../domain/customer/value-object/address';
import Product from '../../../../domain/product/entity/product';
import CustomerModel from '../../../customer/repository/sequelize/customer.model';
import CustomerRepository from '../../../customer/repository/sequelize/customer.repository';
import ProductModel from '../../../product/repository/sequelize/product.model';
import ProductRepository from '../../../product/repository/sequelize/product.repository';
import OrderItemModel from './order-item.model';
import OrderModel from './order.model';
import OrderRepository from './order.repository';

describe('Order repository test', () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
      sync: { force: true },
    });

    await sequelize.addModels([
      CustomerModel,
      OrderModel,
      OrderItemModel,
      ProductModel,
    ]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  describe('should update an order', () => {
    it('update the existing item if it has the same id', async () => {
      const customerRepository = new CustomerRepository();
      const customer = new Customer('123', 'Customer 1');
      const address = new Address('Street 1', 1, 'Zipcode 1', 'City 1');
      customer.changeAddress(address);
      await customerRepository.create(customer);
      const productRepository = new ProductRepository();
      const product = new Product('123', 'Product 1', 10);
      await productRepository.create(product);
      const firstOrderItem = new OrderItem(
        '1',
        product.name,
        product.price,
        product.id,
        2,
      );
      const order = new Order('123', '123', [firstOrderItem]);
      const orderRepository = new OrderRepository();
      await orderRepository.create(order);
      const updatedOrderItem = new OrderItem(
        '1',
        product.name,
        product.price,
        product.id,
        3,
      );
      const updatedOrder = new Order('123', '123', [updatedOrderItem]);
      await orderRepository.update(updatedOrder);
      const orderModel = await OrderModel.findOne({
        where: { id: order.id },
        include: ['items'],
      });
      const orderFound = await orderRepository.find(order.id);
      expect(orderModel.toJSON()).toStrictEqual({
        id: orderFound.id,
        customer_id: orderFound.customerId,
        total: updatedOrder.total(),
        items: [
          {
            id: updatedOrderItem.id,
            name: updatedOrderItem.name,
            price: updatedOrderItem.price,
            quantity: updatedOrderItem.quantity,
            order_id: order.id,
            product_id: updatedOrderItem.productId,
          },
        ],
      });
    });
    it('add a new item if it has a different id', async () => {
      const customerRepository = new CustomerRepository();
      const customer = new Customer('123', 'Customer 1');
      const address = new Address('Street 1', 1, 'Zipcode 1', 'City 1');
      customer.changeAddress(address);
      await customerRepository.create(customer);
      const productRepository = new ProductRepository();
      const product = new Product('123', 'Product 1', 10);
      await productRepository.create(product);
      const firstOrderItem = new OrderItem(
        '1',
        product.name,
        product.price,
        product.id,
        2,
      );
      const order = new Order('123', '123', [firstOrderItem]);
      const orderRepository = new OrderRepository();
      await orderRepository.create(order);
      const secondOrderItem = new OrderItem(
        '2',
        product.name,
        product.price,
        product.id,
        3,
      );
      const updatedOrder = new Order('123', '123', [secondOrderItem]);
      await orderRepository.update(updatedOrder);
      const orderModel = await OrderModel.findOne({
        where: { id: order.id },
        include: ['items'],
      });
      const orderFound = await orderRepository.find(order.id);
      expect(orderModel.toJSON()).toStrictEqual({
        id: orderFound.id,
        customer_id: orderFound.customerId,
        total: updatedOrder.total(),
        items: [
          {
            id: firstOrderItem.id,
            name: firstOrderItem.name,
            price: firstOrderItem.price,
            quantity: firstOrderItem.quantity,
            order_id: order.id,
            product_id: firstOrderItem.productId,
          },
          {
            id: secondOrderItem.id,
            name: secondOrderItem.name,
            price: secondOrderItem.price,
            quantity: secondOrderItem.quantity,
            order_id: order.id,
            product_id: secondOrderItem.productId,
          },
        ],
      });
    });
  });
  it('should create a new order', async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer('123', 'Customer 1');
    const address = new Address('Street 1', 1, 'Zipcode 1', 'City 1');
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product('123', 'Product 1', 10);
    await productRepository.create(product);

    const orderItem = new OrderItem(
      '1',
      product.name,
      product.price,
      product.id,
      2,
    );

    const order = new Order('123', '123', [orderItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ['items'],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: '123',
      customer_id: '123',
      total: order.total(),
      items: [
        {
          id: orderItem.id,
          name: orderItem.name,
          price: orderItem.price,
          quantity: orderItem.quantity,
          order_id: '123',
          product_id: '123',
        },
      ],
    });
  });
  it('should find an order', async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer('123', 'Customer 1');
    const address = new Address('Street 1', 1, 'Zipcode 1', 'City 1');
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product('123', 'Product 1', 10);
    await productRepository.create(product);

    const orderItem = new OrderItem(
      '1',
      product.name,
      product.price,
      product.id,
      2,
    );

    const order = new Order('123', '123', [orderItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderFound = await orderRepository.find(order.id);
    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ['items'],
    });
    const orderItemDB = orderFound.items[0];

    expect(orderModel.toJSON()).toStrictEqual({
      id: '123',
      customer_id: '123',
      total: order.total(),
      items: [
        {
          id: orderItemDB.id,
          name: orderItemDB.name,
          price: orderItemDB.price,
          quantity: orderItemDB.quantity,
          order_id: '123',
          product_id: '123',
        },
      ],
    });
  });
  it('should find all orders', async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer('123', 'Customer 1');
    const address = new Address('Street 1', 1, 'Zipcode 1', 'City 1');
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const firstProduct = new Product('123', 'Product 1', 10);
    await productRepository.create(firstProduct);

    const firstOrderItem = new OrderItem(
      '1',
      firstProduct.name,
      firstProduct.price,
      firstProduct.id,
      2,
    );

    const firstOrder = new Order('123', '123', [firstOrderItem]);
    const orderRepository = new OrderRepository();
    await orderRepository.create(firstOrder);

    const secondProduct = new Product('321', 'Product 2', 20);
    await productRepository.create(secondProduct);

    const orderItem = new OrderItem(
      '2',
      secondProduct.name,
      secondProduct.price,
      secondProduct.id,
      2,
    );

    const secondOrder = new Order('321', '123', [orderItem]);

    await orderRepository.create(secondOrder);

    const orderFound = await orderRepository.findAll();
    const orderModel = await OrderModel.findAll({
      include: ['items'],
    });

    expect(orderFound).toHaveLength(2);
    orderModel.forEach((orderModel) => {
      const order = orderFound.find((order) => order.id === orderModel.id);
      const orderItem = order.items[0];
      expect(orderModel.toJSON()).toStrictEqual({
        id: order.id,
        customer_id: order.customerId,
        total: order.total(),
        items: [
          {
            id: orderItem.id,
            name: orderItem.name,
            price: orderItem.price,
            quantity: orderItem.quantity,
            order_id: order.id,
            product_id: orderItem.productId,
          },
        ],
      });
    });
  });
});
