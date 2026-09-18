-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 13, 2026 at 09:22 AM
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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `image` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `addons`
--

INSERT INTO `addons` (`id`, `studio_id`, `name`, `price`, `description`, `created_at`, `image`) VALUES
('ADD-20ZGGK9JG', 'ST-KGIZMA8DH', 'Make up', 250.00, '', '2026-09-02 02:56:25', NULL),
('ADD-EK0ZPWXNM', 'ST-89X4NQ5QF', 'Hair- style for men', 50.00, '', '2026-09-04 13:02:07', '/api/media/MEDIA-R1F80C37J'),
('ADD-HTWNV3D3Z', 'ST-89X4NQ5QF', 'Make up', 80.00, '', '2026-09-04 13:02:25', '/api/media/MEDIA-USMAZ917V'),
('ADD-PAWPRINT-01', 'ST-PAWPRINT26', 'Extra Edited Image', 150.00, 'One additional high-resolution edited image.', '2026-09-13 05:57:20', NULL),
('ADD-PAWPRINT-02', 'ST-PAWPRINT26', 'Framed 8x10 Print', 650.00, 'Archival 8x10 print in a simple wood-tone frame.', '2026-09-13 05:57:20', NULL),
('ADD-PAWPRINT-03', 'ST-PAWPRINT26', 'Pet Bandana Styling', 250.00, 'Color-coordinated bandana styling with a short accessory portrait set.', '2026-09-13 05:57:20', NULL);

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
('LOG-0MU60RE1L', 'system', 'system@cainta-mis.com', 'Updated system settings & UI config', 'SYSTEM', 'SETTINGS', '2026-09-04 12:30:17', NULL),
('LOG-0NZCKRK8C', 'system', 'system@cainta-mis.com', 'Updated system settings & UI config', 'SYSTEM', 'SETTINGS', '2026-09-04 12:31:09', NULL),
('LOG-1AUXSQ5TX', 'system', 'system@cainta-mis.com', 'Updated system settings & UI config', 'SYSTEM', 'SETTINGS', '2026-09-04 12:31:31', NULL),
('LOG-1NU8VHMJL', 'U-PAWPRINT26', 'shanangdelacruz55@gmail.com', 'Requested password reset', 'USER', 'U-PAWPRINT26', '2026-09-13 06:47:14', NULL),
('LOG-42ULKWZES', 'system', 'system@cainta-mis.com', 'Updated system settings & UI config', 'SYSTEM', 'SETTINGS', '2026-09-04 12:27:10', NULL),
('LOG-4FE81JNPK', 'CUST-MGLA5SSHK', 'onecaintagsoprocurement@gmail.com', 'Submitted full payment', 'PAYMENT', 'PAY-1DWPKEFI2', '2026-09-13 02:14:09', NULL),
('LOG-638FKKP25', 'u-superadmin', 'admin@caintaphotography.com', 'Deleted customer account: Shanang C De La Cruz', 'USER', 'CUST-WWB87MRKD', '2026-09-11 05:52:24', NULL),
('LOG-6ZJVAITAM', 'CUST-M4X6J96AQ', 'danielpadilla140600@gmail.com', 'Requested password reset', 'USER', 'CUST-M4X6J96AQ', '2026-09-11 10:30:35', NULL),
('LOG-9FO04M8GZ', 'CUST-MGLA5SSHK', 'onecaintagsoprocurement@gmail.com', 'Submitted full payment', 'PAYMENT', 'PAY-J138H20SW', '2026-09-13 06:58:53', NULL),
('LOG-B1CPPFMR2', 'system', 'system@cainta-mis.com', 'Updated system settings & UI config', 'SYSTEM', 'SETTINGS', '2026-09-04 12:30:48', NULL),
('LOG-B6JISO1RV', 'system', 'system@cainta-mis.com', 'Updated system settings & UI config', 'SYSTEM', 'SETTINGS', '2026-09-04 12:30:27', NULL),
('LOG-CE4M1JQYO', 'system', 'system@cainta-mis.com', 'Updated system settings & UI config', 'SYSTEM', 'SETTINGS', '2026-09-04 12:27:19', NULL),
('LOG-CNWMS7KYU', 'system', 'system@cainta-mis.com', 'Updated system settings & UI config', 'SYSTEM', 'SETTINGS', '2026-09-04 12:31:58', NULL),
('LOG-DAEK6TW2Q', 'U-6EPTFFF2F', 'reynaldoesteban899@gmail.com', 'Approved downpayment', 'PAYMENT', 'PAY-1DWPKEFI2', '2026-09-13 02:33:11', NULL),
('LOG-EYEOJ3JKQ', 'system', 'system@cainta-mis.com', 'Updated system settings & UI config', 'SYSTEM', 'SETTINGS', '2026-09-04 12:30:38', NULL),
('LOG-FPF1XXWVE', 'CUST-M4X6J96AQ', 'danielpadilla140600@gmail.com', 'Requested password reset', 'USER', 'CUST-M4X6J96AQ', '2026-09-11 11:17:49', NULL),
('LOG-JQHNAPZXI', 'U-PAWPRINT26', 'shanangdelacruz55@gmail.com', 'Reset account password', 'USER', 'U-PAWPRINT26', '2026-09-13 06:48:22', NULL),
('LOG-K4P0DLCCL', 'system', 'system@cainta-mis.com', 'Updated system settings & UI config', 'SYSTEM', 'SETTINGS', '2026-09-04 12:31:14', NULL),
('LOG-NISI9YGZ3', 'CUST-M4X6J96AQ', 'danielpadilla140600@gmail.com', 'Reset account password', 'USER', 'CUST-M4X6J96AQ', '2026-09-11 11:33:26', NULL),
('LOG-PEN0X0NOT', 'CUST-M4X6J96AQ', 'danielpadilla140600@gmail.com', 'Requested password reset', 'USER', 'CUST-M4X6J96AQ', '2026-09-11 11:32:20', NULL),
('LOG-Q9C644XNN', 'system', 'system@cainta-mis.com', 'Updated system settings & UI config', 'SYSTEM', 'SETTINGS', '2026-09-04 12:30:23', NULL),
('LOG-SFCO5A27C', 'CUST-M4X6J96AQ', 'danielpadilla140600@gmail.com', 'Requested password reset', 'USER', 'CUST-M4X6J96AQ', '2026-09-11 11:15:42', NULL),
('LOG-SNT2QUFKA', 'CUST-MGLA5SSHK', 'GSO Cainta Procurement', 'Submitted review REV-REV-OV303VMB2 for studio ST-89X4NQ5QF', 'REVIEW', 'REV-OV303VMB2', '2026-09-13 02:38:09', NULL),
('LOG-TELVDZ91N', 'system', 'system@cainta-mis.com', 'Updated system settings & UI config', 'SYSTEM', 'SETTINGS', '2026-09-04 12:31:01', NULL),
('LOG-TIBG3S72B', 'system', 'system@cainta-mis.com', 'Updated system settings & UI config', 'SYSTEM', 'SETTINGS', '2026-09-04 12:30:07', NULL),
('LOG-URLN8TXHO', 'system', 'system@cainta-mis.com', 'Updated system settings & UI config', 'SYSTEM', 'SETTINGS', '2026-09-04 12:22:34', NULL),
('LOG-VX6O9HKTN', 'CUST-WWB87MRKD', 'shanangdelacruz55@gmail.com', 'Registered customer account in customers table', 'CUSTOMER', 'CUST-WWB87MRKD', '2026-09-09 13:52:36', NULL),
('LOG-WB1PDURSL', 'system', 'system@cainta-mis.com', 'Updated system settings & UI config', 'SYSTEM', 'SETTINGS', '2026-09-04 12:27:25', NULL),
('LOG-WUUO299Z3', 'u-superadmin', 'admin@caintaphotography.com', 'Deleted customer account: Monique Nisha Mendoza', 'USER', 'CUST-KTRD1KJP1', '2026-09-11 05:52:30', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `availability_blackouts`
--

CREATE TABLE `availability_blackouts` (
  `id` varchar(50) NOT NULL,
  `studio_id` varchar(50) NOT NULL,
  `blackout_date` date NOT NULL,
  `start_time` varchar(20) DEFAULT NULL,
  `end_time` varchar(20) DEFAULT NULL,
  `reason` varchar(255) NOT NULL DEFAULT 'Studio closure',
  `is_recurring` tinyint(1) NOT NULL DEFAULT 0,
  `recurrence_rule` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` varchar(50) NOT NULL,
  `studio_id` varchar(50) NOT NULL,
  `customer_id` varchar(50) NOT NULL,
  `service_id` varchar(50) NOT NULL,
  `package_id` varchar(50) DEFAULT NULL,
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
  `cancellation_reason` text DEFAULT NULL,
  `cancelled_by` varchar(50) DEFAULT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `payment_option` varchar(50) DEFAULT 'Downpayment'
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
('cat-5', 'Family Photography', 'Cherish precious bonding moments in crisp frames.', '2025-12-31 16:00:00'),
('cat-6', 'Self-Shoot Studio', 'Express yourself freely behind a private clicker.', '2025-12-31 16:00:00'),
('cat-7', 'ID/Passport Photography', 'Official, compliant photos in instant minutes.', '2025-12-31 16:00:00'),
('cat-8', 'Pet Photography', 'Playful studio and lifestyle portraits for pets, owners, and animal families.', '2026-09-13 05:57:20');

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
('heroBackground', 'heroBackground', ''),
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
('CUST-M4X6J96AQ', 'danielpadilla140600@gmail.com', '$2b$10$m1rg99RgiLQAlblewyw/fuK5Sr4iQDsxpItd1i1olj9QNiG9JIfrS', 'daniel padilla', NULL, NULL, '2026-09-11 10:30:15'),
('CUST-MGLA5SSHK', 'onecaintagsoprocurement@gmail.com', '$2b$10$wYU4y/XCRuyAZly1RiJHW.RbuIC5G5AJqmvwmCKk7HqL3DJigDH2y', 'GSO Cainta Procurement', NULL, NULL, '2026-09-12 11:10:18'),
('CUST-SLBQQP3NK', 'shanangdelacruz55@gmail.com', '$2b$10$H.iAZZph8lPt7/KshyXCQePo3Mee3Deh1JtYHMrMoc7CKlYURbw/S', 'Shanang Dela Cruz', NULL, NULL, '2026-09-11 11:52:12');

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
-- Table structure for table `gcash_qr_sessions`
--

CREATE TABLE `gcash_qr_sessions` (
  `id` varchar(50) NOT NULL,
  `payment_id` varchar(50) DEFAULT NULL,
  `booking_id` varchar(50) DEFAULT NULL,
  `print_order_id` varchar(50) DEFAULT NULL,
  `studio_id` varchar(50) NOT NULL,
  `customer_id` varchar(50) NOT NULL,
  `gateway` varchar(20) NOT NULL DEFAULT 'paymongo',
  `gateway_payment_intent_id` varchar(255) DEFAULT NULL,
  `gateway_source_id` varchar(255) DEFAULT NULL,
  `gateway_checkout_url` text DEFAULT NULL,
  `qr_code_data` longtext DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_type` varchar(30) NOT NULL DEFAULT 'Downpayment',
  `status` varchar(50) NOT NULL DEFAULT 'pending',
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `webhook_event_id` varchar(255) DEFAULT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `gcash_qr_sessions`
--

INSERT INTO `gcash_qr_sessions` (`id`, `payment_id`, `booking_id`, `print_order_id`, `studio_id`, `customer_id`, `gateway`, `gateway_payment_intent_id`, `gateway_source_id`, `gateway_checkout_url`, `qr_code_data`, `amount`, `payment_type`, `status`, `expires_at`, `webhook_event_id`, `paid_at`, `created_at`) VALUES
('GQR-JWQB9QU0N', NULL, 'BK-2026-Y9WHN1AF5', NULL, 'ST-89X4NQ5QF', 'CUST-MGLA5SSHK', 'paymongo', 'pi_MPcYbStbHcqE6kan9UZZJMyu', 'pm_o1jd9bJgB6SDWjoSBTuqPuQ7', NULL, 'data:image/png;base64,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', 550.00, 'Full Payment', 'pending', '2026-09-12 18:32:25', NULL, NULL, '2026-09-13 02:02:29'),
('GQR-TK5WZBNJ8', NULL, 'BK-2026-Y9WHN1AF5', NULL, 'ST-89X4NQ5QF', 'CUST-MGLA5SSHK', 'paymongo', 'pi_VxRxMwoUQwmGnkVesRGBSbZZ', 'pm_QVubiFYFBgLxUdyiNJToxXPR', NULL, 'data:image/png;base64,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6RJ1cYm6RfxMl6hb7LkSrWdubv7m27d+5O+/9omrrr/t7m17984t/ZgFjEYnHnP4T774yT/6nMcdumZl6dXEJOoWPk6XqItL1C3iZ7pE3WLPlWI9d2/Z8aG/u+4vPnndbXffPz83MZdxB7JyxfRlTznz9Vc85ZzTj5rEgS/7JeoWPk6XqItL1C3iZ7pE3WLPFXc9e2b2XvWFW37//Vf/2zfvmtQruf0ajU45ft3/95KLX/isc9asXlF6NRGIuoWP0yXq4qoo6tL9+mOtJ2ccDlP2JRTrXD1tue/Bd3/oix/4+LXbtu8adoTKrVq5/LlPP+t1L3/KWadsmPSru1hvr13p3srTnX2YdLHa51w5Yz4FUbeI9Yi6POfq4/qbN//3d//vz37xlqYu5jpGo9FpJ61/7UsvvvyZ37d61fLSyxlO1C2dqFsKUbeI9Yi6POd61J///Fdu+823X/mNmzfX+/2BqFYfsuLySx/zUy+75PQT10/o5Z2oWzpRtxSibhHrEXV5zrWAubn5T11z05t+78rb7toWavgGeC6j0eisUza87uWXPPfpZ69aWWzvrcFE3dKJuqUQdYtYj6jLc64D/2T49DU3/dpb/uHOTdt63qQxa1avfOEPnPOa/+eiU084ovRaFkfULZ2oWwpRt4j1iLo85zqQa/7ttv/45k98+877ev58k0bLRt932tE/fcVTLnvKGStXTMzlnahbOlG3FFVHXdkvFeWs0qar//Y5VyxJXww3fnvLz/72x79246aD6u+WB3LompUves65r3nJRSccfVjptexHzudqrFdcHznP1efsbfwzOg87GzABtm7b9eY/vOrr35Jz37F9557PfumWmzduLb0QmAwT8wcQDlozs3Pv/csvffqam0v9e7A2jxynUnotMBlEHbW7+tqNf/qxL8/M7p3Mmn1U7Q7JhKREHVXbum3n299/9db7d8m57259cNYxyyb063VQiKijXvPz4aOf+sYXv3r7Qf8R3ei4ow999f893tBubZsb2kFSxaKuz+cubQxFzdl4zHn2PpbYGbvjnm3v//i1MzN7Y69rkixfPvW0J576hlc89fzvO25S9rFL98ws+xWFrpztynRfY+jqc/bJ4qqOSs3Ph49/5vqbNt5beiEFjY7ZsPZVL3riSy8//4jDDim9GJhgoo5Kbd6646Of+kbb05wXMD09dcn5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', 550.00, 'Full Payment', 'expired', '2026-09-13 02:03:01', NULL, NULL, '2026-09-13 02:02:29');

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

--
-- Dumping data for table `media_files`
--

INSERT INTO `media_files` (`id`, `owner_id`, `entity_type`, `entity_id`, `purpose`, `original_name`, `mime_type`, `size_bytes`, `checksum`, `storage_key`, `access_status`, `created_at`) VALUES
('MEDIA-0A70M7YSD', 'U-6EPTFFF2F', 'addon', 'ADD-T3B7AEM84', 'ADDON_IMAGE', 'addon-image', 'image/png', 1804783, 'bdb9b7cae9f65d32d5c9c0b48733516384a2f8c8869b3ef68173052a9a106034', 'MEDIA-0A70M7YSD.png', 'active', '2026-09-04 13:01:32'),
('MEDIA-15AN1YTO2', 'U-6EPTFFF2F', 'studio', 'ST-89X4NQ5QF', 'STUDIO_LOGO', 'logo', 'image/png', 1211323, '53662bb65d431b98c1a2580122ba39ea36f2a01303756772602e797cf9174a19', 'MEDIA-15AN1YTO2.png', 'active', '2026-09-03 10:49:41'),
('MEDIA-1Z54CLISB', 'U-6EPTFFF2F', 'photo-proofing', 'PRF-Q32NW1KKW', 'PROOF_PHOTO', 'MEDIA-UVG5VTZA3.png', 'image/png', 1755714, 'f7213c1078b8631f221c5b07770c052649a7b714e020c90c0cd366408338488a', 'MEDIA-1Z54CLISB.png', 'active', '2026-09-13 02:37:09'),
('MEDIA-2CVTLL232', 'U-4IGCHF41A', 'photo-proofing', 'PRF-B64UJNKFY', 'PROOF_PHOTO', 'ภาพครอบครัวสิริสุขะ.jpg', 'image/jpeg', 66658, '8e1b920a877b4e8909f48c090a6ffa1852c42d536ac3343e6c8284ce9e8a1b1a', 'MEDIA-2CVTLL232.jpeg', 'active', '2026-09-02 07:58:24'),
('MEDIA-33WDWOA0P', 'U-6EPTFFF2F', 'package', 'PKG-7U1WAPB78', 'PACKAGE_IMAGE', 'package-image', 'image/png', 1755714, 'f7213c1078b8631f221c5b07770c052649a7b714e020c90c0cd366408338488a', 'MEDIA-33WDWOA0P.png', 'active', '2026-09-04 11:14:38'),
('MEDIA-3AOUU04LK', 'CUST-KTRD1KJP1', 'print-order', 'PR-2026-NYAINY47M', 'PRINT_UPLOAD', 'print-photo', 'image/jpeg', 63725, '02d497045bd8dcc8e96e3a1793768f6e0f4b8900905a1865f92e86b42697abe4', 'MEDIA-3AOUU04LK.jpeg', 'active', '2026-09-02 09:01:13'),
('MEDIA-44XTSZJQ6', 'U-DJ5I7JJRA', 'studio', 'ST-HGYPGX0SN', 'SUPPORTING_DOCUMENT', 'supporting-document', 'image/jpeg', 3901, 'ac3ab6deff529af78f88731f0bdf1651a3b2796dfdcb64cba19913c9f03ed311', 'MEDIA-44XTSZJQ6.jpeg', 'active', '2026-08-27 10:44:47'),
('MEDIA-4W6QZJK18', 'U-DJ5I7JJRA', 'studio', 'ST-HGYPGX0SN', 'BUSINESS_PERMIT', 'business-permit', 'application/pdf', 9365, '9d562e53c4d208735b0b9f4db87b238781307ed2f2f0349842b312abad5bb0d8', 'MEDIA-4W6QZJK18.pdf', 'active', '2026-08-27 10:44:46'),
('MEDIA-58Y2JTZTF', 'CUST-KTRD1KJP1', 'print-order', 'PR-2026-MG5O3U1ZD', 'PRINT_UPLOAD', 'print-photo', 'image/png', 143431, '3d0a661b9a62185e7e1fefc20b261f4ce0a554c86742fe86c29941e0fe553bed', 'MEDIA-58Y2JTZTF.png', 'active', '2026-09-02 10:30:57'),
('MEDIA-5XM5XMCL1', 'U-4IGCHF41A', 'service', 'SRV-BRH6KRWP8', 'SERVICE_IMAGE', 'service-image', 'image/png', 2266139, 'd80e92c011484aa0547cefc9159f43a9ad900d50a3584f4bab63c41b243530b5', 'MEDIA-5XM5XMCL1.png', 'active', '2026-09-02 02:54:59'),
('MEDIA-6UMUH3HVQ', 'U-6EPTFFF2F', 'photo-proofing', 'PRF-YEYQ7ZO6P', 'PROOF_PHOTO', '664562488804570665.jpg', 'image/jpeg', 63725, '02d497045bd8dcc8e96e3a1793768f6e0f4b8900905a1865f92e86b42697abe4', 'MEDIA-6UMUH3HVQ.jpeg', 'active', '2026-09-04 09:17:44'),
('MEDIA-8ATTMRN66', 'CUST-KTRD1KJP1', 'print-order', 'PR-2026-DP025CHU3', 'PAYMENT_PROOF', 'print-payment-proof', 'image/jpeg', 295758, '072d5368fb5b9012f54b762429e4df848aaef16851ae3825b6699a861b23775a', 'MEDIA-8ATTMRN66.jpeg', 'active', '2026-09-04 13:06:10'),
('MEDIA-8UJGITQGI', 'CUST-KTRD1KJP1', 'print-order', 'PR-2026-MG5O3U1ZD', 'PAYMENT_PROOF', 'print-payment-proof', 'image/jpeg', 71967, 'a87ff082a3c68a23bf8063ee4e6017413f2b4ef5fbd98723df43ce0fa6ea9d07', 'MEDIA-8UJGITQGI.jpeg', 'active', '2026-09-02 10:31:01'),
('MEDIA-9ATSFP6MT', 'CUST-K3AYEDZG4', 'payment', 'PAY-BRY00U1E0', 'PAYMENT_PROOF', 'payment-proof', 'image/jpeg', 25698, '678c8a04a49f215dc6ed176a19f8d68115cc9950bbb25820519f70f4f0b63d0f', 'MEDIA-9ATSFP6MT.jpeg', 'active', '2026-08-29 10:17:39'),
('MEDIA-9PMWW8EB7', 'U-DJ5I7JJRA', 'studio', 'ST-HGYPGX0SN', 'OWNER_VALID_ID', 'owner-valid-id', 'image/jpeg', 3901, 'ac3ab6deff529af78f88731f0bdf1651a3b2796dfdcb64cba19913c9f03ed311', 'MEDIA-9PMWW8EB7.jpeg', 'active', '2026-08-27 10:44:47'),
('MEDIA-9SBZ81ME4', 'u-superadmin', 'cms', 'heroBackground', 'HERO_BACKGROUND', 'ChatGPT Image Sep 4, 2026, 07_50_49 PM.png', 'image/png', 1794588, '4f840e66aa24134859483859e8cae20180a4768c7b136eae515312aaf3fc2df6', 'MEDIA-9SBZ81ME4.png', 'active', '2026-09-04 12:02:50'),
('MEDIA-9V18MOK2N', 'U-6EPTFFF2F', 'studio', 'ST-89X4NQ5QF', 'STUDIO_COVER', 'coverImage', 'image/png', 1814104, '3d38621ea145c3d60fbbd18bbdd87a46ceb120683846bb9c2e8d06ae2d67e825', 'MEDIA-9V18MOK2N.png', 'active', '2026-09-03 10:49:42'),
('MEDIA-A1GMRREGU', 'U-6EPTFFF2F', 'photo-proofing', 'PRF-YEYQ7ZO6P', 'PROOF_PHOTO', 'ภาพครอบครัวสิริสุขะ.jpg', 'image/jpeg', 66658, '8e1b920a877b4e8909f48c090a6ffa1852c42d536ac3343e6c8284ce9e8a1b1a', 'MEDIA-A1GMRREGU.jpeg', 'active', '2026-09-04 09:17:45'),
('MEDIA-AOOTQGPCL', 'U-4IGCHF41A', 'photo-proofing', 'PRF-B64UJNKFY', 'PROOF_PHOTO', '664562488804570665.jpg', 'image/jpeg', 63725, '02d497045bd8dcc8e96e3a1793768f6e0f4b8900905a1865f92e86b42697abe4', 'MEDIA-AOOTQGPCL.jpeg', 'active', '2026-09-02 07:58:22'),
('MEDIA-BUUZCET4A', 'u-superadmin', 'cms', 'heroBackground', 'HERO_BACKGROUND', 'download.jfif', 'image/jpeg', 3901, 'ac3ab6deff529af78f88731f0bdf1651a3b2796dfdcb64cba19913c9f03ed311', 'MEDIA-BUUZCET4A.jpeg', 'active', '2026-09-02 01:54:22'),
('MEDIA-C5A30LX28', 'CUST-MGLA5SSHK', 'payment', 'PAY-1DWPKEFI2', 'PAYMENT_PROOF', 'payment-proof', 'image/jpeg', 53296, '37f639966fb0342095d32f71b4ac0bdce69ae37e6e2e70ff5652655a0ccc9915', 'MEDIA-C5A30LX28.jpeg', 'active', '2026-09-13 02:14:09'),
('MEDIA-DG8OYBQLT', 'U-6EPTFFF2F', 'print-product', 'PRD-C12VWIX50', 'PRINT_PRODUCT_IMAGE', 'print-product-2', 'image/png', 1804783, 'bdb9b7cae9f65d32d5c9c0b48733516384a2f8c8869b3ef68173052a9a106034', 'MEDIA-DG8OYBQLT.png', 'active', '2026-09-04 13:00:51'),
('MEDIA-DJS9JJQO9', 'CUST-KTRD1KJP1', 'print-order', 'PR-2026-3H85OZ38L', 'PRINT_UPLOAD', 'print-photo', 'image/png', 1755714, 'f7213c1078b8631f221c5b07770c052649a7b714e020c90c0cd366408338488a', 'MEDIA-DJS9JJQO9.png', 'active', '2026-09-04 09:19:40'),
('MEDIA-E6MEU2SX8', 'u-superadmin', 'cms', 'heroBackground', 'HERO_BACKGROUND', 'ChatGPT Image Sep 3, 2026, 06_31_13 PM.png', 'image/png', 1211323, '53662bb65d431b98c1a2580122ba39ea36f2a01303756772602e797cf9174a19', 'MEDIA-E6MEU2SX8.png', 'active', '2026-09-04 10:36:58'),
('MEDIA-FBSU1W9DU', 'u-superadmin', 'cms', 'heroBackground', 'HERO_BACKGROUND', 'ChatGPT Image Sep 4, 2026, 07_50_49 PM.png', 'image/png', 1794588, '4f840e66aa24134859483859e8cae20180a4768c7b136eae515312aaf3fc2df6', 'MEDIA-FBSU1W9DU.png', 'active', '2026-09-04 11:51:54'),
('MEDIA-GQ9K4P6QE', 'U-4IGCHF41A', 'photo-proofing', 'PRF-B888G8D1G', 'PROOF_PHOTO', '44824958788843220.jpg', 'image/jpeg', 96326, '44d9861de8ca40b27751994d8d2b1bf2002b76cd07d28471aa715fa948663f92', 'MEDIA-GQ9K4P6QE.jpeg', 'active', '2026-09-02 07:16:04'),
('MEDIA-H0G9Y1JK4', 'U-6EPTFFF2F', 'photo-proofing', 'PRF-YEYQ7ZO6P', 'PROOF_PHOTO', '44824958788843220.jpg', 'image/jpeg', 96326, '44d9861de8ca40b27751994d8d2b1bf2002b76cd07d28471aa715fa948663f92', 'MEDIA-H0G9Y1JK4.jpeg', 'active', '2026-09-04 09:17:44'),
('MEDIA-HECWHHQLF', 'CUST-KTRD1KJP1', 'print-order', 'PR-2026-DP025CHU3', 'PRINT_UPLOAD', 'print-photo', 'image/jpeg', 952714, '563671a167f791c38c742cd527e6cc6091f2f1f00b83ec2ce0062b82016a7c0b', 'MEDIA-HECWHHQLF.jpeg', 'active', '2026-09-04 13:06:10'),
('MEDIA-HN93FL825', 'CUST-KTRD1KJP1', 'payment', 'PAY-BPQMN74SU', 'PAYMENT_PROOF', 'payment-proof', 'image/jpeg', 295758, '072d5368fb5b9012f54b762429e4df848aaef16851ae3825b6699a861b23775a', 'MEDIA-HN93FL825.jpeg', 'active', '2026-09-04 07:59:48'),
('MEDIA-HNVM5HXHZ', 'U-6EPTFFF2F', 'addon', 'ADD-6R40WZE3D', 'ADDON_IMAGE', 'addon-image', 'image/png', 1755714, 'f7213c1078b8631f221c5b07770c052649a7b714e020c90c0cd366408338488a', 'MEDIA-HNVM5HXHZ.png', 'active', '2026-09-04 11:16:00'),
('MEDIA-IG8GY2YAE', 'CUST-KTRD1KJP1', 'payment', 'PAY-DJ2W865SD', 'PAYMENT_PROOF', 'payment-proof', 'image/jpeg', 3901, 'ac3ab6deff529af78f88731f0bdf1651a3b2796dfdcb64cba19913c9f03ed311', 'MEDIA-IG8GY2YAE.jpeg', 'active', '2026-09-02 04:30:32'),
('MEDIA-J7E1TA6MZ', 'U-4IGCHF41A', 'studio', 'ST-KGIZMA8DH', 'SUPPORTING_DOCUMENT', 'supporting-document', 'image/jpeg', 3901, 'ac3ab6deff529af78f88731f0bdf1651a3b2796dfdcb64cba19913c9f03ed311', 'MEDIA-J7E1TA6MZ.jpeg', 'active', '2026-09-02 02:47:00'),
('MEDIA-JBOVM526G', 'U-DJ5I7JJRA', 'studio', 'ST-HGYPGX0SN', 'STUDIO_LOGO', 'logo', 'image/png', 981539, 'e8da5e194969807d4d8f9a7979482dfd593c528a7f3cfcd1cd646d82eeb36850', 'MEDIA-JBOVM526G.png', 'active', '2026-08-29 09:54:12'),
('MEDIA-JQF6AHC7M', 'U-4IGCHF41A', 'studio', 'ST-KGIZMA8DH', 'BUSINESS_PERMIT', 'business-permit', 'image/jpeg', 3901, 'ac3ab6deff529af78f88731f0bdf1651a3b2796dfdcb64cba19913c9f03ed311', 'MEDIA-JQF6AHC7M.jpeg', 'active', '2026-09-02 02:46:37'),
('MEDIA-KBCXLXABI', 'CUST-KTRD1KJP1', 'print-order', 'PR-2026-INFSCMWUX', 'PAYMENT_PROOF', 'print-payment-proof', 'image/jpeg', 71967, 'a87ff082a3c68a23bf8063ee4e6017413f2b4ef5fbd98723df43ce0fa6ea9d07', 'MEDIA-KBCXLXABI.jpeg', 'active', '2026-09-03 04:27:31'),
('MEDIA-KBTH49SEP', 'U-4IGCHF41A', 'studio', 'ST-KGIZMA8DH', 'STUDIO_COVER', 'coverImage', 'image/png', 1723304, '52ae98064042ac74d141f954691f4d59207c1f38b0e7cd6f5237b4de9920bafe', 'MEDIA-KBTH49SEP.png', 'active', '2026-09-02 02:50:36'),
('MEDIA-KWEDENT2N', 'U-6EPTFFF2F', 'print-product', 'PRD-C12VWIX50', 'PRINT_PRODUCT_IMAGE', 'print-product-1', 'image/png', 1755714, 'f7213c1078b8631f221c5b07770c052649a7b714e020c90c0cd366408338488a', 'MEDIA-KWEDENT2N.png', 'active', '2026-09-04 13:00:51'),
('MEDIA-LJZABOPJ1', 'u-superadmin', 'cms', 'heroBackground', 'HERO_BACKGROUND', 'ChatGPT Image Sep 4, 2026, 07_50_49 PM.png', 'image/png', 1794588, '4f840e66aa24134859483859e8cae20180a4768c7b136eae515312aaf3fc2df6', 'MEDIA-LJZABOPJ1.png', 'active', '2026-09-04 11:50:59'),
('MEDIA-LNWYGDXMH', 'CUST-KTRD1KJP1', 'print-order', 'PR-2026-NYAINY47M', 'PAYMENT_PROOF', 'print-payment-proof', 'image/jpeg', 53296, '37f639966fb0342095d32f71b4ac0bdce69ae37e6e2e70ff5652655a0ccc9915', 'MEDIA-LNWYGDXMH.jpeg', 'active', '2026-09-02 09:02:43'),
('MEDIA-LQKL6U0XF', 'U-6EPTFFF2F', 'studio', 'ST-89X4NQ5QF', 'OWNER_VALID_ID', 'owner-valid-id', 'image/png', 2247916, 'caca4f0c4d09f43177c20bf58c1eebc735357c9c75efe9cad3372c7a2453be7f', 'MEDIA-LQKL6U0XF.png', 'active', '2026-09-03 10:48:24'),
('MEDIA-LZUTY9HFL', 'U-6EPTFFF2F', 'photo-proofing', 'PRF-Q32NW1KKW', 'PROOF_PHOTO', 'MEDIA-VYLP7YHN9.png', 'image/png', 1755714, 'f7213c1078b8631f221c5b07770c052649a7b714e020c90c0cd366408338488a', 'MEDIA-LZUTY9HFL.png', 'active', '2026-09-13 02:37:10'),
('MEDIA-NA65EE9CK', 'CUST-MGLA5SSHK', 'print-order', 'PR-2026-2VN1ZMIOB', 'PRINT_UPLOAD', 'print-photo', 'image/jpeg', 53296, '37f639966fb0342095d32f71b4ac0bdce69ae37e6e2e70ff5652655a0ccc9915', 'MEDIA-NA65EE9CK.jpeg', 'active', '2026-09-13 02:59:50'),
('MEDIA-OI659F5U8', 'CUST-KTRD1KJP1', 'print-order', 'PR-2026-3H85OZ38L', 'PAYMENT_PROOF', 'print-payment-proof', 'image/jpeg', 295758, '072d5368fb5b9012f54b762429e4df848aaef16851ae3825b6699a861b23775a', 'MEDIA-OI659F5U8.jpeg', 'active', '2026-09-04 09:19:41'),
('MEDIA-PXFZ1WFM8', 'u-superadmin', 'system', 'demo-video', 'SYSTEM_DEMO_VIDEO', 'YTDown.com_YouTube_Product-Demo-Video-SaaS-Explainer-Video-_Media_ZK-rNEhJIDs_001_1080p.mp4', 'video/mp4', 4819916, '60011eebf28df93e373b91aad15b094ee7678a7228035aff512b4fa18c2649f9', 'MEDIA-PXFZ1WFM8.mp4', 'active', '2026-09-04 07:25:10'),
('MEDIA-R1F80C37J', 'U-6EPTFFF2F', 'addon', 'ADD-EK0ZPWXNM', 'ADDON_IMAGE', 'addon-image', 'image/png', 1804783, 'bdb9b7cae9f65d32d5c9c0b48733516384a2f8c8869b3ef68173052a9a106034', 'MEDIA-R1F80C37J.png', 'active', '2026-09-04 13:02:07'),
('MEDIA-RKU8JAXM8', 'U-6EPTFFF2F', 'print-product', 'PRD-95BRJSN9L', 'PRINT_PRODUCT_IMAGE', 'print-product-2', 'image/png', 1804783, 'bdb9b7cae9f65d32d5c9c0b48733516384a2f8c8869b3ef68173052a9a106034', 'MEDIA-RKU8JAXM8.png', 'active', '2026-09-04 13:00:48'),
('MEDIA-S2ZGJ2HMJ', 'U-4IGCHF41A', 'photo-proofing', 'PRF-B64UJNKFY', 'PROOF_PHOTO', '44824958788843220.jpg', 'image/jpeg', 96326, '44d9861de8ca40b27751994d8d2b1bf2002b76cd07d28471aa715fa948663f92', 'MEDIA-S2ZGJ2HMJ.jpeg', 'active', '2026-09-02 07:58:23'),
('MEDIA-S8Y7LL7OC', 'CUST-MGLA5SSHK', 'print-order', 'PR-2026-2VN1ZMIOB', 'PAYMENT_PROOF', 'print-payment-proof', 'image/jpeg', 96326, '44d9861de8ca40b27751994d8d2b1bf2002b76cd07d28471aa715fa948663f92', 'MEDIA-S8Y7LL7OC.jpeg', 'active', '2026-09-13 03:00:12'),
('MEDIA-S9P465XKJ', 'U-6EPTFFF2F', 'studio', 'ST-89X4NQ5QF', 'BUSINESS_PERMIT', 'business-permit', 'image/png', 1913437, 'e4fbfa554540e0b169fece1ef61440d8aac043943a5fdbcab2f052ee6edbc30e', 'MEDIA-S9P465XKJ.png', 'active', '2026-09-03 10:48:22'),
('MEDIA-SH8TK8J1A', 'CUST-KTRD1KJP1', 'payment', 'PAY-HH9E9JG1M', 'PAYMENT_PROOF', 'payment-proof', 'image/png', 1532465, '083b30ec2fffe25e68661fdba5561768467e756a42d8705859c67a120e8aee8e', 'MEDIA-SH8TK8J1A.png', 'active', '2026-09-04 04:10:40'),
('MEDIA-SPA8380WK', 'U-DJ5I7JJRA', 'service', 'SRV-XT1LPBN77', 'SERVICE_IMAGE', 'service-image', 'image/png', 2266139, 'd80e92c011484aa0547cefc9159f43a9ad900d50a3584f4bab63c41b243530b5', 'MEDIA-SPA8380WK.png', 'active', '2026-08-29 10:12:01'),
('MEDIA-TVORCHKJT', 'U-DJ5I7JJRA', 'studio', 'ST-HGYPGX0SN', 'STUDIO_COVER', 'coverImage', 'image/png', 1723304, '52ae98064042ac74d141f954691f4d59207c1f38b0e7cd6f5237b4de9920bafe', 'MEDIA-TVORCHKJT.png', 'active', '2026-08-29 09:54:13'),
('MEDIA-UL70XPMTN', 'CUST-KTRD1KJP1', 'print-order', 'PR-2026-INFSCMWUX', 'PRINT_UPLOAD', 'print-photo', 'image/png', 48730, '6b2dd8519b2635c732e3a9f2a4b587a37e66acb25c63901c02469d7c40750ffb', 'MEDIA-UL70XPMTN.png', 'active', '2026-09-03 04:27:31'),
('MEDIA-USMAZ917V', 'U-6EPTFFF2F', 'addon', 'ADD-HTWNV3D3Z', 'ADDON_IMAGE', 'addon-image', 'image/png', 1755714, 'f7213c1078b8631f221c5b07770c052649a7b714e020c90c0cd366408338488a', 'MEDIA-USMAZ917V.png', 'active', '2026-09-04 13:02:25'),
('MEDIA-UVG5VTZA3', 'U-6EPTFFF2F', 'print-product', 'PRD-95BRJSN9L', 'PRINT_PRODUCT_IMAGE', 'print-product-1', 'image/png', 1755714, 'f7213c1078b8631f221c5b07770c052649a7b714e020c90c0cd366408338488a', 'MEDIA-UVG5VTZA3.png', 'active', '2026-09-04 13:00:48'),
('MEDIA-VYLP7YHN9', 'U-6EPTFFF2F', 'addon', 'ADD-Q5GBAJYZU', 'ADDON_IMAGE', 'addon-image', 'image/png', 1755714, 'f7213c1078b8631f221c5b07770c052649a7b714e020c90c0cd366408338488a', 'MEDIA-VYLP7YHN9.png', 'active', '2026-09-04 11:22:46'),
('MEDIA-X4YWM7X5P', 'U-4IGCHF41A', 'studio', 'ST-KGIZMA8DH', 'STUDIO_LOGO', 'logo', 'image/png', 981539, 'e8da5e194969807d4d8f9a7979482dfd593c528a7f3cfcd1cd646d82eeb36850', 'MEDIA-X4YWM7X5P.png', 'active', '2026-09-02 02:50:18'),
('MEDIA-X76NH4GEM', 'CUST-MGLA5SSHK', 'payment', 'PAY-J138H20SW', 'PAYMENT_PROOF', 'payment-proof', 'image/jpeg', 3901, 'ac3ab6deff529af78f88731f0bdf1651a3b2796dfdcb64cba19913c9f03ed311', 'MEDIA-X76NH4GEM.jpeg', 'active', '2026-09-13 06:58:53'),
('MEDIA-X90Z32UCE', 'U-4IGCHF41A', 'service', 'SRV-TKZRL8LJJ', 'SERVICE_IMAGE', 'service-image', 'image/png', 1532465, '083b30ec2fffe25e68661fdba5561768467e756a42d8705859c67a120e8aee8e', 'MEDIA-X90Z32UCE.png', 'active', '2026-09-03 06:34:50'),
('MEDIA-XQP0C98L4', 'U-6EPTFFF2F', 'service', 'SRV-7P1C113GE', 'SERVICE_IMAGE', 'service-image', 'image/png', 1932267, '8451430d025a11bb0ea5d089eb46af37169944f394e24b3711641709ef481b6b', 'MEDIA-XQP0C98L4.png', 'active', '2026-09-03 10:54:14'),
('MEDIA-XW5Z9V4YI', 'u-superadmin', 'cms', 'heroBackground', 'HERO_BACKGROUND', 'ChatGPT Image Sep 4, 2026, 07_50_49 PM.png', 'image/png', 1794588, '4f840e66aa24134859483859e8cae20180a4768c7b136eae515312aaf3fc2df6', 'MEDIA-XW5Z9V4YI.png', 'active', '2026-09-04 12:15:53'),
('MEDIA-YJI0FW35G', 'U-4IGCHF41A', 'studio', 'ST-KGIZMA8DH', 'OWNER_VALID_ID', 'owner-valid-id', 'image/jpeg', 3901, 'ac3ab6deff529af78f88731f0bdf1651a3b2796dfdcb64cba19913c9f03ed311', 'MEDIA-YJI0FW35G.jpeg', 'active', '2026-09-02 02:46:50'),
('MEDIA-ZQ263LO2G', 'CUST-MGLA5SSHK', 'print-order', 'PR-2026-GRI1JZVXS', 'PRINT_UPLOAD', 'print-photo', 'image/jpeg', 63725, '02d497045bd8dcc8e96e3a1793768f6e0f4b8900905a1865f92e86b42697abe4', 'MEDIA-ZQ263LO2G.jpeg', 'active', '2026-09-13 03:16:26');

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

--
-- Dumping data for table `packages`
--

INSERT INTO `packages` (`id`, `studio_id`, `name`, `description`, `price`, `duration_minutes`, `edited_photos_count`, `included_prints`, `photographer_count`, `included_services`, `terms_and_conditions`, `image`, `is_active`, `created_at`) VALUES
('PKG-7U1WAPB78', 'ST-89X4NQ5QF', 'Basic Graduation', '1 toga portrait, 1 formal portrait, 2 pcs 5R prints, digital copy', 500.00, 60, 50, '1', 2, '', 'No terms specified.', '/api/media/MEDIA-33WDWOA0P', 1, '2026-09-03 10:52:51'),
('PKG-PAWPRINT-01', 'ST-PAWPRINT26', 'The Whole Pack', 'A complete family-and-pet experience with two outfit or setup changes.', 5200.00, 120, 35, '1 framed 8x10 and 10 wallet prints', 2, 'Pet Portrait Session,Pet and Owner Story', 'A 30% non-refundable booking deposit is required. Rescheduling is allowed once with 48 hours notice. Pets must be supervised at all times.', NULL, 1, '2026-09-13 05:57:20'),
('PKG-RRI6R3M13', 'ST-KGIZMA8DH', 'Classic Family Portrait Session', 'Classic Family Photo', 6500.00, 60, 15, 'None', 4, '', 'No terms specified.', NULL, 1, '2026-09-02 02:56:03');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` varchar(50) NOT NULL,
  `gcash_session_id` varchar(50) DEFAULT NULL,
  `booking_id` varchar(50) NOT NULL,
  `studio_id` varchar(50) NOT NULL,
  `customer_id` varchar(50) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_type` varchar(30) NOT NULL DEFAULT 'Downpayment',
  `payment_method` varchar(50) NOT NULL,
  `payment_status` varchar(50) NOT NULL,
  `proof_of_payment` text DEFAULT NULL,
  `reference_number` varchar(100) DEFAULT NULL,
  `gateway_transaction_id` varchar(255) DEFAULT NULL,
  `fraud_score` int(11) DEFAULT NULL,
  `payment_channel` varchar(50) NOT NULL DEFAULT 'manual_upload',
  `payment_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `reviewed_by` varchar(50) DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `normalized_reference` varchar(100) DEFAULT NULL,
  `submitted_amount` decimal(12,2) DEFAULT NULL,
  `submitted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_intents`
--

CREATE TABLE `payment_intents` (
  `id` varchar(50) NOT NULL,
  `public_payment_id` varchar(60) NOT NULL,
  `booking_id` varchar(50) NOT NULL,
  `tenant_id` varchar(50) NOT NULL,
  `customer_id` varchar(50) NOT NULL,
  `payment_type` varchar(30) NOT NULL DEFAULT 'DOWNPAYMENT',
  `expected_amount` decimal(12,2) NOT NULL,
  `currency` char(3) NOT NULL DEFAULT 'PHP',
  `status` varchar(30) NOT NULL DEFAULT 'AWAITING_PAYMENT',
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_ledger`
--

CREATE TABLE `payment_ledger` (
  `id` varchar(50) NOT NULL,
  `booking_id` varchar(50) NOT NULL,
  `tenant_id` varchar(50) NOT NULL,
  `payment_id` varchar(50) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `payment_type` varchar(30) NOT NULL,
  `status` varchar(30) NOT NULL,
  `reference_number` varchar(100) DEFAULT NULL,
  `verified_by` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_receipts`
--

CREATE TABLE `payment_receipts` (
  `id` varchar(50) NOT NULL,
  `receipt_number` varchar(60) NOT NULL,
  `booking_id` varchar(50) NOT NULL,
  `tenant_id` varchar(50) NOT NULL,
  `payment_id` varchar(50) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `status` varchar(30) NOT NULL DEFAULT 'PAYMENT_VERIFIED',
  `verified_by` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_verifications`
--

CREATE TABLE `payment_verifications` (
  `id` varchar(50) NOT NULL,
  `payment_id` varchar(50) NOT NULL,
  `tenant_id` varchar(50) NOT NULL,
  `verified_by` varchar(50) NOT NULL,
  `verification_method` varchar(60) NOT NULL,
  `reference_checked` tinyint(1) NOT NULL DEFAULT 0,
  `amount_checked` tinyint(1) NOT NULL DEFAULT 0,
  `merchant_checked` tinyint(1) NOT NULL DEFAULT 0,
  `transaction_date_checked` tinyint(1) NOT NULL DEFAULT 0,
  `actual_transaction_confirmed` tinyint(1) NOT NULL DEFAULT 0,
  `verification_notes` text DEFAULT NULL,
  `decision` varchar(20) NOT NULL,
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
  `gcash_session_id` varchar(50) DEFAULT NULL,
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
  `gateway_transaction_id` varchar(255) DEFAULT NULL,
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

--
-- Dumping data for table `print_products`
--

INSERT INTO `print_products` (`id`, `studio_id`, `name`, `description`, `size`, `price`, `image`, `in_stock`, `estimated_hours`, `is_active`, `created_at`) VALUES
('PRD-95BRJSN9L', 'ST-89X4NQ5QF', '5R Photos Print', 'High Resolution 2 copy', '8x10 inches', 150.00, '/api/media/MEDIA-UVG5VTZA3', 1, 1, 1, '2026-09-04 13:00:48'),
('PRD-C12VWIX50', 'ST-89X4NQ5QF', '5R Photos Print', 'High Resolution 2 copy', '8x10 inches', 150.00, '/api/media/MEDIA-KWEDENT2N', 1, 1, 0, '2026-09-04 13:00:50');

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

--
-- Dumping data for table `services`
--

INSERT INTO `services` (`id`, `studio_id`, `name`, `description`, `category`, `base_price`, `duration_minutes`, `image`, `is_active`, `available_days`, `available_slots`, `requirements`, `created_at`) VALUES
('SRV-7P1C113GE', 'ST-89X4NQ5QF', 'Basic Graduation', '1 toga portrait, 1 formal portrait, 2 pcs 5R prints, digital copy', 'Graduation Shoots', 500.00, 30, '[\"/api/media/MEDIA-XQP0C98L4\"]', 1, 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday', '09:00 AM,10:30 AM,01:00 PM,02:30 PM,04:00 PM', 'Arrive 10 minutes early', '2026-09-03 10:54:14'),
('SRV-BRH6KRWP8', 'ST-KGIZMA8DH', ' Family Portrait Session', 'Family photo session ', 'Portrait Photography', 2500.00, 60, '[\"/api/media/MEDIA-5XM5XMCL1\"]', 1, 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday', '09:00 AM,10:30 AM,01:00 PM,02:30 PM,04:00 PM', 'Arrive 10 minutes early', '2026-09-02 02:54:57'),
('SRV-PAWPRINT-01', 'ST-PAWPRINT26', 'Pet Portrait Session', 'A guided portrait session for one pet with treats, toys, and 10 edited digital images.', 'Pet Photography', 1800.00, 60, NULL, 1, 'Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday', '10:00 AM,12:00 PM,02:00 PM,04:00 PM,06:00 PM', 'Bring a favorite toy; pets must be comfortable around people and camera equipment.', '2026-09-13 05:57:20'),
('SRV-PAWPRINT-02', 'ST-PAWPRINT26', 'Pet and Owner Story', 'An intimate lifestyle session for a pet and up to three family members with 20 edited digital images.', 'Pet Photography', 3200.00, 90, NULL, 1, 'Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday', '10:00 AM,01:00 PM,04:00 PM', 'Wear comfortable neutral colors; inform the studio of any pet sensitivities before booking.', '2026-09-13 05:57:20'),
('SRV-PAWPRINT-03', 'ST-PAWPRINT26', 'Rainbow Bridge Memorial', 'A quiet remembrance session for cherished pets, including a framed 8x10 print and 12 edited images.', 'Pet Photography', 2800.00, 75, NULL, 1, 'Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday', '10:00 AM,01:00 PM,04:00 PM', 'Please contact the studio privately so the team can prepare a gentle session plan.', '2026-09-13 05:57:20'),
('SRV-TKZRL8LJJ', 'ST-KGIZMA8DH', 'Passport picture', 'A professional passport-style headshot of a young Asian man facing directly toward the camera with a neutral and natural facial expression. He has neatly styled short black hair, dark eyes, well-groomed eyebrows, and a clean, natural appearance. He is wearing a black formal suit, white collared shirt, and black necktie. The subject is centered in the frame with the head and shoulders fully visible, looking straight ahead.', 'Portrait Photography', 10.00, 60, '[\"/api/media/MEDIA-X90Z32UCE\"]', 1, 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday', '09:00 AM,10:30 AM,01:00 PM,02:30 PM,04:00 PM', 'Arrive 10 minutes early', '2026-09-03 06:34:50');

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
  `registered_by_admin` tinyint(1) DEFAULT 0,
  `blocked_dates` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `studios`
--

INSERT INTO `studios` (`id`, `name`, `owner_id`, `logo`, `cover_image`, `location`, `rating`, `review_count`, `starting_price`, `categories`, `description`, `address`, `contact_info`, `email`, `business_hours`, `is_approved`, `status`, `printing_available`, `latitude`, `longitude`, `business_permit`, `valid_id`, `other_docs`, `created_at`, `registered_by_admin`, `blocked_dates`) VALUES
('ST-89X4NQ5QF', 'EverGrad Photography', 'U-6EPTFFF2F', '/api/media/MEDIA-15AN1YTO2', '/api/media/MEDIA-9V18MOK2N', 'Camia Street, De Castro, Santa Lucia, Pasig Second District, パシッグ, Eastern Manila District, Metro Manila, 1608, Philippines', 5.00, 0, 500.00, 'Graduation Shoots', 'Welcome to our newly registered photography studio! Complete our profile setup to list services, customizable packages, and receive instant bookings.', 'Camia Street, De Castro, Santa Lucia, Pasig Second District, パシッグ, Eastern Manila District, Metro Manila, 1608, Philippines', '09618704213', 'reynaldoesteban899@gmail.com', '09:00 AM - 06:00 PM', 1, 'approved', 1, 14.587831, 121.100197, '/api/media/MEDIA-S9P465XKJ', '/api/media/MEDIA-LQKL6U0XF', NULL, '2026-09-03 10:48:22', 0, ''),
('ST-KGIZMA8DH', 'Ellamaephotstudio', 'U-4IGCHF41A', '/api/media/MEDIA-X4YWM7X5P', '/api/media/MEDIA-KBTH49SEP', 'Sunrise Executive Subdivision, Santo Domingo, Cainta, Rizal, Calabarzon, 1900, Philippines', 5.00, 1, 1000.00, 'Portrait Photography', 'Welcome to our newly registered photography studio! Complete our profile setup to list services, customizable packages, and receive instant bookings.', 'Sunrise Executive Subdivision, Santo Domingo, Cainta, Rizal, Calabarzon, 1900, Philippines', '0985545423', 'maelucanas05@gmail.com', '09:00 AM - 06:00 PM', 1, 'approved', 1, 14.582885, 121.118514, '/api/media/MEDIA-JQF6AHC7M', '/api/media/MEDIA-YJI0FW35G', '/api/media/MEDIA-J7E1TA6MZ', '2026-09-02 02:46:37', 0, ''),
('ST-PAWPRINT26', 'Pawprint Portraits Studio', 'U-PAWPRINT26', 'https://images.unsplash.com/photo-1558788353-f76d92427f16?w=512&q=80', 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1600&q=85', 'Brookside Hills, San Isidro, Cainta, Rizal, Calabarzon, 1900, Philippines', 0.00, 0, 1800.00, 'Pet Photography', 'A warm, pet-friendly portrait studio creating joyful keepsakes for dogs, cats, and the people who love them.', 'Unit 4, Brookside Hills Commercial Center, Brookside Hills, San Isidro, Cainta, Rizal 1900', '0917 555 0182', 'hello@pawprintstudio.ph', '10:00 AM - 07:00 PM', 1, 'approved', 1, 14.585420, 121.114870, 'DEMO-PERMIT-PAWPRINT-2026', 'DEMO-VALID-ID-PAWPRINT-2026', 'Pet-safe studio policy and vaccination requirements available on request.', '2026-09-13 05:57:20', 1, '');

-- --------------------------------------------------------

--
-- Table structure for table `studio_availability`
--

CREATE TABLE `studio_availability` (
  `id` varchar(50) NOT NULL,
  `studio_id` varchar(50) NOT NULL,
  `day_of_week` int(11) NOT NULL,
  `opening_time` varchar(20) NOT NULL,
  `closing_time` varchar(20) NOT NULL,
  `is_available` tinyint(1) NOT NULL DEFAULT 1,
  `slot_duration_minutes` int(11) NOT NULL DEFAULT 60,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `studio_availability`
--

INSERT INTO `studio_availability` (`id`, `studio_id`, `day_of_week`, `opening_time`, `closing_time`, `is_available`, `slot_duration_minutes`, `created_at`, `updated_at`) VALUES
('AVL-PAWPRINT-01', 'ST-PAWPRINT26', 0, '10:00 AM', '07:00 PM', 0, 60, '2026-09-13 05:57:20', '2026-09-13 05:57:20'),
('AVL-PAWPRINT-02', 'ST-PAWPRINT26', 1, '10:00 AM', '07:00 PM', 1, 60, '2026-09-13 05:57:20', '2026-09-13 05:57:20'),
('AVL-PAWPRINT-03', 'ST-PAWPRINT26', 2, '10:00 AM', '07:00 PM', 1, 60, '2026-09-13 05:57:20', '2026-09-13 05:57:20'),
('AVL-PAWPRINT-04', 'ST-PAWPRINT26', 3, '10:00 AM', '07:00 PM', 1, 60, '2026-09-13 05:57:20', '2026-09-13 05:57:20'),
('AVL-PAWPRINT-05', 'ST-PAWPRINT26', 4, '10:00 AM', '07:00 PM', 1, 60, '2026-09-13 05:57:20', '2026-09-13 05:57:20'),
('AVL-PAWPRINT-06', 'ST-PAWPRINT26', 5, '10:00 AM', '07:00 PM', 1, 60, '2026-09-13 05:57:20', '2026-09-13 05:57:20'),
('AVL-PAWPRINT-07', 'ST-PAWPRINT26', 6, '10:00 AM', '07:00 PM', 1, 60, '2026-09-13 05:57:20', '2026-09-13 05:57:20');

-- --------------------------------------------------------

--
-- Table structure for table `studio_payment_credentials`
--

CREATE TABLE `studio_payment_credentials` (
  `id` varchar(50) NOT NULL,
  `studio_id` varchar(50) NOT NULL,
  `gateway` varchar(20) NOT NULL DEFAULT 'paymongo',
  `gateway_sub_account_id` varchar(255) DEFAULT NULL,
  `public_key_encrypted` text DEFAULT NULL,
  `secret_key_encrypted` text DEFAULT NULL,
  `webhook_secret_encrypted` text DEFAULT NULL,
  `gcash_merchant_name` varchar(100) DEFAULT NULL,
  `gcash_number` varchar(20) DEFAULT NULL,
  `is_live_mode` tinyint(1) NOT NULL DEFAULT 0,
  `is_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `studio_payment_credentials`
--

INSERT INTO `studio_payment_credentials` (`id`, `studio_id`, `gateway`, `gateway_sub_account_id`, `public_key_encrypted`, `secret_key_encrypted`, `webhook_secret_encrypted`, `gcash_merchant_name`, `gcash_number`, `is_live_mode`, `is_enabled`, `created_at`, `updated_at`) VALUES
('PAYCRED-PAWPRINT', 'ST-PAWPRINT26', 'paymongo', NULL, NULL, NULL, NULL, 'Pawprint Portraits Studio', '09175550182', 0, 1, '2026-09-13 05:57:20', '2026-09-13 05:57:20');

-- --------------------------------------------------------

--
-- Table structure for table `tenant_payment_methods`
--

CREATE TABLE `tenant_payment_methods` (
  `id` varchar(50) NOT NULL,
  `tenant_id` varchar(50) NOT NULL,
  `provider` varchar(30) NOT NULL DEFAULT 'GCASH',
  `method_type` varchar(40) NOT NULL DEFAULT 'DIGITAL_QR',
  `merchant_name` varchar(150) NOT NULL,
  `merchant_account_identifier` varchar(150) DEFAULT NULL,
  `qr_image_path` varchar(255) DEFAULT NULL,
  `instructions` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `is_default` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tenant_payment_methods`
--

INSERT INTO `tenant_payment_methods` (`id`, `tenant_id`, `provider`, `method_type`, `merchant_name`, `merchant_account_identifier`, `qr_image_path`, `instructions`, `is_active`, `is_default`, `created_at`, `updated_at`) VALUES
('TPM-PAWPRINT', 'ST-PAWPRINT26', 'GCASH', 'DIGITAL_QR', 'Pawprint Portraits Studio', '09175550182', NULL, 'Use the studio GCash number and include your booking reference in the payment note.', 1, 1, '2026-09-13 05:57:20', '2026-09-13 05:57:20');

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
('STAFF-KBSLCTBIS', 'christiandelossantos0315@gmail.com', '$2b$10$Wza.mcj4t0.c0lRxoGiDqOC4nYP2WpATD5XVh5W/2yEhc7Zpv45ku', 'Rey Esteban', 'STUDIO_STAFF', 'ST-KGIZMA8DH', '09840394667', NULL, '2026-09-02 03:06:07'),
('U-4IGCHF41A', 'maelucanas05@gmail.com', '$2b$10$zOzsjHx9CV7SXh6MbppL/eFLKadbinNpP6stA5ufFrDPPJ0c3.M8u', 'Ellamae Monteza lucañas', 'STUDIO_ADMIN', 'ST-KGIZMA8DH', '0985545423', NULL, '2026-09-02 02:46:37'),
('U-6EPTFFF2F', 'reynaldoesteban899@gmail.com', '$2b$10$KWzQUkhlejbbjajhZZSS3ONo1.Onq8MCGV6FDtQ1vWrH9TsHW7D6G', 'Martha dela cruz', 'STUDIO_ADMIN', 'ST-89X4NQ5QF', '09618704213', 'Cainta Rizal', '2026-09-03 10:48:22'),
('U-PAWPRINT26', 'mikaelasantos55@gmail.com', '$2b$10$FcGfWRTgZG.gOZzbwBrsjeXPEk1hXYbhFEaTiLIOtoro43wx7q/Eu', 'Mikaela Santos', 'STUDIO_ADMIN', 'ST-PAWPRINT26', '0917 555 0182', 'Brookside Hills, San Isidro, Cainta, Rizal', '2026-09-13 05:57:20'),
('u-superadmin', 'admin@caintaphotography.com', '$2b$10$KWzQUkhlejbbjajhZZSS3ONo1.Onq8MCGV6FDtQ1vWrH9TsHW7D6G', 'System Super Admin', 'SUPER_ADMIN', NULL, '+63 900 000 0000', 'Cainta Municipal Hall, Rizal', '2025-12-31 16:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `webhook_events`
--

CREATE TABLE `webhook_events` (
  `event_id` varchar(255) NOT NULL,
  `gateway` varchar(20) NOT NULL,
  `event_type` varchar(100) NOT NULL,
  `payment_id` varchar(50) DEFAULT NULL,
  `session_id` varchar(50) DEFAULT NULL,
  `raw_payload` mediumtext DEFAULT NULL,
  `processed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
-- Indexes for table `availability_blackouts`
--
ALTER TABLE `availability_blackouts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_availability_blackouts_studio` (`studio_id`);

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
-- Indexes for table `gcash_qr_sessions`
--
ALTER TABLE `gcash_qr_sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_gcash_sessions_booking` (`booking_id`),
  ADD KEY `idx_gcash_sessions_customer` (`customer_id`),
  ADD KEY `idx_gcash_sessions_intent` (`gateway_payment_intent_id`),
  ADD KEY `idx_gcash_sessions_status` (`status`);

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
-- Indexes for table `payment_intents`
--
ALTER TABLE `payment_intents`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `public_payment_id` (`public_payment_id`);

--
-- Indexes for table `payment_ledger`
--
ALTER TABLE `payment_ledger`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `payment_id` (`payment_id`);

--
-- Indexes for table `payment_receipts`
--
ALTER TABLE `payment_receipts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `receipt_number` (`receipt_number`),
  ADD UNIQUE KEY `payment_id` (`payment_id`);

--
-- Indexes for table `payment_verifications`
--
ALTER TABLE `payment_verifications`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `payment_verifications_approved_uq` (`payment_id`,`decision`);

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
-- Indexes for table `studio_availability`
--
ALTER TABLE `studio_availability`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_studio_availability_studio` (`studio_id`);

--
-- Indexes for table `studio_payment_credentials`
--
ALTER TABLE `studio_payment_credentials`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_studio_payment_creds` (`studio_id`,`gateway`);

--
-- Indexes for table `tenant_payment_methods`
--
ALTER TABLE `tenant_payment_methods`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_users_role` (`role`);

--
-- Indexes for table `webhook_events`
--
ALTER TABLE `webhook_events`
  ADD PRIMARY KEY (`event_id`),
  ADD KEY `idx_webhook_events_payment` (`payment_id`),
  ADD KEY `idx_webhook_events_processed` (`processed_at`);

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

--
-- Constraints for table `studio_payment_credentials`
--
ALTER TABLE `studio_payment_credentials`
  ADD CONSTRAINT `fk_studio_payment_creds_studio` FOREIGN KEY (`studio_id`) REFERENCES `studios` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
