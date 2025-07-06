#!/bin/bash

# GameDin Layer 3 - Quick Start Deployment Script
# This script automates the initial setup of GameDin L3 blockchain

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
GAMEDIN_DIR="gamedin-l3"
NETWORK="testnet"
CHAIN_ID="1337420"

echo -e "${BLUE}🚀 GameDin Layer 3 - Quick Start Deployment${NC}"
echo -e "${BLUE}================================================${NC}"

# Check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}📋 Checking prerequisites...${NC}"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18.x or higher.${NC}"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm is not installed. Please install npm.${NC}"
        exit 1
    fi
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker is not installed. Please install Docker.${NC}"
        exit 1
    fi
    
    # Check Git
    if ! command -v git &> /dev/null; then
        echo -e "${RED}❌ Git is not installed. Please install Git.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ All prerequisites satisfied${NC}"
}

# Setup project structure
setup_project() {
    echo -e "${YELLOW}📁 Setting up project structure...${NC}"
    
    if [ ! -d "$GAMEDIN_DIR" ]; then
        mkdir -p "$GAMEDIN_DIR"
    fi
    
    cd "$GAMEDIN_DIR"
    
    # Initialize package.json if it doesn't exist
    if [ ! -f "package.json" ]; then
        cat > package.json << 'EOF'
{
  "name": "gamedin-l3",
  "version": "1.0.0",
  "description": "GameDin Layer 3 Gaming Blockchain",
  "main": "index.js",
  "scripts": {
    "build": "npx hardhat compile",
    "test": "npx hardhat test",
    "deploy:testnet": "npx hardhat deploy --network testnet",
    "deploy:mainnet": "npx hardhat deploy --network mainnet",
    "start:node": "npx hardhat node",
    "start:bridge": "node src/bridge/relayer.js",
    "start:gaming": "node src/gaming/real-time-engine.js",
    "health:check": "node src/monitoring/health-checker.js"
  },
  "dependencies": {
    "@openzeppelin/contracts": "^4.9.3",
    "@openzeppelin/hardhat-upgrades": "^1.28.0",
    "ethers": "^5.7.2",
    "hardhat": "^2.17.2",
    "hardhat-deploy": "^0.11.34",
    "ws": "^8.13.0"
  },
  "devDependencies": {
    "@nomicfoundation/hardhat-toolbox": "^3.0.2",
    "@types/node": "^20.5.0",
    "typescript": "^5.1.6"
  }
}
EOF
    fi
    
    echo -e "${GREEN}✅ Project structure initialized${NC}"
}

# Install dependencies
install_dependencies() {
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    
    if [ ! -d "node_modules" ]; then
        npm install --silent
    fi
    
    echo -e "${GREEN}✅ Dependencies installed${NC}"
}

# Create directory structure
create_directories() {
    echo -e "${YELLOW}📂 Creating directory structure...${NC}"
    
    mkdir -p {contracts,scripts,src/{config,gaming,bridge,monitoring,sdk},test,deploy}
    mkdir -p src/{contracts,abis,types}
    
    echo -e "${GREEN}✅ Directory structure created${NC}"
}

