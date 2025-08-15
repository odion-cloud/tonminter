# VUETONNER - TON Token Minter (Vue.js Version)

A modern Vue.js application for creating and deploying TON blockchain tokens with automatic buyback-burn mechanisms.

## 🚀 Features

- **Token Configuration**: Set token name, symbol, decimals, total supply, and initial price
- **Transaction Fee Management**: Configure fee percentages and distribution
- **Buyback & Burn**: Set up automatic buyback mechanisms with customizable triggers
- **Contract Preview**: Review generated smart contract code before deployment
- **Multi-Network Support**: Deploy to mainnet, testnet, or local networks
- **Wallet Integration**: Connect TON wallets for deployment
- **Responsive Design**: Modern UI built with Bootstrap 5
- **State Management**: Pinia store for reactive state management

## 🛠️ Tech Stack

- **Frontend**: Vue.js 3, Bootstrap 5, Pinia
- **Build Tool**: Laravel Mix
- **Backend**: Express.js, Node.js
- **Database**: Drizzle ORM with PostgreSQL
- **Blockchain**: TON (The Open Network)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vuetonner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   NODE_ENV=development
   PORT=5000
   DATABASE_URL=your_database_url_here
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🏗️ Project Structure

```
vuetonner/
├── client/                 # Vue.js frontend
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Vue components
│   │   ├── pages/         # Page components
│   │   ├── stores/        # Pinia stores
│   │   ├── lib/           # Utility functions
│   │   ├── styles/        # SCSS styles
│   │   ├── router/        # Vue Router
│   │   ├── App.vue        # Root component
│   │   └── main.js        # Entry point
│   └── build/             # Compiled assets
├── server/                # Express.js backend
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database operations
│   └── index.ts           # Server entry point
├── shared/                # Shared utilities
├── attached_assets/       # Static assets
├── webpack.mix.js         # Laravel Mix config
├── package.json           # Dependencies
└── README.md             # This file
```

## 🎯 Usage

### 1. Token Configuration
- Set your token's basic properties (name, symbol, decimals, supply)
- Configure initial price and optional metadata
- Preview token details before proceeding

### 2. Transaction Fees
- Set transaction fee percentage (0-10%)
- Choose between default (50/50) or custom distribution
- Configure buyback and treasury percentages

### 3. Buyback & Burn
- Select trigger type (threshold, time, or hybrid)
- Set threshold amounts and time periods
- Configure maximum buyback per transaction

### 4. Contract Preview
- Review generated smart contract code
- Run tests to ensure functionality
- Download contract for manual deployment

### 5. Deployment
- Connect your TON wallet
- Select target network (mainnet/testnet/local)
- Deploy contract with one click

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run watch` - Watch for file changes
- `npm run build` - Build for production
- `npm run production` - Build optimized production assets

### Component Structure

The application uses a modular component architecture:

- **Header**: Navigation and wallet connection
- **Sidebar**: Progress tracking and quick actions
- **TokenConfiguration**: Token setup form
- **TransactionFeeSettings**: Fee configuration
- **BuybackBurnSettings**: Buyback mechanism setup
- **ContractPreview**: Code review and testing
- **ActionCards**: Deployment actions

### State Management

Pinia stores manage application state:

- **contractStore**: Contract configuration and operations
- **walletStore**: Wallet connection and address management

## 🌐 API Endpoints

The backend provides the following endpoints:

- `POST /api/compile` - Compile contract from configuration
- `POST /api/test` - Run contract tests
- `POST /api/deploy` - Deploy contract to network
- `GET /api/status` - Get deployment status

## 🎨 Styling

The application uses Bootstrap 5 with custom SCSS:

- Responsive grid system
- Modern card-based layouts
- Custom color scheme and gradients
- Dark mode support
- Smooth animations and transitions

## 🔒 Security

- Input validation on all forms
- Secure API endpoints
- Wallet signature verification
- Network-specific security measures

## 🚀 Deployment

### Production Build

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set production environment**
   ```env
   NODE_ENV=production
   ```

3. **Start production server**
   ```bash
   npm start
   ```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆚 Comparison with React Version

This Vue.js version provides the same functionality as the React version but with:

- **Vue 3 Composition API** instead of React hooks
- **Pinia** instead of React Query for state management
- **Bootstrap 5** instead of Tailwind CSS
- **Laravel Mix** instead of Vite for building
- **Vue Router** instead of Wouter
- **SCSS** instead of CSS-in-JS

## 🆘 Support

For support and questions:

- Create an issue on GitHub
- Check the documentation
- Join our community discussions

## 🔗 Links

- [TON Blockchain](https://ton.org/)
- [Vue.js Documentation](https://vuejs.org/)
- [Bootstrap Documentation](https://getbootstrap.com/)
- [Pinia Documentation](https://pinia.vuejs.org/) 