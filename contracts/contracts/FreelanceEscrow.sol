// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";

contract FreelanceEscrow is ReentrancyGuard {
    using SafeERC20 for IERC20;
    using ECDSA for bytes32;

    struct Escrow {
        address client;
        address freelancer;
        uint256 usdcAmount;
        bool funded;
        bool released;
        bool refunded;
        uint256 deadline;
        uint256 totalInstallments;
        uint256 installmentsPaid;
        uint256 installmentAmount;
        uint256 paidAmount;
    }

    mapping(uint256 => Escrow) public escrows;
    uint256 public escrowCount;

    // Per-escrow nonces for EIP-712 signature replay protection
    mapping(uint256 => uint256) public nonces;

    ISwapRouter public immutable swapRouter;
    address public immutable USDC;

    uint24 public constant POOL_FEE = 3000;
    uint256 public constant REFUND_TIMELOCK = 3 days;

    // EIP-712 Domain
    bytes32 public constant DOMAIN_TYPEHASH = keccak256(
        "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
    );
    bytes32 public constant RELEASE_TYPEHASH = keccak256(
        "Release(uint256 id,uint256 nonce,uint256 amount)"
    );
    string public constant NAME = "FreelanceEscrow";
    string public constant VERSION = "1";

    event EscrowCreated(uint256 id, address client, address freelancer);
    event Deposited(uint256 id, uint256 amount);
    event Released(uint256 id, uint256 amount);
    event Refunded(uint256 id);
    event Cancelled(uint256 id);
    event InstallmentReleased(uint256 indexed id, uint256 indexed installmentIndex, uint256 amount, address recipient);
    event ClaimReleased(uint256 indexed id, address indexed recipient, uint256 amount, uint256 nonce);
    event TransactionLog(uint256 indexed escrowId, address indexed actor, string reason, string action);

    constructor(address _router, address _usdc) {
        swapRouter = ISwapRouter(_router);
        USDC = _usdc;
    }

    // ---------------- EIP-712 HELPERS ----------------

    function DOMAIN_SEPARATOR() public view returns (bytes32) {
        return keccak256(
            abi.encode(
                DOMAIN_TYPEHASH,
                keccak256(bytes(NAME)),
                keccak256(bytes(VERSION)),
                block.chainid,
                address(this)
            )
        );
    }

    function nonceOf(uint256 id) external view returns (uint256) {
        return nonces[id];
    }

    function hashRelease(uint256 id, uint256 nonce, uint256 amount) public view returns (bytes32) {
        bytes32 structHash = keccak256(abi.encode(RELEASE_TYPEHASH, id, nonce, amount));
        return keccak256(abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR(), structHash));
    }

    // ---------------- CREATE ----------------

    function createEscrow(
        address freelancer
    ) external returns (uint256 id) {
        id = escrowCount++;

        escrows[id] = Escrow({
            client: msg.sender,
            freelancer: freelancer,
            usdcAmount: 0,
            funded: false,
            released: false,
            refunded: false,
            deadline: block.timestamp + REFUND_TIMELOCK,
            totalInstallments: 0,
            installmentsPaid: 0,
            installmentAmount: 0,
            paidAmount: 0
        });

        emit EscrowCreated(id, msg.sender, freelancer);
    }

    function createEscrowWithInstallments(
        address freelancer,
        uint256 _totalInstallments
    ) external returns (uint256 id) {
        require(_totalInstallments > 0 && _totalInstallments <= 12, "Invalid installment count");
        
        id = escrowCount++;

        escrows[id] = Escrow({
            client: msg.sender,
            freelancer: freelancer,
            usdcAmount: 0,
            funded: false,
            released: false,
            refunded: false,
            deadline: block.timestamp + REFUND_TIMELOCK,
            totalInstallments: _totalInstallments,
            installmentsPaid: 0,
            installmentAmount: 0,
            paidAmount: 0
        });

        emit EscrowCreated(id, msg.sender, freelancer);
    }

    // ---------------- DEPOSIT ----------------

    function depositFunds(
        uint256 id,
        address token,
        uint256 amount
    ) external nonReentrant {
        Escrow storage e = escrows[id];

        require(msg.sender == e.client, "Not client");
        require(!e.funded, "Already funded");

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        uint256 usdcReceived;

        if (token == USDC) {
            usdcReceived = amount;
        } else {
            // Approve router to spend tokens
            IERC20(token).forceApprove(address(swapRouter), amount);

            ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
                tokenIn: token,
                tokenOut: USDC,
                fee: POOL_FEE,
                recipient: address(this),
                deadline: block.timestamp,
                amountIn: amount,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            });

            usdcReceived = swapRouter.exactInputSingle(params);
        }

        e.usdcAmount = usdcReceived;
        e.funded = true;

        // Calculate installment amount if installments are enabled
        if (e.totalInstallments > 0) {
            e.installmentAmount = usdcReceived / e.totalInstallments;
        }

        emit Deposited(id, usdcReceived);
    }

    // ---------------- INSTALLMENT RELEASE ----------------

    function releaseInstallment(uint256 id) external nonReentrant {
        Escrow storage e = escrows[id];

        require(msg.sender == e.client, "Not client");
        require(e.funded, "Not funded");
        require(!e.released, "Fully released");
        require(e.totalInstallments > 0, "Not installment-based");
        require(e.installmentsPaid < e.totalInstallments, "All installments paid");

        uint256 paymentAmount = e.installmentAmount;
        
        // Last installment may include remainder
        if (e.installmentsPaid == e.totalInstallments - 1) {
            uint256 remainingBalance = e.usdcAmount - (e.installmentAmount * e.installmentsPaid);
            paymentAmount = remainingBalance;
            e.released = true;
        }

        e.installmentsPaid++;

        IERC20(USDC).safeTransfer(e.freelancer, paymentAmount);

        emit InstallmentReleased(id, e.installmentsPaid, paymentAmount, e.freelancer);
        emit TransactionLog(id, msg.sender, 
            string(abi.encodePacked("Released installment ", uintToString(e.installmentsPaid), " of ", uintToString(e.totalInstallments))), 
            "installment");
    }

    // ---------------- SIGNATURE-BASED RELEASE ----------------

    /// @notice Release funds using client's EIP-712 signature (per-escrow nonces for replay protection)
    /// @param id Escrow ID
    /// @param amount Amount of USDC to release
    /// @param nonce Current nonce for this escrow (must match nonces[id])
    /// @param signature Client's EIP-712 signature over Release(id, nonce, amount)
    function releaseWithSignature(
        uint256 id,
        uint256 amount,
        uint256 nonce,
        bytes calldata signature
    ) external nonReentrant {
        Escrow storage e = escrows[id];

        require(e.funded, "Not funded");
        require(!e.refunded, "Already refunded");
        require(amount > 0, "Amount must be > 0");
        require(nonce == nonces[id], "Invalid nonce");

        uint256 remaining = e.usdcAmount - e.paidAmount;
        require(amount <= remaining, "Amount exceeds remaining");

        // Verify EIP-712 signature
        bytes32 digest = hashRelease(id, nonce, amount);
        address signer = digest.recover(signature);
        require(signer == e.client, "Invalid signature");

        // Increment nonce (replay protection)
        nonces[id]++;

        // Update paid amount
        e.paidAmount += amount;
        
        // Mark as fully released if all funds paid
        if (e.paidAmount >= e.usdcAmount) {
            e.released = true;
        }

        // Transfer funds
        IERC20(USDC).safeTransfer(e.freelancer, amount);

        emit ClaimReleased(id, e.freelancer, amount, nonce);
        emit TransactionLog(id, e.client, "Client-signed release", "signature_release");
    }

    // ---------------- RELEASE ----------------

    function releaseFunds(uint256 id) external nonReentrant {
        Escrow storage e = escrows[id];

        require(msg.sender == e.client, "Not client");
        require(e.funded, "Not funded");
        require(!e.released, "Already released");
        require(e.totalInstallments == 0, "Use releaseInstallment for installment-based escrows");

        e.released = true;
        uint256 amount = e.usdcAmount - e.paidAmount;
        e.paidAmount = e.usdcAmount;

        IERC20(USDC).safeTransfer(e.freelancer, amount);

        emit Released(id, amount);
    }

    // ---------------- REFUND ----------------

    function requestRefund(uint256 id) external nonReentrant {
        Escrow storage e = escrows[id];

        require(msg.sender == e.client, "Not client");
        require(block.timestamp > e.deadline, "Too early");
        require(!e.released, "Already released");

        e.refunded = true;

        IERC20(USDC).safeTransfer(e.client, e.usdcAmount);

        emit Refunded(id);
    }

    // ---------------- CANCEL ----------------

    function cancelEscrow(uint256 id) external {
        Escrow storage e = escrows[id];

        require(msg.sender == e.client, "Not client");
        require(!e.funded, "Cannot cancel funded escrow");
        require(!e.released, "Already released");
        require(!e.refunded, "Already refunded");

        // Mark as cancelled by setting freelancer to zero address
        e.freelancer = address(0);
        
        emit Cancelled(id);
    }

    // ---------------- TRANSACTION LOG ----------------

    function logTransaction(uint256 id, string calldata reason, string calldata action) external {
        Escrow storage e = escrows[id];
        
        require(
            msg.sender == e.client || msg.sender == e.freelancer,
            "Not authorized"
        );

        emit TransactionLog(id, msg.sender, reason, action);
    }

    // ---------------- HELPERS ----------------

    function uintToString(uint256 v) internal pure returns (string memory) {
        if (v == 0) return "0";
        uint256 j = v;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (v != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(v - v / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            v /= 10;
        }
        return string(bstr);
    }
}
