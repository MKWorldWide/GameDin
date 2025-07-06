// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./interfaces/INovaSanctumOracle.sol";

/**
 * @title GameDin Enhanced Consensus Contract
 * @dev XRP-inspired trust-based consensus with gaming optimizations and AI integration
 * @notice Implements gaming-optimized Byzantine Fault Tolerance with NovaSanctum AI
 */
contract GameDinEnhancedConsensus is AccessControl, ReentrancyGuard, Pausable {
    
    // ============ ROLES ============
    bytes32 public constant VALIDATOR_ROLE = keccak256("VALIDATOR_ROLE");
    bytes32 public constant UNL_PUBLISHER_ROLE = keccak256("UNL_PUBLISHER_ROLE");
    bytes32 public constant AI_ORACLE_ROLE = keccak256("AI_ORACLE_ROLE");
    bytes32 public constant GAME_MASTER_ROLE = keccak256("GAME_MASTER_ROLE");
    
    // ============ CONSENSUS PARAMETERS ============
    uint256 public constant GAMING_CONSENSUS_THRESHOLD = 67; // 67% for faster gaming
    uint256 public constant CRITICAL_GAMING_THRESHOLD = 60;  // 60% for real-time actions
    uint256 public constant STANDARD_THRESHOLD = 80;         // 80% for non-gaming transactions
    
    uint256 public constant MIN_UNL_OVERLAP = 90;            // 90% minimum overlap between UNLs
    uint256 public constant MIN_VALIDATOR_COUNT = 7;         // Minimum validators for security
    uint256 public constant MAX_VALIDATOR_COUNT = 150;       // Maximum for performance
    
    // ============ STRUCTS ============
    
    struct ValidatorInfo {
        address validatorAddress;
        string domainName;
        uint256 trustScore;
        uint256 gamingScore;           // Gaming infrastructure capability
        uint256 uptime;                // Historical uptime percentage
        uint256 participationRate;    // Consensus participation rate
        bool isActive;
        bool isGamingOptimized;        // Supports gaming-specific features
        uint256 registeredAt;
        uint256 lastActiveBlock;
        mapping(address => bool) trustedBy; // Which validators trust this one
    }
    
    struct UNLInfo {
        address publisher;
        string publisherName;
        bytes32 listHash;
        uint256 version;
        uint256 activationBlock;
        uint256 expirationBlock;
        address[] validators;
        bool isActive;
    }
    
    struct ConsensusRound {
        uint256 roundId;
        bytes32 proposalHash;
        uint256 startBlock;
        uint256 endBlock;
        TransactionType roundType;
        uint256 threshold;             // Dynamic threshold based on round type
        uint256 votes;
        uint256 totalValidators;
        bool isFinalized;
        mapping(address => bool) hasVoted;
        mapping(address => bytes32) validatorVotes;
    }
    
    struct AIConsensusData {
        uint256 fraudScore;            // AI-calculated fraud probability
        uint256 validatorHealthScore;  // Network health assessment
        uint256 optimalThreshold;      // AI-recommended consensus threshold
        bytes32 aiDataHash;           // Hash of AI analysis data
        uint256 timestamp;
    }
    
    enum TransactionType {
        CRITICAL_GAME_ACTION,     // Combat, trades, real-time actions
        STANDARD_GAME_ACTION,     // Regular gameplay
        ASSET_TRANSFER,           // NFT transfers, trading
        CROSS_CHAIN_BRIDGE,       // Bridge operations
        ADMINISTRATIVE,           // Account management, governance
        STANDARD                  // General transactions
    }
    
    // ============ STATE VARIABLES ============
    
    mapping(address => ValidatorInfo) public validators;
    mapping(bytes32 => UNLInfo) public uniqueNodeLists;
    mapping(uint256 => ConsensusRound) public consensusRounds;
    mapping(bytes32 => AIConsensusData) public aiConsensusData;
    
    address[] public activeValidators;
    bytes32[] public activeUNLs;
    uint256 public currentRoundId;
    uint256 public totalValidators;
    
    // Gaming-specific state
    mapping(address => uint256) public gamingTransactionPriority;
    mapping(TransactionType => uint256) public typeBasedThresholds;
    
    // AI Integration
    INovaSanctumOracle public novaSanctumOracle;
    bool public aiEnhancedConsensus = true;
    
    // ============ EVENTS ============
    
    event ValidatorRegistered(address indexed validator, string domain, uint256 gamingScore);
    event ValidatorTrusted(address indexed trustee, address indexed trusted);
    event UNLPublished(bytes32 indexed listId, address indexed publisher, uint256 version);
    event ConsensusRoundStarted(uint256 indexed roundId, TransactionType roundType, uint256 threshold);
    event ConsensusAchieved(uint256 indexed roundId, bytes32 proposalHash, uint256 votes);
    event AIConsensusOptimization(uint256 indexed roundId, uint256 optimalThreshold, uint256 fraudScore);
    event GamingTransactionPrioritized(bytes32 indexed txHash, TransactionType txType, uint256 priority);
    
    // ============ MODIFIERS ============
    
    modifier onlyActiveValidator() {
        require(validators[msg.sender].isActive, "Not an active validator");
        _;
    }
    
    modifier aiEnhanced() {
        if (aiEnhancedConsensus && address(novaSanctumOracle) != address(0)) {
            _;
        } else {
            _;
        }
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor(address _novaSanctumOracle) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(UNL_PUBLISHER_ROLE, msg.sender);
        
        if (_novaSanctumOracle != address(0)) {
            novaSanctumOracle = INovaSanctumOracle(_novaSanctumOracle);
            _grantRole(AI_ORACLE_ROLE, _novaSanctumOracle);
        }
        
        // Initialize gaming-optimized thresholds
        typeBasedThresholds[TransactionType.CRITICAL_GAME_ACTION] = CRITICAL_GAMING_THRESHOLD;
        typeBasedThresholds[TransactionType.STANDARD_GAME_ACTION] = GAMING_CONSENSUS_THRESHOLD;
        typeBasedThresholds[TransactionType.ASSET_TRANSFER] = GAMING_CONSENSUS_THRESHOLD;
        typeBasedThresholds[TransactionType.CROSS_CHAIN_BRIDGE] = STANDARD_THRESHOLD;
        typeBasedThresholds[TransactionType.ADMINISTRATIVE] = STANDARD_THRESHOLD;
        typeBasedThresholds[TransactionType.STANDARD] = STANDARD_THRESHOLD;
    }
    
    // ============ VALIDATOR MANAGEMENT ============
    
    /**
     * @dev Register a new validator with gaming capabilities
     */
    function registerValidator(
        string calldata domainName,
        bool isGamingOptimized,
        bytes calldata aiValidationData
    ) external {
        require(bytes(domainName).length > 0, "Domain name required");
        require(!validators[msg.sender].isActive, "Already registered");
        require(totalValidators < MAX_VALIDATOR_COUNT, "Max validators reached");
        
        uint256 gamingScore = 0;
        uint256 trustScore = 50; // Default trust score
        
        // AI-enhanced validator assessment
        if (aiEnhancedConsensus && address(novaSanctumOracle) != address(0)) {
            (gamingScore, trustScore) = novaSanctumOracle.assessValidator(
                msg.sender,
                domainName,
                isGamingOptimized,
                aiValidationData
            );
            require(gamingScore >= 50, "Insufficient gaming score");
        } else if (isGamingOptimized) {
            gamingScore = 75; // Default for gaming validators
        }
        
        ValidatorInfo storage validator = validators[msg.sender];
        validator.validatorAddress = msg.sender;
        validator.domainName = domainName;
        validator.trustScore = trustScore;
        validator.gamingScore = gamingScore;
        validator.isActive = true;
        validator.isGamingOptimized = isGamingOptimized;
        validator.registeredAt = block.number;
        validator.lastActiveBlock = block.number;
        validator.uptime = 100; // Start with 100% uptime
        validator.participationRate = 100; // Start with 100% participation
        
        activeValidators.push(msg.sender);
        totalValidators++;
        
        _grantRole(VALIDATOR_ROLE, msg.sender);
        
        emit ValidatorRegistered(msg.sender, domainName, gamingScore);
    }
    
    /**
     * @dev Add trust relationship between validators (XRP-style UNL)
     */
    function addTrust(address trustedValidator) external onlyActiveValidator {
        require(validators[trustedValidator].isActive, "Target not active validator");
        require(trustedValidator != msg.sender, "Cannot trust self");
        
        validators[trustedValidator].trustedBy[msg.sender] = true;
        
        emit ValidatorTrusted(msg.sender, trustedValidator);
    }
    
    /**
     * @dev Remove trust relationship
     */
    function removeTrust(address trustedValidator) external onlyActiveValidator {
        validators[trustedValidator].trustedBy[msg.sender] = false;
    }
    
    // ============ UNL MANAGEMENT ============
    
    /**
     * @dev Publish a new Unique Node List (UNL) - XRP-inspired
     */
    function publishUNL(
        string calldata publisherName,
        address[] calldata validatorList,
        uint256 activationBlock,
        uint256 expirationBlock
    ) external onlyRole(UNL_PUBLISHER_ROLE) {
        require(validatorList.length >= MIN_VALIDATOR_COUNT, "Insufficient validators");
        require(activationBlock > block.number, "Activation must be future");
        require(expirationBlock > activationBlock, "Invalid expiration");
        
        // Validate all validators in the list
        for (uint256 i = 0; i < validatorList.length; i++) {
            require(validators[validatorList[i]].isActive, "Invalid validator in list");
        }
        
        bytes32 listId = keccak256(abi.encodePacked(
            msg.sender,
            publisherName,
            block.number,
            validatorList
        ));
        
        UNLInfo storage unl = uniqueNodeLists[listId];
        unl.publisher = msg.sender;
        unl.publisherName = publisherName;
        unl.listHash = keccak256(abi.encodePacked(validatorList));
        unl.version = block.number;
        unl.activationBlock = activationBlock;
        unl.expirationBlock = expirationBlock;
        unl.validators = validatorList;
        unl.isActive = true;
        
        activeUNLs.push(listId);
        
        emit UNLPublished(listId, msg.sender, block.number);
    }
    
    /**
     * @dev Calculate UNL overlap percentage (XRP-style safety check)
     */
    function calculateUNLOverlap(bytes32 unl1, bytes32 unl2) external view returns (uint256) {
        address[] memory list1 = uniqueNodeLists[unl1].validators;
        address[] memory list2 = uniqueNodeLists[unl2].validators;
        
        uint256 overlap = 0;
        for (uint256 i = 0; i < list1.length; i++) {
            for (uint256 j = 0; j < list2.length; j++) {
                if (list1[i] == list2[j]) {
                    overlap++;
                    break;
                }
            }
        }
        
        uint256 minLength = list1.length < list2.length ? list1.length : list2.length;
        return (overlap * 100) / minLength;
    }
    
    // ============ GAMING-OPTIMIZED CONSENSUS ============
    
    /**
     * @dev Start a consensus round with gaming-specific optimizations
     */
    function startConsensusRound(
        bytes32 proposalHash,
        TransactionType txType,
        bytes calldata aiAnalysisData
    ) external onlyActiveValidator aiEnhanced {
        uint256 roundId = ++currentRoundId;
        
        // AI-optimized threshold selection
        uint256 threshold = typeBasedThresholds[txType];
        uint256 aiOptimalThreshold = threshold;
        
        if (aiEnhancedConsensus && address(novaSanctumOracle) != address(0)) {
            (aiOptimalThreshold, ) = novaSanctumOracle.optimizeConsensusThreshold(
                roundId,
                txType,
                activeValidators.length,
                aiAnalysisData
            );
            
            // Use AI recommendation if it's reasonable
            if (aiOptimalThreshold >= 51 && aiOptimalThreshold <= 90) {
                threshold = aiOptimalThreshold;
            }
        }
        
        ConsensusRound storage round = consensusRounds[roundId];
        round.roundId = roundId;
        round.proposalHash = proposalHash;
        round.startBlock = block.number;
        round.roundType = txType;
        round.threshold = threshold;
        round.totalValidators = activeValidators.length;
        
        // Set end block based on transaction type (gaming optimization)
        if (txType == TransactionType.CRITICAL_GAME_ACTION) {
            round.endBlock = block.number + 2; // ~100ms for critical gaming
        } else if (txType == TransactionType.STANDARD_GAME_ACTION) {
            round.endBlock = block.number + 5; // ~500ms for standard gaming
        } else {
            round.endBlock = block.number + 20; // ~1s for other transactions
        }
        
        emit ConsensusRoundStarted(roundId, txType, threshold);
    }
    
    /**
     * @dev Submit a vote for consensus round
     */
    function submitVote(
        uint256 roundId,
        bytes32 voteHash,
        bytes calldata aiValidationData
    ) external onlyActiveValidator {
        ConsensusRound storage round = consensusRounds[roundId];
        require(round.startBlock > 0, "Round does not exist");
        require(block.number <= round.endBlock, "Voting period ended");
        require(!round.hasVoted[msg.sender], "Already voted");
        require(!round.isFinalized, "Round finalized");
        
        // AI-enhanced vote validation
        bool voteValid = true;
        if (aiEnhancedConsensus && address(novaSanctumOracle) != address(0)) {
            voteValid = novaSanctumOracle.validateVote(
                msg.sender,
                roundId,
                voteHash,
                aiValidationData
            );
        }
        
        require(voteValid, "AI vote validation failed");
        
        round.hasVoted[msg.sender] = true;
        round.validatorVotes[msg.sender] = voteHash;
        
        // Count votes for the proposal
        if (voteHash == round.proposalHash) {
            round.votes++;
        }
        
        // Check if consensus achieved
        uint256 votesPercentage = (round.votes * 100) / round.totalValidators;
        if (votesPercentage >= round.threshold) {
            round.isFinalized = true;
            emit ConsensusAchieved(roundId, round.proposalHash, round.votes);
        }
    }
    
    // ============ AI INTEGRATION ============
    
    /**
     * @dev Update AI consensus data from NovaSanctum
     */
    function updateAIConsensusData(
        bytes32 dataId,
        uint256 fraudScore,
        uint256 validatorHealthScore,
        uint256 optimalThreshold,
        bytes32 aiDataHash
    ) external onlyRole(AI_ORACLE_ROLE) {
        aiConsensusData[dataId] = AIConsensusData({
            fraudScore: fraudScore,
            validatorHealthScore: validatorHealthScore,
            optimalThreshold: optimalThreshold,
            aiDataHash: aiDataHash,
            timestamp: block.timestamp
        });
    }
    
    /**
     * @dev Gaming transaction prioritization with AI
     */
    function prioritizeGamingTransaction(
        bytes32 txHash,
        TransactionType txType,
        bytes calldata gameContext
    ) external onlyRole(GAME_MASTER_ROLE) aiEnhanced returns (uint256 priority) {
        priority = uint256(txType); // Default priority
        
        if (aiEnhancedConsensus && address(novaSanctumOracle) != address(0)) {
            priority = novaSanctumOracle.calculateGamingPriority(txHash, txType, gameContext);
        }
        
        gamingTransactionPriority[tx.origin] = priority;
        
        emit GamingTransactionPrioritized(txHash, txType, priority);
        return priority;
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get validator trust relationships
     */
    function getValidatorTrusts(address validator) external view returns (address[] memory trustedBy) {
        uint256 count = 0;
        
        // Count trusted relationships
        for (uint256 i = 0; i < activeValidators.length; i++) {
            if (validators[validator].trustedBy[activeValidators[i]]) {
                count++;
            }
        }
        
        // Build array
        trustedBy = new address[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < activeValidators.length; i++) {
            if (validators[validator].trustedBy[activeValidators[i]]) {
                trustedBy[index] = activeValidators[i];
                index++;
            }
        }
        
        return trustedBy;
    }
    
    /**
     * @dev Get consensus round status
     */
    function getConsensusRoundStatus(uint256 roundId) external view returns (
        bool isActive,
        bool isFinalized,
        uint256 votes,
        uint256 threshold,
        uint256 percentage,
        TransactionType txType
    ) {
        ConsensusRound storage round = consensusRounds[roundId];
        isActive = round.startBlock > 0 && block.number <= round.endBlock && !round.isFinalized;
        isFinalized = round.isFinalized;
        votes = round.votes;
        threshold = round.threshold;
        percentage = round.totalValidators > 0 ? (votes * 100) / round.totalValidators : 0;
        txType = round.roundType;
    }
    
    /**
     * @dev Get active validators with gaming capabilities
     */
    function getGamingValidators() external view returns (address[] memory gamingValidators) {
        uint256 count = 0;
        
        // Count gaming validators
        for (uint256 i = 0; i < activeValidators.length; i++) {
            if (validators[activeValidators[i]].isGamingOptimized) {
                count++;
            }
        }
        
        // Build array
        gamingValidators = new address[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < activeValidators.length; i++) {
            if (validators[activeValidators[i]].isGamingOptimized) {
                gamingValidators[index] = activeValidators[i];
                index++;
            }
        }
        
        return gamingValidators;
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Set NovaSanctum Oracle address
     */
    function setNovaSanctumOracle(address _oracle) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (address(novaSanctumOracle) != address(0)) {
            _revokeRole(AI_ORACLE_ROLE, address(novaSanctumOracle));
        }
        
        novaSanctumOracle = INovaSanctumOracle(_oracle);
        
        if (_oracle != address(0)) {
            _grantRole(AI_ORACLE_ROLE, _oracle);
        }
    }
    
    /**
     * @dev Toggle AI-enhanced consensus
     */
    function setAIEnhancedConsensus(bool enabled) external onlyRole(DEFAULT_ADMIN_ROLE) {
        aiEnhancedConsensus = enabled;
    }
    
    /**
     * @dev Update consensus thresholds for different transaction types
     */
    function updateConsensusThreshold(
        TransactionType txType,
        uint256 newThreshold
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newThreshold >= 51 && newThreshold <= 90, "Invalid threshold");
        typeBasedThresholds[txType] = newThreshold;
    }
    
    /**
     * @dev Emergency pause
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}

// ============ INTERFACES ============

interface INovaSanctumOracle {
    function assessValidator(
        address validator,
        string calldata domain,
        bool isGamingOptimized,
        bytes calldata data
    ) external returns (uint256 gamingScore, uint256 trustScore);
    
    function optimizeConsensusThreshold(
        uint256 roundId,
        GameDinEnhancedConsensus.TransactionType txType,
        uint256 validatorCount,
        bytes calldata data
    ) external returns (uint256 optimalThreshold, uint256 confidence);
    
    function validateVote(
        address voter,
        uint256 roundId,
        bytes32 voteHash,
        bytes calldata data
    ) external returns (bool isValid);
    
    function calculateGamingPriority(
        bytes32 txHash,
        GameDinEnhancedConsensus.TransactionType txType,
        bytes calldata gameContext
    ) external returns (uint256 priority);
}