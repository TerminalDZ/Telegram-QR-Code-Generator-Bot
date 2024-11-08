Here's a professional markdown file for your Telegram QR Code Generator Bot:

# 🤖 Telegram QR Code Generator Bot

A powerful and feature-rich Telegram bot that generates custom QR codes with advanced customization options, encryption support, and comprehensive analytics.

[![Node.js](https://img.shields.io/badge/Node.js-14+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Telegram](https://img.shields.io/badge/Telegram-Bot-26A5E4?style=for-the-badge&logo=telegram&logoColor=white)](https://core.telegram.org/bots)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

## 🚀 Features

### Core Functionality

- **Multi-Format QR Generation**
  - Plain Text
  - URLs & Links
  - WhatsApp Direct Messages (Coming Soon)
  - vCard Contact Information
  - Social Media Profiles
  - WiFi Network Credentials (Coming Soon)

### Advanced Capabilities

- **Customization Options**
  - Custom Colors & Gradients
  - Adjustable Sizes
  - Logo Integration (Comming Soon)
  - Multiple Output Formats
  - Custom Dot Patterns

### Security & Analytics

- 📊 Usage Statistics
- 📈 User Activity Tracking

### User Experience

- 🌐 Multi-language Support (English & Arabic)
- 🎨 Intuitive User Interface
- ⚡ Fast Processing
- 💾 History Management

## 📋 Prerequisites

- Node.js (v14.x or higher)
- npm (v6.x or higher)
- Telegram Account
- Bot Token from [@BotFather](https://t.me/botfather)

## 🛠️ Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/TerminalDZ/Telegram-QR-Code-Generator-Bot.git
   cd Telegram-QR-Code-Generator-Bot
   ```

## 📥 Detailed Setup Guide

### 1. Dependencies Installation

```bash
npm install
```

### 2. Telegram Bot Configuration 🤖

1. Start a conversation with [@BotFather](https://t.me/BotFather) on Telegram
2. Create your bot:
   ```
   /newbot
   ```
3. Follow BotFather's prompts:
   - Set a display name for your bot
   - Choose a unique username ending in 'bot'
4. Save the HTTP API token provided by BotFather

### 3. Supabase Database Setup 📊

#### 3.1 Account Creation

1. Sign up at [Supabase](https://supabase.io/)
2. Create a new project
3. Note down your:
   - Project URL
   - Anon/Public Key
   - Service Role Key (Keep this secret!)

#### 3.2 Database Schema

Execute these SQL commands in your Supabase SQL editor:

```sql
-- QR Codes Table
CREATE TABLE IF NOT EXISTS qr_codes (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Usage Statistics
CREATE TABLE IF NOT EXISTS user_usage (
    user_id BIGINT PRIMARY KEY,
    usage_count INTEGER DEFAULT 0
);

-- Text Frequency Tracking
CREATE TABLE IF NOT EXISTS used_texts (
    user_id BIGINT,
    text TEXT,
    count INTEGER DEFAULT 1,
    PRIMARY KEY (user_id, text)
);

-- Create indexes for better performance
CREATE INDEX idx_qr_codes_user_id ON qr_codes(user_id);
CREATE INDEX idx_used_texts_user_id ON used_texts(user_id);
```

### 4. Environment Configuration ⚙️

Create a `.env` file in your project root:

```env
# Bot Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_here

# Supabase Configuration
SUPABASE_URL=your_project_url
SUPABASE_API_KEY=your_anon_key

```

### 6. Starting the Bot 🚀

```bash
# Development mode
npm run dev

# Production mode
npm start
```

### 7. Verify Installation ✅

1. Send `/start` to your bot on Telegram
2. Try generating a QR code with `/qr test`
3. Check your Supabase dashboard for new entries

## 🔧 Troubleshooting

Common issues and solutions:

- **Bot not responding**: Verify your `TELEGRAM_BOT_TOKEN` in `.env`
- **Database errors**: Check Supabase connection credentials
- **QR generation fails**: Ensure all dependencies are properly installed

## 📝 Usage

### Basic Commands

```
/start - Initialize the bot

```

### Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api)
- [qrcode](https://github.com/soldair/node-qrcode)
- All contributors who helped shape this project

---

<p align="center">
Made with ❤️ by <a href="https://github.com/TerminalDZ">TerminalDZ</a>
</p>

<p align="center">
⭐️ Star this repository if you found it helpful!
</p>