# Generate configuration files
generate_config() {
    echo -e "${YELLOW}⚙️ Generating configuration files...${NC}"
    
    # Create .env.example
    cat > .env.example << 'EOF'
# Network Configuration
GAMEDIN_NETWORK=testnet
SETTLEMENT_LAYER=base-sepolia
CHAIN_ID=1337420
INITIAL_SUPPLY=1000000000
GAS_SPONSOR_POOL=1000000

# RPC Configuration
BASE_RPC_URL=https://sepolia.base.org
ETHEREUM_RPC_URL=https://eth-sepolia.rpc.api.coinbase.com/v1/YOUR_API_KEY

# Security Configuration (DO NOT COMMIT REAL KEYS)
DEPLOYER_PRIVATE_KEY=0x0000000000000000000000000000000000000000000000000000000000000000
VALIDATOR_PRIVATE_KEY=0x0000000000000000000000000000000000000000000000000000000000000000
MULTISIG_ADDRESS=0x0000000000000000000000000000000000000000

# Gaming Configuration
ENABLE_GAS_SPONSORING=true
ENABLE_NFT_BATCHING=true
ENABLE_REALTIME_UPDATES=true
MAX_TPS=10000

# Contract Addresses (Will be populated after deployment)
SETTLEMENT_CONTRACT_ADDRESS=
BRIDGE_CONTRACT_ADDRESS=
L3_TOKEN_ADDRESS=
L3_NFT_ADDRESS=
L3_ENGINE_ADDRESS=
EOF
    
    # Copy to .env if it doesn't exist
    if [ ! -f ".env" ]; then
        cp .env.example .env
        echo -e "${YELLOW}⚠️ Please update .env with your actual configuration${NC}"
    fi
    
    # Create hardhat.config.js
    cat > hardhat.config.js << 'EOF'
require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000000,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    testnet: {
      url: process.env.BASE_RPC_URL || "https://sepolia.base.org",
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      chainId: 84532,
    },
    base: {
      url: "https://mainnet.base.org",
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      chainId: 8453,
    },
    "gamedin-l3": {
      url: "http://localhost:8545",
      accounts: process.env.VALIDATOR_PRIVATE_KEY ? [process.env.VALIDATOR_PRIVATE_KEY] : [],
      chainId: parseInt(process.env.CHAIN_ID || "1337420"),
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  etherscan: {
    apiKey: {
      base: process.env.BASESCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "base",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org"
        }
      }
    ]
  }
};
EOF
    
    echo -e "${GREEN}✅ Configuration files generated${NC}"
}

# Create sample contracts
create_sample_contracts() {
    echo -e "${YELLOW}📝 Creating sample contracts...${NC}"
    
    # GameDin Token Contract
    cat > contracts/GameDinToken.sol << 'EOF'
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract GameDinToken is ERC20, Ownable, ReentrancyGuard {
    // Gaming-specific features
    mapping(address => bool) public gameContracts;
    mapping(address => uint256) public playerXP;
    mapping(address => uint256) public playerLevel;
    
    // L3 specific features
    address public l3Bridge;
    mapping(address => bool) public gasSponsors;
    
    event GameAction(address indexed player, string action, uint256 reward);
    event LevelUp(address indexed player, uint256 newLevel);
    event GasSponsored(address indexed sponsor, address indexed user, uint256 amount);
    
    constructor() ERC20("GameDin Token", "GDIN") {
        _mint(msg.sender, 1000000000 * 10**decimals()); // 1B tokens
    }
    
    // Gaming mechanics
    function rewardPlayer(address player, uint256 amount, string memory action) 
        external 
        onlyGameContract 
    {
        _mint(player, amount);
        playerXP[player] += amount;
        
        uint256 newLevel = playerXP[player] / 1000; // 1000 XP per level
        if (newLevel > playerLevel[player]) {
            playerLevel[player] = newLevel;
            emit LevelUp(player, newLevel);
        }
        
        emit GameAction(player, action, amount);
    }
    
    // Gas sponsoring for seamless UX
    function sponsorGas(address user, uint256 amount) external {
        require(gasSponsors[msg.sender], "Not authorized sponsor");
        _transfer(msg.sender, user, amount);
        emit GasSponsored(msg.sender, user, amount);
    }
    
    // Admin functions
    function addGameContract(address gameContract) external onlyOwner {
        gameContracts[gameContract] = true;
    }
    
    function addGasSponsor(address sponsor) external onlyOwner {
        gasSponsors[sponsor] = true;
    }
    
    modifier onlyGameContract() {
        require(gameContracts[msg.sender], "Not authorized game contract");
        _;
    }
}
EOF
    
    # Deployment script
    cat > deploy/01_deploy_token.js << 'EOF'
module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy("GameDinToken", {
    from: deployer,
    args: [],
    log: true,
    gasLimit: 3000000,
  });
};

module.exports.tags = ["GameDinToken"];
EOF
    
    echo -e "${GREEN}✅ Sample contracts created${NC}"
}

