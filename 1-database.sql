-- (A) ITEMS
CREATE TABLE `items` (
  `item_id` bigint(20) NOT NULL,
  `item_name` varchar(255) NOT NULL,
  `item_price` decimal(12,2) NOT NULL,
  `item_image` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE `items`
  ADD PRIMARY KEY (`item_id`),
  ADD KEY `item_name` (`item_name`);

ALTER TABLE `items`
  MODIFY `item_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

INSERT INTO `items` (`item_id`, `item_name`, `item_price`, `item_image`) VALUES
(1, 'Banana', '1.20', 'banana.png'),
(2, 'Cherry', '2.30', 'cherry.png'),
(3, 'Ice Cream', '3.40', 'icecream.png'),
(4, 'Orange', '4.50', 'orange.png'),
(5, 'Strawberry', '5.60', 'strawberry.png'),
(6, 'Watermelon', '6.70', 'watermelon.png');

-- (B) ORDERS
CREATE TABLE `orders` (
  `order_id` bigint(20) NOT NULL,
  `oder_date` datetime NOT NULL DEFAULT current_timestamp(),
  `order_total` decimal(12,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE `orders`
  ADD PRIMARY KEY (`order_id`),
  ADD KEY `oder_date` (`oder_date`);

ALTER TABLE `orders`
  MODIFY `order_id` bigint(20) NOT NULL AUTO_INCREMENT;

-- (C) ORDER ITEMS
CREATE TABLE `order_items` (
  `order_item_id` bigint(20) NOT NULL,
  `order_id` bigint(20) NOT NULL,
  `item_name` varchar(255) NOT NULL,
  `item_price` decimal(12,0) NOT NULL,
  `item_qty` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE `order_items`
  ADD PRIMARY KEY (`order_item_id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `item_name` (`item_name`);

ALTER TABLE `order_items`
  MODIFY `order_item_id` bigint(20) NOT NULL AUTO_INCREMENT;