-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 25, 2026 at 10:41 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `cainta_photography_mis`
--

-- --------------------------------------------------------

--
-- Table structure for table `addons`
--

CREATE TABLE `addons` (
  `id` varchar(50) NOT NULL,
  `studio_id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `description` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` varchar(50) NOT NULL,
  `user_id` varchar(50) NOT NULL,
  `user_email` varchar(100) NOT NULL,
  `action` text NOT NULL,
  `entity_type` varchar(50) NOT NULL,
  `entity_id` varchar(50) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `ip_address` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user_id`, `user_email`, `action`, `entity_type`, `entity_id`, `timestamp`, `ip_address`) VALUES
('LOG-6B8Y2BCCR', 'system', 'system@cainta-mis.com', 'Updated system settings & UI config', 'SYSTEM', 'SETTINGS', '2026-08-25 06:22:30', NULL),
('LOG-BZH0ZWUMN', 'CUST-DZ61AV3FJ', 'maelucanas05@gmail.com', 'Registered customer account in customers table', 'CUSTOMER', 'CUST-DZ61AV3FJ', '2026-08-25 07:50:29', NULL),
('LOG-ZRL0GM5B7', 'system', 'system@cainta-mis.com', 'Updated system settings & UI config', 'SYSTEM', 'SETTINGS', '2026-08-25 06:20:13', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` varchar(50) NOT NULL,
  `studio_id` varchar(50) NOT NULL,
  `customer_id` varchar(50) NOT NULL,
  `service_id` varchar(50) NOT NULL,
  `package_id` varchar(50) NOT NULL,
  `booking_date` date NOT NULL,
  `time_slot` varchar(50) NOT NULL,
  `addons` text DEFAULT NULL,
  `customer_name` varchar(100) NOT NULL,
  `customer_email` varchar(100) NOT NULL,
  `customer_phone` varchar(50) NOT NULL,
  `customer_notes` text DEFAULT NULL,
  `requirements_doc` varchar(255) DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Pending',
  `total_amount` decimal(10,2) NOT NULL,
  `amount_paid` decimal(10,2) DEFAULT 0.00,
  `down_payment_amount` decimal(10,2) DEFAULT 0.00,
  `remaining_balance` decimal(10,2) DEFAULT 0.00,
  `payment_status` varchar(50) DEFAULT 'Unpaid',
  `final_payment_status` varchar(50) DEFAULT 'Pending',
  `payment_due_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `description`, `created_at`) VALUES
('cat-1', 'Portrait Photography', 'Professional close-up and profile pictures.', '2025-12-31 16:00:00'),
('cat-2', 'Graduation Photography', 'Celebrate milestones with premium cap and gown sessions.', '2025-12-31 16:00:00'),
('cat-3', 'Wedding Photography', 'Timeless storytelling of your special union.', '2025-12-31 16:00:00'),
('cat-4', 'Birthday Photography', 'Joyful celebrations captured beautifully.', '2025-12-31 16:00:00'),
('cat-5', 'Family Photography', 'Cherish precious bonding moments in crisp frames.', '2025-12-31 16:00:00'),
('cat-6', 'Self-Shoot Studio', 'Express yourself freely behind a private clicker.', '2025-12-31 16:00:00'),
('cat-7', 'ID/Passport Photography', 'Official, compliant photos in instant minutes.', '2025-12-31 16:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `cms_settings`
--

CREATE TABLE `cms_settings` (
  `id` varchar(100) NOT NULL,
  `key` varchar(100) NOT NULL,
  `value` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cms_settings`
--

INSERT INTO `cms_settings` (`id`, `key`, `value`) VALUES
('aboutDescription', 'aboutDescription', 'Experience the difference of calibrated Profoto strobes, true-to-life skin tones, and meticulous post-processing by Cainta\'s leading photographers.'),
('aboutTitle', 'aboutTitle', 'Pristine Studio Lighting & Retouching'),
('featuresSubtitle', 'featuresSubtitle', 'Explore photography styles and packages suited to your milestones.'),
('featuresTitle', 'featuresTitle', 'Specialized Categories'),
('heroBackground', 'heroBackground', 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1800&fit=crop'),
('heroSubtitle', 'heroSubtitle', 'Discover accredited photography studios in Cainta, Rizal. Compare live calendar availability, customize grad & creative packages, inspect RAW vs retouched portfolios, and order gallery-grade physical wall prints.'),
('heroTitle', 'heroTitle', 'Frame Your Story. <br /> Book Cainta Studios.');

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `contact_number` varchar(50) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`id`, `email`, `password_hash`, `full_name`, `contact_number`, `address`, `created_at`) VALUES
('CUST-DZ61AV3FJ', 'maelucanas05@gmail.com', '$2b$10$rJ9kwgVwdKTGDrFYRcts8OswvhJfUVdd1xQxSoJUMNqTvj4/RWliG', 'Ellamae Monteza Lucañas', '+639610394556', 'Parola Cainta', '2026-08-25 07:50:29');

-- --------------------------------------------------------

--
-- Table structure for table `faqs`
--

CREATE TABLE `faqs` (
  `id` varchar(50) NOT NULL,
  `studio_id` varchar(50) NOT NULL,
  `question` text NOT NULL,
  `answer` text NOT NULL,
  `category` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `favorites`
--

CREATE TABLE `favorites` (
  `id` varchar(50) NOT NULL,
  `customer_id` varchar(50) NOT NULL,
  `studio_id` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `media_files`
--

CREATE TABLE `media_files` (
  `id` varchar(50) NOT NULL,
  `owner_id` varchar(50) NOT NULL,
  `entity_type` varchar(50) NOT NULL,
  `entity_id` varchar(50) NOT NULL,
  `purpose` varchar(50) NOT NULL,
  `original_name` varchar(255) DEFAULT NULL,
  `mime_type` varchar(100) NOT NULL,
  `size_bytes` bigint(20) NOT NULL,
  `checksum` varchar(128) NOT NULL,
  `storage_key` varchar(255) NOT NULL,
  `access_status` varchar(30) NOT NULL DEFAULT 'quarantined',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` varchar(50) NOT NULL,
  `user_id` varchar(50) NOT NULL,
  `studio_id` varchar(50) DEFAULT NULL,
  `title` varchar(150) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `type` varchar(50) NOT NULL,
  `channel` varchar(50) DEFAULT 'App',
  `recipient_contact` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `packages`
--

CREATE TABLE `packages` (
  `id` varchar(50) NOT NULL,
  `studio_id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `duration_minutes` int(11) NOT NULL,
  `edited_photos_count` int(11) NOT NULL,
  `included_prints` varchar(150) NOT NULL,
  `photographer_count` int(11) DEFAULT 1,
  `included_services` text DEFAULT NULL,
  `terms_and_conditions` text NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` varchar(50) NOT NULL,
  `booking_id` varchar(50) NOT NULL,
  `studio_id` varchar(50) NOT NULL,
  `customer_id` varchar(50) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_type` varchar(30) NOT NULL DEFAULT 'Downpayment',
  `payment_method` varchar(50) NOT NULL,
  `payment_status` varchar(50) NOT NULL,
  `proof_of_payment` text DEFAULT NULL,
  `reference_number` varchar(100) DEFAULT NULL,
  `payment_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `reviewed_by` varchar(50) DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `photo_proofings`
--

CREATE TABLE `photo_proofings` (
  `id` varchar(50) NOT NULL,
  `booking_id` varchar(50) NOT NULL,
  `studio_id` varchar(50) NOT NULL,
  `customer_id` varchar(50) NOT NULL,
  `photos` text NOT NULL,
  `watermark_text` varchar(100) NOT NULL,
  `watermark_position` varchar(50) DEFAULT 'center',
  `watermark_opacity` decimal(3,2) DEFAULT 0.40,
  `final_drive_link` text DEFAULT NULL,
  `status` varchar(50) DEFAULT 'draft',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `print_orders`
--

CREATE TABLE `print_orders` (
  `id` varchar(50) NOT NULL,
  `studio_id` varchar(50) NOT NULL,
  `customer_id` varchar(50) NOT NULL,
  `product_id` varchar(50) NOT NULL,
  `quantity` int(11) DEFAULT 1,
  `uploaded_photo` text NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Pending',
  `total_amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(50) NOT NULL,
  `payment_status` varchar(50) NOT NULL DEFAULT 'Unpaid',
  `proof_of_payment` text DEFAULT NULL,
  `reference_number` varchar(100) DEFAULT NULL,
  `shipping_address` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `print_products`
--

CREATE TABLE `print_products` (
  `id` varchar(50) NOT NULL,
  `studio_id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `size` varchar(50) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `image` varchar(255) NOT NULL,
  `in_stock` tinyint(1) DEFAULT 1,
  `estimated_hours` int(11) DEFAULT 24,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` varchar(50) NOT NULL,
  `studio_id` varchar(50) NOT NULL,
  `customer_id` varchar(50) NOT NULL,
  `customer_name` varchar(100) NOT NULL,
  `booking_id` varchar(50) NOT NULL,
  `rating` int(11) DEFAULT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `comment` text NOT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `reply` text DEFAULT NULL,
  `reply_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

CREATE TABLE `services` (
  `id` varchar(50) NOT NULL,
  `studio_id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `category` varchar(100) NOT NULL,
  `base_price` decimal(10,2) NOT NULL,
  `duration_minutes` int(11) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `available_days` text NOT NULL,
  `available_slots` text NOT NULL,
  `requirements` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `studios`
--

CREATE TABLE `studios` (
  `id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `owner_id` varchar(50) NOT NULL,
  `logo` varchar(255) NOT NULL,
  `cover_image` varchar(255) NOT NULL,
  `location` varchar(150) NOT NULL,
  `rating` decimal(3,2) DEFAULT 0.00,
  `review_count` int(11) DEFAULT 0,
  `starting_price` decimal(10,2) DEFAULT 0.00,
  `categories` text NOT NULL,
  `description` text NOT NULL,
  `address` varchar(255) NOT NULL,
  `contact_info` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `business_hours` varchar(100) NOT NULL,
  `is_approved` tinyint(1) DEFAULT 0,
  `status` varchar(50) DEFAULT 'pending',
  `printing_available` tinyint(1) DEFAULT 0,
  `latitude` decimal(10,6) DEFAULT NULL,
  `longitude` decimal(10,6) DEFAULT NULL,
  `business_permit` longtext DEFAULT NULL,
  `valid_id` longtext DEFAULT NULL,
  `other_docs` longtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `registered_by_admin` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `role` varchar(50) NOT NULL,
  `studio_id` varchar(50) DEFAULT NULL,
  `contact_number` varchar(50) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `role`, `studio_id`, `contact_number`, `address`, `created_at`) VALUES
('u-superadmin', 'admin@caintaphotography.com', '$2b$10$KWzQUkhlejbbjajhZZSS3ONo1.Onq8MCGV6FDtQ1vWrH9TsHW7D6G', 'System Super Admin', 'SUPER_ADMIN', NULL, '+63 900 000 0000', 'Cainta Municipal Hall, Rizal', '2025-12-31 16:00:00');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `addons`
--
ALTER TABLE `addons`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_addons_studio` (`studio_id`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_audit_logs_timestamp` (`timestamp`);

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `studio_id` (`studio_id`),
  ADD KEY `service_id` (`service_id`),
  ADD KEY `package_id` (`package_id`),
  ADD KEY `idx_bookings_customer` (`customer_id`),
  ADD KEY `idx_bookings_date` (`booking_date`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `cms_settings`
--
ALTER TABLE `cms_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_customers_email` (`email`);

--
-- Indexes for table `faqs`
--
ALTER TABLE `faqs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_faqs_studio` (`studio_id`);

--
-- Indexes for table `favorites`
--
ALTER TABLE `favorites`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `studio_id` (`studio_id`);

--
-- Indexes for table `media_files`
--
ALTER TABLE `media_files`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `storage_key` (`storage_key`),
  ADD KEY `media_files_entity_idx` (`entity_type`,`entity_id`),
  ADD KEY `media_files_owner_idx` (`owner_id`),
  ADD KEY `media_files_purpose_idx` (`purpose`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_notifications_unread` (`user_id`,`is_read`);

--
-- Indexes for table `packages`
--
ALTER TABLE `packages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_packages_studio` (`studio_id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `studio_id` (`studio_id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `idx_payments_booking` (`booking_id`);

--
-- Indexes for table `photo_proofings`
--
ALTER TABLE `photo_proofings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `booking_id` (`booking_id`),
  ADD KEY `studio_id` (`studio_id`),
  ADD KEY `customer_id` (`customer_id`);

--
-- Indexes for table `print_orders`
--
ALTER TABLE `print_orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `studio_id` (`studio_id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `idx_print_orders_status` (`status`);

--
-- Indexes for table `print_products`
--
ALTER TABLE `print_products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `studio_id` (`studio_id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `studio_id` (`studio_id`),
  ADD KEY `booking_id` (`booking_id`),
  ADD KEY `idx_reviews_customer` (`customer_id`),
  ADD KEY `idx_reviews_rating` (`rating`);

--
-- Indexes for table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_services_studio` (`studio_id`);

--
-- Indexes for table `studios`
--
ALTER TABLE `studios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_studios_owner` (`owner_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_users_role` (`role`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `addons`
--
ALTER TABLE `addons`
  ADD CONSTRAINT `addons_ibfk_1` FOREIGN KEY (`studio_id`) REFERENCES `studios` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`studio_id`) REFERENCES `studios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_3` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`),
  ADD CONSTRAINT `bookings_ibfk_4` FOREIGN KEY (`package_id`) REFERENCES `packages` (`id`);

--
-- Constraints for table `favorites`
--
ALTER TABLE `favorites`
  ADD CONSTRAINT `favorites_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `favorites_ibfk_2` FOREIGN KEY (`studio_id`) REFERENCES `studios` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `packages`
--
ALTER TABLE `packages`
  ADD CONSTRAINT `packages_ibfk_1` FOREIGN KEY (`studio_id`) REFERENCES `studios` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`studio_id`) REFERENCES `studios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payments_ibfk_3` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `photo_proofings`
--
ALTER TABLE `photo_proofings`
  ADD CONSTRAINT `photo_proofings_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `photo_proofings_ibfk_2` FOREIGN KEY (`studio_id`) REFERENCES `studios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `photo_proofings_ibfk_3` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `print_orders`
--
ALTER TABLE `print_orders`
  ADD CONSTRAINT `print_orders_ibfk_1` FOREIGN KEY (`studio_id`) REFERENCES `studios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `print_orders_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `print_orders_ibfk_3` FOREIGN KEY (`product_id`) REFERENCES `print_products` (`id`);

--
-- Constraints for table `print_products`
--
ALTER TABLE `print_products`
  ADD CONSTRAINT `print_products_ibfk_1` FOREIGN KEY (`studio_id`) REFERENCES `studios` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`studio_id`) REFERENCES `studios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_3` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `services`
--
ALTER TABLE `services`
  ADD CONSTRAINT `services_ibfk_1` FOREIGN KEY (`studio_id`) REFERENCES `studios` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `studios`
--
ALTER TABLE `studios`
  ADD CONSTRAINT `studios_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