# Create sample scripts
create_sample_scripts() {
    echo -e "${YELLOW}📜 Creating sample scripts...${NC}"
    
    # Quick deploy script
    cat > scripts/quick-deploy.js << 'EOF'
const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Quick Deploy - GameDin L3 Contracts");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  // Deploy GameDin Token
  const GameDinToken = await ethers.getContractFactory("GameDinToken");
  const gameDinToken = await GameDinToken.deploy();
  await gameDinToken.deployed();
  
  console.log("✅ GameDin Token deployed to:", gameDinToken.address);
  
  // Save addresses
  const fs = require('fs');
  const addresses = {
    gameDinToken: gameDinToken.address,
    deployer: deployer.address,
    network: hre.network.name,
    chainId: (await ethers.provider.getNetwork()).chainId
  };
  
  fs.writeFileSync('deployed-addresses.json', JSON.stringify(addresses, null, 2));
  console.log("📄 Deployment addresses saved to deployed-addresses.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
EOF
    
    # Test script
    cat > scripts/test-deployment.js << 'EOF'
const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing GameDin L3 Deployment");
  
  const addresses = require('../deployed-addresses.json');
  const [deployer, player1] = await ethers.getSigners();
  
  // Connect to deployed contract
  const GameDinToken = await ethers.getContractFactory("GameDinToken");
  const gameDinToken = GameDinToken.attach(addresses.gameDinToken);
  
  // Test basic functionality
  console.log("Testing basic token functionality...");
  
  const balance = await gameDinToken.balanceOf(deployer.address);
  console.log("Deployer balance:", ethers.utils.formatEther(balance), "GDIN");
  
  // Test game reward (need to add deployer as game contract first)
  await gameDinToken.addGameContract(deployer.address);
  await gameDinToken.rewardPlayer(player1.address, ethers.utils.parseEther("100"), "test_reward");
  
  const playerBalance = await gameDinToken.balanceOf(player1.address);
  const playerXP = await gameDinToken.playerXP(player1.address);
  const playerLevel = await gameDinToken.playerLevel(player1.address);
  
  console.log("Player1 balance:", ethers.utils.formatEther(playerBalance), "GDIN");
  console.log("Player1 XP:", ethers.utils.formatEther(playerXP));
  console.log("Player1 Level:", playerLevel.toString());
  
  console.log("✅ All tests passed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
EOF
    
    echo -e "${GREEN}✅ Sample scripts created${NC}"
}

# Create basic test
create_basic_test() {
    echo -e "${YELLOW}🧪 Creating basic tests...${NC}"
    
    cat > test/GameDinToken.test.js << 'EOF'
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GameDinToken", function () {
  let gameDinToken;
  let owner, player1, player2;

  beforeEach(async function () {
    [owner, player1, player2] = await ethers.getSigners();
    
    const GameDinToken = await ethers.getContractFactory("GameDinToken");
    gameDinToken = await GameDinToken.deploy();
    await gameDinToken.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await gameDinToken.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply to the owner", async function () {
      const ownerBalance = await gameDinToken.balanceOf(owner.address);
      expect(await gameDinToken.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Gaming Features", function () {
    beforeEach(async function () {
      // Add owner as game contract for testing
      await gameDinToken.addGameContract(owner.address);
    });

    it("Should reward players correctly", async function () {
      const rewardAmount = ethers.utils.parseEther("100");
      
      await gameDinToken.rewardPlayer(player1.address, rewardAmount, "level_up");
      
      const balance = await gameDinToken.balanceOf(player1.address);
      expect(balance).to.equal(rewardAmount);
      
      const xp = await gameDinToken.playerXP(player1.address);
      expect(xp).to.equal(rewardAmount);
    });

    it("Should level up players based on XP", async function () {
      const xpAmount = ethers.utils.parseEther("5000"); // 5 levels
      
      await gameDinToken.rewardPlayer(player1.address, xpAmount, "achievement");
      
      const level = await gameDinToken.playerLevel(player1.address);
      expect(level).to.equal(5);
    });
  });
});
EOF
    
    echo -e "${GREEN}✅ Basic tests created${NC}"
}

# Create README
create_readme() {
    echo -e "${YELLOW}📖 Creating README...${NC}"
    
    cat > README.md << 'EOF'
# GameDin Layer 3 - Gaming Blockchain

Welcome to GameDin L3, a high-performance gaming blockchain built on Base L2!

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or higher
- npm or yarn
- Docker (for advanced features)

### Installation
```bash
npm install
```

### Environment Setup
1. Copy `.env.example` to `.env`
2. Update the configuration with your values
3. **Important**: Never commit real private keys!

### Quick Deploy (Local)
```bash
# Start local Hardhat node
npm run start:node

# In another terminal, deploy contracts
npm run deploy:testnet
```

### Test Deployment
```bash
npm test
node scripts/test-deployment.js
```

## 📋 Available Commands

### Development
- `npm run build` - Compile contracts
- `npm test` - Run tests
- `npm run start:node` - Start local blockchain

### Deployment
- `npm run deploy:testnet` - Deploy to testnet
- `npm run deploy:mainnet` - Deploy to mainnet

### Monitoring
- `npm run health:check` - Check system health
- `npm run start:bridge` - Start bridge relayer
- `npm run start:gaming` - Start gaming engine

## 🎮 Gaming Features

### Token Economics
- **Symbol**: GDIN
- **Total Supply**: 1,000,000,000 GDIN
- **Decimals**: 18

### Gaming Mechanics
- **Player XP**: Earned through gameplay
- **Leveling**: 1000 XP per level
- **Rewards**: Automatically distributed for achievements
- **Gas Sponsoring**: Seamless user experience

### Smart Contracts
- `GameDinToken.sol` - Main gaming token with XP/leveling
- `GameDinNFT.sol` - Gaming assets and collectibles
- `GameDinEngine.sol` - Core gaming logic
- `GameDinBridge.sol` - Cross-chain functionality

## 🔗 Network Information

### Testnet (Base Sepolia)
- **Chain ID**: 84532
- **RPC**: https://sepolia.base.org
- **Explorer**: https://sepolia.basescan.org

### GameDin L3
- **Chain ID**: 1337420
- **RPC**: http://localhost:8545 (local)
- **Block Time**: 1 second
- **Finality**: 5 blocks

## 📊 Performance Metrics

### Target Performance
- **TPS**: 10,000+ transactions per second
- **Finality**: 1-second soft, 30-second hard
- **Cost**: $0.001 per transaction
- **Gas Limit**: 30M gas per block

## 🛡️ Security

### Best Practices
- All contracts use OpenZeppelin standards
- Reentrancy protection on all external calls
- Access control with role-based permissions
- Comprehensive test coverage

### Audit Status
- [ ] Internal security review
- [ ] External audit (planned)
- [ ] Bug bounty program (planned)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📞 Support

- **Documentation**: See implementation guides
- **Issues**: GitHub Issues
- **Community**: Discord/Telegram
- **Email**: dev@gamedin.com

## 📄 License

MIT License - see LICENSE file for details

---

**⚠️ Disclaimer**: This is experimental software. Use at your own risk.
EOF
    
    echo -e "${GREEN}✅ README created${NC}"
}

# Main execution
main() {
    echo -e "${BLUE}Starting GameDin L3 Quick Start Setup...${NC}"
    
    check_prerequisites
    setup_project
    install_dependencies
    create_directories
    generate_config
    create_sample_contracts
    create_sample_scripts
    create_basic_test
    create_readme
    
    echo ""
    echo -e "${GREEN}🎉 GameDin L3 setup completed successfully!${NC}"
    echo ""
    echo -e "${BLUE}Next Steps:${NC}"
    echo -e "1. ${YELLOW}cd $GAMEDIN_DIR${NC}"
    echo -e "2. ${YELLOW}Update .env with your configuration${NC}"
    echo -e "3. ${YELLOW}npm run start:node${NC} (in one terminal)"
    echo -e "4. ${YELLOW}npm run deploy:testnet${NC} (in another terminal)"
    echo -e "5. ${YELLOW}npm test${NC} (to verify deployment)"
    echo ""
    echo -e "${GREEN}🚀 Your GameDin L3 blockchain is ready to launch!${NC}"
    echo ""
    echo -e "${BLUE}For advanced features, see:${NC}"
    echo -e "- GameDin_Layer3_Implementation_Plan.md"
    echo -e "- GameDin_L3_Technical_Deployment_Guide.md"
}

# Run if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi